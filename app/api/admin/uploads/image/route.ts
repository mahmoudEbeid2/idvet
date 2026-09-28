import sharp, { type OutputInfo } from "sharp";
import { prisma } from "@/lib/prisma";
import { saveUpload, uploadUrl } from "@/lib/storage";
import { guardUpload, jsonError } from "@/lib/admin/uploadGuard";

// Image uploads (a Route Handler, not a Server Action: actions cap bodies at 1MB).
//   target=product        → a ProductImage (≤15MB, rotated, ≤1600px, WebP)
//   target=category-icon  → a category icon (≤2MB, ≤256px, WebP with alpha)

const LIMITS = { product: 15 * 1024 * 1024, "category-icon": 2 * 1024 * 1024 } as const;
const ACCEPTED = new Set(["jpeg", "png", "webp"]);

export async function POST(request: Request) {
  const target = new URL(request.url).searchParams.get("target") === "category-icon" ? "category-icon" : "product";
  const limit = LIMITS[target];
  const rejected = guardUpload(request, limit);
  if (rejected) return rejected;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return jsonError("اختر ملف صورة.", 400);
  if (file.size > limit) return jsonError(`${file.name}: الملف أكبر من ${limit / (1024 * 1024)}MB.`, 413);

  const productId = String(form?.get("productId") ?? "");
  if (target === "product" && !(await prisma.product.findUnique({ where: { id: productId }, select: { id: true } }))) {
    return jsonError("المنتج غير موجود.", 404);
  }

  const input = Buffer.from(await file.arrayBuffer());
  let output: { data: Buffer; info: OutputInfo };
  try {
    const meta = await sharp(input).metadata();
    if (!meta.format || !ACCEPTED.has(meta.format)) throw new Error("format");
    const size = target === "product" ? 1600 : 256;
    output = await sharp(input)
      .rotate() // apply EXIF orientation, then drop the metadata
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .webp({ quality: target === "product" ? 82 : 90 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return jsonError(`${file.name}: الملف ليس صورة صالحة. استخدم JPG أو PNG أو WEBP.`, 415);
  }

  if (target === "category-icon") {
    const path = await saveUpload("categories", "webp", output.data);
    return Response.json({ src: uploadUrl(path) }, { status: 201 });
  }

  const path = await saveUpload(`products/${productId}`, "webp", output.data);
  const last = await prisma.productImage.aggregate({ where: { productId }, _max: { sortOrder: true } });
  const image = await prisma.productImage.create({
    data: {
      productId,
      path,
      width: output.info.width,
      height: output.info.height,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  });
  return Response.json(
    { id: image.id, src: uploadUrl(path), width: image.width, height: image.height },
    { status: 201 },
  );
}

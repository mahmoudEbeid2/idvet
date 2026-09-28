import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/storage";
import { guardUpload, jsonError } from "@/lib/admin/uploadGuard";
import { text, translated } from "@/lib/admin/forms";
import { withFile } from "@/lib/admin/i18n";
import { getAdminT } from "@/lib/admin/lang";

// Certificate PDF uploads (a Route Handler: Server Actions cap bodies at 1MB).

const LIMIT = 20 * 1024 * 1024;
const PDF_MAGIC = Buffer.from("%PDF-");

export async function POST(request: Request) {
  const t = await getAdminT();
  const rejected = guardUpload(request, LIMIT, t);
  if (rejected) return rejected;

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError(t.errors.badRequest, 400);
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return jsonError(t.errors.choosePdf, 400);
  if (file.size > LIMIT) return jsonError(withFile(file.name, t.errors.tooBig(20)), 413);

  const productId = text(form, "productId", 40);
  if (!(await prisma.product.findUnique({ where: { id: productId }, select: { id: true } }))) {
    return jsonError(t.errors.productNotFound, 404);
  }
  const titles = translated(form, "title", 200);
  if (!titles.titleKu && !titles.titleAr && !titles.titleEn) {
    return jsonError(t.errors.certificateTitleRequired, 400);
  }

  const data = Buffer.from(await file.arrayBuffer());
  if (!data.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
    return jsonError(withFile(file.name, t.errors.notPdf), 415);
  }

  const path = await saveUpload(`certificates/${productId}`, "pdf", data);
  const last = await prisma.certificate.aggregate({ where: { productId }, _max: { sortOrder: true } });
  const certificate = await prisma.certificate.create({
    data: {
      productId,
      ...titles,
      issuer: text(form, "issuer", 120),
      issuedOn: text(form, "issuedOn", 40),
      path,
      size: data.length,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  });
  return Response.json({ id: certificate.id }, { status: 201 });
}

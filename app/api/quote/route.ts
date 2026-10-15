import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendQuoteMail } from "@/lib/mailer";
import { quoteEmail } from "@/lib/email/templates";
import { pick } from "@/lib/catalog/i18n";

const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const quoteSchema = z.object({
  productId: z.string().trim().max(40),
  name: z.string().trim().min(2).max(100),
  /** Phone number or email. */
  contact: z.string().trim().min(5).max(200),
  quantity: optional(100),
  company: optional(150),
  city: optional(100),
  message: optional(2000),
  locale: z.enum(["ku", "ar", "en"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, name, contact, quantity, company, city, message, locale } = parsed.data;
  const product = await prisma.product.findFirst({
    where: { id: productId, published: true },
    include: { category: true, images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 1 } },
  });
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 404 });

  // Stored with the English name (kept if the product is deleted later).
  const productName = pick(product, "name", "en") || product.code;
  const saved = await prisma.quoteRequest.create({
    data: {
      productId: product.id,
      productName,
      name,
      contact,
      quantity: quantity || null,
      company: company || null,
      city: city || null,
      message: message || null,
      locale,
    },
  });

  // The email is read by the IDVET team in Arabic.
  const result = await sendQuoteMail(
    quoteEmail({
      ...saved,
      product: {
        name: pick(product, "name", "ar") || product.code,
        code: product.code,
        brand: product.brand,
        category: pick(product.category, "name", "ar"),
        summary: pick(product, "summary", "ar"),
        dosageForm: pick(product, "dosageForm", "ar"),
        packaging: pick(product, "packaging", "ar"),
        species: pick(product, "species", "ar"),
        slug: product.slug,
        image: product.images[0]?.path ?? null,
      },
    }),
  );
  await prisma.quoteRequest
    .update({ where: { id: saved.id }, data: result.sent ? { mailSent: true } : { mailError: result.error } })
    .catch((error) => console.error("[quote] couldn't record mail status:", error));

  return NextResponse.json({ id: saved.id }, { status: 201 });
}

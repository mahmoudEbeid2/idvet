import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { pick } from "@/lib/catalog/i18n";
import { absoluteUrl } from "@/lib/seo";

const quoteSchema = z.object({
  productId: z.string().trim().max(40),
  name: z.string().trim().min(2).max(100),
  /** Phone number or email. */
  contact: z.string().trim().min(5).max(200),
  quantity: z.string().trim().min(1).max(100),
  locale: z.enum(["ku", "ar", "en"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, name, contact, quantity, locale } = parsed.data;
  const product = await prisma.product.findFirst({ where: { id: productId, published: true } });
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 404 });

  // The email is read by the IDVET team: English name first, then the visitor's language.
  const productName = pick(product, "name", "en") || product.code;
  const quote = await prisma.quoteRequest.create({
    data: { productId: product.id, productName, name, contact, quantity, locale },
  });

  const isEmail = z.string().email().safeParse(contact).success;
  await sendMail({
    subject: `Quote request — ${productName} — ${name}`,
    replyTo: isEmail ? contact : undefined,
    rows: [
      ["Product", [productName, product.code !== productName ? product.code : "", product.brand].filter(Boolean).join(" · ")],
      ["Product page", absoluteUrl(`/${locale}/products/${product.slug}`)],
      ["Name / company", name],
      ["Phone or email", contact],
      ["Quantity", quantity],
      ["Language", locale],
    ],
  });

  return NextResponse.json({ id: quote.id }, { status: 201 });
}

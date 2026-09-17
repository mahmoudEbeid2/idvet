import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  locale: z.enum(["ku", "ar"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, phone, message, locale } = parsed.data;

  const submission = await prisma.contactSubmission.create({
    data: { name, email, phone: phone || null, message, locale },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}

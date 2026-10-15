import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  locale: z.enum(["ku", "ar", "en"]),
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

  const { name, email, phone, subject, message, locale } = parsed.data;

  // Saved first: the admin inbox has it even when the email can't be sent
  // (sendMail logs and returns false instead of throwing).
  const submission = await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, subject: subject || null, message, locale },
  });

  await sendMail({
    subject: `Website contact form — ${subject ? `${subject} — ` : ""}${name}`,
    replyTo: email,
    rows: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone ?? ""],
      ["Subject", subject ?? ""],
      ["Message", message],
      ["Language", locale],
    ],
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}

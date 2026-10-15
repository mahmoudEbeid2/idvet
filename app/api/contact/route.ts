import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactMail } from "@/lib/mailer";
import { contactEmail } from "@/lib/email/templates";
import { notifyInbox } from "@/lib/admin/inboxEvents";

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

  // Saved first: the message is in the admin even when the email can't be sent.
  const saved = await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, subject: subject || null, message, locale },
  });
  notifyInbox();

  const result = await sendContactMail(contactEmail(saved));
  await prisma.contactMessage
    .update({ where: { id: saved.id }, data: result.sent ? { mailSent: true } : { mailError: result.error } })
    .catch((error) => console.error("[contact] couldn't record mail status:", error));

  // The visitor's message is stored either way, so a mail failure is still a success for them.
  return NextResponse.json({ id: saved.id }, { status: 201 });
}

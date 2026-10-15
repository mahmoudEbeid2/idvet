import nodemailer, { type Transporter } from "nodemailer";

// The site's one mailer: contact form and quote requests (both also stored in
// the database first, so nothing is lost while SMTP is not configured).
//
//   SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASS, SMTP_SECURE ("true" for 465)
//   MAIL_FROM  sender, e.g. "IDVET Website <no-reply@idvet.co>" (default: SMTP_USER)
//   MAIL_TO    recipient (default: info@idvet.co)

const DEFAULT_TO = "info@idvet.co";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return (transporter = null);
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
  });
  return transporter;
}

export interface Mail {
  subject: string;
  /** Label → value rows; the email is these rows as plain text and a simple table. */
  rows: [string, string][];
  /** Visitor's email, used as Reply-To when given. */
  replyTo?: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends `mail` to MAIL_TO. Returns false (and logs) when SMTP is not
 * configured or sending fails; callers have already saved the submission.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[mailer] SMTP_HOST is not set; not emailing "${mail.subject}".`);
    return false;
  }
  const rows = mail.rows.filter(([, value]) => value.trim());
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO || DEFAULT_TO,
      replyTo: mail.replyTo || undefined,
      // Header values must not carry line breaks.
      subject: mail.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
      text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
      html: `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
        .map(
          ([label, value]) =>
            `<tr><th align="left" valign="top" style="color:#555">${escapeHtml(label)}</th><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
        )
        .join("")}</table>`,
    });
    return true;
  } catch (error) {
    console.error("[mailer] sending failed:", error);
    return false;
  }
}

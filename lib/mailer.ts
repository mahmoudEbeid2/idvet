import nodemailer, { type Transporter } from "nodemailer";

// The site's mail: two SMTP accounts on one server, so contact messages and
// quote requests each come from (and land in) their own mailbox. Callers save
// the submission to the database first; nothing here throws.
//
//   SMTP_HOST, SMTP_PORT (465), SMTP_SECURE ("true" for 465)  shared
//   CONTACT_SMTP_USER, CONTACT_SMTP_PASS, CONTACT_MAIL_FROM, CONTACT_MAIL_TO (info@idvet.co)
//   QUOTE_SMTP_USER,   QUOTE_SMTP_PASS,   QUOTE_MAIL_FROM,   QUOTE_MAIL_TO   (notification@idvet.co)
//
// The From address is always the account's own SMTP user (only its display
// name comes from *_MAIL_FROM): a From the server doesn't own fails SPF/DMARC.
// If the configured port can't connect or log in, 587 + STARTTLS is tried.

export type MailAccount = "contact" | "quote";

const DEFAULT_TO: Record<MailAccount, string> = { contact: "info@idvet.co", quote: "notification@idvet.co" };

interface Account {
  user: string;
  pass: string;
  fromName: string;
  to: string;
}

function account(kind: MailAccount): Account | null {
  const prefix = kind === "contact" ? "CONTACT" : "QUOTE";
  const user = process.env[`${prefix}_SMTP_USER`]?.trim();
  if (!process.env.SMTP_HOST || !user) return null;
  const from = process.env[`${prefix}_MAIL_FROM`]?.trim() ?? "";
  return {
    user,
    pass: process.env[`${prefix}_SMTP_PASS`] ?? "",
    // "IDVET Website <x@idvet.co>" → "IDVET Website"; a bare address → no name.
    fromName: from.includes("<") ? from.slice(0, from.indexOf("<")).trim().replace(/^"|"$/g, "") : "",
    to: process.env[`${prefix}_MAIL_TO`]?.trim() || DEFAULT_TO[kind],
  };
}

function createTransport(acc: Account, port: number, secure: boolean): Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: !secure,
    auth: { user: acc.user, pass: acc.pass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

/** Verified transport per account; a failed verify is retried on the next send. */
const transports = new Map<MailAccount, Promise<Transporter | null>>();

async function connect(kind: MailAccount): Promise<Transporter | null> {
  const acc = account(kind);
  if (!acc) {
    console.warn(`[mailer] ${kind}: not configured (SMTP_HOST / ${kind.toUpperCase()}_SMTP_USER empty)`);
    return null;
  }
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const attempts: [number, boolean][] = [[port, secure]];
  if (port !== 587) attempts.push([587, false]);

  for (const [p, s] of attempts) {
    const transport = createTransport(acc, p, s);
    try {
      await transport.verify();
      console.info(`[mailer] ${kind}: ok (port ${p})`);
      return transport;
    } catch (error) {
      // Only the error code: messages can echo server responses, never credentials, but keep logs lean.
      console.error(`[mailer] ${kind}: failed (port ${p}, ${(error as { code?: string }).code ?? "error"})`);
      transport.close();
    }
  }
  return null;
}

function getTransport(kind: MailAccount): Promise<Transporter | null> {
  let pending = transports.get(kind);
  if (!pending) {
    pending = connect(kind);
    transports.set(kind, pending);
    // Don't cache a failure: the next send tries again.
    void pending.then((t) => {
      if (!t) transports.delete(kind);
    });
  }
  return pending;
}

/** Verifies both accounts and logs "ok"/"failed" for each (called once at server start). */
export async function verifyMailers(): Promise<void> {
  await Promise.all([getTransport("contact"), getTransport("quote")]);
}

export interface Mail {
  subject: string;
  html: string;
  text: string;
  /** Visitor's email, used as Reply-To when given. */
  replyTo?: string;
}

export type MailResult = { sent: true } | { sent: false; error: string };

async function send(kind: MailAccount, mail: Mail): Promise<MailResult> {
  const acc = account(kind);
  const transport = await getTransport(kind);
  if (!acc || !transport) return { sent: false, error: `${kind} mailer not configured or SMTP login failed` };
  try {
    await transport.sendMail({
      from: { name: acc.fromName, address: acc.user },
      to: acc.to,
      replyTo: mail.replyTo || undefined,
      // Header values must not carry line breaks.
      subject: mail.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
      text: mail.text,
      html: mail.html,
    });
    return { sent: true };
  } catch (error) {
    console.error(`[mailer] ${kind}: sending failed:`, (error as Error).message);
    transports.delete(kind); // reconnect next time
    return { sent: false, error: String((error as Error).message ?? error).slice(0, 500) };
  }
}

export const sendContactMail = (mail: Mail) => send("contact", mail);
export const sendQuoteMail = (mail: Mail) => send("quote", mail);

/** The address replies go out from (shown in the reply box): the contact account. */
export const replyFromAddress = () => process.env.CONTACT_SMTP_USER?.trim() || "info@idvet.co";

/**
 * The team's reply to a customer (admin inbox). Always from the contact
 * account — info@idvet.co, never notification@ — with Reply-To that same
 * address, so the customer's answer lands in the shared inbox.
 */
export async function sendCustomerReply(mail: Omit<Mail, "replyTo"> & { to: string }): Promise<MailResult> {
  const acc = account("contact");
  const transport = await getTransport("contact");
  if (!acc || !transport) return { sent: false, error: "contact mailer (info@) not configured or SMTP login failed" };
  try {
    await transport.sendMail({
      from: { name: "IDVET", address: acc.user },
      to: mail.to,
      replyTo: acc.user,
      subject: mail.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
      text: mail.text,
      html: mail.html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[mailer] reply: sending failed:", (error as Error).message);
    transports.delete("contact");
    return { sent: false, error: String((error as Error).message ?? error).slice(0, 500) };
  }
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

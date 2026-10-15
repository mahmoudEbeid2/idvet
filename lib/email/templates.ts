import { escapeHtml, type Mail } from "@/lib/mailer";
import { SITE_URL as PUBLIC_SITE_URL } from "@/lib/seo";

// Notification emails for the IDVET team (Arabic, right-to-left). Built for
// email clients: table layout, inline styles only, 600px wide, no CSS/JS files,
// images as absolute JPEG/PNG URLs (Outlook shows neither SVG nor WebP).
// Every visitor-typed value goes through escapeHtml.

/** Runtime SITE_URL (emails), falling back to the build-time public origin. */
const siteUrl = () => (process.env.SITE_URL || PUBLIC_SITE_URL).replace(/\/+$/, "");
const abs = (path: string) => `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

const BRAND = "#0676bd";
const NAVY = "#0b1f36";
const MUTED = "#6b7680";
const LINE = "#e3e8ed";
const FONT = "Tahoma, Arial, sans-serif";

const dateAr = (date: Date) =>
  new Intl.DateTimeFormat("ar", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Baghdad" }).format(date);

const isEmail = (value: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** A full-width, table-based button (renders in Outlook too). */
function button(href: string, label: string, color = BRAND) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr>
<td align="center" bgcolor="${color}" style="border-radius:6px;background:${color}">
<a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:12px 24px;font-family:${FONT};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px">${escapeHtml(label)}</a>
</td></tr></table>`;
}

/**
 * Label/value rows; values are already-escaped HTML. Empty values are skipped.
 * Each value is direction-isolated (dir="auto"), so Latin text like "10 boxes"
 * isn't reordered by the right-to-left layout.
 */
function rows(items: [string, string | null | undefined][]) {
  return items
    .filter((item): item is [string, string] => Boolean(item[1]))
    .map(
      ([label, value]) => `<tr>
<td valign="top" style="padding:8px 0;width:130px;font-family:${FONT};font-size:14px;color:${MUTED}">${escapeHtml(label)}</td>
<td valign="top" style="padding:8px 0;font-family:${FONT};font-size:15px;color:${NAVY};word-break:break-word"><span dir="auto">${value}</span></td>
</tr>`,
    )
    .join("");
}

function section(title: string, body: string) {
  return `<tr><td style="padding:24px 32px 8px 32px">
<p style="margin:0 0 8px 0;font-family:${FONT};font-size:13px;font-weight:bold;color:${BRAND}">${escapeHtml(title)}</p>
${body}
</td></tr>`;
}

/** The outer document: header with logo, the given rows, footer with company and date. */
function layout({ title, preheader, body, date }: { title: string; preheader: string; body: string; date: Date }) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f6f8" style="background:#f4f6f8">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:8px;border-collapse:separate">
<tr><td style="padding:24px 32px;border-bottom:3px solid ${BRAND}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle"><a href="${escapeHtml(siteUrl())}" target="_blank"><img src="${escapeHtml(abs("/assets/email/idvet-logo.png"))}" width="98" height="56" alt="IDVET" style="display:block;border:0;outline:none"></a></td>
<td valign="middle" align="left" style="font-family:${FONT};font-size:18px;font-weight:bold;color:${NAVY}">${escapeHtml(title)}</td>
</tr></table>
</td></tr>
${body}
<tr><td style="padding:24px 32px;border-top:1px solid ${LINE};font-family:${FONT};font-size:12px;line-height:1.7;color:${MUTED}">
IDVET — ${escapeHtml(dateAr(date))}<br>
هذه رسالة تلقائية من موقع <a href="${escapeHtml(siteUrl())}" target="_blank" style="color:${MUTED}">${escapeHtml(siteUrl().replace(/^https?:\/\//, ""))}</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Plain-text alternative from label/value pairs. */
function plain(title: string, groups: [string, string | null | undefined][][], links: [string, string][], date: Date) {
  const lines = [title, ""];
  for (const group of groups) {
    for (const [label, value] of group) if (value) lines.push(`${label}: ${value}`);
    lines.push("");
  }
  for (const [label, href] of links) lines.push(`${label}: ${href}`);
  lines.push("", `IDVET — ${dateAr(date)}`);
  return lines.join("\n");
}

const LANG_AR: Record<string, string> = { ar: "العربية", ku: "الكردية", en: "الإنجليزية" };

// ---------------------------------------------------------------- contact

export function contactEmail(m: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  locale: string;
  createdAt: Date;
}): Mail {
  const dashboard = abs(`/admin/messages/${m.id}`);
  const title = "رسالة جديدة من الموقع";
  const customer: [string, string | null | undefined][] = [
    ["الاسم", m.name],
    ["البريد", m.email],
    ["الهاتف", m.phone],
    ["الموضوع", m.subject],
    ["لغة الزائر", LANG_AR[m.locale] ?? m.locale],
  ];
  const body =
    section(
      "المرسل",
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows([
        ["الاسم", escapeHtml(m.name)],
        ["البريد", `<a href="mailto:${escapeHtml(m.email)}" style="color:${BRAND}" dir="ltr">${escapeHtml(m.email)}</a>`],
        ["الهاتف", m.phone && `<a href="${escapeHtml(telHref(m.phone))}" style="color:${BRAND}" dir="ltr">${escapeHtml(m.phone)}</a>`],
        ["الموضوع", m.subject && escapeHtml(m.subject)],
        ["لغة الزائر", escapeHtml(LANG_AR[m.locale] ?? m.locale)],
      ])}</table>`,
    ) +
    section(
      "الرسالة",
      `<p dir="auto" style="margin:0;padding:16px;background:#f7f9fb;border-radius:6px;font-family:${FONT};font-size:15px;line-height:1.8;color:${NAVY};white-space:pre-wrap;word-break:break-word">${escapeHtml(m.message)}</p>`,
    ) +
    `<tr><td style="padding:24px 32px">${button(dashboard, "فتح في لوحة التحكم", NAVY)}</td></tr>`;

  return {
    subject: `رسالة من الموقع: ${m.subject || m.name}${m.subject ? ` — ${m.name}` : ""}`,
    replyTo: m.email,
    html: layout({ title, preheader: `${m.name}: ${m.message.slice(0, 90)}`, body, date: m.createdAt }),
    text: plain(title, [customer, [["الرسالة", m.message]]], [["لوحة التحكم", dashboard]], m.createdAt),
  };
}

// ---------------------------------------------------------------- quote

export function quoteEmail(q: {
  id: string;
  name: string;
  contact: string;
  quantity: string;
  company?: string | null;
  city?: string | null;
  message?: string | null;
  locale: string;
  createdAt: Date;
  product: {
    name: string;
    code: string;
    brand: string;
    category: string;
    summary: string;
    dosageForm: string;
    packaging: string;
    species: string;
    slug: string;
    /** Relative upload path of the main image, if any. */
    image: string | null;
  };
}): Mail {
  const p = q.product;
  const productUrl = abs(`/ar/products/${p.slug}`);
  const dashboard = abs(`/admin/quotes/${q.id}`);
  const email = isEmail(q.contact) ? q.contact : null;
  const phone = email ? null : q.contact;
  const title = "طلب عرض سعر جديد";

  const image = p.image
    ? `<tr><td align="center" style="padding:24px 32px 0 32px"><a href="${escapeHtml(productUrl)}" target="_blank"><img src="${escapeHtml(
        abs(`/uploads/${p.image}?format=jpg`),
      )}" width="280" alt="${escapeHtml(p.name)}" style="display:block;width:280px;max-width:100%;height:auto;border:0;border-radius:6px"></a></td></tr>`
    : "";

  const productRows = rows([
    ["الاسم التجاري", p.code && p.code !== p.name ? `<span dir="ltr">${escapeHtml(p.code)}</span>` : null],
    ["البراند", p.brand && escapeHtml(p.brand)],
    ["القسم", p.category && escapeHtml(p.category)],
    ["الشكل الصيدلاني", p.dosageForm && escapeHtml(p.dosageForm)],
    ["العبوات", p.packaging && escapeHtml(p.packaging.replace(/\s*\n\s*/g, "، "))],
    ["الحيوانات", p.species && escapeHtml(p.species)],
  ]);

  const body =
    image +
    `<tr><td style="padding:20px 32px 0 32px">
<p style="margin:0;font-family:${FONT};font-size:20px;font-weight:bold;color:${NAVY}">${escapeHtml(p.name)}</p>
${p.summary ? `<p style="margin:8px 0 0 0;font-family:${FONT};font-size:14px;line-height:1.7;color:${MUTED}">${escapeHtml(p.summary)}</p>` : ""}
${productRows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px">${productRows}</table>` : ""}
<div style="padding-top:16px">${button(productUrl, "عرض المنتج")}</div>
</td></tr>` +
    section(
      "بيانات العميل",
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows([
        ["الاسم", escapeHtml(q.name)],
        ["الهاتف", phone && `<a href="${escapeHtml(telHref(phone))}" style="color:${BRAND}" dir="ltr">${escapeHtml(phone)}</a>`],
        ["البريد", email && `<a href="mailto:${escapeHtml(email)}" style="color:${BRAND}" dir="ltr">${escapeHtml(email)}</a>`],
        ["الشركة", q.company && escapeHtml(q.company)],
        ["المدينة", q.city && escapeHtml(q.city)],
        ["الكمية", `<b>${escapeHtml(q.quantity)}</b>`],
        ["لغة الزائر", escapeHtml(LANG_AR[q.locale] ?? q.locale)],
      ])}</table>${
        q.message
          ? `<p dir="auto" style="margin:12px 0 0 0;padding:16px;background:#f7f9fb;border-radius:6px;font-family:${FONT};font-size:15px;line-height:1.8;color:${NAVY};white-space:pre-wrap;word-break:break-word">${escapeHtml(q.message)}</p>`
          : ""
      }`,
    ) +
    `<tr><td style="padding:24px 32px">${button(dashboard, "فتح في لوحة التحكم", NAVY)}</td></tr>`;

  return {
    subject: `طلب عرض سعر: ${p.name} — ${q.name}`,
    replyTo: email ?? undefined,
    html: layout({ title, preheader: `${q.name} — ${p.name} — ${q.quantity}`, body, date: q.createdAt }),
    text: plain(
      title,
      [
        [
          ["المنتج", p.name],
          ["الاسم التجاري", p.code !== p.name ? p.code : ""],
          ["البراند", p.brand],
          ["القسم", p.category],
        ],
        [
          ["الاسم", q.name],
          ["الهاتف", phone],
          ["البريد", email],
          ["الشركة", q.company],
          ["المدينة", q.city],
          ["الكمية", q.quantity],
          ["الرسالة", q.message],
        ],
      ],
      [
        ["صفحة المنتج", productUrl],
        ["لوحة التحكم", dashboard],
      ],
      q.createdAt,
    ),
  };
}

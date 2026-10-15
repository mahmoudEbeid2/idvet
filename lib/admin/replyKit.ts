// Pure helpers for replying to customers (admin inbox): no server-only
// imports, so the reply box (client) can use them too.

export type CustomerLang = "ar" | "ku" | "en";

export const customerLang = (locale: string): CustomerLang => (locale === "ku" || locale === "en" ? locale : "ar");

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

export const isEmailAddress = (value: string | null | undefined): value is string =>
  Boolean(value && value.length <= 200 && EMAIL.test(value.trim()));

/** Arabic-Indic and Persian digits → 0-9 (customers type either). */
function asciiDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));
}

/**
 * International number without "+" (as wa.me wants it), or null when it
 * doesn't look like a phone number. Iraqi numbers are completed:
 * 07xx xxx xxxx → 9647xxxxxxxxx, 7xx xxx xxxx → 9647xxxxxxxxx, 00964… → 964….
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw || raw.includes("@")) return null;
  const value = asciiDigits(raw).trim();
  if (!/^[+\d\s().\-/]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (/^07\d{9}$/.test(digits)) digits = `964${digits.slice(1)}`;
  else if (/^7\d{9}$/.test(digits)) digits = `964${digits}`;
  else if (digits.startsWith("9640")) digits = `964${digits.slice(4)}`;
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** "+964 773 599 5586" style, for display and tel: links. */
export const telHref = (digits: string) => `tel:+${digits}`;

/** {name} and {product} in a template or message. */
export function fillPlaceholders(text: string, values: { name: string; product: string }): string {
  return text.replace(/\{name\}/g, values.name).replace(/\{product\}/g, values.product);
}

/** Right-to-left when the first letter is Arabic-script (ar/ku), else left-to-right. */
export function textDir(text: string): "rtl" | "ltr" {
  const first = text.match(/[A-Za-zÀ-ɏ֐-ࣿﭐ-﷿ﹰ-﻿]/);
  return first && /[֐-ࣿﭐ-﷿ﹰ-﻿]/.test(first[0]) ? "rtl" : "ltr";
}

/** Text the customer sees, in their language: subjects, the WhatsApp greeting, the email's labels. */
export const CUSTOMER_TEXT = {
  ar: {
    quoteSubject: (product: string) => `رد: طلب عرض سعر — ${product}`,
    messageSubject: (subject: string) => `رد: ${subject || "رسالتك إلى IDVET"}`,
    whatsappQuote: (name: string, product: string) => `مرحباً ${name}، بخصوص طلبك لمنتج ${product} من IDVET...`,
    whatsappMessage: (name: string) => `مرحباً ${name}، بخصوص رسالتك إلى IDVET...`,
    heading: "رد من فريق IDVET",
    yourRequest: "طلبك",
    yourMessage: "رسالتك",
    product: "المنتج",
    viewProduct: "عرض المنتج",
    quantity: "الكمية",
    company: "الشركة",
    city: "المدينة",
    subject: "الموضوع",
    sentOn: "أُرسل في",
    footer: "يمكنك الرد مباشرة على هذه الرسالة.",
  },
  ku: {
    quoteSubject: (product: string) => `وەڵام: داواکاری نرخ — ${product}`,
    messageSubject: (subject: string) => `وەڵام: ${subject || "نامەکەت بۆ IDVET"}`,
    whatsappQuote: (name: string, product: string) => `سڵاو ${name}، سەبارەت بە داواکارییەکەت بۆ بەرهەمی ${product} لە IDVET...`,
    whatsappMessage: (name: string) => `سڵاو ${name}، سەبارەت بە نامەکەت بۆ IDVET...`,
    heading: "وەڵام لە تیمی IDVET",
    yourRequest: "داواکارییەکەت",
    yourMessage: "نامەکەت",
    product: "بەرهەم",
    viewProduct: "بینینی بەرهەم",
    quantity: "بڕ",
    company: "کۆمپانیا",
    city: "شار",
    subject: "بابەت",
    sentOn: "نێردراوە لە",
    footer: "دەتوانیت ڕاستەوخۆ وەڵامی ئەم نامەیە بدەیتەوە.",
  },
  en: {
    quoteSubject: (product: string) => `Re: Quote request — ${product}`,
    messageSubject: (subject: string) => `Re: ${subject || "Your message to IDVET"}`,
    whatsappQuote: (name: string, product: string) => `Hello ${name}, regarding your request for ${product} from IDVET...`,
    whatsappMessage: (name: string) => `Hello ${name}, regarding your message to IDVET...`,
    heading: "Reply from the IDVET team",
    yourRequest: "Your request",
    yourMessage: "Your message",
    product: "Product",
    viewProduct: "View product",
    quantity: "Quantity",
    company: "Company",
    city: "City",
    subject: "Subject",
    sentOn: "Sent on",
    footer: "You can reply directly to this email.",
  },
} satisfies Record<CustomerLang, unknown>;

export const whatsappHref = (digits: string, text: string) => `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

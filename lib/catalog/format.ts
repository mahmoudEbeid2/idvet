import type { Locale, PluralForms } from "@/lib/content/types";

const rules: Partial<Record<Locale, Intl.PluralRules>> = {};

/**
 * Picks the right plural form with Intl.PluralRules (Arabic has zero/one/two/
 * few/many/other) and substitutes the count for "{n}".
 */
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  const tag = locale === "ku" ? "ckb" : locale;
  rules[locale] ??= new Intl.PluralRules(tag);
  const category = n === 0 && forms.zero ? "zero" : rules[locale]!.select(n);
  const form = forms[category as keyof PluralForms] ?? forms.other;
  return form.replace("{n}", String(n));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "Paragraph one\n\nParagraph two" → ["Paragraph one", "Paragraph two"]. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** One step per line; blank lines and leading "1." / "-" markers are dropped. */
export function steps(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim().replace(/^(\d+[.)-]|[-•*])\s*/, ""))
    .filter(Boolean);
}

/** decodeURIComponent that returns the input instead of throwing on bad escapes. */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

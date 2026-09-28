import type { Locale } from "@/lib/content/types";

type Suffix = "Ku" | "Ar" | "En";

const SUFFIX: Record<Locale, Suffix> = { ku: "Ku", ar: "Ar", en: "En" };

/** Order tried after the requested locale when a translation is empty. */
const FALLBACK: Locale[] = ["ar", "ku", "en"];

/** A row that stores `field` once per language: `nameKu`, `nameAr`, `nameEn`. */
export type Translated<F extends string> = Record<`${F}${Suffix}`, string>;

/** The text for `locale`, falling back to ar → ku → en when it is empty. */
export function pick<F extends string>(row: Translated<F>, field: F, locale: Locale): string {
  for (const candidate of [locale, ...FALLBACK]) {
    const value = row[`${field}${SUFFIX[candidate]}`];
    if (value?.trim()) return value;
  }
  return "";
}

/**
 * Languages in which any of `fields` is empty while at least one other
 * language has it filled in. Used for the admin "missing translation" badges.
 */
export function missingLocales<F extends string>(row: Translated<F>, fields: F[]): Suffix[] {
  const missing = new Set<Suffix>();
  for (const field of fields) {
    const filled = (["Ku", "Ar", "En"] as const).filter((s) => row[`${field}${s}`]?.trim());
    if (filled.length === 0) continue;
    for (const s of ["Ku", "Ar", "En"] as const) {
      if (!filled.includes(s)) missing.add(s);
    }
  }
  return (["Ku", "Ar", "En"] as const).filter((s) => missing.has(s));
}

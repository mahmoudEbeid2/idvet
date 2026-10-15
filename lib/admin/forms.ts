export const LANGS = ["Ku", "Ar", "En"] as const;
export type Lang = (typeof LANGS)[number];

/** Result returned by admin form actions; `fields` refills the form after an error. */
export interface FormState {
  error?: string;
  fields?: Record<string, string>;
}

export const PRESET_ICONS = [
  "/assets/products/icon-medicine.svg",
  "/assets/products/icon-supplement.svg",
  "/assets/products/icon-feed.svg",
  "/assets/products/icon-poultry.svg",
  "/assets/products/icon-disinfectant.svg",
] as const;

export const COLOR_SWATCHES = ["#e8f3fb", "#fdf1e3", "#eaf7ee", "#fdecec", "#f1ecfb", "#fff8d9", "#e6f5f5", "#f1f2f4"];

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function text(form: FormData, name: string, max = 200): string {
  const value = form.get(name);
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
}

export function int(form: FormData, name: string): number {
  const n = Number.parseInt(text(form, name, 12), 10);
  return Number.isFinite(n) ? Math.max(-9999, Math.min(9999, n)) : 0;
}

/** { nameKu, nameAr, nameEn } from the form fields with the same names. */
export function translated<F extends string>(form: FormData, field: F, max: number) {
  return Object.fromEntries(LANGS.map((l) => [`${field}${l}`, text(form, `${field}${l}`, max)])) as Record<
    `${F}${Lang}`,
    string
  >;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function randomSlug(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 6)}`;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

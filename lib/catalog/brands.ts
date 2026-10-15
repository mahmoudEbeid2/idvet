import type { Locale } from "@/lib/content/types";

export interface KnownBrand {
  /** URL value for the catalog's ?brand= filter. */
  slug: string;
  name: string;
  /** One image, or the Vet Care icon badge + wordmark pair. */
  logo: string[];
  country: Record<Locale, string>;
}

// Countries match the Brands section in lib/content. There is no DB field for
// them on purpose: any brand not listed here shows as plain text, no country.
const BRANDS: KnownBrand[] = [
  {
    slug: "hipro",
    name: "HiPro",
    logo: ["/assets/hipro-logo.png"],
    country: { ku: "تورکیا", ar: "تركيا", en: "Turkey" },
  },
  {
    slug: "vetcare",
    name: "Vet Care",
    logo: ["/assets/vetcare-logo-part1.svg", "/assets/vetcare-logo-part2.svg"],
    country: { ku: "ئوردن", ar: "الأردن", en: "Jordan" },
  },
  {
    slug: "jumuh",
    name: "Jumuh",
    logo: ["/assets/jamuh-logo.png"],
    country: { ku: "عەرەبستانی سعودی", ar: "السعودية", en: "Saudi Arabia" },
  },
];

/** Old or alternative spellings, typed in the dashboard or found in old links. */
export const BRAND_ALIASES: Record<string, string> = { jamuh: "jumuh" };

const squash = (brand: string) => brand.toLowerCase().replace(/[^a-z]/g, "");

/** "Vet Care", "vetcare" and "VET-CARE" all resolve to the same brand. */
export function knownBrand(brand: string): KnownBrand | null {
  const key = squash(brand);
  return BRANDS.find((b) => b.slug === (BRAND_ALIASES[key] ?? key)) ?? null;
}

/**
 * The ?brand= value for a product's free-text brand: the known brand's slug,
 * otherwise the brand name lower-cased with dashes. "" for no brand.
 */
export function brandSlug(brand: string): string {
  const known = knownBrand(brand);
  if (known) return known.slug;
  return brand
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export const KNOWN_BRANDS: readonly KnownBrand[] = BRANDS;
export const KNOWN_BRAND_NAMES = BRANDS.map((b) => b.name);

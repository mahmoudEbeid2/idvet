import type { Locale } from "@/lib/content/types";

export interface KnownBrand {
  name: string;
  /** One image, or the Vet Care icon badge + wordmark pair. */
  logo: string[];
  country: Record<Locale, string>;
}

// Countries match the Brands section in lib/content. There is no DB field for
// them on purpose: any brand not listed here shows as plain text, no country.
const BRANDS: Record<string, KnownBrand> = {
  hipro: {
    name: "HiPro",
    logo: ["/assets/hipro-logo.png"],
    country: { ku: "تورکیا", ar: "تركيا", en: "Turkey" },
  },
  vetcare: {
    name: "Vet Care",
    logo: ["/assets/vetcare-logo-part1.svg", "/assets/vetcare-logo-part2.svg"],
    country: { ku: "ئوردن", ar: "الأردن", en: "Jordan" },
  },
  jamuh: {
    name: "Jamuh",
    logo: ["/assets/jamuh-logo.png"],
    country: { ku: "عەرەبستانی سعودی", ar: "السعودية", en: "Saudi Arabia" },
  },
};

/** "Vet Care", "vetcare" and "VET-CARE" all resolve to the same brand. */
export function knownBrand(brand: string): KnownBrand | null {
  const key = brand.toLowerCase().replace(/[^a-z]/g, "");
  return BRANDS[key] ?? null;
}

export const KNOWN_BRAND_NAMES = Object.values(BRANDS).map((b) => b.name);

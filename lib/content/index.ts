import type { Locale, SiteContent } from "./types";
import { ku } from "./ku";
import { ar } from "./ar";

export const locales: Locale[] = ["ku", "ar"];

export const content: Record<Locale, SiteContent> = { ku, ar };

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export type {
  Locale,
  SiteContent,
  BrandCard,
  ServiceItem,
  WhyUsItem,
} from "./types";

import type { Locale, SiteContent, LanguageOption } from "./types";
import { ku } from "./ku";
import { ar } from "./ar";
import { en } from "./en";

export const locales: Locale[] = ["ku", "ar", "en"];

const nativeNames: Record<Locale, string> = {
  ku: "کوردی",
  ar: "العربية",
  en: "English",
};

const baseContent: Record<Locale, Omit<SiteContent, "languages">> = { ku, ar, en };

const languages: LanguageOption[] = locales.map((locale) => ({
  locale,
  label: nativeNames[locale],
  href: `/${locale}`,
}));

export const content: Record<Locale, SiteContent> = Object.fromEntries(
  locales.map((locale) => [locale, { ...baseContent[locale], languages }]),
) as Record<Locale, SiteContent>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export type {
  Locale,
  SiteContent,
  BrandCard,
  ServiceItem,
  WhyUsItem,
  LanguageOption,
} from "./types";

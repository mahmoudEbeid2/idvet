import type { SiteContent } from "@/lib/content";

const KEYS = [
  "requestQuote",
  "quoteTitle",
  "quoteIntro",
  "quoteFor",
  "quoteName",
  "quoteContact",
  "quoteQuantity",
  "quoteQuantityPlaceholder",
  "quoteCompany",
  "quoteCity",
  "quoteOptional",
  "quoteSend",
  "quoteSending",
  "quoteSuccess",
  "quoteError",
  "quoteCancel",
  "quoteSuccessTitle",
  "quoteErrRequired",
  "quoteErrName",
  "quoteErrContact",
  "close",
] as const;

export type QuoteLabels = Pick<SiteContent["products"], (typeof KEYS)[number]>;

/** The quote modal's strings only, so server components send the client just what it needs. */
export function quoteLabels(t: SiteContent["products"]): QuoteLabels {
  return Object.fromEntries(KEYS.map((key) => [key, t[key]])) as QuoteLabels;
}

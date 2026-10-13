import type { Metadata } from "next";
import { content, locales, type Locale, type SiteContent } from "@/lib/content";
import { SOCIAL_LINKS } from "@/lib/social";

// Canonical origin for every absolute URL: canonical/hreflang links, sitemap,
// robots.txt, llms.txt, Open Graph and JSON-LD. NEXT_PUBLIC_* is inlined at
// build time and the Docker build doesn't pass it, hence the fallback.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://idvet.co").replace(/\/+$/, "");

/** The site's main language: "/" redirects here and it is the hreflang x-default. */
export const DEFAULT_LOCALE: Locale = "ar";

export const GTM_ID = "GTM-TGCDHMRK";

const OG_LOCALE: Record<Locale, string> = { ar: "ar_IQ", ku: "ckb_IQ", en: "en_US" };

const DEFAULT_OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "IDVET" };

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/**
 * hreflang alternates for a page that exists in every language, keyed by
 * html lang ("ckb" for Kurdish). `path` is the part after the locale ("" for
 * the home page, "/products/…" otherwise).
 */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[content[locale].htmlLang] = absoluteUrl(`/${locale}${path}`);
  languages["x-default"] = absoluteUrl(`/${DEFAULT_LOCALE}${path}`);
  return languages;
}

/** Cuts `text` to at most `max` characters on a word boundary (meta descriptions). */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > max * 0.6 ? cut.slice(0, space) : cut}…`;
}

type OgImage = { url: string; width?: number; height?: number; alt?: string };

/**
 * Full metadata for a public page: title, description, self-referencing
 * canonical, hreflang alternates, Open Graph and Twitter card. Child metadata
 * replaces (not merges) openGraph/twitter, so every page sets them all here.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  images,
  noindex = false,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  images?: OgImage[];
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(`/${locale}${path}`);
  const desc = truncate(description);
  const ogImages = images?.length ? images : [DEFAULT_OG_IMAGE];
  return {
    title,
    description: desc,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: "IDVET",
      url,
      title,
      description: desc,
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: ogImages,
    },
    twitter: { card: "summary_large_image", title, description: desc, images: ogImages },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

// ── JSON-LD ────────────────────────────────────────────────────────────────

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Organization + WebSite (with a catalog SearchAction), on every public page. */
export function siteJsonLd(site: SiteContent) {
  const { contact } = site;
  const telephone = contact.phone.replace(/[^+0-9]/g, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "IDVET",
        url: SITE_URL,
        logo: absoluteUrl("/logo.png"),
        image: absoluteUrl(DEFAULT_OG_IMAGE.url),
        description: site.hero.paragraph,
        email: contact.email,
        telephone,
        areaServed: { "@type": "Country", name: "Iraq" },
        address: [
          { "@type": "PostalAddress", addressLocality: "Erbil", postalCode: "44001", addressRegion: "Kurdistan", addressCountry: "IQ" },
          { "@type": "PostalAddress", addressLocality: "Baghdad", postalCode: "10082", addressCountry: "IQ" },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone,
          email: contact.email,
          areaServed: "IQ",
          availableLanguage: ["Arabic", "Kurdish", "English"],
        },
        // WhatsApp is a chat link, not a profile page.
        sameAs: SOCIAL_LINKS.filter((s) => s.name !== "WhatsApp").map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/${site.locale}#website`,
        url: absoluteUrl(`/${site.locale}`),
        name: "IDVET",
        inLanguage: site.htmlLang,
        publisher: { "@id": ORGANIZATION_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(`/${site.locale}/products`)}?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** BreadcrumbList from (name, path) pairs; paths are absolute paths on this site. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** ItemList of links (catalog and category pages). */
export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

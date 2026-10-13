import type { Metadata } from "next";
import { ibmPlexSansArabic, roboto } from "@/lib/fonts";
import { isLocale, locales, content } from "@/lib/content";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const site = content[locale];
  return {
    // Resolves relative Open Graph image URLs (product pages). NEXT_PUBLIC_* is
    // inlined at build time and the Docker build doesn't pass it, hence the fallback.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://idvet.co"),
    title: `IDVET — ${site.hero.eyebrow}`,
    description: site.hero.paragraph,
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/assets/idvet-logo.svg", type: "image/svg+xml" },
      ],
      apple: "/icon.svg",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // An unknown locale (/fr/…) still renders this layout with the default
  // locale: every page under it calls notFound(), and not-found.tsx can only
  // show the site header if the layout itself doesn't throw.
  const site = content[isLocale(locale) ? locale : "ar"];

  const isEnglish = site.locale === "en";

  return (
    <html lang={site.htmlLang} dir={isEnglish ? "ltr" : "rtl"} data-scroll-behavior="smooth">
      <body
        className={`${ibmPlexSansArabic.variable} ${roboto.variable} antialiased`}
        style={isEnglish ? { fontFamily: "var(--font-roboto), sans-serif" } : undefined}
      >
        {children}
      </body>
    </html>
  );
}

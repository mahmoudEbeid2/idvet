import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Roboto } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, locales, content } from "@/lib/content";
import "../globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
  if (!isLocale(locale)) notFound();
  const site = content[locale];

  const isEnglish = site.locale === "en";

  return (
    <html lang={site.htmlLang} dir={isEnglish ? "ltr" : "rtl"}>
      <body
        className={`${ibmPlexSansArabic.variable} ${roboto.variable} antialiased`}
        style={isEnglish ? { fontFamily: "var(--font-roboto), sans-serif" } : undefined}
      >
        {children}
      </body>
    </html>
  );
}

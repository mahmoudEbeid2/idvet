import type { Metadata } from "next";
import { ibmPlexSansArabic, roboto } from "@/lib/fonts";
import { isLocale, locales, content } from "@/lib/content";
import { GTM_ID, SITE_URL, siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Shared by every page under /{locale}; each page sets its own title,
// description, canonical, hreflang and Open Graph through pageMetadata().
export const metadata: Metadata = {
  // Resolves relative Open Graph image URLs.
  metadataBase: new URL(SITE_URL),
  applicationName: "IDVET",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/assets/idvet-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

// Google Tag Manager, verbatim from the container's install snippet.
const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

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
      <head>
        {/* Google Tag Manager — as high in <head> as possible */}
        <script dangerouslySetInnerHTML={{ __html: GTM_SCRIPT }} />
      </head>
      <body
        className={`${ibmPlexSansArabic.variable} ${roboto.variable} antialiased`}
        style={isEnglish ? { fontFamily: "var(--font-roboto), sans-serif" } : undefined}
      >
        {/* Google Tag Manager (noscript) — immediately after <body> */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <JsonLd data={siteJsonLd(site)} />
        {children}
      </body>
    </html>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { ibmPlexSansArabic, roboto } from "@/lib/fonts";
import { content, isLocale } from "@/lib/content";
import { StatusPage } from "@/components/site/StatusPage";
import "./globals.css";

// Replaces the root layout when that layout itself fails, so it brings its
// own <html>/<body>, fonts and styles — the page inside is the same StatusPage
// (and header) as [locale]/error.tsx.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const first = (usePathname() ?? "/").split("/")[1] ?? "";
  const site = content[isLocale(first) ? first : "ar"];
  const isEnglish = site.locale === "en";
  return (
    <html lang={site.htmlLang} dir={isEnglish ? "ltr" : "rtl"} data-scroll-behavior="smooth">
      <body
        className={`${ibmPlexSansArabic.variable} ${roboto.variable} antialiased`}
        style={isEnglish ? { fontFamily: "var(--font-roboto), sans-serif" } : undefined}
      >
        <StatusPage kind="error" onRetry={retry} />
      </body>
    </html>
  );
}

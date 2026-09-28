import type { Metadata } from "next";
import { ibmPlexSansArabic, roboto } from "@/lib/fonts";
import { adminDir, adminHtmlLang, adminMessages } from "@/lib/admin/i18n";
import { getAdminLang } from "@/lib/admin/lang";
import { AdminLangProvider } from "@/components/admin/AdminLang";
import s from "@/components/admin/admin.module.css";
import "../globals.css";

// Separate root layout for the dashboard: Kurdish / Arabic / English (the
// switcher's cookie, Arabic by default), RTL except English, never indexed.

export async function generateMetadata(): Promise<Metadata> {
  const t = adminMessages[await getAdminLang()];
  return {
    title: { default: t.meta.defaultTitle, template: t.meta.titleTemplate },
    robots: { index: false, follow: false, nocache: true },
    icons: { icon: "/icon.svg" },
  };
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  return (
    <html lang={adminHtmlLang(lang)} dir={adminDir(lang)}>
      <body
        className={`${ibmPlexSansArabic.variable} ${roboto.variable} antialiased`}
        style={lang === "en" ? { fontFamily: "var(--font-roboto), sans-serif" } : undefined}
      >
        <AdminLangProvider lang={lang}>
          <div className={s.root}>{children}</div>
        </AdminLangProvider>
      </body>
    </html>
  );
}

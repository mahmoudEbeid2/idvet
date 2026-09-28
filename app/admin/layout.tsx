import type { Metadata } from "next";
import { ibmPlexSansArabic, roboto } from "@/lib/fonts";
import s from "@/components/admin/admin.module.css";
import "../globals.css";

// Separate root layout for the dashboard: Arabic RTL, never indexed.

export const metadata: Metadata = {
  title: { default: "لوحة التحكم — IDVET", template: "%s — لوحة التحكم IDVET" },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/icon.svg" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlexSansArabic.variable} ${roboto.variable} antialiased`}>
        <div className={s.root}>{children}</div>
      </body>
    </html>
  );
}

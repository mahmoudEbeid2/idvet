import type { SiteContent } from "@/lib/content";
import { ContactModalProvider } from "../ContactModalContext";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import s from "./catalog.module.css";

/**
 * The home page's header, contact section and footer around every other public
 * page (the catalog, and the 404/error pages with `page="other"`), plus the
 * contact modal that "Request a quote" and the contact section open.
 * `languagePath` is appended to /{locale} by the language switcher.
 */
export function CatalogShell({
  site,
  languagePath,
  page = "products",
  children,
}: {
  site: SiteContent;
  languagePath: string;
  page?: "products" | "other";
  children: React.ReactNode;
}) {
  return (
    <ContactModalProvider locale={site.locale} form={site.form}>
      <div className={s.root}>
        <SiteHeader site={site} page={page} languagePath={languagePath} />
        <main className={s.main}>{children}</main>
        <SiteFooter site={site} />
      </div>
    </ContactModalProvider>
  );
}

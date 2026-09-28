"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { CatalogShell } from "./products/CatalogShell";
import s from "./products/catalog.module.css";

/**
 * The 404 and error page body, inside the same shell (and so the same header)
 * as the rest of the site. not-found/error files get no params, so the locale
 * comes from the URL; an unknown locale (e.g. /fr/…) falls back to Kurdish,
 * the site default. The rest of the path goes to the language switcher, so
 * switching language on a 404 keeps the same path.
 */
export function StatusPage({ kind, onRetry }: { kind: "notFound" | "error"; onRetry?: () => void }) {
  const pathname = usePathname() ?? "/";
  const [, first = "", ...rest] = pathname.split("/");
  const locale = isLocale(first) ? first : "ku";
  const site = content[locale];
  const t = site.status;
  const languagePath = isLocale(first) ? (rest.length ? `/${rest.join("/")}` : "") : pathname;

  return (
    <CatalogShell site={site} languagePath={languagePath} page="other">
      <title>{`${kind === "notFound" ? t.notFoundTitle : t.errorTitle} — IDVET`}</title>
      <section className={`${s.wrap} ${s.status}`}>
        {kind === "notFound" && (
          <p className={s.statusCode} aria-hidden="true">
            404
          </p>
        )}
        <h1>{kind === "notFound" ? t.notFoundTitle : t.errorTitle}</h1>
        <p>{kind === "notFound" ? t.notFoundBody : t.errorBody}</p>
        <div className={s.statusActions}>
          {onRetry && (
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={onRetry}>
              {t.retry}
            </button>
          )}
          <Link href={`/${locale}`} className={`${s.btn} ${onRetry ? s.btnGhost : s.btnPrimary}`}>
            {t.backHome}
          </Link>
          <Link href={`/${locale}/products`} className={`${s.btn} ${s.btnGhost}`}>
            {t.browseProducts}
          </Link>
        </div>
      </section>
    </CatalogShell>
  );
}

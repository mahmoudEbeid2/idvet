import Link from "next/link";
import type { Lang } from "@/lib/admin/forms";
import type { AdminMessages } from "@/lib/admin/i18n";
import s from "./admin.module.css";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: React.ReactNode;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className={s.ph}>
      <div>
        {back && (
          <Link href={back.href} className={s.back}>
            {back.label}
          </Link>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className={s.actions}>{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  id,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={s.card} id={id}>
      {title && (
        <div className={s.cardH}>
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={s.cardB}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className={s.hint}>{hint}</p>}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "ok" | "err" | "info"; children: React.ReactNode }) {
  return (
    <p className={`${s.notice} ${s[tone]}`} role={tone === "err" ? "alert" : "status"}>
      {children}
    </p>
  );
}

export function StatusBadge({ published, t }: { published: boolean; t: AdminMessages }) {
  return published ? (
    <span className={`${s.badge} ${s.bGreen}`}>{t.common.published}</span>
  ) : (
    <span className={`${s.badge} ${s.bGray}`}>{t.common.draft}</span>
  );
}

/** "Missing translation: Kurdish, English" for the languages with an empty field. */
export function MissingBadge({ langs, t }: { langs: Lang[]; t: AdminMessages }) {
  if (langs.length === 0) return null;
  return (
    <span className={`${s.badge} ${s.bAmber}`}>
      {t.common.missing(langs.map((l) => t.common.langNames[l]).join(t.common.listSep))}
    </span>
  );
}

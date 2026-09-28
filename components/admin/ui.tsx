import Link from "next/link";
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
            → {back.label}
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

export function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className={`${s.badge} ${s.bGreen}`}>منشور</span>
  ) : (
    <span className={`${s.badge} ${s.bGray}`}>مسودة</span>
  );
}

export function MissingBadge({ langs }: { langs: string[] }) {
  if (langs.length === 0) return null;
  return <span className={`${s.badge} ${s.bAmber}`}>ترجمة ناقصة: {langs.join("، ")}</span>;
}

/** Arabic count + noun, e.g. "3 صور", "صورة واحدة". */
export function arCount(n: number, forms: { one: string; two: string; few: string; many: string }) {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n === 0 || (n % 100 >= 3 && n % 100 <= 10)) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}

export const IMAGES = { one: "صورة واحدة", two: "صورتان", few: "صور", many: "صورة" };
export const CERTS = { one: "شهادة واحدة", two: "شهادتان", few: "شهادات", many: "شهادة" };
export const PRODUCTS = { one: "منتج واحد", two: "منتجان", few: "منتجات", many: "منتج" };

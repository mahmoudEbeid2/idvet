import Link from "next/link";
import type { AdminMessages } from "@/lib/admin/i18n";
import s from "./admin.module.css";

// Pieces shared by /admin/messages and /admin/quotes.

export function InboxFilters({
  base,
  q,
  status,
  placeholder,
  options,
  t,
}: {
  base: string;
  q?: string;
  status?: string;
  placeholder: string;
  options: [value: string, label: string][];
  t: AdminMessages;
}) {
  return (
    <form className={s.filters} method="get" role="search">
      <input className={`${s.in} ${s.q}`} name="q" type="search" defaultValue={q} placeholder={placeholder} aria-label={placeholder} />
      <select className={s.in} name="status" defaultValue={status ?? ""} aria-label={t.inbox.status}>
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button className={`${s.btn} ${s.secondary}`} type="submit">
        {t.products.filter}
      </button>
      {(q || status) && (
        <Link href={base} className={s.link}>
          {t.products.clearFilter}
        </Link>
      )}
    </form>
  );
}

const STATUS_TONE: Record<string, string> = {
  new: s.bBlue,
  read: s.bGray,
  archived: s.bGray,
  contacted: s.bAmber,
  closed: s.bGreen,
};

export function InboxStatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`${s.badge} ${STATUS_TONE[status] ?? s.bGray}`}>{label}</span>;
}

export function MailFailedBadge({ t }: { t: AdminMessages }) {
  return <span className={`${s.badge} ${s.bRed}`}>{t.inbox.mailFailed}</span>;
}

/** Status select + save, as a plain form posting to a Server Action. */
export function StatusForm({
  id,
  status,
  options,
  action,
  t,
}: {
  id: string;
  status: string;
  options: [value: string, label: string][];
  action: (form: FormData) => Promise<void>;
  t: AdminMessages;
}) {
  return (
    <form action={action} className={s.filters}>
      <input type="hidden" name="id" value={id} />
      <select className={s.in} name="status" defaultValue={status} aria-label={t.inbox.changeStatus}>
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button className={`${s.btn} ${s.secondary}`} type="submit">
        {t.inbox.saveStatus}
      </button>
    </form>
  );
}

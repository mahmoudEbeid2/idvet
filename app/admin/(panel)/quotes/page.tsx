import type { Metadata } from "next";
import Link from "next/link";
import { QUOTE_STATUSES, listQuoteRequests } from "@/lib/admin/data";
import { formatAdminDate } from "@/lib/admin/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { InboxFilters, InboxStatusBadge, MailFailedBadge } from "@/components/admin/InboxParts";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).inbox.quotesTitle };
}

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; deleted?: string }>;
}) {
  const { q, status, deleted } = await searchParams;
  const [quotes, lang, t] = await Promise.all([listQuoteRequests({ q, status }), getAdminLang(), getAdminT()]);

  return (
    <>
      <PageHeader title={t.inbox.quotesTitle} description={t.inbox.quotesDescription} />
      <div className={s.stack}>
        {deleted && <Notice tone="ok">{t.inbox.deleted}</Notice>}
        <InboxFilters
          base="/admin/quotes"
          q={q}
          status={status}
          placeholder={t.inbox.searchQuotes}
          options={[["", t.inbox.allStatuses], ...QUOTE_STATUSES.map((v): [string, string] => [v, t.inbox.quoteStatus[v]])]}
          t={t}
        />
        <Card>
          {quotes.length ? (
            <ul className={s.rows}>
              {quotes.map((r) => {
                const unread = !r.readAt;
                return (
                  <li key={r.id}>
                    <Link href={`/admin/quotes/${r.id}`} className={`${s.row} ${unread ? s.unread : ""}`}>
                      <span className={unread ? s.unreadDot : s.readDot} aria-hidden="true" />
                      <span className={s.rowText}>
                        <b>
                          <bdi>{r.name}</bdi> <span className={s.rowSub}>· <bdi>{r.productName}</bdi></span>
                        </b>
                        <span>
                          <bdi>{r.contact}</bdi>
                          {r.quantity ? <> · {t.inbox.quantity}: <bdi>{r.quantity}</bdi></> : null}
                          {r.company ? <> · <bdi>{r.company}</bdi></> : null}
                        </span>
                      </span>
                      <span className={s.badges}>
                        {!r.mailSent && <MailFailedBadge t={t} />}
                        {unread && <span className={`${s.badge} ${s.bBlue}`}>{t.inbox.unread}</span>}
                        <InboxStatusBadge status={r.status} label={t.inbox.quoteStatus[r.status]} />
                      </span>
                      <time className={s.when} dateTime={r.createdAt.toISOString()}>
                        {formatAdminDate(r.createdAt, lang)}
                      </time>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={s.empty}>{q || status ? t.inbox.noMatch : t.inbox.emptyQuotes}</p>
          )}
        </Card>
      </div>
    </>
  );
}

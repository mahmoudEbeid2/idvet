import type { Metadata } from "next";
import Link from "next/link";
import { getUnreadCounts, listContactMessages, listQuoteRequests } from "@/lib/admin/data";
import { formatAdminDate, type AdminLang, type AdminMessages } from "@/lib/admin/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).inbox.title };
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; deleted?: string }>;
}) {
  const [{ tab, deleted }, unread, lang, t] = await Promise.all([searchParams, getUnreadCounts(), getAdminLang(), getAdminT()]);
  const showQuotes = tab === "quotes";

  const tabs = [
    { key: "messages", label: t.inbox.messages, count: unread.messages, active: !showQuotes },
    { key: "quotes", label: t.inbox.quotes, count: unread.quotes, active: showQuotes },
  ];

  return (
    <>
      <PageHeader title={t.inbox.title} description={t.inbox.description} />
      <div className={s.stack}>
        {deleted && <Notice tone="ok">{t.inbox.deleted}</Notice>}
        <nav className={s.tabs}>
          {tabs.map((item) => (
            <Link key={item.key} href={`/admin/inbox?tab=${item.key}`} aria-current={item.active ? "page" : undefined}>
              {item.label}
              {item.count > 0 && <span className={`${s.badge} ${s.bBlue}`}>{t.inbox.unreadCount(item.count)}</span>}
            </Link>
          ))}
        </nav>
        <Card>{showQuotes ? <QuoteRows lang={lang} t={t} /> : <MessageRows lang={lang} t={t} />}</Card>
      </div>
    </>
  );
}

type RowProps = { lang: AdminLang; t: AdminMessages };

async function MessageRows({ lang, t }: RowProps) {
  const messages = await listContactMessages();
  if (!messages.length) return <p className={s.empty}>{t.inbox.emptyMessages}</p>;
  return (
    <ul className={s.rows}>
      {messages.map((m) => (
        <li key={m.id}>
          <Link href={`/admin/inbox/message/${m.id}`} className={`${s.row} ${m.isRead ? "" : s.unread}`}>
            <span className={m.isRead ? s.readDot : s.unreadDot} aria-hidden="true" />
            <span className={s.rowText}>
              <b>
                <bdi>{m.name}</bdi> <span className={`${s.rowSub} ${s.latin}`}>{m.email}</span>
              </b>
              <span>
                {m.subject ? <b>{m.subject} · </b> : null}
                {m.message}
              </span>
            </span>
            {!m.isRead && <span className={`${s.badge} ${s.bBlue}`}>{t.inbox.unread}</span>}
            <time className={s.when} dateTime={m.createdAt.toISOString()}>
              {formatAdminDate(m.createdAt, lang)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function QuoteRows({ lang, t }: RowProps) {
  const quotes = await listQuoteRequests();
  if (!quotes.length) return <p className={s.empty}>{t.inbox.emptyQuotes}</p>;
  return (
    <ul className={s.rows}>
      {quotes.map((q) => (
        <li key={q.id}>
          <Link href={`/admin/inbox/quote/${q.id}`} className={`${s.row} ${q.isRead ? "" : s.unread}`}>
            <span className={q.isRead ? s.readDot : s.unreadDot} aria-hidden="true" />
            <span className={s.rowText}>
              <b>
                <bdi>{q.name}</bdi> <span className={s.rowSub}>· <bdi>{q.productName}</bdi></span>
              </b>
              <span>
                <bdi>{q.contact}</bdi> · {t.inbox.quantity}: <bdi>{q.quantity}</bdi>
              </span>
            </span>
            {!q.isRead && <span className={`${s.badge} ${s.bBlue}`}>{t.inbox.unread}</span>}
            <time className={s.when} dateTime={q.createdAt.toISOString()}>
              {formatAdminDate(q.createdAt, lang)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}

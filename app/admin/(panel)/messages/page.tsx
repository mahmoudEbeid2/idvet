import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_STATUSES, listContactMessages } from "@/lib/admin/data";
import { formatAdminDate, localeDir } from "@/lib/admin/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { InboxFilters, InboxStatusBadge, MailFailedBadge } from "@/components/admin/InboxParts";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).inbox.messagesTitle };
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; deleted?: string }>;
}) {
  const { q, status, deleted } = await searchParams;
  const [messages, lang, t] = await Promise.all([listContactMessages({ q, status }), getAdminLang(), getAdminT()]);

  return (
    <>
      <PageHeader title={t.inbox.messagesTitle} description={t.inbox.messagesDescription} />
      <div className={s.stack}>
        {deleted && <Notice tone="ok">{t.inbox.deleted}</Notice>}
        <InboxFilters
          base="/admin/messages"
          q={q}
          status={status}
          placeholder={t.inbox.searchMessages}
          options={[
            ["", t.inbox.activeStatuses],
            ...CONTACT_STATUSES.map((v): [string, string] => [v, t.inbox.messageStatus[v]]),
            ["all", t.inbox.allStatuses],
          ]}
          t={t}
        />
        <Card>
          {messages.length ? (
            <ul className={s.rows}>
              {messages.map((m) => {
                const unread = m.status === "new";
                return (
                  <li key={m.id}>
                    <Link href={`/admin/messages/${m.id}`} className={`${s.row} ${unread ? s.unread : ""}`}>
                      <span className={unread ? s.unreadDot : s.readDot} aria-hidden="true" />
                      <span className={s.rowText}>
                        <b>
                          <bdi>{m.name}</bdi> <span className={`${s.rowSub} ${s.latin}`}>{m.email}</span>
                        </b>
                        <span dir={localeDir(m.locale)}>
                          {m.subject ? <b>{m.subject} · </b> : null}
                          {m.message}
                        </span>
                      </span>
                      <span className={s.badges}>
                        {!m.mailSent && <MailFailedBadge t={t} />}
                        <InboxStatusBadge status={m.status} label={t.inbox.messageStatus[m.status]} />
                      </span>
                      <time className={s.when} dateTime={m.createdAt.toISOString()}>
                        {formatAdminDate(m.createdAt, lang)}
                      </time>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={s.empty}>{q || status ? t.inbox.noMatch : t.inbox.emptyMessages}</p>
          )}
        </Card>
      </div>
    </>
  );
}

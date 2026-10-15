import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContactMessage } from "@/lib/admin/data";
import { formatAdminDate, localeName } from "@/lib/admin/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { InboxDelete, MarkRead } from "@/components/admin/InboxItemActions";
import { Card, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).inbox.messageTitle };
}

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [message, lang, t] = await Promise.all([getContactMessage(id), getAdminLang(), getAdminT()]);
  if (!message) notFound();

  return (
    <>
      <MarkRead kind="message" id={message.id} isRead={message.isRead} />
      <PageHeader
        title={<bdi>{message.subject || t.inbox.messageTitle}</bdi>}
        back={{ href: "/admin/inbox?tab=messages", label: `${t.common.backArrow} ${t.inbox.back}` }}
        actions={
          <>
            {message.phone && (
              <a href={`tel:${message.phone.replace(/[^\d+]/g, "")}`} className={`${s.btn} ${s.secondary}`}>
                {t.inbox.call}
              </a>
            )}
            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "IDVET"}`)}`}
              className={`${s.btn} ${s.primary}`}
            >
              {t.inbox.reply}
            </a>
          </>
        }
      />
      <div className={s.stack}>
        <Card>
          <dl className={s.dl}>
            <dt>{t.inbox.name}</dt>
            <dd>
              <bdi>{message.name}</bdi>
            </dd>
            <dt>{t.inbox.email}</dt>
            <dd className={s.latin}>
              <a href={`mailto:${message.email}`} className={s.link}>
                {message.email}
              </a>
            </dd>
            {message.phone && (
              <>
                <dt>{t.inbox.phone}</dt>
                <dd className={s.latin} dir="ltr" style={{ textAlign: "start" }}>
                  {message.phone}
                </dd>
              </>
            )}
            <dt>{t.inbox.subject}</dt>
            <dd>{message.subject ? <bdi>{message.subject}</bdi> : <span className={s.rowSub}>{t.inbox.noSubject}</span>}</dd>
            <dt>{t.inbox.language}</dt>
            <dd>{localeName(message.locale, t)}</dd>
            <dt>{t.inbox.received}</dt>
            <dd>
              <time dateTime={message.createdAt.toISOString()}>{formatAdminDate(message.createdAt, lang)}</time>
            </dd>
          </dl>
        </Card>
        <Card title={t.inbox.message}>
          <p className={s.msgBody} dir="auto">
            {message.message}
          </p>
        </Card>
        <Card title={t.inbox.deleteTitle}>
          <InboxDelete kind="message" id={message.id} label={t.inbox.deleteMessage} />
        </Card>
      </div>
    </>
  );
}

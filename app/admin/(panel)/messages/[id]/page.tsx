import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setMessageStatus } from "@/app/admin/actions";
import { CONTACT_STATUSES, getContactMessage, listReplyTemplates } from "@/lib/admin/data";
import { CUSTOMER_TEXT, customerLang, isEmailAddress, normalizePhone, telHref } from "@/lib/admin/replyKit";
import { replyFromAddress } from "@/lib/mailer";
import { formatAdminDate, localeDir, localeName } from "@/lib/admin/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { InboxDelete, MarkRead } from "@/components/admin/InboxItemActions";
import { InboxStatusBadge, StatusForm } from "@/components/admin/InboxParts";
import { PhoneButtons, ReplyBox } from "@/components/admin/ReplyBox";
import { ReplyHistory } from "@/components/admin/ReplyHistory";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).inbox.messageTitle };
}

export default async function MessagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [message, lang, t, templates] = await Promise.all([
    getContactMessage(id),
    getAdminLang(),
    getAdminT(),
    listReplyTemplates(),
  ]);
  if (!message) notFound();
  // Opening it marks it read (MarkRead); show it as such right away.
  const status = message.status === "new" ? "read" : message.status;
  const phone = normalizePhone(message.phone);
  const tel = phone ? telHref(phone) : null;
  const email = isEmailAddress(message.email) ? message.email.trim() : null;
  const customer = CUSTOMER_TEXT[customerLang(message.locale)];

  return (
    <>
      <MarkRead kind="message" id={message.id} unread={message.status === "new"} />
      <PageHeader
        title={<bdi>{message.subject || t.inbox.messageTitle}</bdi>}
        back={{ href: "/admin/messages", label: `${t.common.backArrow} ${t.inbox.messagesTitle}` }}
        actions={
          <>
            {phone && <PhoneButtons kind="message" id={message.id} phone={phone} greeting={customer.whatsappMessage(message.name)} />}
            {email && (
              <a href="#reply" className={`${s.btn} ${s.primary}`}>
                {t.inbox.reply}
              </a>
            )}
          </>
        }
      />
      <div className={s.stack}>
        {saved && <Notice tone="ok">{t.inbox.statusSaved}</Notice>}
        {!message.mailSent && (
          <Notice tone="err">
            {t.inbox.mailFailedDetail} <span className={s.latin}>{message.mailError || "—"}</span>
          </Notice>
        )}
        <Card>
          <dl className={s.dl}>
            <dt>{t.inbox.name}</dt>
            <dd>
              <bdi>{message.name}</bdi>
            </dd>
            <dt>{t.inbox.email}</dt>
            <dd className={s.latin}>
              {email ? (
                <a href="#reply" className={s.link}>
                  {message.email}
                </a>
              ) : (
                <bdi>{message.email}</bdi>
              )}
            </dd>
            {tel && (
              <>
                <dt>{t.inbox.phone}</dt>
                <dd className={s.latin}>
                  <a href={tel} className={s.link} dir="ltr">
                    {message.phone}
                  </a>
                </dd>
              </>
            )}
            <dt>{t.inbox.subject}</dt>
            <dd>{message.subject ? <bdi>{message.subject}</bdi> : <span className={s.rowSub}>{t.inbox.noSubject}</span>}</dd>
            <dt>{t.inbox.status}</dt>
            <dd>
              <InboxStatusBadge status={status} label={t.inbox.messageStatus[status]} />
            </dd>
            <dt>{t.inbox.language}</dt>
            <dd>{localeName(message.locale, t)}</dd>
            <dt>{t.inbox.received}</dt>
            <dd>
              <time dateTime={message.createdAt.toISOString()}>{formatAdminDate(message.createdAt, lang)}</time>
            </dd>
          </dl>
        </Card>
        <Card title={t.inbox.message}>
          <p className={s.msgBody} dir={localeDir(message.locale)}>
            {message.message}
          </p>
        </Card>
        <Card title={t.reply.title} description={email ? t.reply.messageStatusNote : undefined} id="reply">
          <ReplyBox
            kind="message"
            id={message.id}
            email={email}
            from={replyFromAddress()}
            defaultSubject={customer.messageSubject(message.subject ?? "")}
            placeholders={{ name: message.name, product: message.subject ?? "" }}
            templates={templates.map(({ id, lang, title, body }) => ({ id, lang, title, body }))}
            customerLang={customerLang(message.locale)}
          />
        </Card>
        <Card title={t.reply.history}>
          <ReplyHistory replies={message.replies} lang={lang} t={t} />
        </Card>
        <Card title={t.inbox.changeStatus}>
          <StatusForm
            id={message.id}
            status={status}
            options={CONTACT_STATUSES.map((v) => [v, t.inbox.messageStatus[v]])}
            action={setMessageStatus}
            t={t}
          />
        </Card>
        <Card title={t.inbox.deleteTitle}>
          <InboxDelete kind="message" id={message.id} label={t.inbox.deleteMessage} />
        </Card>
      </div>
    </>
  );
}

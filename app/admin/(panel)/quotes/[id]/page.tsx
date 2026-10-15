import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { setQuoteStatus } from "@/app/admin/actions";
import { QUOTE_STATUSES, getQuoteRequest } from "@/lib/admin/data";
import { formatAdminDate, localeDir, localeName } from "@/lib/admin/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { InboxDelete, MarkRead } from "@/components/admin/InboxItemActions";
import { InboxStatusBadge, StatusForm } from "@/components/admin/InboxParts";
import { QuoteProduct } from "@/components/admin/QuoteProduct";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).inbox.quoteTitle };
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [quote, lang, t] = await Promise.all([getQuoteRequest(id), getAdminLang(), getAdminT()]);
  if (!quote) notFound();

  // The visitor typed either a phone number or an email address.
  const isEmail = z.string().email().safeParse(quote.contact).success;
  const contactHref = isEmail
    ? `mailto:${quote.contact}?subject=${encodeURIComponent(`Re: ${quote.productName}`)}`
    : `tel:${quote.contact.replace(/[^\d+]/g, "")}`;

  const optionalRows: [string, string | null][] = [
    [t.inbox.quantity, quote.quantity],
    [t.inbox.company, quote.company],
    [t.inbox.city, quote.city],
  ];

  return (
    <>
      <MarkRead kind="quote" id={quote.id} unread={!quote.readAt} />
      <PageHeader
        title={<bdi>{quote.product?.name ?? quote.productName}</bdi>}
        description={t.inbox.quoteTitle}
        back={{ href: "/admin/quotes", label: `${t.common.backArrow} ${t.inbox.quotesTitle}` }}
        actions={
          <a href={contactHref} className={`${s.btn} ${s.primary}`}>
            {isEmail ? t.inbox.reply : t.inbox.call}
          </a>
        }
      />
      <div className={s.stack}>
        {saved && <Notice tone="ok">{t.inbox.statusSaved}</Notice>}
        {!quote.mailSent && (
          <Notice tone="err">
            {t.inbox.mailFailedDetail} <span className={s.latin}>{quote.mailError || "—"}</span>
          </Notice>
        )}
        <Card>
          <dl className={s.dl}>
            <dt>{t.inbox.name}</dt>
            <dd>
              <bdi>{quote.name}</bdi>
            </dd>
            <dt>{t.inbox.contact}</dt>
            <dd className={s.latin}>
              <a href={contactHref} className={s.link} dir="ltr">
                {quote.contact}
              </a>
            </dd>
            {optionalRows.map(([label, value]) =>
              value ? (
                <div key={label} style={{ display: "contents" }}>
                  <dt>{label}</dt>
                  <dd>
                    <bdi>{value}</bdi>
                  </dd>
                </div>
              ) : null,
            )}
            <dt>{t.inbox.status}</dt>
            <dd>
              <InboxStatusBadge status={quote.status} label={t.inbox.quoteStatus[quote.status]} />
            </dd>
            <dt>{t.inbox.language}</dt>
            <dd>{localeName(quote.locale, t)}</dd>
            <dt>{t.inbox.received}</dt>
            <dd>
              <time dateTime={quote.createdAt.toISOString()}>{formatAdminDate(quote.createdAt, lang)}</time>
            </dd>
          </dl>
        </Card>
        <QuoteProduct
          product={quote.product}
          snapshot={{ name: quote.productName, slug: quote.productSlug, image: quote.snapshotImage }}
          t={t}
        />
        {quote.message && (
          <Card title={t.inbox.message}>
            <p className={s.msgBody} dir={localeDir(quote.locale)}>
              {quote.message}
            </p>
          </Card>
        )}
        <Card title={t.inbox.changeStatus}>
          <StatusForm
            id={quote.id}
            status={quote.status}
            options={QUOTE_STATUSES.map((v) => [v, t.inbox.quoteStatus[v]])}
            action={setQuoteStatus}
            t={t}
          />
        </Card>
        <Card title={t.inbox.deleteTitle}>
          <InboxDelete kind="quote" id={quote.id} label={t.inbox.deleteQuote} />
        </Card>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getQuoteRequest } from "@/lib/admin/data";
import { formatAdminDate, localeName } from "@/lib/admin/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { InboxDelete, MarkRead } from "@/components/admin/InboxItemActions";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).inbox.quoteTitle };
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote, lang, t] = await Promise.all([getQuoteRequest(id), getAdminLang(), getAdminT()]);
  if (!quote) notFound();

  // The visitor typed either a phone number or an email address.
  const isEmail = z.string().email().safeParse(quote.contact).success;
  const contactHref = isEmail
    ? `mailto:${quote.contact}?subject=${encodeURIComponent(`Re: ${quote.productName}`)}`
    : `tel:${quote.contact.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <MarkRead kind="quote" id={quote.id} isRead={quote.isRead} />
      <PageHeader
        title={<bdi>{quote.productName}</bdi>}
        description={t.inbox.quoteTitle}
        back={{ href: "/admin/inbox?tab=quotes", label: `${t.common.backArrow} ${t.inbox.back}` }}
        actions={
          <a href={contactHref} className={`${s.btn} ${s.primary}`}>
            {isEmail ? t.inbox.reply : t.inbox.call}
          </a>
        }
      />
      <div className={s.stack}>
        <Card>
          <dl className={s.dl}>
            <dt>{t.inbox.product}</dt>
            <dd>
              {quote.product ? (
                <span className={s.badges}>
                  <a href={quote.product.href} target="_blank" rel="noopener" className={s.link}>
                    <bdi>{quote.product.name}</bdi> ↗
                  </a>
                  <StatusBadge published={quote.product.published} t={t} />
                  <Link href={`/admin/products/${quote.product.id}`} className={`${s.link} ${s.linkMuted}`}>
                    {t.inbox.editProduct}
                  </Link>
                </span>
              ) : (
                <>
                  <bdi>{quote.productName}</bdi>{" "}
                  <span className={`${s.badge} ${s.bGray}`}>{t.inbox.productDeleted}</span>
                </>
              )}
            </dd>
            <dt>{t.inbox.nameCompany}</dt>
            <dd>
              <bdi>{quote.name}</bdi>
            </dd>
            <dt>{t.inbox.contact}</dt>
            <dd className={s.latin}>
              <a href={contactHref} className={s.link} dir="ltr">
                {quote.contact}
              </a>
            </dd>
            <dt>{t.inbox.quantity}</dt>
            <dd>
              <bdi>{quote.quantity}</bdi>
            </dd>
            <dt>{t.inbox.language}</dt>
            <dd>{localeName(quote.locale, t)}</dd>
            <dt>{t.inbox.received}</dt>
            <dd>
              <time dateTime={quote.createdAt.toISOString()}>{formatAdminDate(quote.createdAt, lang)}</time>
            </dd>
          </dl>
        </Card>
        <Card title={t.inbox.deleteTitle}>
          <InboxDelete kind="quote" id={quote.id} label={t.inbox.deleteQuote} />
        </Card>
      </div>
    </>
  );
}

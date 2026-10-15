"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { logWhatsApp, sendReply, type ReplyState } from "@/app/admin/actions";
import { fillPlaceholders, telHref, whatsappHref } from "@/lib/admin/replyKit";
import { ADMIN_LANG_NAMES, isAdminLang } from "@/lib/admin/i18n";
import { useAdminT } from "./AdminLang";
import s from "./admin.module.css";

export type ReplyTemplateOption = { id: string; lang: string; title: string; body: string };

/**
 * The reply form on a quote / message page: subject, text, quick replies
 * (with {name} and {product} filled in), sent by the sendReply action from
 * info@idvet.co. Without a valid email only the hint is shown.
 */
export function ReplyBox({
  kind,
  id,
  email,
  from,
  defaultSubject,
  placeholders,
  templates,
  customerLang,
}: {
  kind: "quote" | "message";
  id: string;
  email: string | null;
  from: string;
  defaultSubject: string;
  placeholders: { name: string; product: string };
  templates: ReplyTemplateOption[];
  customerLang: string;
}) {
  const t = useAdminT();
  const [state, action, pending] = useActionState<ReplyState, FormData>(sendReply, {});

  if (!email) {
    return <p className={`${s.notice} ${s.info}`}>{t.reply.noEmail}</p>;
  }

  // The customer's language first, then the others.
  const langs = [customerLang, ...["ar", "ku", "en"].filter((l) => l !== customerLang)];
  const groups = langs
    .map((lang) => ({ lang, items: templates.filter((tpl) => tpl.lang === lang) }))
    .filter((g) => g.items.length);
  const fields = state.ok ? undefined : state.fields;

  return (
    <div className={s.stackTight} style={{ display: "grid" }}>
      {state.ok && state.to && (
        <p className={`${s.notice} ${s.ok}`} role="status">
          {t.reply.sent(state.to)}
        </p>
      )}
      {state.error && (
        <p className={`${s.notice} ${s.err}`} role="alert">
          {state.error} {state.detail && <span className={s.latin}>{state.detail}</span>}
        </p>
      )}
      <ReplyForm
        // A fresh, empty form after each successful send.
        key={state.replyId ?? "draft"}
        kind={kind}
        id={id}
        email={email}
        from={from}
        subject={fields?.subject ?? defaultSubject}
        body={fields?.body ?? ""}
        placeholders={placeholders}
        groups={groups}
        action={action}
        pending={pending}
      />
    </div>
  );
}

function ReplyForm({
  kind,
  id,
  email,
  from,
  subject,
  body,
  placeholders,
  groups,
  action,
  pending,
}: {
  kind: string;
  id: string;
  email: string;
  from: string;
  subject: string;
  body: string;
  placeholders: { name: string; product: string };
  groups: { lang: string; items: ReplyTemplateOption[] }[];
  action: (form: FormData) => void;
  pending: boolean;
}) {
  const t = useAdminT();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  /** Puts the template at the cursor (or replaces the selection), placeholders filled in. */
  function insertTemplate(templateId: string) {
    const tpl = groups.flatMap((g) => g.items).find((x) => x.id === templateId);
    const area = bodyRef.current;
    if (!tpl || !area) return;
    const text = fillPlaceholders(tpl.body, placeholders);
    const { selectionStart: start, selectionEnd: end, value } = area;
    const before = value.slice(0, start);
    const glue = before && !before.endsWith("\n") ? "\n\n" : "";
    area.value = before + glue + text + value.slice(end);
    const caret = (before + glue + text).length;
    area.focus();
    area.setSelectionRange(caret, caret);
  }

  return (
    <form action={action} className={s.stackTight} style={{ display: "grid" }}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <dl className={s.dl}>
        <dt>{t.reply.from}</dt>
        <dd className={s.latin}>{from}</dd>
        <dt>{t.reply.to}</dt>
        <dd className={s.latin}>{email}</dd>
      </dl>
      <div className={s.field}>
        <label className={s.label} htmlFor={`reply-subject-${id}`}>
          {t.reply.subject}
        </label>
        <input id={`reply-subject-${id}`} name="subject" className={s.in} defaultValue={subject} maxLength={200} required dir="auto" />
      </div>
      {groups.length > 0 && (
        <div className={s.field}>
          <label className={s.label} htmlFor={`reply-template-${id}`}>
            {t.reply.template}
          </label>
          <select
            id={`reply-template-${id}`}
            className={s.in}
            value=""
            onChange={(e) => insertTemplate(e.target.value)}
          >
            <option value="">{t.reply.templatePick}</option>
            {groups.map((g) => (
              <optgroup key={g.lang} label={isAdminLang(g.lang) ? ADMIN_LANG_NAMES[g.lang] : g.lang}>
                {g.items.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}
      <div className={s.field}>
        <label className={s.label} htmlFor={`reply-body-${id}`}>
          {t.reply.body}
        </label>
        <textarea
          ref={bodyRef}
          id={`reply-body-${id}`}
          name="body"
          className={s.in}
          rows={9}
          maxLength={10000}
          required
          dir="auto"
          defaultValue={body}
        />
        <p className={s.hint}>{t.reply.bodyHint}</p>
      </div>
      <div className={s.formActions}>
        <button type="submit" className={`${s.btn} ${s.primary}`} disabled={pending} aria-busy={pending}>
          {pending ? t.reply.sending : t.reply.send}
        </button>
        <Link href="/admin/reply-templates" className={s.link}>
          {t.reply.manageTemplates}
        </Link>
      </div>
    </form>
  );
}

/** WhatsApp (prefilled greeting, click logged in the history) and call buttons for a phone number. */
export function PhoneButtons({
  kind,
  id,
  phone,
  greeting,
}: {
  kind: "quote" | "message";
  id: string;
  /** International digits (lib/admin/replyKit normalizePhone). */
  phone: string;
  greeting: string;
}) {
  const t = useAdminT();
  return (
    <>
      <a
        href={whatsappHref(phone, greeting)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${s.btn} ${s.whatsapp}`}
        onClick={() => void logWhatsApp(kind, id)}
      >
        {t.reply.whatsapp}
      </a>
      <a href={telHref(phone)} className={`${s.btn} ${s.secondary}`}>
        {t.reply.call}
      </a>
    </>
  );
}

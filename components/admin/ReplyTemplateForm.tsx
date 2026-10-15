"use client";

import { useActionState } from "react";
import Link from "next/link";
import { deleteReplyTemplate, saveReplyTemplate } from "@/app/admin/actions";
import type { FormState } from "@/lib/admin/forms";
import { ADMIN_LANG_NAMES, ADMIN_LANGS } from "@/lib/admin/i18n";
import { useAdminT } from "./AdminLang";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { FormError } from "./FormError";
import s from "./admin.module.css";

export type TemplateValues = { id?: string; lang: string; title: string; body: string; sortOrder: number };

/** Add or edit one quick reply (/admin/reply-templates). */
export function ReplyTemplateForm({ template }: { template?: TemplateValues }) {
  const t = useAdminT();
  const [state, action, pending] = useActionState<FormState, FormData>(saveReplyTemplate, {});
  const f = state.fields;
  const value = (name: keyof TemplateValues) => f?.[name] ?? String(template?.[name] ?? "");

  return (
    <form action={action} className={s.stackTight} style={{ display: "grid" }}>
      <FormError state={state} />
      {template?.id && <input type="hidden" name="id" value={template.id} />}
      <div className={s.grid2}>
        <div className={s.field}>
          <label className={s.label} htmlFor="tpl-title">
            {t.templates.name}
          </label>
          <input id="tpl-title" name="title" className={s.in} maxLength={120} required defaultValue={value("title")} dir="auto" />
        </div>
        <div className={s.grid2} style={{ gap: 12 }}>
          <div className={s.field}>
            <label className={s.label} htmlFor="tpl-lang">
              {t.templates.lang}
            </label>
            <select id="tpl-lang" name="lang" className={s.in} defaultValue={value("lang") || "ar"}>
              {ADMIN_LANGS.map((lang) => (
                <option key={lang} value={lang}>
                  {ADMIN_LANG_NAMES[lang]}
                </option>
              ))}
            </select>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="tpl-order">
              {t.common.order}
            </label>
            <input id="tpl-order" name="sortOrder" type="number" className={s.in} defaultValue={value("sortOrder") || "0"} />
          </div>
        </div>
      </div>
      <div className={s.field}>
        <label className={s.label} htmlFor="tpl-body">
          {t.templates.body}
        </label>
        <textarea id="tpl-body" name="body" className={s.in} rows={8} maxLength={5000} required defaultValue={value("body")} dir="auto" />
        <p className={s.hint}>{t.templates.description}</p>
      </div>
      <div className={s.formActions}>
        <button type="submit" className={`${s.btn} ${s.primary}`} disabled={pending}>
          {pending ? t.common.saving : t.common.save}
        </button>
        {template?.id && (
          <Link href="/admin/reply-templates" className={`${s.btn} ${s.secondary}`}>
            {t.common.cancel}
          </Link>
        )}
      </div>
    </form>
  );
}

export function ReplyTemplateDelete({ id }: { id: string }) {
  const t = useAdminT();
  return <ConfirmDeleteButton label={t.templates.deleteOne} onConfirm={() => deleteReplyTemplate(id)} />;
}

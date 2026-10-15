import type { Metadata } from "next";
import Link from "next/link";
import { listReplyTemplates } from "@/lib/admin/data";
import { ADMIN_LANG_NAMES, ADMIN_LANGS } from "@/lib/admin/i18n";
import { getAdminT } from "@/lib/admin/lang";
import { textDir } from "@/lib/admin/replyKit";
import { ReplyTemplateDelete, ReplyTemplateForm } from "@/components/admin/ReplyTemplateForm";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).templates.title };
}

/** Quick replies for the reply box on quote and message pages: the list per language, and an add / edit form. */
export default async function ReplyTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string; deleted?: string }>;
}) {
  const [templates, { edit, saved, deleted }, t] = await Promise.all([listReplyTemplates(), searchParams, getAdminT()]);
  const editing = edit ? templates.find((tpl) => tpl.id === edit) : undefined;

  return (
    <>
      <PageHeader title={t.templates.title} description={t.templates.description} />
      <div className={s.stack}>
        {(saved || deleted) && <Notice tone="ok">{saved ? t.templates.saved : t.templates.deleted}</Notice>}
        <Card title={editing ? t.templates.edit : t.templates.add} id="template-form">
          <ReplyTemplateForm
            key={editing?.id ?? "new"}
            template={editing && { id: editing.id, lang: editing.lang, title: editing.title, body: editing.body, sortOrder: editing.sortOrder }}
          />
        </Card>
        {templates.length === 0 ? (
          <Card>
            <p className={s.rowSub}>{t.templates.empty}</p>
          </Card>
        ) : (
          ADMIN_LANGS.map((lang) => {
            const items = templates.filter((tpl) => tpl.lang === lang);
            if (!items.length) return null;
            return (
              <Card key={lang} title={ADMIN_LANG_NAMES[lang]}>
                <ol className={s.replies}>
                  {items.map((tpl) => (
                    <li key={tpl.id} className={s.reply}>
                      <div className={s.replyHead}>
                        <b>
                          <bdi>{tpl.title}</bdi>
                        </b>
                        <span className={`${s.latin} ${s.rowSub}`}>#{tpl.sortOrder}</span>
                      </div>
                      <p className={s.msgBody} dir={textDir(tpl.body)}>
                        {tpl.body}
                      </p>
                      <div className={s.formActions}>
                        <Link href={`/admin/reply-templates?edit=${tpl.id}#template-form`} className={`${s.btn} ${s.secondary}`}>
                          {t.common.edit}
                        </Link>
                        <ReplyTemplateDelete id={tpl.id} />
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}

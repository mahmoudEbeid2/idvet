"use client";

import Link from "next/link";
import { saveProduct } from "@/app/admin/actions";
import { KNOWN_BRAND_NAMES } from "@/lib/catalog/brands";
import type { Lang } from "@/lib/admin/forms";
import { LangTabs, filledLangs, langAttrs } from "./LangTabs";
import { FormError } from "./FormError";
import { useAdminT } from "./AdminLang";
import { useFormAction } from "./useFormAction";
import { Card, Field } from "./ui";
import s from "./admin.module.css";

const TEXT_FIELDS = ["name", "summary", "dosageForm", "packaging", "species", "about", "usage"];


export function ProductForm({
  product,
  categories,
}: {
  /** Existing product (edit) or undefined (create). */
  product?: { id: string; published: boolean; sortOrder: number } & Record<string, unknown>;
  categories: { id: string; name: string }[];
}) {
  const { state, pending, onSubmit } = useFormAction(saveProduct);
  const t = useAdminT();
  const f = t.productForm;
  const isNew = !product;
  const v = (name: string) => (product ? String(product[name] ?? "") : "");

  const input = (name: string, lang: Lang, rows?: number) => {
    const id = `${name}${lang}`;
    return rows ? (
      <textarea id={id} name={id} rows={rows} className={s.in} defaultValue={v(id)} {...langAttrs(lang)} />
    ) : (
      <input id={id} name={id} className={s.in} defaultValue={v(id)} {...langAttrs(lang)} />
    );
  };

  return (
    <form method="post" onSubmit={onSubmit} className={s.stack} noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      <FormError state={state} />

      <Card title={f.basics}>
        <div className={s.grid2}>
          <Field label={f.category} htmlFor="categoryId">
            <select id="categoryId" name="categoryId" className={s.in} defaultValue={v("categoryId")}>
              <option value="" disabled>
                {f.chooseCategory}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={f.brand} htmlFor="brand" hint={f.brandHint}>
            <input id="brand" name="brand" list="brands" className={`${s.in} ${s.latin}`} defaultValue={v("brand")} />
            <datalist id="brands">
              {KNOWN_BRAND_NAMES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>
          <Field label={f.code} htmlFor="code" hint={f.codeHint}>
            <input id="code" name="code" className={`${s.in} ${s.latin}`} defaultValue={v("code")} />
          </Field>
          <Field label={f.status}>
            <label className={s.check}>
              <input type="checkbox" name="published" defaultChecked={product ? product.published : true} />{" "}
              {f.publishedOnSite}
            </label>
          </Field>
        </div>
      </Card>

      <Card
        title={f.texts}
        description={f.textsDescription}
      >
        <div className={`${s.stack} ${s.stackTight}`}>
          <LangTabs
            initialFilled={filledLangs(product as Record<string, string> | undefined, TEXT_FIELDS)}
          >
            {(lang) => (
              <>
                <Field label={f.name} htmlFor={`name${lang}`}>
                  {input("name", lang)}
                </Field>
                <Field label={f.summary} htmlFor={`summary${lang}`} hint={f.summaryHint}>
                  {input("summary", lang, 3)}
                </Field>
                <div className={s.grid3}>
                  <Field label={f.dosageForm} htmlFor={`dosageForm${lang}`}>
                    {input("dosageForm", lang)}
                  </Field>
                  <Field label={f.packaging} htmlFor={`packaging${lang}`}>
                    {input("packaging", lang)}
                  </Field>
                  <Field label={f.species} htmlFor={`species${lang}`}>
                    {input("species", lang)}
                  </Field>
                </div>
                <Field label={f.about} htmlFor={`about${lang}`} hint={f.aboutHint}>
                  {input("about", lang, 6)}
                </Field>
                <Field label={f.usage} htmlFor={`usage${lang}`} hint={f.usageHint}>
                  {input("usage", lang, 5)}
                </Field>
              </>
            )}
          </LangTabs>
        </div>
      </Card>

      <Card title={t.common.settings}>
        <div className={s.grid2}>
          <Field label={t.common.slug} htmlFor="slug" hint={f.slugHint}>
            <input id="slug" name="slug" className={`${s.in} ${s.latin}`} defaultValue={v("slug")} placeholder="amoxi-vet-50" />
          </Field>
          <Field label={t.common.order} htmlFor="sortOrder" hint={f.orderHint}>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              className={`${s.in} ${s.latin} ${s.narrow}`}
              defaultValue={product ? product.sortOrder : 0}
            />
          </Field>
        </div>
      </Card>

      <div className={s.formActions}>
        <button className={`${s.btn} ${s.primary}`} type="submit" disabled={pending}>
          {pending ? t.common.saving : isNew ? f.createSubmit : t.common.saveChanges}
        </button>
        <Link href="/admin/products" className={`${s.link} ${s.linkMuted}`}>
          {t.common.back}
        </Link>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { saveProduct } from "@/app/admin/actions";
import { KNOWN_BRAND_NAMES } from "@/lib/catalog/brands";
import type { Lang } from "@/lib/admin/forms";
import { LangTabs, filledLangs, langAttrs } from "./LangTabs";
import { FormError } from "./FormError";
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

      <Card title="المعلومات الأساسية">
        <div className={s.grid2}>
          <Field label="القسم" htmlFor="categoryId">
            <select id="categoryId" name="categoryId" className={s.in} defaultValue={v("categoryId")}>
              <option value="" disabled>
                اختر القسم…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="البراند" htmlFor="brand" hint="اكتب HiPro أو Vet Care أو Jamuh ليظهر شعار البراند تلقائياً.">
            <input id="brand" name="brand" list="brands" className={`${s.in} ${s.latin}`} defaultValue={v("brand")} />
            <datalist id="brands">
              {KNOWN_BRAND_NAMES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>
          <Field label="الاسم التجاري (كما على العبوة)" htmlFor="code" hint="بالأحرف اللاتينية، مثل: AMOXI-VET 50%">
            <input id="code" name="code" className={`${s.in} ${s.latin}`} defaultValue={v("code")} />
          </Field>
          <Field label="الحالة">
            <label className={s.check}>
              <input type="checkbox" name="published" defaultChecked={product ? product.published : true} /> منشور على
              الموقع
            </label>
          </Field>
        </div>
      </Card>

      <Card
        title="النصوص"
        description="اكتب النصوص بالكردية والعربية والإنجليزية. الحقل الفارغ في لغة ما يُعرض من لغة أخرى."
      >
        <div className={`${s.stack} ${s.stackTight}`}>
          <LangTabs
            initialFilled={filledLangs(product as Record<string, string> | undefined, TEXT_FIELDS)}
            defaultTab={isNew ? "Ku" : "Ar"}
          >
            {(lang) => (
              <>
                <Field label="اسم المنتج" htmlFor={`name${lang}`}>
                  {input("name", lang)}
                </Field>
                <Field label="وصف مختصر" htmlFor={`summary${lang}`} hint="يظهر تحت اسم المنتج. جملتان أو ثلاث.">
                  {input("summary", lang, 3)}
                </Field>
                <div className={s.grid3}>
                  <Field label="الشكل الصيدلاني" htmlFor={`dosageForm${lang}`}>
                    {input("dosageForm", lang)}
                  </Field>
                  <Field label="العبوات المتوفرة" htmlFor={`packaging${lang}`}>
                    {input("packaging", lang)}
                  </Field>
                  <Field label="الحيوانات المستهدفة" htmlFor={`species${lang}`}>
                    {input("species", lang)}
                  </Field>
                </div>
                <Field label="عن المنتج (وصف تفصيلي)" htmlFor={`about${lang}`} hint="افصل بين الفقرات بسطر فارغ.">
                  {input("about", lang, 6)}
                </Field>
                <Field label="طريقة الاستخدام" htmlFor={`usage${lang}`} hint="كل خطوة في سطر مستقل، وتظهر كقائمة مرقّمة.">
                  {input("usage", lang, 5)}
                </Field>
              </>
            )}
          </LangTabs>
        </div>
      </Card>

      <Card title="إعدادات">
        <div className={s.grid2}>
          <Field label="الرابط (Slug)" htmlFor="slug" hint="اختياري. يُنشأ تلقائياً من الاسم الإنجليزي أو الاسم التجاري.">
            <input id="slug" name="slug" className={`${s.in} ${s.latin}`} defaultValue={v("slug")} placeholder="amoxi-vet-50" />
          </Field>
          <Field label="الترتيب" htmlFor="sortOrder" hint="الرقم الأصغر يظهر أولاً في القوائم.">
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
          {pending ? "جارٍ الحفظ…" : isNew ? "حفظ ومتابعة لإضافة الصور" : "حفظ التعديلات"}
        </button>
        <Link href="/admin/products" className={`${s.link} ${s.linkMuted}`}>
          رجوع
        </Link>
      </div>
    </form>
  );
}

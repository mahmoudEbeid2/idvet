"use client";

import { useState } from "react";
import Link from "next/link";
import { saveCategory } from "@/app/admin/actions";
import { COLOR_SWATCHES, PRESET_ICONS, type Lang } from "@/lib/admin/forms";
import { LangTabs, filledLangs, langAttrs } from "./LangTabs";
import { FormError } from "./FormError";
import { useFormAction } from "./useFormAction";
import { upload } from "./upload";
import { Card, Field } from "./ui";
import s from "./admin.module.css";

export interface CategoryFormValues {
  id: string;
  slug: string;
  icon: string;
  color: string;
  sortOrder: number;
  nameKu: string;
  nameAr: string;
  nameEn: string;
  descriptionKu: string;
  descriptionAr: string;
  descriptionEn: string;
}

export function CategoryForm({ category, nextSortOrder = 0 }: { category?: CategoryFormValues; nextSortOrder?: number }) {
  const { state, pending, onSubmit } = useFormAction(saveCategory);
  const [icon, setIcon] = useState(category?.icon ?? PRESET_ICONS[0]);
  const [color, setColor] = useState(category?.color ?? COLOR_SWATCHES[0]);
  const [iconUpload, setIconUpload] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const isNew = !category;
  const icons = (PRESET_ICONS as readonly string[]).includes(icon) ? [...PRESET_ICONS] : [...PRESET_ICONS, icon];

  const v = (name: keyof CategoryFormValues) => (category ? String(category[name]) : "");
  const text = (name: "name" | "description", lang: Lang) => {
    const id = `${name}${lang}` as const;
    return name === "name" ? (
      <input id={id} name={id} className={s.in} defaultValue={v(id)} {...langAttrs(lang)} />
    ) : (
      <textarea id={id} name={id} rows={2} className={s.in} defaultValue={v(id)} {...langAttrs(lang)} />
    );
  };

  async function onIconFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setIconUpload({ busy: false, error: `${file.name}: الملف أكبر من 2MB.` });
      return;
    }
    setIconUpload({ busy: true });
    const body = new FormData();
    body.set("file", file);
    try {
      const { src } = await upload<{ src: string }>("/api/admin/uploads/image?target=category-icon", body);
      setIcon(src);
      setIconUpload({ busy: false });
    } catch (error) {
      setIconUpload({ busy: false, error: (error as Error).message });
    }
  }

  return (
    <form method="post" onSubmit={onSubmit} className={s.stack} noValidate>
      {category && <input type="hidden" name="id" value={category.id} />}
      <input type="hidden" name="icon" value={icon} />
      <input type="hidden" name="color" value={color} />
      <FormError state={state} />

      <Card
        title="الاسم والوصف"
        description="اكتب الاسم بالكردية والعربية والإنجليزية. إذا تركت لغة فارغة يظهر الاسم من لغة أخرى."
      >
        <div className={`${s.stack} ${s.stackTight}`}>
          <LangTabs
            initialFilled={filledLangs(category as unknown as Record<string, string>, ["name", "description"])}
            defaultTab={isNew ? "Ku" : "Ar"}
          >
            {(lang) => (
              <>
                <Field label="اسم القسم" htmlFor={`name${lang}`}>
                  {text("name", lang)}
                </Field>
                <Field
                  label="وصف قصير"
                  htmlFor={`description${lang}`}
                  hint="يظهر على بطاقة القسم وفي أعلى صفحة القسم. سطر أو سطران."
                >
                  {text("description", lang)}
                </Field>
              </>
            )}
          </LangTabs>
        </div>
      </Card>

      <Card title="الأيقونة واللون">
        <div className={s.grid2}>
          <Field label="الأيقونة">
            <div className={s.icons}>
              {icons.map((src) => (
                <button
                  key={src}
                  type="button"
                  aria-pressed={icon === src}
                  aria-label={src.split("/").pop()}
                  style={{ background: color }}
                  onClick={() => setIcon(src)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
            <label className={`${s.link} ${s.uploadLink}`}>
              {iconUpload.busy ? "جارٍ رفع الأيقونة…" : "أو ارفع أيقونة خاصة (PNG بخلفية شفافة، حتى 2MB)"}
              <input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={onIconFile} disabled={iconUpload.busy} />
            </label>
            {iconUpload.error && (
              <p className={s.error} role="alert">
                {iconUpload.error}
              </p>
            )}
          </Field>
          <Field label="لون الخلفية" hint="يظهر خلف الأيقونة وخلف صور منتجات هذا القسم.">
            <div className={s.swatches}>
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-pressed={color === swatch}
                  aria-label={swatch}
                  style={{ background: swatch }}
                  onClick={() => setColor(swatch)}
                />
              ))}
              <input
                type="color"
                value={color}
                aria-label="لون مخصص"
                onChange={(e) => setColor(e.currentTarget.value)}
              />
            </div>
          </Field>
        </div>
      </Card>

      <Card title="إعدادات">
        <div className={s.grid2}>
          <Field
            label="الرابط (Slug)"
            htmlFor="slug"
            hint="اختياري. يظهر في عنوان الصفحة: /products/الرابط. إذا تركته فارغاً يُنشأ من الاسم الإنجليزي."
          >
            <input id="slug" name="slug" className={`${s.in} ${s.latin}`} defaultValue={v("slug")} placeholder="poultry-care" />
          </Field>
          <Field label="الترتيب" htmlFor="sortOrder" hint="الرقم الأصغر يظهر أولاً.">
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              className={`${s.in} ${s.latin} ${s.narrow}`}
              defaultValue={category ? category.sortOrder : nextSortOrder}
            />
          </Field>
        </div>
      </Card>

      <div className={s.formActions}>
        <button className={`${s.btn} ${s.primary}`} type="submit" disabled={pending || iconUpload.busy}>
          {pending ? "جارٍ الحفظ…" : isNew ? "إضافة القسم" : "حفظ التعديلات"}
        </button>
        <Link href="/admin/categories" className={`${s.link} ${s.linkMuted}`}>
          رجوع
        </Link>
      </div>
    </form>
  );
}

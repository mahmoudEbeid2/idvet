"use client";

import { useState } from "react";
import Link from "next/link";
import { saveCategory } from "@/app/admin/actions";
import { COLOR_SWATCHES, PRESET_ICONS, type Lang } from "@/lib/admin/forms";
import { withFile } from "@/lib/admin/i18n";
import { useAdminT } from "./AdminLang";
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
  const t = useAdminT();
  const f = t.categoryForm;
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
      setIconUpload({ busy: false, error: withFile(file.name, t.errors.tooBig(2)) });
      return;
    }
    setIconUpload({ busy: true });
    const body = new FormData();
    body.set("file", file);
    try {
      const { src } = await upload<{ src: string }>("/api/admin/uploads/image?target=category-icon", body, t);
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
        title={f.nameAndDescription}
        description={f.nameAndDescriptionHint}
      >
        <div className={`${s.stack} ${s.stackTight}`}>
          <LangTabs
            initialFilled={filledLangs(category as unknown as Record<string, string>, ["name", "description"])}
          >
            {(lang) => (
              <>
                <Field label={f.name} htmlFor={`name${lang}`}>
                  {text("name", lang)}
                </Field>
                <Field
                  label={f.description}
                  htmlFor={`description${lang}`}
                  hint={f.descriptionHint}
                >
                  {text("description", lang)}
                </Field>
              </>
            )}
          </LangTabs>
        </div>
      </Card>

      <Card title={f.iconAndColor}>
        <div className={s.grid2}>
          <Field label={f.icon}>
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
              {iconUpload.busy ? f.uploadingIcon : f.uploadIcon}
              <input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={onIconFile} disabled={iconUpload.busy} />
            </label>
            {iconUpload.error && (
              <p className={s.error} role="alert">
                {iconUpload.error}
              </p>
            )}
          </Field>
          <Field label={f.color} hint={f.colorHint}>
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
                aria-label={f.customColor}
                onChange={(e) => setColor(e.currentTarget.value)}
              />
            </div>
          </Field>
        </div>
      </Card>

      <Card title={t.common.settings}>
        <div className={s.grid2}>
          <Field
            label={t.common.slug}
            htmlFor="slug"
            hint={f.slugHint}
          >
            <input id="slug" name="slug" className={`${s.in} ${s.latin}`} defaultValue={v("slug")} placeholder="poultry-care" />
          </Field>
          <Field label={t.common.order} htmlFor="sortOrder" hint={f.orderHint}>
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
          {pending ? t.common.saving : isNew ? f.createSubmit : t.common.saveChanges}
        </button>
        <Link href="/admin/categories" className={`${s.link} ${s.linkMuted}`}>
          {t.common.back}
        </Link>
      </div>
    </form>
  );
}

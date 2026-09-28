"use client";

import { useId, useState } from "react";
import { LANGS, type Lang } from "@/lib/admin/forms";
import s from "./admin.module.css";

const LABELS: Record<Lang, string> = { Ku: "کوردی", Ar: "العربية", En: "English" };

/** dir/lang attributes for an input holding text in `lang`. */
export function langAttrs(lang: Lang) {
  return lang === "En" ? { dir: "ltr", lang: "en" } : { dir: "rtl", lang: lang === "Ku" ? "ckb" : "ar" };
}

/**
 * Kurdish / Arabic / English tabs. All three panels stay in the DOM (inactive
 * ones hidden) so the form always submits every language. A green dot marks
 * tabs that have any text.
 */
export function LangTabs({
  initialFilled,
  defaultTab = "Ku",
  children,
}: {
  initialFilled: Record<Lang, boolean>;
  defaultTab?: Lang;
  children: (lang: Lang) => React.ReactNode;
}) {
  const id = useId();
  const [tab, setTab] = useState<Lang>(defaultTab);
  const [filled, setFilled] = useState(initialFilled);

  function onKeyDown(event: React.KeyboardEvent) {
    const i = LANGS.indexOf(tab);
    // RTL: ArrowLeft moves to the next tab.
    const delta = event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = LANGS[(i + delta + LANGS.length) % LANGS.length];
    setTab(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <>
      <div className={s.tabs} role="tablist" aria-label="اللغة" onKeyDown={onKeyDown}>
        {LANGS.map((lang) => (
          <button
            key={lang}
            id={`${id}-tab-${lang}`}
            type="button"
            role="tab"
            aria-selected={tab === lang}
            aria-controls={`${id}-panel-${lang}`}
            tabIndex={tab === lang ? 0 : -1}
            onClick={() => setTab(lang)}
          >
            {LABELS[lang]}
            {filled[lang] && <span className={s.dot} aria-hidden="true" />}
          </button>
        ))}
      </div>
      {LANGS.map((lang) => (
        <div
          key={lang}
          id={`${id}-panel-${lang}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${lang}`}
          hidden={tab !== lang}
          className={`${s.stack} ${s.stackTight}`}
          onInput={(event) => {
            const any = [...event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")].some(
              (el) => el.value.trim() !== "",
            );
            if (any !== filled[lang]) setFilled((f) => ({ ...f, [lang]: any }));
          }}
        >
          {children(lang)}
        </div>
      ))}
    </>
  );
}

/** Which languages have any of `fields` filled in, for LangTabs' initial dots. */
export function filledLangs(values: Record<string, string> | null | undefined, fields: string[]): Record<Lang, boolean> {
  const has = (lang: Lang) => fields.some((f) => (values?.[`${f}${lang}`] ?? "").trim() !== "");
  return { Ku: has("Ku"), Ar: has("Ar"), En: has("En") };
}

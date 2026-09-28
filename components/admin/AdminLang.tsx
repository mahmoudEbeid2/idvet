"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAdminLang } from "@/app/admin/actions";
import { ADMIN_LANGS, ADMIN_LANG_NAMES, adminMessages, type AdminLang } from "@/lib/admin/i18n";
import s from "./admin.module.css";

const LangContext = createContext<AdminLang>("ar");

/** Set once in the admin root layout from the language cookie. */
export function AdminLangProvider({ lang, children }: { lang: AdminLang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useAdminLang() {
  return useContext(LangContext);
}

/** The dashboard text in the current language, for client components. */
export function useAdminT() {
  return adminMessages[useContext(LangContext)];
}

/** Kurdish / Arabic / English buttons; saves the choice and re-renders the page in it. */
export function AdminLangSwitch() {
  const lang = useAdminLang();
  const t = useAdminT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className={s.langSwitch} role="group" aria-label={t.langSwitch}>
      {ADMIN_LANGS.map((option) => (
        <button
          key={option}
          type="button"
          lang={option === "ku" ? "ckb" : option}
          aria-pressed={option === lang}
          disabled={pending}
          onClick={() => {
            if (option === lang) return;
            startTransition(async () => {
              await setAdminLang(option);
              router.refresh();
            });
          }}
        >
          {ADMIN_LANG_NAMES[option]}
        </button>
      ))}
    </div>
  );
}

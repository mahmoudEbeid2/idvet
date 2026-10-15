"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LanguageOption, Locale } from "@/lib/content";

/**
 * Compact language menu: a globe and the current language's short label,
 * opening a list of the languages. Each option is a plain link to the same
 * page in that language (`options[].href` already carries the page path).
 */
export function LanguageSwitcher({
  current,
  options,
  label,
  className = "",
}: {
  current: Locale;
  options: LanguageOption[];
  /** Accessible name, in the page's language. */
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const active = options.find((option) => option.locale === current);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`${label}: ${active?.label ?? current}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#0676bd]/30 px-3 font-roboto text-[13px] font-bold text-[#0676bd] transition-colors hover:border-[#0676bd] hover:bg-[#0676bd]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0676bd]"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        <span>{active?.short ?? current.toUpperCase()}</span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className={`size-2.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
        </svg>
      </button>
      {open && (
        <ul
          id={listId}
          className="absolute end-0 top-full z-40 mt-2 min-w-[150px] overflow-hidden rounded-xl border border-black/5 bg-white py-1 text-start shadow-lg"
        >
          {options.map((option) => {
            const isCurrent = option.locale === current;
            return (
              <li key={option.locale}>
                <a
                  href={option.href}
                  lang={option.locale}
                  hrefLang={option.locale}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-3 px-4 py-2 text-[15px] transition-colors hover:bg-[#0676bd]/8 ${
                    isCurrent ? "font-bold text-[#0676bd]" : "text-[#33475b]"
                  }`}
                >
                  {option.label}
                  {isCurrent && (
                    <svg viewBox="0 0 12 12" aria-hidden className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m2 6.5 2.5 2.5L10 3.5" />
                    </svg>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

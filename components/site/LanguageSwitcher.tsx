"use client";

import { useRouter } from "next/navigation";
import type { LanguageOption, Locale } from "@/lib/content";

export function LanguageSwitcher({
  current,
  options,
  className,
}: {
  current: Locale;
  options: LanguageOption[];
  className?: string;
}) {
  const router = useRouter();

  return (
    <select
      aria-label="Language"
      value={current}
      onChange={(e) => {
        const href = options.find((option) => option.locale === e.target.value)?.href;
        if (href) router.push(href);
      }}
      className={className}
    >
      {options.map((option) => (
        <option key={option.locale} value={option.locale}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

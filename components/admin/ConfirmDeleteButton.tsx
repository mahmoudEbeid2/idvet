"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useAdminT } from "./AdminLang";
import s from "./admin.module.css";

/**
 * Two-click delete. The first click only arms it; the armed state is a
 * *different* button element (different key), so the first click can never
 * reach the delete handler — swapping type="button" → type="submit" on one
 * element would let that same click submit. It disarms after 4 seconds, and
 * ignores clicks in the first 400ms so a double-click doesn't delete.
 */
export function ConfirmDeleteButton({
  label,
  variant = "btn",
  disabled,
  onConfirm,
}: {
  label: string;
  variant?: "btn" | "del";
  disabled?: boolean;
  onConfirm: () => unknown;
}) {
  const [armedAt, setArmedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const t = useAdminT();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const className = variant === "btn" ? `${s.btn} ${s.danger}` : s.del;

  useEffect(() => () => clearTimeout(timer.current), []);

  if (armedAt === null) {
    return (
      <button
        key="idle"
        type="button"
        className={className}
        disabled={disabled || pending}
        onClick={() => {
          setArmedAt(Date.now());
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setArmedAt(null), 4000);
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      key="armed"
      type="button"
      className={`${className} ${s.armed}`}
      disabled={pending}
      aria-live="polite"
      onClick={() => {
        if (Date.now() - armedAt < 400) return;
        clearTimeout(timer.current);
        startTransition(async () => {
          await onConfirm();
          setArmedAt(null);
        });
      }}
    >
      {pending ? t.common.deleting : variant === "del" ? t.common.confirmShort : t.common.confirmLong}
    </button>
  );
}

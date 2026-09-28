"use client";

import { useEffect, useRef } from "react";
import type { FormState } from "@/lib/admin/forms";
import s from "./admin.module.css";

/**
 * The error notice at the top of a long form. The submit button is at the
 * bottom, so each new result (a new state object, even with the same text)
 * scrolls the notice into view — otherwise the save looks like it did nothing.
 */
export function FormError({ state }: { state: FormState }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.error) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [state]);
  if (!state.error) return null;
  return (
    <p ref={ref} className={`${s.notice} ${s.err}`} role="alert">
      {state.error}
    </p>
  );
}

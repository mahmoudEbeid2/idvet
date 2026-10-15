"use client";

import { useEffect, useRef } from "react";

/**
 * Shared modal behaviour: focus `focusRef` (usually the close button) on
 * open, close on Escape, lock page scroll, and give focus back to whatever
 * opened the modal.
 */
export function useModal(focusRef: React.RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    focusRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [focusRef]);
}

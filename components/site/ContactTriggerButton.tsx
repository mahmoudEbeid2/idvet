"use client";

import { useContactModal } from "./ContactModalContext";

export function ContactTriggerButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useContactModal();
  return (
    <button
      type="button"
      onClick={open}
      className={`cursor-pointer ${className ?? ""}`.trim()}
    >
      {children}
    </button>
  );
}

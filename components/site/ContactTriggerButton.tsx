"use client";

import { useContactModal } from "./ContactModalContext";

export function ContactTriggerButton({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { open } = useContactModal();
  return (
    <button
      type="button"
      onClick={open}
      style={style}
      className={`cursor-pointer ${className ?? ""}`.trim()}
    >
      {children}
    </button>
  );
}

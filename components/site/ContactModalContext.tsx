"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Locale, SiteContent } from "@/lib/content";
import { ContactModal } from "./ContactModal";

const ContactModalCtx = createContext<{ open: () => void } | null>(null);

export function useContactModal() {
  const ctx = useContext(ContactModalCtx);
  if (!ctx) throw new Error("useContactModal must be used within ContactModalProvider");
  return ctx;
}

export function ContactModalProvider({
  locale,
  form,
  children,
}: {
  locale: Locale;
  form: SiteContent["form"];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => ({ open: () => setIsOpen(true) }), []);

  return (
    <ContactModalCtx.Provider value={value}>
      {children}
      <ContactModal
        locale={locale}
        form={form}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </ContactModalCtx.Provider>
  );
}

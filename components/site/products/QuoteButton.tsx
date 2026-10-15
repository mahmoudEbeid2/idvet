"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/content";
import { CloseIcon } from "./icons";
import type { QuoteLabels } from "./quoteLabels";
import { useModal } from "./useModal";
import s from "./catalog.module.css";

/** `code` is the Latin trade name, shown after the name as its own LTR run. */
type QuoteProduct = { id: string; name: string; code?: string };

/**
 * "Request a quote" for one product: opens a small form (name, phone or email,
 * quantity) that posts to /api/quote, which stores it and emails info@idvet.co.
 */
export function QuoteButton({
  product,
  locale,
  labels,
  className,
  children,
}: {
  product: QuoteProduct;
  locale: Locale;
  labels: QuoteLabels;
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} aria-haspopup="dialog">
        {children ?? labels.requestQuote}
      </button>
      {open && <QuoteModal product={product} locale={locale} labels={labels} onClose={() => setOpen(false)} />}
    </>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

function QuoteModal({
  product,
  locale,
  labels,
  onClose,
}: {
  product: QuoteProduct;
  locale: Locale;
  labels: QuoteLabels;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const id = useId();
  useModal(closeRef, onClose);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: form.get("name"),
          contact: form.get("contact"),
          quantity: form.get("quantity"),
          locale,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  // Portalled to <body> (like the lightbox): a sticky or transformed ancestor
  // — the product card lifts on hover — would otherwise trap the fixed overlay.
  return createPortal(
    <div
      className={`${s.modal} ${s.qmOverlay}`}
      dir={locale === "en" ? "ltr" : "rtl"}
      lang={locale === "ku" ? "ckb" : locale}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.qm} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-for`}>
        <div className={s.qmHead}>
          <h2 id={`${id}-title`}>{labels.quoteTitle}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close} className={s.qmClose}>
            <CloseIcon />
          </button>
        </div>
        <p id={`${id}-for`} className={s.qmFor}>
          {/* Isolated runs: a Latin code with "%" or brackets would otherwise be reordered inside RTL text. */}
          {labels.quoteFor.split("{name}")[0]}
          <bdi>{product.name}</bdi>
          {product.code && (
            <>
              {" "}
              <bdi dir="ltr" className={s.latin}>
                ({product.code})
              </bdi>
            </>
          )}
          {labels.quoteFor.split("{name}")[1]}
        </p>

        {status === "sent" ? (
          <p className={s.qmDone} role="status">
            {labels.quoteSuccess}
          </p>
        ) : (
          <form className={s.qmForm} onSubmit={onSubmit}>
            <p className={s.qmIntro}>{labels.quoteIntro}</p>
            <label>
              <span>{labels.quoteName}</span>
              <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
            </label>
            <label>
              <span>{labels.quoteContact}</span>
              <input name="contact" required minLength={5} maxLength={200} dir="ltr" />
            </label>
            <label>
              <span>{labels.quoteQuantity}</span>
              <input name="quantity" required maxLength={100} placeholder={labels.quoteQuantityPlaceholder} />
            </label>
            {status === "error" && (
              <p className={s.qmError} role="alert">
                {labels.quoteError}
              </p>
            )}
            <div className={s.qmActions}>
              <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={status === "sending"}>
                {status === "sending" ? labels.quoteSending : labels.quoteSend}
              </button>
              <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={onClose}>
                {labels.quoteCancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

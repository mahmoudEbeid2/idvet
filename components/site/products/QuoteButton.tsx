"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/content";
import { CloseIcon } from "./icons";
import type { QuoteLabels } from "./quoteLabels";
import { useModal } from "./useModal";
import s from "./catalog.module.css";

/**
 * `code` is the Latin trade name, shown after the name as its own LTR run;
 * `image` its first photo, shown as a thumbnail.
 */
type QuoteProduct = { id: string; name: string; code?: string; image?: string };

/**
 * "Request a quote" for one product: opens a small form (name, phone or email;
 * optional quantity, company, city) that posts to /api/quote, which stores it
 * and emails notification@idvet.co.
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
type Field = "name" | "contact";
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The two required fields, checked as the API does (lengths) plus a plausible phone or email. */
function validate(values: Record<Field, string>, labels: QuoteLabels): Errors {
  const errors: Errors = {};
  const name = values.name.trim();
  const contact = values.contact.trim();
  if (!name) errors.name = labels.quoteErrRequired;
  else if (name.length < 2) errors.name = labels.quoteErrName;
  if (!contact) errors.contact = labels.quoteErrRequired;
  else {
    const digits = contact.replace(/\D/g, "").length;
    const isEmail = contact.includes("@") ? EMAIL.test(contact) : false;
    const isPhone = !contact.includes("@") && /^[+\d\s().-]+$/.test(contact) && digits >= 7;
    if (!isEmail && !isPhone) errors.contact = labels.quoteErrContact;
  }
  return errors;
}

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
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  // Messages appear once a field has been left or the form submitted, then follow every keystroke.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const id = useId();
  useModal(nameRef, onClose);

  const values = () => ({ name: nameRef.current?.value ?? "", contact: contactRef.current?.value ?? "" });

  function recheck(field: Field, force = false) {
    if (!force && !touched[field]) return;
    if (force) setTouched((t) => ({ ...t, [field]: true }));
    const next = validate(values(), labels);
    setErrors((e) => ({ ...e, [field]: next[field] }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values(), labels);
    setTouched({ name: true, contact: true });
    setErrors(found);
    if (found.name) return nameRef.current?.focus();
    if (found.contact) return contactRef.current?.focus();

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
          company: form.get("company"),
          city: form.get("city"),
          locale,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("error");
    }
  }

  const sending = status === "sending";
  const [forBefore, forAfter = ""] = labels.quoteFor.split("{name}");

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
          <button type="button" onClick={onClose} aria-label={labels.close} className={s.qmClose}>
            <CloseIcon />
          </button>
        </div>

        <div id={`${id}-for`} className={s.qmFor}>
          {product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt="" width={44} height={44} />
          )}
          <p>
            {/* Isolated runs: a Latin code with "%" or brackets would otherwise be reordered inside RTL text. */}
            {forBefore}
            <bdi>{product.name}</bdi>
            {product.code && (
              <>
                {" "}
                <bdi dir="ltr" className={s.latin}>
                  ({product.code})
                </bdi>
              </>
            )}
            {forAfter}
          </p>
        </div>

        {status === "sent" ? (
          <div className={s.qmDone} role="status">
            <span className={s.qmDoneIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h3>{labels.quoteSuccessTitle}</h3>
            <p>{labels.quoteSuccess}</p>
            <button ref={doneRef} type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={onClose}>
              {labels.close}
            </button>
          </div>
        ) : (
          <form className={s.qmForm} onSubmit={onSubmit} noValidate aria-busy={sending}>
            <p className={s.qmIntro}>{labels.quoteIntro}</p>
            <div className={s.qmField}>
              <label htmlFor={`${id}-name`}>
                {labels.quoteName}
                <span className={s.qmReq} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                ref={nameRef}
                id={`${id}-name`}
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${id}-name-err` : undefined}
                onBlur={() => recheck("name", true)}
                onChange={() => recheck("name")}
              />
              {errors.name && (
                <p id={`${id}-name-err`} className={s.qmFieldErr}>
                  {errors.name}
                </p>
              )}
            </div>
            <div className={s.qmField}>
              <label htmlFor={`${id}-contact`}>
                {labels.quoteContact}
                <span className={s.qmReq} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                ref={contactRef}
                id={`${id}-contact`}
                name="contact"
                required
                maxLength={200}
                dir="ltr"
                aria-invalid={errors.contact ? true : undefined}
                aria-describedby={errors.contact ? `${id}-contact-err` : undefined}
                onBlur={() => recheck("contact", true)}
                onChange={() => recheck("contact")}
              />
              {errors.contact && (
                <p id={`${id}-contact-err`} className={s.qmFieldErr}>
                  {errors.contact}
                </p>
              )}
            </div>
            <OptionalField id={`${id}-quantity`} name="quantity" label={labels.quoteQuantity} hint={labels.quoteOptional} maxLength={100} placeholder={labels.quoteQuantityPlaceholder} />
            <div className={s.qmPair}>
              <OptionalField id={`${id}-company`} name="company" label={labels.quoteCompany} hint={labels.quoteOptional} maxLength={150} autoComplete="organization" />
              <OptionalField id={`${id}-city`} name="city" label={labels.quoteCity} hint={labels.quoteOptional} maxLength={100} autoComplete="address-level2" />
            </div>
            {status === "error" && (
              <p className={s.qmError} role="alert">
                {labels.quoteError}
              </p>
            )}
            <div className={s.qmActions}>
              <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={sending}>
                {sending && <span className={s.qmSpinner} aria-hidden="true" />}
                {sending ? labels.quoteSending : labels.quoteSend}
              </button>
              <button type="button" className={`${s.btn} ${s.qmCancel}`} onClick={onClose}>
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

function OptionalField({
  id,
  label,
  hint,
  ...input
}: { id: string; label: string; hint: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={s.qmField}>
      <label htmlFor={id}>
        {label} <span className={s.qmOptional}>({hint})</span>
      </label>
      <input id={id} {...input} />
    </div>
  );
}

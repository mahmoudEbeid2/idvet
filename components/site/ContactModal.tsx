"use client";

import { useState } from "react";
import type { Locale, SiteContent } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactModal({
  locale,
  form,
  isOpen,
  onClose,
}: {
  locale: Locale;
  form: SiteContent["form"];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          locale,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8 text-right shadow-xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#006eb3]">{form.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={form.close}
            className="text-2xl leading-none text-[#848484] hover:text-[#006eb3]"
          >
            ×
          </button>
        </div>

        {status === "success" ? (
          <p className="py-6 text-center text-[#4d4d4d]">{form.success}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="name"
              required
              minLength={2}
              placeholder={form.name}
              className="rounded-lg border border-[#d9d9d9] px-4 py-3 text-sm outline-none focus:border-[#006eb3]"
            />
            <input
              name="email"
              type="email"
              required
              placeholder={form.email}
              className="rounded-lg border border-[#d9d9d9] px-4 py-3 text-sm outline-none focus:border-[#006eb3]"
              dir="ltr"
            />
            <input
              name="phone"
              placeholder={form.phone}
              className="rounded-lg border border-[#d9d9d9] px-4 py-3 text-sm outline-none focus:border-[#006eb3]"
              dir="ltr"
            />
            <textarea
              name="message"
              required
              minLength={10}
              rows={4}
              placeholder={form.message}
              className="resize-none rounded-lg border border-[#d9d9d9] px-4 py-3 text-sm outline-none focus:border-[#006eb3]"
            />
            {status === "error" && (
              <p className="text-sm text-red-600">{form.error}</p>
            )}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 rounded-full bg-[#006eb3] px-6 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60"
            >
              {status === "submitting" ? form.submitting : form.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import type { SiteContent } from "@/lib/content";
import { ContactTriggerButton } from "./ContactTriggerButton";

export function Contact({ site }: { site: SiteContent }) {
  const { contact } = site;
  const isEnglish = site.locale === "en";
  const mirror = isEnglish ? "-scale-x-100" : "";
  const whatsappUrl = `https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`;
  // The English heading wraps to 2 lines in this box (vs. 1 for ar/ku), so
  // the body and CTA need extra room below it to avoid overlapping it.
  const bodyTop = isEnglish ? 5793 : 5763;
  const ctaTop = isEnglish ? 5893 : 5883;

  // Each row is icon + label/value in one flex container so they can never
  // drift apart — the icon sits wherever the row starts (left in LTR, right
  // in RTL) purely from the inherited `dir`, no locale branching needed.
  const infoRows = [
    {
      key: "email",
      icon: "/assets/identity-07.svg",
      label: contact.emailLabel,
      value: (
        <a
          href={`mailto:${contact.email}`}
          dir="ltr"
          className="inline-block cursor-pointer text-start transition-opacity hover:opacity-80 hover:underline"
        >
          {contact.email}
        </a>
      ),
    },
    {
      key: "phone",
      icon: "/assets/identity-08.svg",
      label: contact.phoneLabel,
      value: (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="inline-block cursor-pointer text-start transition-opacity hover:opacity-80 hover:underline"
        >
          {contact.phone}
        </a>
      ),
    },
    {
      key: "address",
      icon: "/assets/identity-09.svg",
      label: contact.addressLabel,
      value: (
        <span dir="ltr" className="block text-start">
          {contact.addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
      ),
    },
  ];

  return (
    <>
      <span
        id="contact"
        aria-hidden
        className="absolute left-0 top-[5624px] block h-px w-px"
      />
      <div className="absolute left-[-1px] top-[5624px] h-[434px] w-[1440px] bg-[#006eb3]" />

      <p className={`absolute left-[1253px] top-[5695px] w-[513px] -translate-x-full text-start text-[28px] font-medium leading-[normal] text-white ${mirror}`}>
        {contact.heading}
      </p>
      <p
        className={`absolute left-[1253px] w-[482px] -translate-x-full text-start text-[20px] font-normal leading-[28px] text-white ${mirror}`}
        style={{ top: bodyTop }}
      >
        {contact.body}
      </p>

      <ContactTriggerButton
        className={`absolute left-[1088px] flex h-[44px] w-[165px] items-center justify-center bg-white text-center text-[13px] font-bold text-[#006eb3] transition-all hover:bg-white/90 active:scale-95 ${mirror}`}
        style={{ top: ctaTop }}
      >
        {contact.cta}
      </ContactTriggerButton>

      {/* Contact info column: same physical-RTL-authored position as every
          other block in this section, mirrored by the canvas-level flip on
          Canvas.tsx for English (see `mirror`). The icon+label rows inside
          are plain dir-aware flex, so once the ancestor's mirror is
          cancelled here, the browser's own `dir` handling places the icon
          correctly (start side) with no locale branching needed. */}
      <div
        className={`absolute left-[680px] top-[5695px] flex w-[482px] -translate-x-full flex-col gap-[18px] text-[20px] leading-[28px] text-white ${mirror}`}
      >
        {infoRows.map((row) => (
          <div key={row.key} className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.icon} alt="" aria-hidden className="mt-0.5 size-[24px] shrink-0" />
            <div className="text-start">
              <p className="font-bold">{row.label}</p>
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

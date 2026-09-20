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

      <div
        className={`absolute left-[680px] top-[5695px] w-[482px] -translate-x-full text-right text-[20px] leading-[36px] text-white ${mirror}`}
        dir="ltr"
      >
        <p className="font-bold">{contact.emailLabel}</p>
        <p>
          <a
            href={`mailto:${contact.email}`}
            className="cursor-pointer transition-opacity hover:opacity-80 hover:underline"
          >
            {contact.email}
          </a>
        </p>
        <p className="font-bold">{contact.phoneLabel}</p>
        <p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer transition-opacity hover:opacity-80 hover:underline"
          >
            {contact.phone}
          </a>
        </p>
        <p className="font-bold">{contact.addressLabel}</p>
        {contact.addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <a
        href={`mailto:${contact.email}`}
        aria-label={contact.email}
        className={`absolute left-[689px] top-[5704px] size-[24px] cursor-pointer transition-opacity hover:opacity-80 ${mirror}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/identity-07.svg" alt="" className="block size-full" />
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={contact.phone}
        className={`absolute left-[689px] top-[5775px] size-[24px] cursor-pointer transition-opacity hover:opacity-80 ${mirror}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/identity-08.svg" alt="" className="block size-full" />
      </a>
      <div className={`absolute left-[688px] top-[5845px] size-[24px] ${mirror}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/identity-09.svg" alt="" className="block size-full" />
      </div>
    </>
  );
}

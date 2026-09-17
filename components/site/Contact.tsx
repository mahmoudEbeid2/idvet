import type { SiteContent } from "@/lib/content";
import { ContactTriggerButton } from "./ContactTriggerButton";

export function Contact({ site }: { site: SiteContent }) {
  const { contact } = site;
  return (
    <>
      <span
        id="contact"
        aria-hidden
        className="absolute left-0 top-[5624px] block h-px w-px"
      />
      <div className="absolute left-[-1px] top-[5624px] h-[434px] w-[1440px] bg-[#006eb3]" />

      <p className="absolute left-[1253px] top-[5695px] w-[513px] -translate-x-full text-right text-[28px] font-medium leading-[normal] text-white">
        {contact.heading}
      </p>
      <p className="absolute left-[1253px] top-[5763px] w-[482px] -translate-x-full text-right text-[20px] font-normal leading-[28px] text-white">
        {contact.body}
      </p>

      <ContactTriggerButton className="absolute left-[1088px] top-[5883px] flex h-[44px] w-[165px] items-center justify-center bg-white text-center text-[13px] font-bold text-[#006eb3]">
        {contact.cta}
      </ContactTriggerButton>

      <div className="absolute left-[680px] top-[5695px] w-[482px] -translate-x-full text-right text-[20px] leading-[36px] text-white" dir="ltr">
        <p className="font-bold">{contact.emailLabel}</p>
        <p>{contact.email}</p>
        <p className="font-bold">{contact.phoneLabel}</p>
        <p>{contact.phone}</p>
        <p className="font-bold">{contact.addressLabel}</p>
        {contact.addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="absolute left-[689px] top-[5704px] size-[24px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/identity-07.svg" alt="" className="block size-full" />
      </div>
      <div className="absolute left-[689px] top-[5775px] size-[24px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/identity-08.svg" alt="" className="block size-full" />
      </div>
      <div className="absolute left-[688px] top-[5845px] size-[24px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/identity-09.svg" alt="" className="block size-full" />
      </div>
    </>
  );
}

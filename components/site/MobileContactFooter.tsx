import type { SiteContent } from "@/lib/content";
import { ContactTriggerButton } from "./ContactTriggerButton";
import { SocialLinks } from "./SocialLinks";

/**
 * The phone/tablet (below lg) contact section and footer — the only one in the
 * app, used by the home page (MobileSite) and every other page (SiteFooter).
 * Needs a ContactModalProvider above it for the CTA button.
 */
export function MobileContactFooter({ site }: { site: SiteContent }) {
  const isEnglish = site.locale === "en";
  return (
    // Font-size/line-height reset: pages may set their own (the catalog uses 15px/1.7).
    <div className="text-base leading-normal lg:hidden">
      {/* Contact */}
      <section
        id="contact-m"
        className="scroll-mt-[73px] bg-[#006eb3] px-4 py-12 text-white"
      >
        <h2 className="mb-3 text-center text-2xl font-medium">{site.contact.heading}</h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-white/90">
          {site.contact.body}
        </p>
        <div className="mb-8 flex justify-center">
          <ContactTriggerButton className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#006eb3]">
            {site.contact.cta}
          </ContactTriggerButton>
        </div>
        <div
          className={`flex flex-col items-center gap-4 text-center ${
            isEnglish ? "sm:items-start sm:text-left" : "sm:items-end sm:text-right"
          }`}
          dir="ltr"
        >
          <div>
            <p className="font-bold">{site.contact.emailLabel}</p>
            <a
              href={`mailto:${site.contact.email}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              {site.contact.email}
            </a>
          </div>
          <div>
            <p className="font-bold">{site.contact.phoneLabel}</p>
            <a
              href={`https://wa.me/${site.contact.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline-offset-4 hover:underline"
            >
              {site.contact.phone}
            </a>
          </div>
          <div>
            <p className="font-bold">{site.contact.addressLabel}</p>
            {site.contact.addressLines.map((line) => (
              <p key={line} className="text-sm">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#006eb3] px-4 py-6 text-center text-sm font-light text-white">
        <SocialLinks className="mb-4 justify-center" />
        {site.footer.copyright}
      </footer>
    </div>
  );
}

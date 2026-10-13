import Image from "next/image";
import type { SiteContent } from "@/lib/content/types";
import { centerSmall, container, HeroButtons } from "./pageParts";

// The Contact page body (Figma "Desktop - 4"), between SiteHeader and
// SiteFooter — same responsive approach as AboutPage (see pageParts).

export function ContactPage({ site }: { site: SiteContent }) {
  const t = site.contactPage;
  const { contact } = site;
  const isEnglish = site.locale === "en";

  const details = [
    {
      label: t.details.phoneLabel,
      value: (
        <a href={`tel:${contact.phone.replace(/[^+0-9]/g, "")}`} dir="ltr" className="inline-block hover:underline">
          {contact.phone}
        </a>
      ),
    },
    {
      label: t.details.emailLabel,
      value: (
        <a href={`mailto:${contact.email}`} dir="ltr" className="inline-block hover:underline">
          {contact.email}
        </a>
      ),
    },
    {
      label: t.details.addressLabel,
      // Each line follows the page's alignment; only its text runs left-to-right.
      value: contact.addressLines.map((line) => (
        <span key={line} className="block">
          <span dir="ltr" className="inline-block">
            {line}
          </span>
        </span>
      )),
    },
  ];

  return (
    <>
      {/* Hero: image band above the text on phones, full background from lg.
          The design shows the 1574px-wide image 96px off the left edge. */}
      <section className="relative overflow-hidden bg-[#0b1f36] text-white">
        <div className="relative h-[240px] sm:h-[360px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/assets/contact/hero-global-network.png"
            alt={t.imageAlts.hero}
            fill
            priority
            sizes="100vw"
            className={`object-cover object-[72%_50%] ${isEnglish ? "-scale-x-100" : ""}`}
          />
        </div>
        <div className={`${container} relative py-10 lg:flex lg:h-[810px] lg:flex-col lg:justify-center lg:py-0`}>
          <div className={`lg:max-w-[443px] ${centerSmall}`}>
            <p className="text-sm font-bold sm:text-base lg:leading-[44px]">{site.hero.eyebrow}</p>
            <h1 className="mt-3 text-[30px] font-bold leading-[1.4] sm:text-[40px] lg:mt-[102px] lg:text-[48px] lg:leading-[74px]">
              {t.hero.heading}
            </h1>
            <p className="mt-4 text-base leading-[28px] text-white/90 lg:mt-[10px] lg:min-h-[112px] lg:max-w-[435px] lg:text-[20px] lg:text-white">
              {t.hero.body}
            </p>
            <HeroButtons site={site} className="mt-8 lg:mt-[117px]" />
          </div>
        </div>
      </section>

      {/* Intro — the tilted handset is clipped by the section's edges. */}
      <section className="relative overflow-hidden bg-[#f0efef]">
        <div className={`${container} relative py-10 lg:min-h-[292px] lg:pt-[79px] lg:pb-10`}>
          <div className={`relative z-10 lg:max-w-[705px] ${centerSmall}`}>
            <h2 className="text-[28px] font-medium leading-[36px] text-[#0075be] lg:text-[36px]">{t.intro.title}</h2>
            <p className="mt-4 text-base leading-[28px] text-[#4d4d4d] lg:mt-[21px] lg:text-[20px]">{t.intro.body}</p>
          </div>
          <div className="absolute -top-[27px] end-4 hidden size-[375px] items-center justify-center lg:flex">
            <div className="relative size-[268px] rotate-[36.32deg]">
              <Image src="/assets/contact/telephone-icon.png" alt="" fill sizes="268px" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section>
        <div
          className={`${container} flex flex-col items-center gap-8 py-12 lg:min-h-[433px] lg:flex-row lg:items-start lg:gap-[69px] lg:py-0`}
        >
          <div className="relative h-[220px] w-[240px] shrink-0 sm:h-[280px] sm:w-[306px] lg:-ms-[46px] lg:mt-[49px] lg:h-[308px] lg:w-[337px]">
            <Image
              src="/assets/contact/smartphone-hand.png"
              alt={t.imageAlts.hand}
              fill
              sizes="(min-width: 1024px) 337px, 306px"
              className="object-cover"
            />
          </div>
          <div className={`w-full lg:max-w-[705px] lg:pt-[79px] lg:pb-12 ${centerSmall}`}>
            <h2 className="text-[28px] font-medium leading-[36px] text-[#0075be] lg:text-[36px]">{t.details.title}</h2>
            <dl className="mt-4 text-base leading-[32px] text-[#0075be] lg:mt-[18px] lg:text-[20px] lg:leading-[36px]">
              {details.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}

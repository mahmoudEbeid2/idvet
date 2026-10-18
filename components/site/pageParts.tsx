import Image from "next/image";
import type { SiteContent } from "@/lib/content/types";
import { ContactTriggerButton } from "./ContactTriggerButton";

// Shared by the responsive inner pages (About, Contact, Brands, Services): from lg they match
// the 1440px designs (content 1065px wide, like every home section), below
// 720px their text, images, icons and buttons are centered.

export const container = "mx-auto w-full max-w-[1097px] px-4";
export const centerSmall = "max-[719px]:text-center";

export function Paragraphs({ paragraphs, className }: { paragraphs: string[]; className: string }) {
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/**
 * The large IDVET wordmark closing the Brands and Services pages, cut off by
 * the contact band below it (1513px wide on the 1440px design, its bottom
 * 55px hidden). Capped at 1440px like the footer canvas (FigmaCanvas) below it.
 */
export function IdvetWatermark({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative mx-auto aspect-[1440/328] max-w-[1440px] overflow-hidden ${className}`} dir="ltr">
      <div className="absolute top-0 left-[-2.6%] aspect-[1817/460] w-[105.07%]">
        <Image src="/assets/brands/idvet-watermark.png" alt="" fill sizes="105vw" className="object-cover" />
      </div>
    </div>
  );
}

/** The hero's two buttons: the brands (the Brands page unless `brandsHref` says otherwise), and the contact form. */
export function HeroButtons({
  site,
  className,
  brandsHref = `/${site.locale}/brands`,
}: {
  site: SiteContent;
  className: string;
  brandsHref?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-[15px] max-[719px]:justify-center ${className}`}>
      <a
        href={brandsHref}
        className="inline-flex h-[44px] min-w-[165px] items-center justify-center gap-2 bg-[#0676bd] px-3 text-[13px] font-bold transition-colors hover:bg-[#0568a8]"
      >
        <span>{site.hero.ctaPrimary}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/arrow-icon.svg"
          alt=""
          className={`size-[23px] shrink-0 ${site.locale === "en" ? "" : "rotate-180"}`}
        />
      </a>
      <ContactTriggerButton className="inline-flex h-[44px] min-w-[167px] items-center justify-center border border-white px-3 text-[13px] transition-colors hover:bg-white/15">
        {site.hero.ctaSecondary}
      </ContactTriggerButton>
    </div>
  );
}

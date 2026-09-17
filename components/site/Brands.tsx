"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { BrandCard, SiteContent } from "@/lib/content";

function useRevealed<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

const CARD_POSITIONS = [
  {
    titleLeft: 1239,
    titleTop: 3530,
    titleWidth: 328,
    tagsLeft: 912,
    linkLeft: 1235,
    bodyAlign: "right" as const,
  },
  {
    titleLeft: 880,
    titleTop: 3530,
    titleWidth: 329,
    tagsLeft: 551,
    linkLeft: 875,
    bodyAlign: "justify" as const,
  },
  {
    titleLeft: 520,
    titleTop: 3530,
    titleWidth: 332,
    tagsLeft: 188,
    linkLeft: 515,
    bodyAlign: "justify" as const,
  },
];

const LOGO_POSITIONS = [
  { left: 1031, top: 3424 },
  { left: 549, top: 3422 },
  { left: 330, top: 3410 },
];

function ColumnDivider({ left, top }: { left: number; top: number }) {
  return (
    <div className="absolute" style={{ left, top, width: 1.5, height: 527 }}>
      <div className="absolute inset-0 rounded-full bg-[#b8b6b6]" />
      <div className="absolute left-1/2 top-0 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8b6b6]" />
      <div className="absolute bottom-0 left-1/2 size-[6px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#b8b6b6]" />
    </div>
  );
}

function BrandCardBlock({
  card,
  pos,
  logoPos,
  index,
}: {
  card: BrandCard;
  pos: (typeof CARD_POSITIONS)[number];
  logoPos: (typeof LOGO_POSITIONS)[number];
  index: number;
}) {
  const { ref, revealed } = useRevealed<HTMLDivElement>();

  return (
    <div
      className={`pointer-events-none absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
        revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/*
        This wrapper spans the full canvas (so its absolutely positioned
        children keep resolving against the canvas origin) and is
        pointer-events-none so that huge invisible box doesn't swallow clicks
        meant for the header, hero buttons, etc. underneath/around it —
        interactive children below opt back in with pointer-events-auto.
        It's also unusable as an IntersectionObserver target as-is (it
        "enters" the viewport on every scroll position), so this sentinel
        sits at the card's actual on-canvas location and is what visibility
        is measured against instead.
      */}
      <span
        ref={ref}
        aria-hidden
        className="absolute h-px w-px"
        style={{ left: pos.tagsLeft, top: pos.titleTop + 150 }}
      />

      <div
        className="pointer-events-auto absolute overflow-hidden transition-transform duration-300 ease-out hover:scale-[1.04]"
        style={{
          left: logoPos.left,
          top: logoPos.top,
          width: card.logoWidth,
          // The two-part logo's inset percentages below are computed against
          // an 80px-tall box; a single-image logo instead uses its own
          // Figma-designed height so object-contain doesn't rescale it.
          height: card.logo.length > 1 ? 80 : card.logoHeight,
        }}
      >
        {card.logo.length > 1 ? (
          // Two-part logo (icon badge + wordmark), positioned like the
          // original nested insets so the parts sit side by side.
          <>
            <div className="absolute" style={{ inset: "13.85% 64.43% 13.83% 13.86%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.logo[0]} alt="" className="block size-full object-contain" />
            </div>
            <div className="absolute" style={{ inset: "23.91% 13.85% 23.91% 37.78%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.logo[1]} alt="" className="block size-full object-contain" />
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.logo[0]}
            alt=""
            className="absolute inset-0 size-full object-cover object-right"
          />
        )}
      </div>

      <div
        className={`absolute -translate-x-full ${
          pos.bodyAlign === "justify" ? "text-justify" : "text-right"
        }`}
        style={{ left: pos.titleLeft, top: pos.titleTop, width: pos.titleWidth }}
      >
        <p className="mb-[28px] text-[20px] font-bold leading-[28px] text-[#0075be]">
          {card.title}
        </p>
        <p className="text-[18px] font-normal leading-[28px] text-[#4d4d4d]">
          {card.body}
        </p>
      </div>

      <div
        dir="ltr"
        className="pointer-events-auto absolute flex flex-wrap gap-[16px]"
        style={{ left: pos.tagsLeft, top: 3887, width: pos.titleWidth }}
      >
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-[36px] items-center justify-center whitespace-nowrap rounded-[50px] border border-solid border-[#006db2] bg-white px-3 text-[12px] leading-none text-[#0075be] transition-colors duration-200 hover:bg-[#0075be] hover:text-white"
          >
            {tag}
          </span>
        ))}
      </div>

      <a
        href={card.href}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto absolute -translate-x-full whitespace-nowrap text-[16px] font-bold leading-[36px] text-[#0075be] underline decoration-solid [text-underline-position:from-font] transition-colors duration-200 hover:text-[#006eb3]"
        style={{ left: pos.linkLeft, top: 3937 }}
      >
        {card.linkText}
      </a>
    </div>
  );
}

export function Brands({ site }: { site: SiteContent }) {
  const { brands } = site;
  return (
    <>
      <span
        id="brands"
        aria-hidden
        className="absolute left-0 top-[2469px] block h-px w-px"
      />
      <div className="absolute left-0 top-[3353px] h-[925px] w-[1440px] bg-[#f0efef]" />
      <div className="absolute left-1/2 top-[2469px] h-[636px] w-[848px] -translate-x-1/2">
        <Image
          src="/assets/brands-section.png"
          alt=""
          fill
          loading="lazy"
          sizes="848px"
          className="object-cover"
        />
      </div>

      <p className="absolute left-1/2 top-[3069px] w-[1065px] -translate-x-1/2 text-center text-[36px] font-bold leading-[18px] text-[#0075be]">
        {brands.title}
      </p>
      <div className="absolute left-1/2 top-[3137px] w-[1065px] -translate-x-1/2 text-center">
        <p className="mb-[10px] text-[32px] font-bold leading-[36px] text-[#0075be]">
          {brands.introHeading}
        </p>
        <p className="text-[24px] font-normal leading-[36px] text-[#4d4d4d]">
          {brands.introBody}
        </p>
      </div>

      {brands.cards.map((card, i) => (
        <BrandCardBlock
          key={card.title}
          card={card}
          pos={CARD_POSITIONS[i]}
          logoPos={LOGO_POSITIONS[i]}
          index={i}
        />
      ))}

      <ColumnDivider left={900} top={3422} />
      <ColumnDivider left={533} top={3422} />

      <div className="absolute left-0 top-[3963px] h-[703px] w-[1440px] overflow-hidden">
        <Image
          src="/assets/clients-strip.png"
          alt=""
          loading="lazy"
          fill
          sizes="1440px"
          className="object-cover"
        />
      </div>
    </>
  );
}

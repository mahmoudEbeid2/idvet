"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { SiteContent } from "@/lib/content";
import { ContactTriggerButton } from "./ContactTriggerButton";
import { scrollToSection } from "@/lib/scrollToSection";

// Mouse-parallax range (px) and how much slower the background scrolls
// than the page (0 = locked to content, 1 = doesn't move at all).
const MAX_MOUSE_PARALLAX = 14;
const SCROLL_PARALLAX_FACTOR = 0.25;
// How far (px of scroll) the hero text takes to fade out completely.
const TEXT_FADE_DISTANCE = 500;

// Globe/glow and floor-ripple centers, as a percentage of the 1440x810
// hero image box. Derived by sampling the actual asset for its brightest
// blue region (public/assets/hero-img.png), then mirrored to match the
// horizontal flip already applied to the image for the RTL layout.
const GLOW_POSITION = { left: "35%", top: "44%" };
const RIPPLE_POSITION = { left: "31%", top: "83%" };

const PARTICLES = [
  { left: "22%", top: "24%", size: 4, duration: 5, delay: 0, driftX: 8, driftY: -12 },
  { left: "46%", top: "16%", size: 3, duration: 6, delay: 0.8, driftX: -6, driftY: -10 },
  { left: "16%", top: "48%", size: 3, duration: 4.5, delay: 1.4, driftX: 10, driftY: 8 },
  { left: "50%", top: "58%", size: 4, duration: 5.5, delay: 0.4, driftX: -8, driftY: 10 },
  { left: "30%", top: "65%", size: 3, duration: 6.5, delay: 2, driftX: 6, driftY: -8 },
  { left: "40%", top: "30%", size: 2, duration: 4, delay: 1.2, driftX: -5, driftY: 6 },
];

const RIPPLES = [
  { duration: 3, delay: 0 },
  { duration: 3, delay: 1 },
  { duration: 3, delay: 2 },
];

// Splits on whitespace, keeping the whitespace tokens so they render
// unchanged — words are never split into letters, since that would break
// Kurdish/Arabic letter joining within a word.
function splitIntoWordTokens(text: string) {
  return text.split(/(\s+)/).filter((token) => token.length > 0);
}

export function Hero({ site }: { site: SiteContent }) {
  const { hero } = site;
  const isEnglish = site.locale === "en";
  const mirror = isEnglish ? "-scale-x-100" : "";
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bg = bgRef.current;
    const text = textRef.current;
    if (!bg || !text) return;

    let mouseX = 0;
    let mouseY = 0;
    let curX = 0;
    let curY = 0;
    let scrollY = 0;
    let rafId = 0;

    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

    function onMouseMove(e: MouseEvent) {
      if (!isDesktop()) return;
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2 * MAX_MOUSE_PARALLAX;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2 * MAX_MOUSE_PARALLAX;
    }

    function onScroll() {
      scrollY = window.scrollY;
      const fade = Math.max(0, 1 - scrollY / TEXT_FADE_DISTANCE);
      if (text) {
        text.style.opacity = String(fade);
        text.style.transform = `translateY(${(1 - fade) * -16}px)`;
      }
    }

    function loop() {
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;
      if (bg) {
        bg.style.transform = `translate3d(${curX}px, ${curY + scrollY * SCROLL_PARALLAX_FACTOR}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  function handlePrimaryCtaClick(e: React.MouseEvent) {
    e.preventDefault();
    scrollToSection("brands", { fallbackHref: `/${site.locale}` });
  }

  const wordTokens = splitIntoWordTokens(hero.heading);
  const wordCount = wordTokens.filter((t) => !/^\s+$/.test(t)).length;
  const wordRevealWindow = 0.6; // seconds, total spread across all words
  const perWordDelay = wordCount > 0 ? wordRevealWindow / wordCount : 0;
  let wordIndex = 0;

  return (
    <>
      {/* Hero image */}
      <div className="absolute left-0 top-[150px] flex h-[810px] w-[1440px] items-center justify-center overflow-hidden">
        <div ref={bgRef} className="relative size-full will-change-transform">
          <div className="hero-ken-burns relative size-full">
            <div className="-scale-y-100 rotate-180">
              <div className="relative h-[810px] w-[1440px]">
                <Image
                  src="/assets/hero-img.png"
                  alt=""
                  fill
                  sizes="1440px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Soft pulsing glow aligned with the globe */}
            <div
              aria-hidden
              className="hero-glow pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                left: GLOW_POSITION.left,
                top: GLOW_POSITION.top,
                width: "38%",
                height: "48%",
                background:
                  "radial-gradient(circle, rgba(96,165,250,0.55) 0%, rgba(37,99,235,0.22) 45%, transparent 72%)",
              }}
            />

            {/* Floating light particles around the globe */}
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                aria-hidden
                className="hero-particle pointer-events-none absolute block rounded-full bg-white"
                style={
                  {
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    boxShadow: "0 0 6px 2px rgba(147,197,253,0.8)",
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                    "--drift-x": `${p.driftX}px`,
                    "--drift-y": `${p.driftY}px`,
                  } as CSSProperties
                }
              />
            ))}

            {/* Ripple rings expanding from the glowing floor under the hands */}
            {RIPPLES.map((r, i) => (
              <span
                key={i}
                aria-hidden
                className="hero-ripple pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7cb2ff]"
                style={{
                  left: RIPPLE_POSITION.left,
                  top: RIPPLE_POSITION.top,
                  width: 220,
                  height: 70,
                  animationDuration: `${r.duration}s`,
                  animationDelay: `${r.delay}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Text layer — a single wrapper so scroll-fade can move/fade it as one
          unit. It spans the full canvas (to keep every child's existing
          absolute left/top values valid) so it must stay pointer-events-none,
          with the actual links opting back in individually. */}
      <div ref={textRef} className="pointer-events-none absolute inset-0">
        <p className={`hero-eyebrow absolute left-[1252px] top-[326px] w-[330px] -translate-x-full text-start text-[16px] font-bold leading-[normal] text-white ${mirror}`}>
          {hero.eyebrow}
        </p>

        <p className={`absolute left-[1252px] top-[367px] w-[482px] -translate-x-full text-start text-[36px] font-bold leading-[46px] text-white ${mirror}`}>
          {wordTokens.map((token, i) => {
            if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
            const delay = 0.25 + wordIndex * perWordDelay;
            wordIndex += 1;
            return (
              <span key={i} className="hero-word" style={{ animationDelay: `${delay}s` }}>
                {token}
              </span>
            );
          })}
        </p>

        <p className={`hero-paragraph absolute left-[1252px] top-[588px] w-[482px] -translate-x-full text-start text-[16px] font-normal leading-[28px] text-white ${mirror}`}>
          {hero.paragraph}
        </p>

        <div className="pointer-events-auto absolute right-[188px] top-[763px] flex items-center gap-[18px] whitespace-nowrap">
          <a
            href="#brands"
            onClick={handlePrimaryCtaClick}
            className={`hero-cta hero-shine flex h-[48px] shrink-0 cursor-pointer items-center justify-center gap-[14px] bg-[#0676bd] px-6 text-[15px] font-bold text-white whitespace-nowrap transition-all duration-200 hover:bg-[#0568a8] hover:shadow-md active:bg-[#045990] ${mirror}`}
          >
            <span className="whitespace-nowrap">{hero.ctaPrimary}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/arrow-icon.svg"
              alt=""
              className={`size-[24px] shrink-0 select-none ${isEnglish ? "" : "rotate-180"}`}
            />
          </a>
          <ContactTriggerButton
            className={`hero-cta flex h-[48px] shrink-0 cursor-pointer items-center justify-center border border-white bg-transparent px-8 text-[15px] font-normal text-white whitespace-nowrap transition-all duration-200 hover:bg-white/20 hover:shadow-sm active:bg-white/30 ${mirror}`}
          >
            <span className="whitespace-nowrap">{hero.ctaSecondary}</span>
          </ContactTriggerButton>
        </div>
      </div>

      {/* Tagline strip */}
      <div className="absolute left-0 top-[961px] h-[150px] w-[1440px] bg-[#f0efef]" />
      <p className={`absolute left-[763px] top-[1018px] w-[1074px] -translate-x-1/2 text-center text-[24px] font-medium leading-[36px] text-[#848484] whitespace-pre-wrap ${mirror}`}>
        {site.tagline}
      </p>
    </>
  );
}

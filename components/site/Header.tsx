"use client";

import { useEffect } from "react";
import type { SiteContent } from "@/lib/content";
import { scrollToSection, scrollToTop } from "@/lib/scrollToSection";
import { useActiveSection } from "@/lib/useActiveSection";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV_ITEMS = [
  { id: "contact", left: 496 },
  { id: "brands", left: 656 },
  { id: "services", left: 799 },
  { id: "about", left: 948.5 },
] as const;

const NAV_IDS = NAV_ITEMS.map((item) => item.id);

export function Header({ site }: { site: SiteContent }) {
  const { nav } = site;
  const active = useActiveSection(NAV_IDS, "about");
  // The canvas is mirrored horizontally for English (see Canvas.tsx) so the
  // whole page reads left-to-right; text/logo units counter-mirror
  // themselves so their content stays upright while their position mirrors.
  const mirror = site.locale === "en" ? "-scale-x-100" : "";

  // Opening the page directly on a hash (e.g. /#brands) should land on that
  // section — native fragment navigation doesn't work here (see
  // lib/scrollToSection.ts), so this does it manually on mount.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, []);

  function handleNavClick(e: React.MouseEvent, id: string) {
    e.preventDefault();
    scrollToSection(id, { fallbackHref: `/${site.locale}` });
  }

  const labels: Record<(typeof NAV_ITEMS)[number]["id"], string> = {
    contact: nav.contact,
    brands: nav.brands,
    services: nav.services,
    about: nav.about,
  };

  return (
    <>
      <div className="absolute left-0 top-0 h-[150px] w-[1440px] bg-white" />

      {NAV_ITEMS.map(({ id, left }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => handleNavClick(e, id)}
          className={`absolute top-[65px] -translate-x-1/2 whitespace-nowrap text-[20px] text-[#0676bd] hover:underline ${mirror} ${
            active === id ? "font-bold" : "font-normal"
          }`}
          style={{ left }}
        >
          {labels[id]}
        </a>
      ))}

      <LanguageSwitcher
        current={site.locale}
        options={site.languages}
        className={`absolute left-[190px] top-[57px] h-[44px] w-[165px] cursor-pointer appearance-none rounded-[25px] border border-solid border-[#0676bd] bg-white px-4 text-center font-roboto text-[13px] font-bold text-[#0676bd] transition-colors hover:bg-[#0676bd]/5 focus:outline-none ${mirror}`}
      />

      <button
        type="button"
        onClick={() => scrollToTop()}
        aria-label="Scroll to top"
        className={`absolute left-[1090px] top-[34px] h-[93px] w-[163px] cursor-pointer bg-transparent p-0 transition-opacity hover:opacity-90 ${mirror}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/idvet-logo.svg"
          alt="IDVET"
          className="block size-full"
        />
      </button>
    </>
  );
}

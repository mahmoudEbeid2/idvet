"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { SiteContent } from "@/lib/content";
import { scrollToSection, scrollToTop } from "@/lib/scrollToSection";
import { useActiveSection } from "@/lib/useActiveSection";

const NAV_ITEMS = [
  { id: "contact", left: 496 },
  { id: "brands", left: 656 },
  { id: "services", left: 799 },
  { id: "about", left: 948.5 },
] as const;

const NAV_IDS = NAV_ITEMS.map((item) => item.id);

export function Header({ site }: { site: SiteContent }) {
  const { nav, langSwitch } = site;
  const active = useActiveSection(NAV_IDS, "about");

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
          className={`absolute top-[65px] -translate-x-1/2 whitespace-nowrap text-[20px] text-[#0676bd] hover:underline ${
            active === id ? "font-bold" : "font-normal"
          }`}
          style={{ left }}
        >
          {labels[id]}
        </a>
      ))}

      <Link
        href={langSwitch.href}
        className="absolute left-[190px] top-[57px] flex h-[44px] w-[165px] items-center justify-center rounded-[25px] border border-solid border-[#0676bd] font-roboto text-[13px] font-bold text-[#0676bd] transition-colors hover:bg-[#0676bd]/5"
      >
        {langSwitch.label}
      </Link>

      <button
        type="button"
        onClick={() => scrollToTop()}
        aria-label="Scroll to top"
        className="absolute left-[1090px] top-[34px] h-[93px] w-[163px] cursor-pointer bg-transparent p-0 transition-opacity hover:opacity-90"
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

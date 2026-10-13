"use client";

import { useEffect } from "react";
import type { SiteContent } from "@/lib/content";
import { scrollToSection, scrollToTop } from "@/lib/scrollToSection";
import { useActiveSection } from "@/lib/useActiveSection";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV_ITEMS = [
  { id: "contact", left: 496 },
  { id: "products", left: 609 },
  { id: "brands", left: 722 },
  { id: "services", left: 835 },
  { id: "about", left: 948.5 },
] as const;

const NAV_IDS = NAV_ITEMS.map((item) => item.id);

/** Which page the header is on: home, the catalog, the About page, or anything else (404, error). */
export type HeaderPage = "home" | "products" | "about" | "other";

/**
 * The desktop header, drawn on the 1440px canvas — the only desktop header in
 * the app. The home page renders it inside Canvas; every other page renders it
 * through SiteHeader. Off home the logo links home, section links go to
 * /{locale}#section, and `languagePath` is appended to the language
 * switcher's /{locale} targets so switching keeps the page.
 */
export function Header({
  site,
  page = "home",
  languagePath = "",
}: {
  site: SiteContent;
  page?: HeaderPage;
  languagePath?: string;
}) {
  const { nav } = site;
  const home = `/${site.locale}`;
  const isHome = page === "home";
  // The bold item looks the same on every page: "about", as on home before
  // scrolling (off home no section is ever in view, so it stays).
  const active = useActiveSection(NAV_IDS, "about");
  const languages = site.languages.map((option) => ({ ...option, href: `${option.href}${languagePath}` }));
  // The canvas is mirrored horizontally for English (see Canvas.tsx) so the
  // whole page reads left-to-right; text/logo units counter-mirror
  // themselves so their content stays upright while their position mirrors.
  const mirror = site.locale === "en" ? "-scale-x-100" : "";

  // Opening the page directly on a hash (e.g. /#brands) should land on that
  // section — native fragment navigation doesn't work here (see
  // lib/scrollToSection.ts), so this does it manually on mount.
  useEffect(() => {
    if (!isHome) return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, [isHome]);

  function handleNavClick(e: React.MouseEvent, id: string) {
    e.preventDefault();
    scrollToSection(id, { fallbackHref: home });
  }

  const labels: Record<(typeof NAV_ITEMS)[number]["id"], string> = {
    contact: nav.contact,
    products: nav.products,
    brands: nav.brands,
    services: nav.services,
    about: nav.about,
  };

  // eslint-disable-next-line @next/next/no-img-element
  const logo = <img src="/assets/idvet-logo.svg" alt="IDVET" className="block size-full" />;

  return (
    <>
      <div className="absolute left-0 top-0 h-[150px] w-[1440px] bg-white" />

      {NAV_ITEMS.map(({ id, left }) =>
        id === "products" || id === "about" ? (
          // Page links: the catalog and the About page.
          <a
            key={id}
            href={`${home}/${id}`}
            aria-current={page === id ? "page" : undefined}
            className={`absolute top-[65px] -translate-x-1/2 whitespace-nowrap text-[20px] text-[#0676bd] hover:underline ${mirror} ${
              active === id ? "font-bold" : "font-normal"
            }`}
            style={{ left }}
          >
            {labels[id]}
          </a>
        ) : (
          <a
            key={id}
            href={isHome ? `#${id}` : `${home}#${id}`}
            onClick={(e) => handleNavClick(e, id)}
            className={`absolute top-[65px] -translate-x-1/2 whitespace-nowrap text-[20px] text-[#0676bd] hover:underline ${mirror} ${
              active === id ? "font-bold" : "font-normal"
            }`}
            style={{ left }}
          >
            {labels[id]}
          </a>
        ),
      )}

      <LanguageSwitcher
        current={site.locale}
        options={languages}
        className={`absolute left-[190px] top-[57px] h-[44px] w-[165px] cursor-pointer appearance-none rounded-[25px] border border-solid border-[#0676bd] bg-white px-4 text-center font-roboto text-[13px] font-bold text-[#0676bd] transition-colors hover:bg-[#0676bd]/5 focus:outline-none ${mirror}`}
      />

      {!isHome ? (
        <a href={home} className={`absolute left-[1090px] top-[34px] h-[93px] w-[163px] transition-opacity hover:opacity-90 ${mirror}`}>
          {logo}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => scrollToTop()}
          aria-label="Scroll to top"
          className={`absolute left-[1090px] top-[34px] h-[93px] w-[163px] cursor-pointer bg-transparent p-0 transition-opacity hover:opacity-90 ${mirror}`}
        >
          {logo}
        </button>
      )}
    </>
  );
}

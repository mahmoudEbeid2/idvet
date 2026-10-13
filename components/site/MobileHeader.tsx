"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/content";
import { scrollToSection, scrollToTop } from "@/lib/scrollToSection";
import { useActiveSection } from "@/lib/useActiveSection";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { HeaderPage } from "./Header";

const MOBILE_NAV_IDS = ["about", "services", "brands", "contact"] as const;

/**
 * The sticky phone/tablet header (below lg) — the only one in the app, used by
 * the home page (MobileSite) and every other page (SiteHeader). Same `page`
 * and `languagePath` behaviour as the desktop Header.
 */
export function MobileHeader({
  site,
  page = "home",
  languagePath = "",
}: {
  site: SiteContent;
  page?: HeaderPage;
  languagePath?: string;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const isHome = page === "home";
  // Same bold item as the home page on every page (see Header).
  const active = useActiveSection(MOBILE_NAV_IDS, "about");
  const home = `/${site.locale}`;
  const languages = site.languages.map((option) => ({ ...option, href: `${option.href}${languagePath}` }));

  function handleNavClick(id: string) {
    setNavOpen(false);
    scrollToSection(id, { fallbackHref: home });
  }

  const mobileLabels: Record<(typeof MOBILE_NAV_IDS)[number], string> = {
    about: site.nav.about,
    services: site.nav.services,
    brands: site.nav.brands,
    contact: site.nav.contact,
  };

  // eslint-disable-next-line @next/next/no-img-element
  const logo = <img src="/assets/idvet-logo.svg" alt="IDVET" className="h-12 w-auto" />;

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white text-base leading-normal shadow-xs lg:hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        {!isHome ? (
          <a href={home} className="p-0">
            {logo}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNavOpen(false);
              scrollToTop();
            }}
            aria-label="Scroll to top"
            className="cursor-pointer bg-transparent p-0"
          >
            {logo}
          </button>
        )}
        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          aria-label="menu"
          aria-expanded={navOpen}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
        >
          <span className="block h-0.5 w-6 bg-[#0676bd]" />
          <span className="block h-0.5 w-6 bg-[#0676bd]" />
          <span className="block h-0.5 w-6 bg-[#0676bd]" />
        </button>
      </div>
      {navOpen && (
        <nav className="flex flex-col items-center gap-3 border-t border-black/5 px-4 py-4 text-center text-[#0676bd]">
          {MOBILE_NAV_IDS.map((id) =>
            id === "about" ? (
              // The About page, not a home section.
              <a
                key={id}
                href={`${home}/about`}
                aria-current={page === "about" ? "page" : undefined}
                className={active === id ? "font-bold" : "font-normal"}
                onClick={() => setNavOpen(false)}
              >
                {mobileLabels[id]}
              </a>
            ) : (
              <a
                key={id}
                href={isHome ? `#${id}` : `${home}#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(id);
                }}
                className={active === id ? "font-bold" : "font-normal"}
              >
                {mobileLabels[id]}
              </a>
            ),
          )}
          <a
            href={`${home}/products`}
            aria-current={page === "products" ? "page" : undefined}
            className="font-normal"
            onClick={() => setNavOpen(false)}
          >
            {site.nav.products}
          </a>
          <LanguageSwitcher
            current={site.locale}
            options={languages}
            className="mt-1 w-fit cursor-pointer appearance-none rounded-full border border-[#0676bd] bg-white px-4 py-2 text-center font-roboto text-sm font-bold text-[#0676bd] focus:outline-none"
          />
        </nav>
      )}
    </header>
  );
}

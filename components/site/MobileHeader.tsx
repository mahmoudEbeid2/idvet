"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { contactButtonClass, languageOptions, navLinkClass, useHeaderNav, type HeaderPage } from "./Header";

/**
 * The sticky phone/tablet header (below lg) — the only one in the app, used by
 * the home page (MobileSite) and every other page (SiteHeader). The menu holds
 * the desktop Header's links in the same order, the language menu, and the
 * Contact button across the bottom.
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
  const { home, links, contact, onLogoClick } = useHeaderNav(site, page, () => setNavOpen(false));

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white text-base leading-normal shadow-xs lg:hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <a href={home} onClick={onLogoClick} className="p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/idvet-logo.svg" alt="IDVET" className="h-12 w-auto" />
        </a>
        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          aria-label={site.nav.menu}
          aria-expanded={navOpen}
          aria-controls="mobile-nav"
          className="relative flex size-10 items-center justify-center"
        >
          {/* Three bars that fold into an X while the menu is open. */}
          <span
            className={`absolute h-0.5 w-6 bg-[#0676bd] transition-transform ${navOpen ? "rotate-45" : "-translate-y-2"}`}
          />
          <span className={`absolute h-0.5 w-6 bg-[#0676bd] transition-opacity ${navOpen ? "opacity-0" : ""}`} />
          <span
            className={`absolute h-0.5 w-6 bg-[#0676bd] transition-transform ${navOpen ? "-rotate-45" : "translate-y-2"}`}
          />
        </button>
      </div>
      {navOpen && (
        <nav id="mobile-nav" aria-label={site.nav.menu} className="border-t border-black/5 px-5 pt-2 pb-5">
          <ul className="flex flex-col text-center text-[17px]">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  onClick={(e) => (link.onClick ? link.onClick(e) : setNavOpen(false))}
                  aria-current={link.active ? (link.id === "services" ? "true" : "page") : undefined}
                  className={`block py-3 ${navLinkClass(link.active)}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-center">
            <LanguageSwitcher current={site.locale} options={languageOptions(site, languagePath)} label={site.nav.language} />
          </div>
          <a
            href={contact.href}
            aria-current={contact.active ? "page" : undefined}
            onClick={() => setNavOpen(false)}
            className={`mt-4 flex w-full ${contactButtonClass(contact.active)}`}
          >
            {contact.label}
          </a>
        </nav>
      )}
    </header>
  );
}

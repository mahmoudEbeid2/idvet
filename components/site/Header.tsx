"use client";

import { useEffect } from "react";
import type { SiteContent } from "@/lib/content";
import { scrollToSection, scrollToTop } from "@/lib/scrollToSection";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Which page the header is on: home, the catalog, the About, Contact, Brands or Services page, or anything else (404, error). */
export type HeaderPage = "home" | "products" | "about" | "contact" | "brands" | "services" | "other";

/** The nav links in order (start → end); Contact follows as a button. */
const NAV_IDS = ["products", "brands", "services", "about"] as const;
type NavId = (typeof NAV_IDS)[number];

export interface NavLink {
  id: NavId;
  label: string;
  href: string;
  active: boolean;
}

/** The header's links (all pages), shared by the desktop Header and the MobileHeader. */
export function useHeaderNav(site: SiteContent, page: HeaderPage, onNavigate?: () => void) {
  const home = `/${site.locale}`;
  const isHome = page === "home";

  const links: NavLink[] = NAV_IDS.map((id) => ({
    id,
    label: site.nav[id],
    href: `${home}/${id}`,
    active: page === id,
  }));

  /** On home the logo scrolls back to the top instead of reloading. */
  function onLogoClick(e: React.MouseEvent) {
    onNavigate?.();
    if (!isHome) return;
    e.preventDefault();
    scrollToTop();
  }

  return {
    home,
    links,
    contact: { label: site.nav.contact, href: `${home}/contact`, active: page === "contact" },
    onLogoClick,
  };
}

/** Same page in each language: `languagePath` is appended to /{locale}. */
export function languageOptions(site: SiteContent, languagePath: string) {
  return site.languages.map((option) => ({ ...option, href: `${option.href}${languagePath}` }));
}

export const navLinkClass = (active: boolean) =>
  `underline-offset-[10px] transition-colors hover:text-[#0676bd] ${
    active ? "font-bold text-[#0676bd] underline decoration-2" : "text-[#33475b] hover:underline hover:decoration-[#0676bd]/40"
  }`;

export const contactButtonClass = (active: boolean) =>
  `inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#0676bd] px-6 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[#0568a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0676bd] ${
    active ? "ring-2 ring-[#0676bd]/35 ring-offset-2" : ""
  }`;

/**
 * The desktop header (from lg) on every public page: logo, the nav links,
 * the Contact button and the language menu, in the page's direction.
 * Below lg the MobileHeader takes over.
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
  const { home, links, contact, onLogoClick } = useHeaderNav(site, page);

  // Opening home directly on a hash (e.g. /ar#services) should land on that
  // section; MobileSite does the same below lg.
  useEffect(() => {
    if (page !== "home") return;
    const hash = window.location.hash.replace("#", "");
    if (hash) requestAnimationFrame(() => scrollToSection(hash));
  }, [page]);

  return (
    // Font-size/line-height reset: pages may set their own (the catalog uses 15px/1.7).
    <header className="relative z-30 hidden bg-white text-base leading-normal lg:block">
      <div className="mx-auto flex h-[112px] max-w-[1097px] items-center justify-between gap-8 px-4 xl:h-[150px]">
        <a href={home} onClick={onLogoClick} className="shrink-0 transition-opacity hover:opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/idvet-logo.svg" alt="IDVET" width={163} height={93} className="block h-[72px] w-auto xl:h-[93px]" />
        </a>
        <nav aria-label={site.nav.menu} className="flex items-center gap-8 xl:gap-12">
          <ul className="flex items-center gap-7 text-[17px] xl:gap-10 xl:text-[19px]">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={`whitespace-nowrap ${navLinkClass(link.active)}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <a href={contact.href} aria-current={contact.active ? "page" : undefined} className={contactButtonClass(contact.active)}>
              {contact.label}
            </a>
            <LanguageSwitcher current={site.locale} options={languageOptions(site, languagePath)} label={site.nav.language} />
          </div>
        </nav>
      </div>
    </header>
  );
}

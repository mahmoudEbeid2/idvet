"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { ContactTriggerButton } from "./ContactTriggerButton";
import { scrollToSection, scrollToTop } from "@/lib/scrollToSection";
import { useActiveSection } from "@/lib/useActiveSection";
import { GalleryLightbox } from "./GalleryLightbox";
import { LanguageSwitcher } from "./LanguageSwitcher";

const GALLERY_IMAGES = Array.from({ length: 10 }, (_, i) => `gallery-${i + 1}.png`);

const MOBILE_NAV_IDS = ["about", "services", "brands", "contact"] as const;

export function MobileSite({ site }: { site: SiteContent }) {
  const [navOpen, setNavOpen] = useState(false);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);
  const active = useActiveSection(MOBILE_NAV_IDS, "about");
  const isEnglish = site.locale === "en";
  const smAlign = isEnglish ? "sm:text-left" : "sm:text-right";

  // Opening the page directly on a hash (e.g. /#brands) should land on that
  // section on load — see lib/scrollToSection.ts for why this can't just be
  // native <a href="#id"> fragment navigation.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, []);

  function handleNavClick(id: string) {
    setNavOpen(false);
    scrollToSection(id, { fallbackHref: `/${site.locale}` });
  }

  const mobileLabels: Record<(typeof MOBILE_NAV_IDS)[number], string> = {
    about: site.nav.about,
    services: site.nav.services,
    brands: site.nav.brands,
    contact: site.nav.contact,
  };

  return (
    <div className="lg:hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white shadow-xs">
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={() => {
              setNavOpen(false);
              scrollToTop();
            }}
            aria-label="Scroll to top"
            className="cursor-pointer bg-transparent p-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/idvet-logo.svg" alt="IDVET" className="h-12 w-auto" />
          </button>
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
          >
            <span className="block h-0.5 w-6 bg-[#0676bd]" />
            <span className="block h-0.5 w-6 bg-[#0676bd]" />
            <span className="block h-0.5 w-6 bg-[#0676bd]" />
          </button>
        </div>
        {navOpen && (
          <nav className="flex flex-col items-center gap-3 border-t border-black/5 px-4 py-4 text-center text-[#0676bd]">
            {MOBILE_NAV_IDS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(id);
                }}
                className={active === id ? "font-bold" : "font-normal"}
              >
                {mobileLabels[id]}
              </a>
            ))}
            <LanguageSwitcher
              current={site.locale}
              options={site.languages}
              className="mt-1 w-fit cursor-pointer appearance-none rounded-full border border-[#0676bd] bg-white px-4 py-2 text-center font-roboto text-sm font-bold text-[#0676bd] focus:outline-none"
            />
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative h-[320px] w-full sm:h-[420px]">
        <Image
          src="/assets/hero-img.png"
          alt=""
          fill
          sizes="100vw"
          className={`object-cover ${isEnglish ? "" : "scale-x-[-1]"}`}
        />
      </section>
      <section className={`bg-[#0b1f36] px-4 py-10 text-center text-white ${smAlign}`}>
        <p className="mb-3 text-sm font-bold sm:text-base">{site.hero.eyebrow}</p>
        <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">
          {site.hero.heading}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-white/90 sm:text-base">
          {site.hero.paragraph}
        </p>
        <div className="flex flex-wrap justify-center gap-3.5 sm:justify-start">
          <a
            href="#brands"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("brands", { fallbackHref: `/${site.locale}` });
            }}
            className="flex h-[46px] shrink-0 cursor-pointer items-center justify-center gap-3 bg-[#0676bd] px-5 text-sm font-bold text-white whitespace-nowrap transition-all hover:bg-[#0568a8]"
          >
            <span className="whitespace-nowrap">{site.hero.ctaPrimary}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/arrow-icon.svg"
              alt=""
              className={`size-[22px] shrink-0 select-none ${isEnglish ? "" : "rotate-180"}`}
            />
          </a>
          <ContactTriggerButton className="flex h-[46px] shrink-0 cursor-pointer items-center justify-center border border-white bg-transparent px-6 text-sm font-normal text-white whitespace-nowrap transition-colors hover:bg-white/20 active:bg-white/30">
            <span className="whitespace-nowrap">{site.hero.ctaSecondary}</span>
          </ContactTriggerButton>
        </div>
      </section>

      {/* Tagline */}
      <section className="bg-[#f0efef] px-4 py-6 text-center text-sm font-medium text-[#848484] sm:text-base">
        {site.tagline}
      </section>

      {/* About */}
      <section
        id="about-m"
        className="scroll-mt-[73px] flex flex-col items-center gap-6 px-4 py-12"
      >
        <div className="relative h-[220px] w-[170px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/about-illustration.svg"
            alt=""
            className="block size-full"
          />
        </div>
        <p className="text-2xl font-medium text-[#0075be]">{site.about.title}</p>
        <p className={`text-center text-xl font-bold leading-snug text-[#0075be] ${smAlign}`}>
          {site.about.heading}
        </p>
        <div className={`flex w-full flex-col gap-3 text-center text-[#4d4d4d] ${smAlign}`}>
          {site.about.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Services */}
      <section
        id="services-m"
        className="scroll-mt-[73px] bg-[#0075be] px-4 py-12 text-white"
      >
        <p className="mb-2 text-center text-2xl font-medium">{site.services.title}</p>
        <p className="mb-8 text-center text-lg font-medium text-white/90">
          {site.services.subtitle}
        </p>
        <div className="flex flex-col gap-6">
          {site.services.items.map((item, i) => (
            <div key={i} className={`text-center ${smAlign}`}>
              <p className="mb-1 font-bold leading-snug">
                {item.heading.split("\n").map((line, j) => (
                  <span key={j}>
                    {j > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
              <p className="text-sm leading-relaxed text-white/90">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section id="brands-m" className="scroll-mt-[73px] px-4 py-12">
        <p className="mb-2 text-center text-2xl font-bold text-[#0075be]">
          {site.brands.title}
        </p>
        <p className="mb-2 text-center text-lg font-bold text-[#0075be]">
          {site.brands.introHeading}
        </p>
        <p className="mb-8 text-center text-sm leading-relaxed text-[#4d4d4d]">
          {site.brands.introBody}
        </p>
        <div className="flex flex-col gap-6">
          {site.brands.cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center gap-3 rounded-2xl bg-[#f7f7f7] p-5"
            >
              <div className="relative h-[50px] w-[160px]">
                {card.logo.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="absolute inset-0 mx-auto size-full object-contain"
                  />
                ))}
              </div>
              <p className={`w-full text-center font-bold text-[#0075be] ${smAlign}`}>
                {card.title}
              </p>
              <p className={`w-full text-center text-sm leading-relaxed text-[#4d4d4d] ${smAlign}`}>
                {card.body}
              </p>
              <div className="flex flex-wrap justify-center gap-2" dir="ltr">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="whitespace-nowrap rounded-full border border-[#006db2] bg-white px-3 py-1 text-xs text-[#0075be]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="mt-1 text-sm font-bold text-[#0075be] underline"
              >
                {card.linkText}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Client photo strip */}
      <div className="relative h-[220px] w-full">
        <Image
          src="/assets/clients-strip.png"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Why us */}
      <section id="why-us-m" className="bg-[#f0efef] px-4 py-12">
        <p className="mb-2 text-center text-2xl font-medium text-[#196cb5]">
          {site.whyUs.title}
        </p>
        <p className="mb-8 text-center text-lg font-medium text-[#196cb5]">
          {site.whyUs.subtitle}
        </p>
        <div className="flex flex-col gap-8">
          {site.whyUs.items.map((item) => (
            <div
              key={item.title}
              className={`flex flex-col items-center gap-3 text-center ${smAlign}`}
            >
              <div className="relative size-[56px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.icon} alt="" className="block size-full" />
              </div>
              <p className="font-bold text-[#196cb5]">{item.title}</p>
              <p className="text-sm leading-relaxed text-[#196cb5]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery-m" className="px-4 py-12">
        <p className="mb-6 text-center text-2xl font-medium text-[#0075be]">
          {site.gallery.title}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GALLERY_IMAGES.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setGalleryLightboxIndex(i)}
              aria-label={`${site.gallery.title} ${i + 1}`}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-black/5 bg-slate-100 p-0 text-left focus:outline-none focus:ring-2 focus:ring-[#0075be]"
            >
              <Image
                src={`/assets/${src}`}
                alt={`${site.gallery.title} ${i + 1}`}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-[#0075be] shadow-md">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>

        {galleryLightboxIndex !== null && (
          <GalleryLightbox
            images={GALLERY_IMAGES}
            initialIndex={galleryLightboxIndex}
            onClose={() => setGalleryLightboxIndex(null)}
            title={site.gallery.title}
            locale={site.locale}
          />
        )}
      </section>

      {/* Contact */}
      <section
        id="contact-m"
        className="scroll-mt-[73px] bg-[#006eb3] px-4 py-12 text-white"
      >
        <p className="mb-3 text-center text-2xl font-medium">{site.contact.heading}</p>
        <p className="mb-6 text-center text-sm leading-relaxed text-white/90">
          {site.contact.body}
        </p>
        <div className="mb-8 flex justify-center">
          <ContactTriggerButton className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#006eb3]">
            {site.contact.cta}
          </ContactTriggerButton>
        </div>
        <div
          className={`flex flex-col items-center gap-4 text-center ${
            isEnglish ? "sm:items-start sm:text-left" : "sm:items-end sm:text-right"
          }`}
          dir="ltr"
        >
          <div>
            <p className="font-bold">{site.contact.emailLabel}</p>
            <a
              href={`mailto:${site.contact.email}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              {site.contact.email}
            </a>
          </div>
          <div>
            <p className="font-bold">{site.contact.phoneLabel}</p>
            <a
              href={`https://wa.me/${site.contact.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline-offset-4 hover:underline"
            >
              {site.contact.phone}
            </a>
          </div>
          <div>
            <p className="font-bold">{site.contact.addressLabel}</p>
            {site.contact.addressLines.map((line) => (
              <p key={line} className="text-sm">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#006eb3] px-4 py-6 text-center text-sm font-light text-white">
        {site.footer.copyright}
      </footer>
    </div>
  );
}

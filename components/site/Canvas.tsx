import type { SiteContent } from "@/lib/content";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { About } from "./About";
import { Services } from "./Services";
import { Brands } from "./Brands";
import { WhyUs } from "./WhyUs";
import { Gallery } from "./Gallery";
import { Contact } from "./Contact";
import { Footer } from "./Footer";

export const CANVAS_HEIGHT = 6058;

export function Canvas({ site }: { site: SiteContent }) {
  const isEnglish = site.locale === "en";
  return (
    <div
      className={`relative w-[1440px] overflow-hidden bg-white ${isEnglish ? "-scale-x-100" : ""}`}
      style={{ height: CANVAS_HEIGHT }}
    >
      <Header site={site} />
      <Hero site={site} />
      <About site={site} />
      <Services site={site} />
      <Brands site={site} />
      <WhyUs site={site} />
      <Gallery site={site} />
      <Contact site={site} />
      <Footer site={site} />
    </div>
  );
}

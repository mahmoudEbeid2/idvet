import type { SiteContent } from "@/lib/content";
import { Hero } from "./Hero";
import { About } from "./About";
import { Services } from "./Services";
import { Brands } from "./Brands";
import { WhyUs } from "./WhyUs";
import { Gallery } from "./Gallery";
import { Contact } from "./Contact";
import { Footer } from "./Footer";

import { CANVAS_HEIGHT, CANVAS_HEADER_HEIGHT } from "./canvasSize";

export { CANVAS_HEIGHT, CANVAS_HEADER_HEIGHT };

/**
 * The 1440px home page design below its header (the real Header is rendered
 * above it, see app/[locale]/page.tsx): the sections keep their design
 * coordinates and the top CANVAS_HEADER_HEIGHT pixels are cut off.
 */
export function Canvas({ site }: { site: SiteContent }) {
  const isEnglish = site.locale === "en";
  return (
    <div
      className={`relative w-[1440px] overflow-hidden bg-white ${isEnglish ? "-scale-x-100" : ""}`}
      style={{ height: CANVAS_HEIGHT - CANVAS_HEADER_HEIGHT }}
    >
      <div className="relative w-[1440px]" style={{ height: CANVAS_HEIGHT, marginTop: -CANVAS_HEADER_HEIGHT }}>
        <Hero site={site} />
        <About site={site} />
        <Services site={site} />
        <Brands site={site} />
        <WhyUs site={site} />
        <Gallery site={site} />
        <Contact site={site} />
        <Footer site={site} />
      </div>
    </div>
  );
}

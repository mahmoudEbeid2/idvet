import type { SiteContent } from "@/lib/content";
import { CANVAS_HEIGHT } from "./canvasSize";
import { Contact } from "./Contact";
import { FigmaCanvas } from "./FigmaCanvas";
import { Footer } from "./Footer";
import { MobileContactFooter } from "./MobileContactFooter";

// Contact + Footer are drawn at these canvas coordinates on the home page
// (Contact.tsx starts its blue band at top 5624; the canvas ends at 6058).
const BAND_TOP = 5624;
const BAND_HEIGHT = CANVAS_HEIGHT - BAND_TOP;

/**
 * The home page's own contact section and footer for every other public page:
 * below lg MobileContactFooter, from lg the same Contact/Footer components as
 * the home canvas — the bottom band of that 1440px canvas, scaled and (for
 * English) mirrored exactly like Canvas does. Needs a ContactModalProvider.
 */
export function SiteFooter({ site }: { site: SiteContent }) {
  const isEnglish = site.locale === "en";
  return (
    <>
      <MobileContactFooter site={site} />
      {/* Font-size/line-height reset: pages may set their own (the catalog uses 15px/1.7). */}
      <div className="hidden text-base leading-normal lg:block">
        <FigmaCanvas height={BAND_HEIGHT}>
          <div
            className={`relative w-[1440px] overflow-hidden bg-[#006eb3] ${isEnglish ? "-scale-x-100" : ""}`}
            style={{ height: BAND_HEIGHT }}
          >
            <div className="absolute left-0 w-[1440px]" style={{ top: -BAND_TOP, height: CANVAS_HEIGHT }}>
              <Contact site={site} />
              <Footer site={site} />
            </div>
          </div>
        </FigmaCanvas>
      </div>
    </>
  );
}

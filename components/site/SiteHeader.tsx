import type { SiteContent } from "@/lib/content";
import { FigmaCanvas } from "./FigmaCanvas";
import { Header, type HeaderPage } from "./Header";
import { MobileHeader } from "./MobileHeader";

const HEADER_HEIGHT = 150;

/**
 * The home page's own headers for every other public page: below lg the
 * sticky MobileHeader, from lg the 1440px canvas Header, scaled and (for
 * English) mirrored exactly like the home page's Canvas does it.
 */
export function SiteHeader({
  site,
  page,
  languagePath,
}: {
  site: SiteContent;
  page: Exclude<HeaderPage, "home">;
  languagePath: string;
}) {
  const isEnglish = site.locale === "en";
  return (
    <>
      <MobileHeader site={site} page={page} languagePath={languagePath} />
      {/* Font-size/line-height reset: pages may set their own (the catalog uses 15px/1.7). */}
      <div className="hidden text-base leading-normal lg:block">
        <FigmaCanvas height={HEADER_HEIGHT}>
          <div
            className={`relative w-[1440px] overflow-hidden bg-white ${isEnglish ? "-scale-x-100" : ""}`}
            style={{ height: HEADER_HEIGHT }}
          >
            <Header site={site} page={page} languagePath={languagePath} />
          </div>
        </FigmaCanvas>
      </div>
    </>
  );
}

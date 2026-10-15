import type { SiteContent } from "@/lib/content";
import { Header, type HeaderPage } from "./Header";
import { MobileHeader } from "./MobileHeader";

/**
 * The header of every page other than home: below lg the sticky
 * MobileHeader, from lg the desktop Header. `languagePath` is appended to
 * /{locale} by the language menu so switching keeps the page.
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
  return (
    <>
      <MobileHeader site={site} page={page} languagePath={languagePath} />
      <Header site={site} page={page} languagePath={languagePath} />
    </>
  );
}

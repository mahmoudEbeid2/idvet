import type { SiteContent } from "@/lib/content";
import { SocialLinks } from "./SocialLinks";

export function Footer({ site }: { site: SiteContent }) {
  const mirror = site.locale === "en" ? "-scale-x-100" : "";
  return (
    <>
      <div className="absolute left-[188px] top-[5986px] h-px w-[1065px] bg-white/40" />
      <p className={`absolute left-1/2 top-[6004px] w-[1065px] -translate-x-1/2 text-center text-[20px] font-light leading-[36px] text-white ${mirror}`}>
        {site.footer.copyright}
      </p>
      <SocialLinks className={`absolute left-[188px] top-[6004px] h-[36px] ${mirror}`} />
    </>
  );
}

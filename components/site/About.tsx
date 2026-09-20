import type { SiteContent } from "@/lib/content";

export function About({ site }: { site: SiteContent }) {
  const { about } = site;
  const mirror = site.locale === "en" ? "-scale-x-100" : "";
  return (
    <>
      <span
        id="about"
        aria-hidden
        className="absolute left-0 top-[1120px] block h-px w-px"
      />
      <p className={`absolute left-[1253px] top-[1145px] w-[345px] -translate-x-full text-start text-[32px] font-bold leading-normal text-[#0075be] ${mirror}`}>
        {about.title}
      </p>
      <div className={`absolute left-[1253px] top-[1205px] w-[760px] -translate-x-full text-start ${mirror}`}>
        <p className="mb-4 text-[26px] font-bold leading-[38px] text-[#0075be]">
          {about.heading}
        </p>
        {about.paragraphs.map((p, i) => (
          <p
            key={i}
            className="mb-3 text-[17px] font-normal leading-[30px] text-[#4d4d4d] last:mb-0"
          >
            {p}
          </p>
        ))}
      </div>

      <div className={`absolute left-[184px] top-[1197px] h-[344px] w-[260px] ${mirror}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/about-illustration.svg"
          alt=""
          className="block size-full"
        />
      </div>
    </>
  );
}

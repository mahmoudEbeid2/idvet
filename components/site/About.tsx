import type { SiteContent } from "@/lib/content";

export function About({ site }: { site: SiteContent }) {
  const { about } = site;
  return (
    <>
      <span
        id="about"
        aria-hidden
        className="absolute left-0 top-[1120px] block h-px w-px"
      />
      <p className="absolute left-[1253px] top-[1168px] w-[345px] -translate-x-full text-right text-[36px] font-medium leading-[18px] text-[#0075be]">
        {about.title}
      </p>
      <div className="absolute left-[1253px] top-[1232px] w-[705px] -translate-x-full text-right">
        <p className="mb-[10px] text-[32px] font-bold leading-[40px] text-[#0075be]">
          {about.heading}
        </p>
        {about.paragraphs.map((p, i) => (
          <p
            key={i}
            className="mb-[10px] text-[24px] font-normal leading-[40px] text-[#4d4d4d] last:mb-0"
          >
            {p}
          </p>
        ))}
      </div>

      <div className="absolute left-[184px] top-[1197px] h-[344px] w-[260px]">
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

import Image from "next/image";
import type { SiteContent } from "@/lib/content";

const ITEM_TOPS = [1792, 1981, 2134, 2287];

export function Services({ site }: { site: SiteContent }) {
  const { services } = site;
  return (
    <>
      <span
        id="services"
        aria-hidden
        className="absolute left-0 top-[1603px] block h-px w-px"
      />
      <div className="absolute left-0 top-[1603px] h-[883px] w-[1440px] bg-[#0075be]" />
      <div className="absolute left-0 top-[1603px] h-[883px] w-[1568px] opacity-40">
        <Image
          src="/assets/our-services-bg.png"
          alt=""
          fill
          loading="lazy"
          sizes="1568px"
          className="object-cover"
        />
      </div>

      <p className="absolute left-[1253px] top-[1659px] w-[345px] -translate-x-full text-right text-[36px] font-medium leading-[18px] text-white">
        {services.title}
      </p>
      <p className="absolute left-[1253px] top-[1715px] w-[705px] -translate-x-full text-right text-[36px] font-medium leading-[18px] text-white">
        {services.subtitle}
      </p>

      {services.items.map((item, i) => (
        <div
          key={i}
          className="absolute left-[1253px] w-[705px] -translate-x-full text-right"
          style={{ top: ITEM_TOPS[i] }}
        >
          <p className="text-[20px] font-bold leading-[36px] text-white">
            {item.heading.split("\n").map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <p className="text-[20px] font-normal leading-[36px] text-white">
            {item.body}
          </p>
        </div>
      ))}
    </>
  );
}

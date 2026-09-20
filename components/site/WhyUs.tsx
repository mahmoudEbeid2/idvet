import type { SiteContent } from "@/lib/content";

const ITEM_POS = [
  { textLeft: 1253, width: 345, iconLeft: 1186, iconTop: 5333, iconSize: 67 },
  { textLeft: 888, width: 335, iconLeft: 825, iconTop: 5337, iconSize: 63 },
  { textLeft: 531, width: 345, iconLeft: 474, iconTop: 5341, iconSize: 59 },
];

export function WhyUs({ site }: { site: SiteContent }) {
  const { whyUs } = site;
  const mirror = site.locale === "en" ? "-scale-x-100" : "";
  return (
    <>
      <p className={`absolute left-[1253px] top-[5200px] w-[345px] -translate-x-full text-start text-[36px] font-medium leading-[18px] text-[#196cb5] ${mirror}`}>
        {whyUs.title}
      </p>
      <p className={`absolute left-[1253px] top-[5256px] w-[1039px] -translate-x-full text-start text-[36px] font-medium leading-[18px] text-[#196cb5] ${mirror}`}>
        {whyUs.subtitle}
      </p>

      {whyUs.items.map((item, i) => {
        const pos = ITEM_POS[i];
        return (
          <div key={item.title}>
            <div
              className={`absolute ${mirror}`}
              style={{ left: pos.iconLeft, top: pos.iconTop, width: pos.iconSize, height: pos.iconSize }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" className="block size-full" />
            </div>
            <div
              className={`absolute -translate-x-full text-start ${mirror}`}
              style={{ left: pos.textLeft, width: pos.width, top: 5414 }}
            >
              <p className="mb-0 text-[20px] font-bold leading-[28px] text-[#196cb5]">
                {item.title}
              </p>
              <p className="text-[20px] font-normal leading-[28px] text-[#196cb5]">
                {item.body}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}

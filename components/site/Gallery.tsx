import Image from "next/image";
import type { SiteContent } from "@/lib/content";

const XS = [208, 420, 631, 842, 1054];
const ROWS = [4759, 4974];
const IMAGES = [
  "gallery-1.png",
  "gallery-2.png",
  "gallery-3.png",
  "gallery-4.png",
  "gallery-5.png",
  "gallery-6.png",
  "gallery-7.png",
  "gallery-8.png",
  "gallery-9.png",
  "gallery-10.png",
];

export function Gallery({ site }: { site: SiteContent }) {
  return (
    <>
      <div className="absolute left-[514px] top-[4682px] flex h-[40px] w-[411px] items-center justify-center">
        <p className="text-[36px] font-medium leading-[normal] text-[#0075be]">
          {site.gallery.title}
        </p>
      </div>

      {IMAGES.map((src, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <div
            key={src}
            className="absolute size-[177.795px] overflow-hidden"
            style={{ left: XS[col], top: ROWS[row] }}
          >
            <Image
              src={`/assets/${src}`}
              alt=""
              fill
              loading="lazy"
              sizes="178px"
              className="object-cover"
            />
          </div>
        );
      })}
    </>
  );
}

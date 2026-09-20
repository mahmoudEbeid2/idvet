"use client";

import { useState } from "react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { GalleryLightbox } from "./GalleryLightbox";

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const mirror = site.locale === "en" ? "-scale-x-100" : "";

  return (
    <>
      <div className="absolute left-[514px] top-[4682px] flex h-[40px] w-[411px] items-center justify-center">
        <p className={`text-[36px] font-medium leading-[normal] text-[#0075be] ${mirror}`}>
          {site.gallery.title}
        </p>
      </div>

      {IMAGES.map((src, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <button
            key={src}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`${site.gallery.title} ${i + 1}`}
            className={`group absolute size-[177.795px] cursor-pointer overflow-hidden rounded-md border border-black/5 bg-slate-100 p-0 transition-shadow duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0075be] ${mirror}`}
            style={{ left: XS[col], top: ROWS[row] }}
          >
            <Image
              src={`/assets/${src}`}
              alt={`${site.gallery.title} ${i + 1}`}
              fill
              loading="lazy"
              sizes="178px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Subtle hover overlay with zoom-in icon */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
              <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-[#0075be] shadow-md transition-transform duration-200 group-hover:scale-105">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </span>
            </div>
          </button>
        );
      })}

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={IMAGES}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          title={site.gallery.title}
          locale={site.locale}
        />
      )}
    </>
  );
}


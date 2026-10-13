"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ImageView } from "@/lib/catalog/data";
import { CloseIcon, NextIcon, PrevIcon, ZoomIcon } from "./icons";
import { useModal } from "./useModal";
import { NoImage, tint } from "./parts";
import s from "./catalog.module.css";

interface Labels {
  galleryLabel: string;
  previousImage: string;
  nextImage: string;
  enlargeImage: string;
  close: string;
  noImage: string;
}

export function ProductGallery({
  images,
  name,
  color,
  categoryIcon,
  rtl,
  labels,
}: {
  images: ImageView[];
  name: string;
  color: string;
  categoryIcon: string;
  rtl: boolean;
  labels: Labels;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const step = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);
  const flip = rtl ? "" : s.flip;

  if (count === 0) {
    return (
      <div className={s.gal} style={tint(color)}>
        <div className={s.galMain}>
          <NoImage icon={categoryIcon} label={labels.noImage} />
        </div>
      </div>
    );
  }

  const current = images[index];
  return (
    <div className={s.gal} style={tint(color)} aria-label={labels.galleryLabel} role="region">
      <div className={s.galMain}>
        <button type="button" className={s.galMainButton} onClick={() => setOpen(true)} aria-label={labels.enlargeImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} width={current.width} height={current.height} alt={name} />
        </button>
        {count > 1 && (
          <span className={s.galCount}>
            {index + 1} / {count}
          </span>
        )}
        {count > 1 && (
          <>
            <button type="button" className={`${s.galNav} ${s.galPrev}`} onClick={() => step(-1)} aria-label={labels.previousImage}>
              <PrevIcon className={flip} />
            </button>
            <button type="button" className={`${s.galNav} ${s.galNext}`} onClick={() => step(1)} aria-label={labels.nextImage}>
              <NextIcon className={flip} />
            </button>
          </>
        )}
        <span className={s.galZoom} aria-hidden="true">
          <ZoomIcon />
        </span>
      </div>

      {count > 1 && (
        <div className={s.thumbs}>
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              aria-current={i === index}
              aria-label={`${i + 1} / ${count}`}
              onClick={() => setIndex(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} width={image.width} height={image.height} alt={`${name} ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <Lightbox
          images={images}
          index={index}
          name={name}
          color={color}
          rtl={rtl}
          labels={labels}
          onStep={step}
          onSelect={setIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  name,
  color,
  rtl,
  labels,
  onStep,
  onSelect,
  onClose,
}: {
  images: ImageView[];
  index: number;
  name: string;
  color: string;
  rtl: boolean;
  labels: Labels;
  onStep: (delta: number) => void;
  onSelect: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const current = images[index];
  const flip = rtl ? "" : s.flip;
  useModal(closeRef, onClose);

  // Arrow keys follow the reading direction: in RTL the left arrow is "next".
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (count < 2) return;
      if (e.key === "ArrowLeft") onStep(rtl ? 1 : -1);
      if (e.key === "ArrowRight") onStep(rtl ? -1 : 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [count, onStep, rtl]);

  // Portalled to <body>: a sticky ancestor would otherwise trap it under the site header.
  return createPortal(
    <div className={s.modal} role="dialog" aria-modal="true" aria-label={labels.galleryLabel} style={tint(color)}>
      <div className={s.mBar}>
        <div className={s.mTitle}>
          <span>{name}</span>
        </div>
        <div className={s.mTools}>
          <span className={s.mCount}>
            {index + 1} / {count}
          </span>
          <span className={s.mSep} />
          <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close}>
            <CloseIcon />
          </button>
        </div>
      </div>
      <div
        className={s.lbBody}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className={s.lbStage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} width={current.width} height={current.height} alt={name} />
        </div>
        {count > 1 && (
          <>
            <button type="button" className={`${s.lbNav} ${s.lbPrev}`} onClick={() => onStep(-1)} aria-label={labels.previousImage}>
              <PrevIcon className={flip} />
            </button>
            <button type="button" className={`${s.lbNav} ${s.lbNext}`} onClick={() => onStep(1)} aria-label={labels.nextImage}>
              <NextIcon className={flip} />
            </button>
          </>
        )}
      </div>
      {count > 1 && (
        <div className={s.lbThumbs}>
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              aria-current={i === index}
              aria-label={`${i + 1} / ${count}`}
              onClick={() => onSelect(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={`${name} ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

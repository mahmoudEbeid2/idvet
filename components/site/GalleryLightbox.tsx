"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface GalleryLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  title?: string;
}

export function GalleryLightbox({
  images,
  initialIndex,
  onClose,
  title,
}: GalleryLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);

  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const total = images.length;

  useEffect(() => {
    setMounted(true);
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Lock body scroll and preserve scroll position
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      lastActiveElementRef.current?.focus();
    };
  }, []);

  const goToNext = useCallback(() => {
    setDirection("next");
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setDirection("prev");
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Preload next and previous images
  useEffect(() => {
    if (total <= 1) return;
    const nextIdx = (currentIndex + 1) % total;
    const prevIdx = (currentIndex - 1 + total) % total;
    const imgNext = new window.Image();
    imgNext.src = `/assets/${images[nextIdx]}`;
    const imgPrev = new window.Image();
    imgPrev.src = `/assets/${images[prevIdx]}`;
  }, [currentIndex, images, total]);

  // Focus trap & keyboard navigation (RTL aware)
  useEffect(() => {
    if (!mounted) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // In RTL: ArrowLeft moves forward (next), ArrowRight moves back (prev)
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToNext();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToPrev();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, onClose, goToNext, goToPrev]);

  // Touch swipe handling
  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    // In RTL: dragging left (diff > 50) moves to next image; dragging right (diff < -50) moves to previous
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  }

  if (!mounted) return null;

  const currentImage = images[currentIndex];

  const modalContent = (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title || "Gallery"} - ${currentIndex + 1} / ${total}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      dir="rtl"
    >
      {/* Top bar: Counter & Close button */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 md:p-6">
        {/* Counter badge */}
        <div className="pointer-events-auto rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold tracking-wider text-white backdrop-blur-md select-none border border-white/10 shadow-sm">
          <span>{currentIndex + 1}</span>
          <span className="mx-1.5 text-white/50">/</span>
          <span>{total}</span>
        </div>

        {/* Title if present */}
        {title && (
          <div className="hidden sm:block text-sm font-medium text-white/80 select-none">
            {title}
          </div>
        )}

        {/* Close (X) button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close / داخستن / إغلاق"
          className="pointer-events-auto flex size-10 md:size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 transition-all duration-200 hover:bg-white/25 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0075be]"
        >
          <svg
            className="size-5 md:size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation: RTL "Next" arrow on the Left (points left ←) */}
      <button
        type="button"
        onClick={goToNext}
        aria-label="Next image / وێنەی داهاتوو / الصورة التالية"
        className="group absolute left-3 md:left-6 z-20 flex size-11 md:size-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 transition-all duration-200 hover:bg-[#0075be] hover:border-[#0075be] hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0075be]"
      >
        <svg
          className="size-6 md:size-7 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation: RTL "Previous" arrow on the Right (points right →) */}
      <button
        type="button"
        onClick={goToPrev}
        aria-label="Previous image / وێنەی پێشوو / الصورة السابقة"
        className="group absolute right-3 md:right-6 z-20 flex size-11 md:size-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 transition-all duration-200 hover:bg-[#0075be] hover:border-[#0075be] hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0075be]"
      >
        <svg
          className="size-6 md:size-7 transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main Image Stage */}
      <div
        className="relative flex items-center justify-center max-w-[90vw] max-h-[82vh] md:max-h-[85vh] select-none pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-10 md:size-12 animate-spin rounded-full border-3 border-white/20 border-t-[#0075be]" />
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentImage}
          src={`/assets/${currentImage}`}
          alt={`${title || "Gallery"} - ${currentIndex + 1}`}
          onLoad={() => setIsLoading(false)}
          className={`pointer-events-auto max-w-[90vw] max-h-[82vh] md:max-h-[85vh] rounded-lg object-contain shadow-2xl transition-all duration-300 ${
            isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          style={{
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Bottom Hint */}
      <div className="pointer-events-none absolute bottom-4 inset-x-0 text-center text-xs text-white/50 select-none">
        <span className="hidden md:inline">
          استخدم الأسهم (← →) أو زر Esc للخروج • Use Arrow keys to navigate
        </span>
        <span className="md:hidden">
          اسحب للتنقل بين الصور • Swipe to navigate
        </span>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

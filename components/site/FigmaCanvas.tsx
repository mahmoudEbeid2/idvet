"use client";

import { useLayoutEffect, useRef, useState } from "react";

const DESIGN_WIDTH = 1440;

/**
 * The design only exists at a 1440px desktop frame. Rather than re-deriving a
 * separate responsive layout (which would drift from the Figma pixel values),
 * this scales the exact 1440-wide canvas down uniformly to fit narrower
 * viewports, the same way the Figma frame itself scales in "fit" preview.
 */
export function FigmaCanvas({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? DESIGN_WIDTH;
      setScale(Math.min(1, width / DESIGN_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="flex w-full justify-center overflow-hidden"
      style={{ height: height * scale }}
    >
      <div
        className="w-[1440px] shrink-0 origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

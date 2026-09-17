"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which nav section is currently in view while scrolling, so the
 * matching nav item can be highlighted. `ids` are canonical ids (e.g.
 * "about"); both the desktop node (#about) and the mobile node (#about-m)
 * are checked, since both trees exist in the DOM at once (toggled with
 * CSS, not conditionally mounted) and only one is ever actually visible.
 *
 * Each section's DOM node is a 1px anchor marker sitting at the section's
 * top edge (not the full section body), so "is this section's marker
 * currently intersecting the viewport" only holds true for an instant —
 * useless for sections taller than the viewport. Instead, this tracks a
 * reference line 40% down the viewport and picks whichever section's
 * marker is the closest one at or above that line — i.e. the most
 * recently passed section — which stays correct for the section's entire
 * height, however tall it is.
 */
export function useActiveSection(ids: readonly string[], initial: string | null = null) {
  const [active, setActive] = useState<string | null>(initial);

  useEffect(() => {
    function computeActive() {
      const line = window.scrollY + window.innerHeight * 0.4;

      let current: string | null = null;
      let currentTop = -Infinity;

      for (const id of ids) {
        for (const candidateId of [id, `${id}-m`]) {
          const el = document.getElementById(candidateId);
          if (!el || el.offsetParent === null) continue;
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= line && top > currentTop) {
            currentTop = top;
            current = id;
          }
        }
      }

      if (current) setActive(current);
    }

    computeActive();
    window.addEventListener("scroll", computeActive, { passive: true });
    window.addEventListener("resize", computeActive);
    return () => {
      window.removeEventListener("scroll", computeActive);
      window.removeEventListener("resize", computeActive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  return active;
}

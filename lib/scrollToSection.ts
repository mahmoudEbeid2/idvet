"use client";

/**
 * Scrolls to a section identified by its canonical id (e.g. "about").
 *
 * The desktop and mobile trees render simultaneously (toggled with
 * `hidden`/`lg:hidden`, not conditionally mounted), each with its own DOM
 * id — the mobile copy suffixed with "-m" (e.g. "about-m"). This tries the
 * canonical id first, then the mobile-suffixed one, and scrolls to whichever
 * one is actually visible (display:none targets are skipped).
 *
 * Native `<a href="#id">` fragment navigation does not work here: the
 * desktop canvas is rendered inside a `transform: scale()` wrapper
 * (FigmaCanvas, for responsive scaling of the pixel-perfect 1440px design),
 * and Chromium's native "jump to fragment" does not account for ancestor
 * transforms. `scrollIntoView()` does, so every scroll in this app goes
 * through this helper instead of relying on the browser default.
 */
export function scrollToSection(id: string, options?: { fallbackHref?: string }) {
  if (typeof window === "undefined") return;

  const candidates = [id, `${id}-m`];
  for (const candidateId of candidates) {
    const el = document.getElementById(candidateId);
    if (el && el.offsetParent !== null) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
      return;
    }
  }

  // Section doesn't exist on this page — go to the page that has it. This
  // is a plain utility function (not a component), so the router hook
  // isn't available here; a full navigation is fine since we're leaving
  // the current page anyway.
  if (options?.fallbackHref) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${options.fallbackHref}#${id}`;
  }
}

export function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.history.pushState(null, "", window.location.pathname);
}

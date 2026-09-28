import { notFound } from "next/navigation";

// Unmatched paths under a locale (e.g. /en/about-us) would otherwise get Next's
// bare default 404; sending them through notFound() renders [locale]/not-found.
export default function CatchAll() {
  notFound();
}

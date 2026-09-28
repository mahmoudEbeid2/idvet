import { StatusPage } from "@/components/site/StatusPage";

// Every notFound() under /{locale} (unknown product/category, unknown locale)
// and every unmatched path (see [...rest]) lands here, inside the locale layout.
export default function NotFound() {
  return <StatusPage kind="notFound" />;
}

"use client";

import { StatusPage } from "@/components/site/StatusPage";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <StatusPage kind="error" onRetry={retry} />;
}

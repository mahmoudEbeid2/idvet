import { requireAdmin } from "@/lib/admin/session";
import { getUnreadCounts } from "@/lib/admin/data";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLiveProvider } from "@/components/admin/AdminLive";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  // Read before the counts, so a request saved meanwhile is still announced live.
  const since = new Date().toISOString();
  const unread = await getUnreadCounts();
  return (
    <AdminLiveProvider counts={unread} since={since}>
      <AdminShell>{children}</AdminShell>
    </AdminLiveProvider>
  );
}

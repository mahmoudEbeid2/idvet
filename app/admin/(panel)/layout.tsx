import { requireAdmin } from "@/lib/admin/session";
import { getUnreadCounts } from "@/lib/admin/data";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const unread = await getUnreadCounts();
  return <AdminShell unread={unread}>{children}</AdminShell>;
}

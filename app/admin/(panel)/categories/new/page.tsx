import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "قسم جديد" };

export default async function NewCategoryPage() {
  await requireAdmin();
  // New categories go after the existing ones unless the admin picks another position.
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  return (
    <>
      <PageHeader title="قسم جديد" back={{ href: "/admin/categories", label: "الأقسام" }} />
      <CategoryForm nextSortOrder={(last._max.sortOrder ?? 0) + 1} />
    </>
  );
}

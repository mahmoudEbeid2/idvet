import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { getAdminT } from "@/lib/admin/lang";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).category.newTitle };
}

export default async function NewCategoryPage() {
  await requireAdmin();
  const t = await getAdminT();
  // New categories go after the existing ones unless the admin picks another position.
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  return (
    <>
      <PageHeader
        title={t.category.newTitle}
        back={{ href: "/admin/categories", label: `${t.common.backArrow} ${t.categories.title}` }}
      />
      <CategoryForm nextSortOrder={(last._max.sortOrder ?? 0) + 1} />
    </>
  );
}

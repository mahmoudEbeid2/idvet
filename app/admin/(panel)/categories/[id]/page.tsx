import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCategory } from "@/lib/admin/data";
import { pick } from "@/lib/catalog/i18n";
import { CategoryDelete } from "@/components/admin/CategoryDelete";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "تعديل قسم" };

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const [category, { saved }] = await Promise.all([getAdminCategory(id), searchParams]);
  if (!category) notFound();
  const count = category._count.products;

  return (
    <>
      <PageHeader
        title={pick(category, "name", "ar")}
        back={{ href: "/admin/categories", label: "الأقسام" }}
        actions={
          <>
            <Link href={`/admin/products?category=${category.id}`} className={`${s.btn} ${s.secondary}`}>
              منتجات القسم ({count})
            </Link>
            <a href={`/ar/products/${category.slug}`} target="_blank" rel="noopener" className={`${s.btn} ${s.secondary}`}>
              عرض على الموقع ↗
            </a>
          </>
        }
      />
      <div className={s.stack}>
        {saved && <Notice tone="ok">تم حفظ التعديلات.</Notice>}
        <CategoryForm
          key={category.updatedAt.toISOString()}
          category={{
            id: category.id,
            slug: category.slug,
            icon: category.icon,
            color: category.color,
            sortOrder: category.sortOrder,
            nameKu: category.nameKu,
            nameAr: category.nameAr,
            nameEn: category.nameEn,
            descriptionKu: category.descriptionKu,
            descriptionAr: category.descriptionAr,
            descriptionEn: category.descriptionEn,
          }}
        />
        <Card title="حذف القسم">
          <CategoryDelete id={category.id} productCount={count} />
        </Card>
      </div>
    </>
  );
}

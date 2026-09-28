import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCategory } from "@/lib/admin/data";
import { pick } from "@/lib/catalog/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { CategoryDelete } from "@/components/admin/CategoryDelete";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).category.editTitle };
}

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const [category, { saved }, lang] = await Promise.all([getAdminCategory(id), searchParams, getAdminLang()]);
  const t = await getAdminT();
  if (!category) notFound();
  const count = category._count.products;

  return (
    <>
      <PageHeader
        title={pick(category, "name", lang)}
        back={{ href: "/admin/categories", label: `${t.common.backArrow} ${t.categories.title}` }}
        actions={
          <>
            <Link href={`/admin/products?category=${category.id}`} className={`${s.btn} ${s.secondary}`}>
              {t.category.productsOf(count)}
            </Link>
            <a href={`/${lang}/products/${category.slug}`} target="_blank" rel="noopener" className={`${s.btn} ${s.secondary}`}>
              {t.common.viewOnSite}
            </a>
          </>
        }
      />
      <div className={s.stack}>
        {saved && <Notice tone="ok">{t.common.savedNotice}</Notice>}
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
        <Card title={t.category.deleteTitle}>
          <CategoryDelete id={category.id} productCount={count} />
        </Card>
      </div>
    </>
  );
}

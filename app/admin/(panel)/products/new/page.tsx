import type { Metadata } from "next";
import { getCategoryOptions } from "@/lib/admin/data";
import { getAdminT } from "@/lib/admin/lang";
import { ProductForm } from "@/components/admin/ProductForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).product.newTitle };
}

export default async function NewProductPage() {
  const [categories, t] = await Promise.all([getCategoryOptions(), getAdminT()]);
  return (
    <>
      <PageHeader
        title={t.product.newTitle}
        back={{ href: "/admin/products", label: `${t.common.backArrow} ${t.products.title}` }}
      />
      <div className={`${s.stack} ${s.stackTight}`}>
        <Notice tone="info">{t.product.newNotice}</Notice>
        <ProductForm categories={categories} />
      </div>
    </>
  );
}

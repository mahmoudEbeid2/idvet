import type { Metadata } from "next";
import { getCategoryOptions } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/ProductForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "منتج جديد" };

export default async function NewProductPage() {
  const categories = await getCategoryOptions();
  return (
    <>
      <PageHeader title="منتج جديد" back={{ href: "/admin/products", label: "المنتجات" }} />
      <div className={`${s.stack} ${s.stackTight}`}>
        <Notice tone="info">بعد حفظ المنتج ستنتقل لصفحة يمكنك فيها رفع الصور والشهادات.</Notice>
        <ProductForm categories={categories} />
      </div>
    </>
  );
}

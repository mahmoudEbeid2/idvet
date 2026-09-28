import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { getAdminProduct, getCategoryOptions } from "@/lib/admin/data";
import { pick } from "@/lib/catalog/i18n";
import { CertificateManager } from "@/components/admin/CertificateManager";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; created?: string }> };

export const metadata: Metadata = { title: "تعديل منتج" };

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const [product, categories, { saved, created }] = await Promise.all([
    getAdminProduct(id),
    getCategoryOptions(),
    searchParams,
  ]);
  if (!product) notFound();

  const { images, certificates, category, ...fields } = product;
  const name = pick(product, "name", "ar") || product.code;
  const deleteThis = deleteProduct.bind(null, product.id);

  return (
    <>
      <PageHeader
        title={name}
        back={{ href: "/admin/products", label: "المنتجات" }}
        actions={
          product.published ? (
            <>
              <span className={`${s.badge} ${s.bGreen}`}>منشور</span>
              <a
                href={`/ar/products/${category.slug}/${product.slug}`}
                target="_blank"
                rel="noopener"
                className={`${s.btn} ${s.secondary}`}
              >
                عرض على الموقع ↗
              </a>
            </>
          ) : (
            <span className={`${s.badge} ${s.bGray}`}>مسودة — غير ظاهر على الموقع</span>
          )
        }
      />
      <div className={s.stack}>
        {created && <Notice tone="ok">تم إنشاء المنتج. أضف الصور والشهادات من الأسفل.</Notice>}
        {saved && <Notice tone="ok">تم حفظ التعديلات.</Notice>}
        <nav className={s.chips}>
          <a href="#images">الصور ({images.length})</a>
          <a href="#certificates">الشهادات ({certificates.length})</a>
        </nav>
        {/* Keyed on updatedAt: after a save the form remounts with the stored values. */}
        <ProductForm key={product.updatedAt.toISOString()} product={fields} categories={categories} />
        <ImageManager productId={product.id} images={images} color={category.color} />
        <CertificateManager productId={product.id} certificates={certificates} />
        <Card title="حذف المنتج" description="يحذف المنتج وكل صوره وشهاداته نهائياً.">
          <ConfirmDeleteButton label="حذف هذا المنتج" onConfirm={deleteThis} />
        </Card>
        <p>
          <Link href="/admin/products" className={`${s.link} ${s.linkMuted}`}>
            → رجوع إلى المنتجات
          </Link>
        </p>
      </div>
    </>
  );
}

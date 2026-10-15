import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { getAdminProduct, getCategoryOptions } from "@/lib/admin/data";
import { pick } from "@/lib/catalog/i18n";
import { getAdminLang, getAdminT } from "@/lib/admin/lang";
import { CertificateManager } from "@/components/admin/CertificateManager";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; created?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).product.editTitle };
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const [product, categories, { saved, created }, lang] = await Promise.all([
    getAdminProduct(id),
    getCategoryOptions(),
    searchParams,
    getAdminLang(),
  ]);
  const t = await getAdminT();
  if (!product) notFound();

  const { images, certificates, category, ...fields } = product;
  const name = pick(product, "name", lang) || product.code;
  const deleteThis = deleteProduct.bind(null, product.id);

  return (
    <>
      <PageHeader
        title={name}
        back={{ href: "/admin/products", label: `${t.common.backArrow} ${t.products.title}` }}
        actions={
          product.published ? (
            <>
              <span className={`${s.badge} ${s.bGreen}`}>{t.common.published}</span>
              <a
                href={`/${lang}/products/${product.slug}`}
                target="_blank"
                rel="noopener"
                className={`${s.btn} ${s.secondary}`}
              >
                {t.common.viewOnSite}
              </a>
            </>
          ) : (
            <span className={`${s.badge} ${s.bGray}`}>{t.product.draftHidden}</span>
          )
        }
      />
      <div className={s.stack}>
        {created && <Notice tone="ok">{t.product.created}</Notice>}
        {saved && <Notice tone="ok">{t.common.savedNotice}</Notice>}
        <nav className={s.chips}>
          <a href="#images">{t.product.imagesChip(images.length)}</a>
          <a href="#certificates">{t.product.certificatesChip(certificates.length)}</a>
        </nav>
        {/* Keyed on updatedAt: after a save the form remounts with the stored values. */}
        <ProductForm key={product.updatedAt.toISOString()} product={fields} categories={categories} />
        <ImageManager productId={product.id} images={images} color={category.color} />
        <CertificateManager productId={product.id} certificates={certificates} />
        <Card title={t.product.deleteTitle} description={t.product.deleteDescription}>
          <ConfirmDeleteButton label={t.product.deleteButton} onConfirm={deleteThis} />
        </Card>
        <p>
          <Link href="/admin/products" className={`${s.link} ${s.linkMuted}`}>
            {t.common.backArrow} {t.product.backToProducts}
          </Link>
        </p>
      </div>
    </>
  );
}

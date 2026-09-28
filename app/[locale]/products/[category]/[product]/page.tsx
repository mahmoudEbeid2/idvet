import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { getProduct, getRelated } from "@/lib/catalog/data";
import { safeDecode } from "@/lib/catalog/format";
import { ProductPage } from "@/components/site/products/ProductPage";

type Props = {
  params: Promise<{ locale: string; category: string; product: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, product: slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProduct(safeDecode(slug), locale);
  if (!product) return {};
  return {
    title: `${product.name}${product.code ? ` (${product.code})` : ""} — IDVET`,
    description: product.summary || undefined,
    openGraph: product.images[0] ? { images: [product.images[0].src] } : undefined,
  };
}

export default async function ProductRoute({ params }: Props) {
  const { locale, category, product: slug } = await params;
  if (!isLocale(locale)) notFound();

  // Unknown and unpublished products are both a plain 404.
  const product = await getProduct(safeDecode(slug), locale);
  if (!product) notFound();

  // The product moved or the URL has the wrong category: send it to the right one.
  if (safeDecode(category) !== product.category.slug) {
    redirect(`/${locale}/products/${product.category.slug}/${product.slug}`);
  }

  const related = await getRelated(product, locale);
  return <ProductPage site={content[locale]} product={product} related={related} />;
}

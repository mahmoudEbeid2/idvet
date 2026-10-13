import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { getProduct, getRelated } from "@/lib/catalog/data";
import { safeDecode } from "@/lib/catalog/format";
import { ProductPage } from "@/components/site/products/ProductPage";
import { JsonLd } from "@/components/site/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import type { ProductDetailView } from "@/lib/catalog/data";
import type { Locale } from "@/lib/content";

function describe(product: ProductDetailView, locale: Locale): string {
  return product.summary || product.about[0] || content[locale].products.lead;
}

type Props = {
  params: Promise<{ locale: string; category: string; product: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, product: slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProduct(safeDecode(slug), locale);
  if (!product) return {};
  return pageMetadata({
    locale,
    path: `/products/${product.category.slug}/${product.slug}`,
    title: `${product.name}${product.code && product.code !== product.name ? ` (${product.code})` : ""} — IDVET`,
    description: describe(product, locale),
    images: product.images.map((image) => ({
      url: image.src,
      width: image.width,
      height: image.height,
      alt: product.name,
    })),
  });
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
  const t = content[locale].products;
  const categoryPath = `/${locale}/products/${product.category.slug}`;
  const productPath = `${categoryPath}/${product.slug}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${absoluteUrl(productPath)}#product`,
          url: absoluteUrl(productPath),
          name: product.name,
          description: describe(product, locale),
          image: product.images.map((image) => absoluteUrl(image.src)),
          category: product.category.name,
          ...(product.code ? { sku: product.code, mpn: product.code } : {}),
          ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.breadcrumbHome, path: `/${locale}` },
          { name: t.title, path: `/${locale}/products` },
          { name: product.category.name, path: categoryPath },
          { name: product.name, path: productPath },
        ])}
      />
      <ProductPage site={content[locale]} product={product} related={related} />
    </>
  );
}

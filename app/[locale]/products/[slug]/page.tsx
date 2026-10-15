import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { getCategories, getProduct, getRelated } from "@/lib/catalog/data";
import { safeDecode } from "@/lib/catalog/format";
import { ProductPage } from "@/components/site/products/ProductPage";
import { JsonLd } from "@/components/site/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import type { ProductDetailView } from "@/lib/catalog/data";
import type { Locale } from "@/lib/content";

function describe(product: ProductDetailView, locale: Locale): string {
  if (product.seoDescription) return product.seoDescription;
  if (product.summary) return product.summary;
  if (product.about[0]) return product.about[0];
  const by = product.brand ? ` — ${product.brand}` : "";
  return `${product.name}${by} · ${product.category.name}. ${content[locale].products.lead}`;
}

function titleOf(product: ProductDetailView): string {
  if (product.seoTitle) return product.seoTitle;
  const code = product.code && product.code !== product.name ? ` (${product.code})` : "";
  // The category name is translated, so each language gets its own title even
  // when a product name is only written in one language.
  return `${product.name}${code} — ${product.category.name} | IDVET`;
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProduct(safeDecode(slug), locale);
  if (!product) return {};
  return pageMetadata({
    locale,
    path: `/products/${product.slug}`,
    title: titleOf(product),
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
  const { locale, slug: rawSlug } = await params;
  if (!isLocale(locale)) notFound();
  const slug = safeDecode(rawSlug);

  // Unknown and unpublished products are both a plain 404.
  const product = await getProduct(slug, locale);
  if (!product) {
    // Category pages used to live here (/products/{category}); they are now the filtered catalog.
    const category = (await getCategories(locale)).find((c) => c.slug === slug);
    if (category) permanentRedirect(`/${locale}/products?category=${encodeURIComponent(category.slug)}`);
    notFound();
  }

  const related = await getRelated(product, locale);
  const t = content[locale].products;
  const listPath = `/${locale}/products`;
  const productPath = `${listPath}/${product.slug}`;
  const parent = product.brandSlug
    ? { name: product.brand, path: `${listPath}?brand=${encodeURIComponent(product.brandSlug)}` }
    : { name: product.category.name, path: `${listPath}?category=${encodeURIComponent(product.category.slug)}` };

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
          ...(product.tags.length ? { keywords: product.tags.join(", ") } : {}),
          ...(product.code ? { sku: product.code, mpn: product.code } : {}),
          ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.breadcrumbHome, path: `/${locale}` },
          { name: t.title, path: listPath },
          parent,
          { name: product.name, path: productPath },
        ])}
      />
      <ProductPage site={content[locale]} product={product} related={related} parent={parent} />
    </>
  );
}

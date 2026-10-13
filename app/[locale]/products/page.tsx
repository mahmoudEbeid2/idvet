import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { countBrands, getCategories, listProducts } from "@/lib/catalog/data";
import { CatalogIndex } from "@/components/site/products/CatalogIndex";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].products;
  const { q } = await searchParams;
  return pageMetadata({
    locale,
    path: "/products",
    title: `${t.title} — IDVET`,
    description: t.lead,
    // Search results are thin duplicates of the catalog: keep them out of the index.
    noindex: Boolean(q),
  });
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";

  const [categories, products, brandCount] = await Promise.all([
    getCategories(locale),
    listProducts(locale, { query }),
    countBrands(),
  ]);
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  const t = content[locale].products;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.breadcrumbHome, path: `/${locale}` },
          { name: t.title, path: `/${locale}/products` },
        ])}
      />
      {!query && (
        <JsonLd
          data={itemListJsonLd(
            t.categoriesHeading,
            categories.map((c) => ({ name: c.name, path: `/${locale}/products/${c.slug}` })),
          )}
        />
      )}
      <CatalogIndex
        site={content[locale]}
        categories={categories}
        products={products}
        query={query}
        totalProducts={totalProducts}
        brandCount={brandCount}
      />
    </>
  );
}

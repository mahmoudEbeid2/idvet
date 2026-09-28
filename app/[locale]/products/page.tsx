import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { countBrands, getCategories, listProducts } from "@/lib/catalog/data";
import { CatalogIndex } from "@/components/site/products/CatalogIndex";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].products;
  return { title: `IDVET — ${t.title}`, description: t.lead };
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

  return (
    <CatalogIndex
      site={content[locale]}
      categories={categories}
      products={products}
      query={query}
      totalProducts={totalProducts}
      brandCount={brandCount}
    />
  );
}

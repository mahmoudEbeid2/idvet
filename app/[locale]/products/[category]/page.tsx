import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { getCategories, listProducts, parseSort } from "@/lib/catalog/data";
import { safeDecode } from "@/lib/catalog/format";
import { CategoryPage } from "@/components/site/products/CategoryPage";
import { JsonLd } from "@/components/site/JsonLd";
import { productHref } from "@/components/site/products/parts";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ sort?: string | string[] }>;
};

async function findCategory(locale: string, slug: string) {
  if (!isLocale(locale)) return null;
  const categories = await getCategories(locale);
  const category = categories.find((c) => c.slug === safeDecode(slug));
  return category ? { categories, category } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const found = await findCategory(locale, slug);
  if (!found || !isLocale(locale)) return {};
  return pageMetadata({
    locale,
    path: `/products/${found.category.slug}`,
    title: `${found.category.name} — IDVET`,
    description: found.category.description || content[locale].products.lead,
  });
}

export default async function CategoryRoute({ params, searchParams }: Props) {
  const { locale, category: slug } = await params;
  if (!isLocale(locale)) notFound();
  const found = await findCategory(locale, slug);
  if (!found) notFound();

  const sort = parseSort((await searchParams).sort);
  const products = await listProducts(locale, { categoryId: found.category.id, sort });

  const t = content[locale].products;
  const categoryPath = `/${locale}/products/${found.category.slug}`;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.breadcrumbHome, path: `/${locale}` },
          { name: t.title, path: `/${locale}/products` },
          { name: found.category.name, path: categoryPath },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          found.category.name,
          products.map((p) => ({ name: p.name, path: productHref(locale, p) })),
        )}
      />
      <CategoryPage
        site={content[locale]}
        category={found.category}
        categories={found.categories}
        products={products}
        sort={sort}
      />
    </>
  );
}

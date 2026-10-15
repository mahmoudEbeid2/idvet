import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { content, isLocale, type Locale } from "@/lib/content";
import { countBrands, getCatalog, getCategories } from "@/lib/catalog/data";
import { type CatalogFilters, type SearchParams, filtersQuery, landingFacet, parseFilters } from "@/lib/catalog/filters";
import { CatalogIndex, type Landing } from "@/components/site/products/CatalogIndex";
import { productHref } from "@/components/site/products/parts";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { BRAND_ALIASES, KNOWN_BRANDS } from "@/lib/catalog/brands";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

/** Heading for a one-category or one-brand view; null for the full catalog or any other combination. */
async function findLanding(locale: Locale, filters: CatalogFilters): Promise<Landing | null> {
  const facet = landingFacet(filters);
  if (!facet) return null;
  const t = content[locale].products;
  if (facet.kind === "category") {
    const category = (await getCategories(locale)).find((c) => c.slug === facet.slug);
    return category
      ? { title: category.name, description: category.description, icon: category.icon, color: category.color }
      : null;
  }
  // Brands only exist on products, so any brand slug can be a landing; unknown ones simply show no results.
  const brand = KNOWN_BRANDS.find((b) => b.slug === facet.slug);
  return brand ? { title: t.brandPageTitle.replace("{brand}", brand.name), description: "" } : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].products;
  const filters = parseFilters(await searchParams);
  const landing = await findLanding(locale, filters);
  const facet = landingFacet(filters);

  if (landing && facet) {
    // /products?category=medicines and /products?brand=hipro are landing pages: indexable, self-canonical.
    return pageMetadata({
      locale,
      path: `/products${filtersQuery(filters)}`,
      title: `${landing.title} — IDVET`,
      description: landing.description || t.lead,
    });
  }
  return pageMetadata({
    locale,
    path: "/products",
    title: `${t.title} — IDVET`,
    description: t.lead,
    // Searches and filter combinations are thin duplicates of the catalog: crawl the links, don't index the page.
    noindex: filtersQuery(filters) !== "",
  });
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const filters = parseFilters(await searchParams);

  // Old brand spellings in links (?brand=jamuh) move permanently to the current slug.
  const brands = [...new Set(filters.brands.map((b) => BRAND_ALIASES[b] ?? b))];
  if (brands.some((b, i) => b !== filters.brands[i]) || brands.length !== filters.brands.length) {
    permanentRedirect(`/${locale}/products${filtersQuery({ ...filters, brands })}`);
  }

  const [catalog, categories, brandCount, landing] = await Promise.all([
    getCatalog(locale, filters),
    getCategories(locale),
    countBrands(),
    findLanding(locale, filters),
  ]);

  const t = content[locale].products;
  const listPath = `/${locale}/products`;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.breadcrumbHome, path: `/${locale}` },
          { name: t.title, path: listPath },
          ...(landing ? [{ name: landing.title, path: `${listPath}${filtersQuery(filters)}` }] : []),
        ])}
      />
      {(!filtersQuery(filters) || landing) && (
        <JsonLd
          data={itemListJsonLd(
            landing?.title ?? t.title,
            catalog.products.map((p) => ({ name: p.name, path: productHref(locale, p) })),
          )}
        />
      )}
      <CatalogIndex
        site={content[locale]}
        filters={filters}
        catalog={catalog}
        categoryCount={categories.filter((c) => c.productCount > 0).length}
        brandCount={brandCount}
        landing={landing}
      />
    </>
  );
}

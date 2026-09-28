import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { CategoryView, ProductCardView } from "@/lib/catalog/data";
import { plural } from "@/lib/catalog/format";
import { CatalogShell } from "./CatalogShell";
import { SearchIcon } from "./icons";
import { Breadcrumbs, CategoryCard, ProductGrid, SectionHead } from "./parts";
import s from "./catalog.module.css";

export function CatalogIndex({
  site,
  categories,
  products,
  query,
  totalProducts,
  brandCount,
}: {
  site: SiteContent;
  categories: CategoryView[];
  products: ProductCardView[];
  query: string;
  totalProducts: number;
  brandCount: number;
}) {
  const t = site.products;
  const base = `/${site.locale}/products`;
  const stats = [
    [categories.length, t.statCategories],
    [totalProducts, t.statProducts],
    [brandCount, t.statBrands],
  ] as const;

  return (
    <CatalogShell site={site} languagePath={`/products${query ? `?q=${encodeURIComponent(query)}` : ""}`}>
      <section className={s.band}>
        <div className={`${s.wrap} ${s.bandInner}`}>
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[{ label: t.breadcrumbHome, href: `/${site.locale}` }, { label: t.title }]}
          />
          <span className={s.eyebrow}>{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p className={s.lead}>{t.lead}</p>
          <form className={s.search} action={base} method="get" role="search">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchButton}
              maxLength={100}
            />
            <button type="submit">
              <SearchIcon /> {t.searchButton}
            </button>
          </form>
          <div className={s.stats}>
            {stats.map(([n, forms], i) => (
              <span key={i}>
                <b>{n}</b>
                {plural(site.locale, n, forms)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className={s.sec}>
          <div className={s.wrap}>
            <SectionHead title={t.categoriesHeading} />
            <div className={s.cats}>
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} site={site} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${s.sec} ${s.secAlt}`} id="all">
        <div className={s.wrap}>
          <SectionHead
            title={query ? t.searchResultsHeading.replace("{q}", query) : t.allProductsHeading}
            meta={<span className={s.secMeta}>{plural(site.locale, products.length, t.productCount)}</span>}
          />
          {products.length > 0 ? (
            <ProductGrid products={products} site={site} />
          ) : (
            <div className={s.empty}>
              <p>{query ? t.noResults : t.emptyCatalog}</p>
              {query && <Link href={base}>{t.clearSearch}</Link>}
            </div>
          )}
        </div>
      </section>
    </CatalogShell>
  );
}

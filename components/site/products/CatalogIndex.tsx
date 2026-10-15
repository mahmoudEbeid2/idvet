import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { CatalogResult } from "@/lib/catalog/data";
import { type CatalogFilters as Filters, filtersQuery } from "@/lib/catalog/filters";
import { plural } from "@/lib/catalog/format";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogShell } from "./CatalogShell";
import { CloseIcon, SearchIcon } from "./icons";
import { SortSelect } from "./SortSelect";
import { Breadcrumbs, ProductGrid } from "./parts";
import s from "./catalog.module.css";

/** A one-category or one-brand view gets its own heading (see landingFacet). */
export interface Landing {
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export function CatalogIndex({
  site,
  filters,
  catalog,
  categoryCount,
  brandCount,
  landing,
}: {
  site: SiteContent;
  filters: Filters;
  catalog: CatalogResult;
  categoryCount: number;
  brandCount: number;
  landing: Landing | null;
}) {
  const t = site.products;
  const base = `/${site.locale}/products`;
  const { products } = catalog;
  const resultText = plural(site.locale, products.length, t.productCount);
  const stats = [
    [categoryCount, t.statCategories],
    [catalog.total, t.statProducts],
    [brandCount, t.statBrands],
  ] as const;

  // Removable chips for everything that narrows the list.
  const nameOf = (list: { slug: string; name: string }[], slug: string) => list.find((o) => o.slug === slug)?.name ?? slug;
  const chips = [
    ...(filters.q ? [{ key: "q", label: `“${filters.q}”`, latin: false, next: { ...filters, q: "" } }] : []),
    ...filters.brands.map((slug) => ({
      key: `b-${slug}`,
      label: nameOf(catalog.brands, slug),
      latin: true,
      next: { ...filters, brands: filters.brands.filter((b) => b !== slug) },
    })),
    ...filters.categories.map((slug) => ({
      key: `c-${slug}`,
      label: nameOf(catalog.categories, slug),
      latin: false,
      next: { ...filters, categories: filters.categories.filter((c) => c !== slug) },
    })),
  ];
  const clearHref = `${base}${filtersQuery({ sort: filters.sort })}`;

  return (
    <CatalogShell site={site} languagePath={`/products${filtersQuery(filters)}`}>
      <section className={`${s.band} ${landing?.icon ? s.bandCat : ""}`}>
        <div className={`${s.wrap} ${s.bandInner}`}>
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { label: t.breadcrumbHome, href: `/${site.locale}` },
              ...(landing ? [{ label: t.title, href: base }, { label: landing.title }] : [{ label: t.title }]),
            ]}
          />
          {landing?.icon ? (
            <div className={s.catHead}>
              <span className={s.catHeadIcon} style={{ background: landing.color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={landing.icon} alt="" />
              </span>
              <div>
                <h1>{landing.title}</h1>
                {landing.description && <p className={s.lead}>{landing.description}</p>}
              </div>
            </div>
          ) : (
            <>
              <span className={s.eyebrow}>{t.eyebrow}</span>
              <h1>{landing?.title ?? t.title}</h1>
              <p className={s.lead}>{landing?.description || t.lead}</p>
            </>
          )}
          <form className={s.search} action={base} method="get" role="search">
            {filters.brands.map((brand) => (
              <input key={`b-${brand}`} type="hidden" name="brand" value={brand} />
            ))}
            {filters.categories.map((category) => (
              <input key={`c-${category}`} type="hidden" name="category" value={category} />
            ))}
            {filters.sort !== "relevance" && <input type="hidden" name="sort" value={filters.sort} />}
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
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

      <section className={s.sec} id="results">
        <div className={`${s.wrap} ${s.catLayout}`}>
          <CatalogFilters
            base={base}
            filters={filters}
            brands={catalog.brands}
            categories={catalog.categories}
            resultText={resultText}
            labels={{
              filtersHeading: t.filtersHeading,
              filtersButton: t.filtersButton,
              brandFilter: t.brandFilter,
              categoryFilter: t.categoryFilter,
              showResults: t.showResults,
              clearAll: t.clearAll,
              close: t.close,
              sortApply: t.sortApply,
            }}
          />
          <div className={s.results}>
            <div className={s.toolbar}>
              <span className={s.toolbarCount} role="status">
                {resultText}
              </span>
              {catalog.total > 1 && <SortSelect key={filtersQuery(filters)} base={base} filters={filters} labels={t} />}
            </div>
            {chips.length > 0 && (
              <div className={s.chips} role="group" aria-label={t.activeFilters}>
                {chips.map((chip) => (
                  <Link
                    key={chip.key}
                    href={`${base}${filtersQuery(chip.next)}`}
                    scroll={false}
                    className={s.fChip}
                    aria-label={t.removeFilter.replace("{name}", chip.label)}
                  >
                    <span className={chip.latin ? s.latin : undefined}>{chip.label}</span>
                    <CloseIcon />
                  </Link>
                ))}
                <Link href={clearHref} scroll={false} className={s.fClear}>
                  {t.clearAll}
                </Link>
              </div>
            )}
            {products.length > 0 ? (
              <div className={s.fadeIn} key={filtersQuery(filters)}>
                <ProductGrid products={products} site={site} three />
              </div>
            ) : catalog.total === 0 ? (
              <div className={s.empty}>
                <p>{t.emptyCatalog}</p>
              </div>
            ) : (
              <div className={s.empty}>
                <h2 className={s.emptyTitle}>{t.noResults}</h2>
                <p>{t.noResultsBody}</p>
                <Link href={clearHref} className={`${s.btn} ${s.btnGhost}`}>
                  {t.clearAll}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </CatalogShell>
  );
}

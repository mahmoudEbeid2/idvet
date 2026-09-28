import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { CategoryView, ProductCardView, SortKey } from "@/lib/catalog/data";
import { plural } from "@/lib/catalog/format";
import { CatalogShell } from "./CatalogShell";
import { SortSelect } from "./SortSelect";
import { Breadcrumbs, ProductGrid, tint } from "./parts";
import s from "./catalog.module.css";

export function CategoryPage({
  site,
  category,
  categories,
  products,
  sort,
}: {
  site: SiteContent;
  category: CategoryView;
  categories: CategoryView[];
  products: ProductCardView[];
  sort: SortKey;
}) {
  const t = site.products;
  const base = `/${site.locale}/products`;
  const sortQuery = sort === "newest" ? "" : `?sort=${sort}`;

  return (
    <CatalogShell site={site} languagePath={`/products/${category.slug}${sortQuery}`}>
      <section className={`${s.band} ${s.bandCat}`}>
        <div className={`${s.wrap} ${s.bandInner}`}>
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { label: t.breadcrumbHome, href: `/${site.locale}` },
              { label: t.title, href: base },
              { label: category.name },
            ]}
          />
          <div className={s.catHead}>
            <span className={s.catHeadIcon} style={{ background: category.color }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={category.icon} alt="" />
            </span>
            <div>
              <h1>{category.name}</h1>
              {category.description && <p className={s.lead}>{category.description}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className={s.sec}>
        <div className={`${s.wrap} ${s.catLayout}`}>
          <nav className={s.side} aria-label={t.categoriesHeading}>
            <h2>{t.categoriesHeading}</h2>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`${base}/${c.slug}`}
                style={tint(c.color)}
                aria-current={c.id === category.id ? "page" : undefined}
              >
                <span className={s.sideIcon}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.icon} alt="" />
                </span>
                {c.name}
                <span className={s.n}>{c.productCount}</span>
              </Link>
            ))}
          </nav>
          <div style={{ minWidth: 0 }}>
            <div className={s.toolbar}>
              <span className={s.toolbarCount}>
                {t.inCategory
                  .replace("{count}", plural(site.locale, products.length, t.productCount))
                  .replace("{name}", category.name)}
              </span>
              {products.length > 1 && <SortSelect key={sort} value={sort} labels={t} />}
            </div>
            {products.length > 0 ? (
              <div className={s.fadeIn} key={sort}>
                <ProductGrid products={products} site={site} three showCategory={false} />
              </div>
            ) : (
              <div className={s.empty}>
                <p>{t.emptyCategory}</p>
                <Link href={base}>{t.clearSearch}</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </CatalogShell>
  );
}

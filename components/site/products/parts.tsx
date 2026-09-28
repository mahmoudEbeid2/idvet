import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { CategoryView, ProductCardView } from "@/lib/catalog/data";
import { plural } from "@/lib/catalog/format";
import { ArrowIcon, ImageIcon } from "./icons";
import s from "./catalog.module.css";


export function tint(color: string): React.CSSProperties {
  return { "--tint": color } as React.CSSProperties;
}

export function productHref(locale: string, product: Pick<ProductCardView, "slug" | "category">) {
  return `/${locale}/products/${product.category.slug}/${product.slug}`;
}

export function Breadcrumbs({
  label,
  items,
}: {
  label: string;
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className={s.crumbs} aria-label={label}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "contents" }}>
          {i > 0 && (
            <span className={s.sep} aria-hidden="true">
              /
            </span>
          )}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function SectionHead({ title, meta }: { title: string; meta?: React.ReactNode }) {
  return (
    <div className={s.secHead}>
      <h2>{title}</h2>
      <span className={s.rule} aria-hidden="true" />
      {meta}
    </div>
  );
}

export function CategoryCard({ category, site }: { category: CategoryView; site: SiteContent }) {
  const t = site.products;
  return (
    <Link href={`/${site.locale}/products/${category.slug}`} className={s.catCard} style={tint(category.color)}>
      <span className={s.catCardIcon}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={category.icon} alt="" />
      </span>
      <h3>{category.name}</h3>
      {category.description && <p>{category.description}</p>}
      <span className={s.catCardGo}>
        {t.viewProducts}
        <span>
          <span className={s.n}>{plural(site.locale, category.productCount, t.productCount)}</span>{" "}
          <span className={s.arrow}>
            <ArrowIcon className={s.flip} />
          </span>
        </span>
      </span>
    </Link>
  );
}

export function ProductCard({
  product,
  site,
  showCategory = true,
}: {
  product: ProductCardView;
  site: SiteContent;
  showCategory?: boolean;
}) {
  const t = site.products;
  return (
    <Link href={productHref(site.locale, product)} className={s.pCard} style={tint(product.category.color)}>
      <div className={s.pCardPh}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image.src}
            width={product.image.width}
            height={product.image.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <NoImage icon={product.category.icon} label={t.noImage} />
        )}
        {product.imageCount > 1 && (
          <span className={s.imgsBadge} aria-label={t.imageCount}>
            <ImageIcon />
            <span className={s.latin}>{product.imageCount}</span>
          </span>
        )}
      </div>
      <div className={s.pCardBody}>
        {showCategory && <span className={s.pCardCat}>{product.category.name}</span>}
        <h3>{product.name}</h3>
        <span className={s.pCardBrand}>
          {product.brand && <span className={s.latin}>{product.brand}</span>}
          {product.brand && product.brandCountry && " · "}
          {product.brandCountry}
        </span>
        <div className={s.pCardFoot}>
          {product.certificateCount > 0 ? (
            <span className={s.pdfBadge}>
              <span className={s.pdfTag}>PDF</span>
              {plural(site.locale, product.certificateCount, t.certificateCount)}
            </span>
          ) : (
            <span className={`${s.pdfBadge} ${s.pdfBadgeMuted}`}>{t.noCertificates}</span>
          )}
          <span className={s.more}>
            {t.details} <ArrowIcon className={s.flip} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function NoImage({ icon, label }: { icon: string; label: string }) {
  return (
    <span className={s.placeholder}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" />
      {label}
    </span>
  );
}

export function ProductGrid({
  products,
  site,
  three = false,
  showCategory = true,
}: {
  products: ProductCardView[];
  site: SiteContent;
  three?: boolean;
  showCategory?: boolean;
}) {
  return (
    <div className={`${s.grid} ${three ? s.gridThree : ""}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} site={site} showCategory={showCategory} />
      ))}
    </div>
  );
}

import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { ProductCardView } from "@/lib/catalog/data";
import { ArrowIcon, ImageIcon } from "./icons";
import { QuoteButton } from "./QuoteButton";
import { quoteLabels } from "./quoteLabels";
import { tint } from "./tint";
import s from "./catalog.module.css";

export { tint } from "./tint";

/** Every product has one URL per language: /{locale}/products/{slug}. */
export function productHref(locale: string, product: Pick<ProductCardView, "slug">) {
  return `/${locale}/products/${product.slug}`;
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

/**
 * The whole card links to the product (the name's link is stretched over the
 * card), while "Request a quote" stays a separate button on top of it — a
 * button can't be nested inside a link.
 */
export function ProductCard({ product, site }: { product: ProductCardView; site: SiteContent }) {
  const t = site.products;
  return (
    <article className={s.pCard} style={tint(product.category.color)}>
      <div className={s.pCardPh}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image.src}
            width={product.image.width}
            height={product.image.height}
            alt={product.brand ? `${product.name} — ${product.brand}` : product.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <NoImage icon={product.category.icon} label={t.noImage} />
        )}
        {product.brand && <span className={`${s.brandBadge} ${s.latin}`}>{product.brand}</span>}
        {product.imageCount > 1 && (
          <span className={s.imgsBadge} aria-label={t.imageCount}>
            <ImageIcon />
            <span className={s.latin}>{product.imageCount}</span>
          </span>
        )}
      </div>
      <div className={s.pCardBody}>
        <span className={s.pCardCat}>{product.category.name}</span>
        <h3>
          <Link href={productHref(site.locale, product)} className={s.pCardLink}>
            {product.name}
          </Link>
        </h3>
        {product.summary && <p className={s.pCardDesc}>{product.summary}</p>}
        <div className={s.pCardFoot}>
          <QuoteButton
            product={{ id: product.id, name: product.name, code: product.code !== product.name ? product.code : "" }}
            locale={site.locale}
            labels={quoteLabels(t)}
            className={s.pCardQuote}
          />
          <span className={s.more} aria-hidden="true">
            {t.details} <ArrowIcon className={s.flip} />
          </span>
        </div>
      </div>
    </article>
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
}: {
  products: ProductCardView[];
  site: SiteContent;
  three?: boolean;
}) {
  return (
    <div className={`${s.grid} ${three ? s.gridThree : ""}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} site={site} />
      ))}
    </div>
  );
}

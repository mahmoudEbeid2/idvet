import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { ProductCardView, ProductDetailView } from "@/lib/catalog/data";
import { knownBrand } from "@/lib/catalog/brands";
import { plural } from "@/lib/catalog/format";
import { CatalogShell } from "./CatalogShell";
import { CertificateList } from "./CertificateList";
import { WhatsAppIcon } from "./icons";
import { ProductGallery } from "./ProductGallery";
import { QuoteButton } from "./QuoteButton";
import { quoteLabels } from "./quoteLabels";
import { Breadcrumbs, ProductGrid, SectionHead, tint } from "./parts";
import s from "./catalog.module.css";

export function ProductPage({
  site,
  product,
  related,
  parent,
}: {
  site: SiteContent;
  product: ProductDetailView;
  related: { sameCategory: ProductCardView[]; sameBrand: ProductCardView[] };
  /** The breadcrumb level above the product: its brand, or its category when it has none. */
  parent: { name: string; path: string };
}) {
  const t = site.products;
  const base = `/${site.locale}/products`;
  const categoryHref = `${base}?category=${encodeURIComponent(product.category.slug)}`;
  const brandHref = product.brandSlug ? `${base}?brand=${encodeURIComponent(product.brandSlug)}` : "";
  const brand = knownBrand(product.brand);
  const code = product.code && product.code !== product.name ? product.code : "";
  const quote = { id: product.id, name: product.name, code };
  const whatsappHref = `https://wa.me/${site.contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    t.whatsappMessage.replace("{name}", code ? `${product.name} (${code})` : product.name),
  )}`;

  const specs = [
    [t.brandLabel, product.brand && (
      <>
        <Link href={brandHref} className={`${s.latin} ${s.specLink}`}>{product.brand}</Link>
        {product.brandCountry && ` — ${product.brandCountry}`}
      </>
    )],
    [t.categoryLabel, <Link key="c" href={categoryHref} className={s.specLink}>{product.category.name}</Link>],
    [t.dosageForm, product.dosageForm],
    [t.species, product.species],
  ].filter(([, value]) => value) as [string, React.ReactNode][];

  const hasDetails =
    product.composition.length > 0 ||
    product.indications.length > 0 ||
    product.packSizes.length > 0 ||
    product.about.length > 0 ||
    product.usage.length > 0;

  const ctas = (className: string) => (
    <div className={className}>
      <QuoteButton product={quote} locale={site.locale} labels={quoteLabels(t)} className={`${s.btn} ${s.btnPrimary}`} />
      <a className={`${s.btn} ${s.btnGhost}`} href={whatsappHref} target="_blank" rel="noopener">
        <WhatsAppIcon /> {t.whatsapp}
      </a>
    </div>
  );

  return (
    <CatalogShell site={site} languagePath={`/products/${product.slug}`}>
      <div className={s.crumbBar}>
        <div className={s.wrap}>
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { label: t.breadcrumbHome, href: `/${site.locale}` },
              { label: t.title, href: base },
              { label: parent.name, href: parent.path },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className={s.wrap} style={tint(product.category.color)}>
        <div className={s.pd}>
          <ProductGallery
            images={product.images}
            name={product.name}
            color={product.category.color}
            categoryIcon={product.category.icon}
            rtl={site.locale !== "en"}
            labels={t}
          />

          <div className={s.info}>
            <div className={s.infoTop}>
              <Link href={categoryHref} className={s.chip}>
                <span className={s.chipIcon}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.category.icon} alt="" />
                </span>
                {product.category.name}
              </Link>
              {brand ? (
                <Link href={brandHref} className={s.brandLogo}>
                  {brand.logo.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt={i === 0 ? brand.name : ""} />
                  ))}
                </Link>
              ) : (
                product.brand && (
                  <Link href={brandHref} className={s.brandText}>
                    {product.brand}
                  </Link>
                )
              )}
            </div>
            <div>
              <h1>{product.name}</h1>
              {product.code && product.code !== product.name && (
                <p className={`${s.tradeName} ${s.latin}`}>{product.code}</p>
              )}
            </div>
            {product.summary && <p className={s.desc}>{product.summary}</p>}
            {product.tags.length > 0 && (
              <ul className={s.tags} aria-label={t.tagsLabel}>
                {product.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
            {specs.length > 0 && (
              <dl className={s.specs}>
                {specs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {ctas(s.ctas)}

            <CertificateList
              certificates={product.certificates}
              labels={{
                heading: t.certificatesHeading,
                countLabel: product.certificates.length
                  ? `${plural(site.locale, product.certificates.length, t.certificateFiles)} PDF`
                  : "",
                empty: t.noCertificatesLong,
                view: t.view,
                openInNewTab: t.openInNewTab,
                download: t.download,
                close: t.close,
              }}
            />
          </div>
        </div>

        {hasDetails && (
          <div className={s.pdBody}>
            <div className={s.pdMain}>
              {product.composition.length > 0 && (
                <section>
                  <h2>{t.compositionHeading}</h2>
                  <table className={s.specTable}>
                    <thead>
                      <tr>
                        <th scope="col">{t.ingredientColumn}</th>
                        <th scope="col">{t.amountColumn}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.composition.map((row, i) => (
                        <tr key={i}>
                          <th scope="row">{row.ingredient}</th>
                          <td>{row.amount || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
              {product.indications.length > 0 && (
                <section>
                  <h2>{t.indicationsHeading}</h2>
                  <ul className={s.bullets}>
                    {product.indications.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
              {product.packSizes.length > 0 && (
                <section>
                  <h2>{t.packSizesHeading}</h2>
                  <ul className={s.packs}>
                    {product.packSizes.map((size) => (
                      <li key={size}>{size}</li>
                    ))}
                  </ul>
                </section>
              )}
              {product.about.length > 0 && (
                <section>
                  <h2>{t.aboutHeading}</h2>
                  {product.about.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </section>
              )}
              {product.usage.length > 0 && (
                <section>
                  <h2>{t.usageHeading}</h2>
                  <ol>
                    {product.usage.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            <aside className={s.quoteCard} aria-label={t.quoteTitle}>
              <div className={s.quoteCardHead}>
                <span className={s.quoteCardThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images[0]?.src ?? product.category.icon} alt="" />
                </span>
                <b>{product.name}</b>
              </div>
              <p className={s.quoteCardTitle}>{t.asideTitle}</p>
              <p className={s.quoteCardBody}>{t.asideBody}</p>
              {ctas(s.quoteCardCtas)}
            </aside>
          </div>
        )}
      </div>

      {related.sameCategory.length > 0 && (
        <section className={`${s.sec} ${s.secAlt}`}>
          <div className={s.wrap}>
            <SectionHead
              title={t.relatedHeading}
              meta={
                <Link href={categoryHref} className={s.secMeta}>
                  {t.allInCategory.replace("{name}", product.category.name)}
                </Link>
              }
            />
            <ProductGrid products={related.sameCategory} site={site} three />
          </div>
        </section>
      )}

      {related.sameBrand.length > 0 && (
        <section className={s.sec}>
          <div className={s.wrap}>
            <SectionHead
              title={t.moreFromBrand.replace("{brand}", product.brand)}
              meta={
                <Link href={brandHref} className={s.secMeta}>
                  {t.allFromBrand.replace("{brand}", product.brand)}
                </Link>
              }
            />
            <ProductGrid products={related.sameBrand} site={site} three />
          </div>
        </section>
      )}
    </CatalogShell>
  );
}

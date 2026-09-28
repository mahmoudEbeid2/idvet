import Link from "next/link";
import type { SiteContent } from "@/lib/content";
import type { ProductCardView, ProductDetailView } from "@/lib/catalog/data";
import { knownBrand } from "@/lib/catalog/brands";
import { plural } from "@/lib/catalog/format";
import { ContactTriggerButton } from "../ContactTriggerButton";
import { CatalogShell } from "./CatalogShell";
import { CertificateList } from "./CertificateList";
import { ProductGallery } from "./ProductGallery";
import { Breadcrumbs, ProductGrid, SectionHead, tint } from "./parts";
import s from "./catalog.module.css";

export function ProductPage({
  site,
  product,
  related,
}: {
  site: SiteContent;
  product: ProductDetailView;
  related: ProductCardView[];
}) {
  const t = site.products;
  const base = `/${site.locale}/products`;
  const categoryHref = `${base}/${product.category.slug}`;
  const brand = knownBrand(product.brand);
  const whatsappNumber = site.contact.phone.replace(/\D/g, "");
  const whatsappText = t.whatsappMessage.replace("{name}", product.code ? `${product.name} (${product.code})` : product.name);

  const specs = [
    [t.brandLabel, product.brand && (
      <>
        <span className={s.latin}>{brand?.name ?? product.brand}</span>
        {product.brandCountry && ` — ${product.brandCountry}`}
      </>
    )],
    [t.dosageForm, product.dosageForm],
    [t.packaging, product.packaging],
    [t.species, product.species],
  ].filter(([, value]) => value) as [string, React.ReactNode][];

  return (
    <CatalogShell site={site} languagePath={`/products/${product.category.slug}/${product.slug}`}>
      <div className={s.crumbBar}>
        <div className={s.wrap}>
          <Breadcrumbs
            label={t.breadcrumbLabel}
            items={[
              { label: t.breadcrumbHome, href: `/${site.locale}` },
              { label: t.title, href: base },
              { label: product.category.name, href: categoryHref },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className={s.wrap}>
        <div className={s.pd} style={tint(product.category.color)}>
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
                <span className={s.brandLogo}>
                  {brand.logo.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt={i === 0 ? brand.name : ""} />
                  ))}
                </span>
              ) : (
                product.brand && <span className={s.brandText}>{product.brand}</span>
              )}
            </div>
            <div>
              <h1>{product.name}</h1>
              {product.code && product.code !== product.name && (
                <p className={`${s.tradeName} ${s.latin}`}>{product.code}</p>
              )}
            </div>
            {product.summary && <p className={s.desc}>{product.summary}</p>}
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
            <div className={s.ctas}>
              <ContactTriggerButton className={`${s.btn} ${s.btnPrimary}`}>{t.requestQuote}</ContactTriggerButton>
              <a
                className={`${s.btn} ${s.btnGhost}`}
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener"
              >
                {t.whatsapp}
              </a>
            </div>

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

        {(product.about.length > 0 || product.usage.length > 0) && (
          <div className={s.long}>
            {product.about.length > 0 && (
              <div>
                <h2>{t.aboutHeading}</h2>
                {product.about.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
            {product.usage.length > 0 && (
              <div>
                <h2>{t.usageHeading}</h2>
                <ol>
                  {product.usage.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {related.length > 0 && (
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
            <ProductGrid products={related} site={site} three />
          </div>
        </section>
      )}
    </CatalogShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { absoluteUrl, breadcrumbJsonLd, ORGANIZATION_ID, pageMetadata } from "@/lib/seo";
import { BrandsPage } from "@/components/site/BrandsPage";
import { CatalogShell } from "@/components/site/products/CatalogShell";
import { JsonLd } from "@/components/site/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].brandsPage;
  return pageMetadata({
    locale,
    path: "/brands",
    title: t.metaTitle,
    description: t.hero.body,
    images: [{ url: "/assets/brands/hero-logistics-hub.png", width: 1672, height: 941, alt: t.imageAlts.hero }],
  });
}

export default async function BrandsRoute({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const site = content[locale];
  const path = `/${locale}/brands`;

  return (
    <CatalogShell site={site} languagePath="/brands" page="brands">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: absoluteUrl(path),
          name: site.brandsPage.metaTitle,
          description: site.brandsPage.hero.body,
          inLanguage: site.htmlLang,
          about: { "@id": ORGANIZATION_ID },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: site.brandsPage.brands.map((brand, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "Brand", name: brand.name, url: brand.href },
            })),
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: site.products.breadcrumbHome, path: `/${locale}` },
          { name: site.nav.brands, path },
        ])}
      />
      <BrandsPage site={site} />
    </CatalogShell>
  );
}

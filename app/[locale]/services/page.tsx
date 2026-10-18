import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { absoluteUrl, breadcrumbJsonLd, ORGANIZATION_ID, pageMetadata } from "@/lib/seo";
import { ServicesPage } from "@/components/site/ServicesPage";
import { CatalogShell } from "@/components/site/products/CatalogShell";
import { JsonLd } from "@/components/site/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].servicesPage;
  return pageMetadata({
    locale,
    path: "/services",
    title: t.metaTitle,
    description: t.hero.body,
    images: [{ url: "/assets/services/hero-supply-chain.jpg", width: 1876, height: 941, alt: t.imageAlts.hero }],
  });
}

export default async function ServicesRoute({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const site = content[locale];
  const path = `/${locale}/services`;

  return (
    <CatalogShell site={site} languagePath="/services" page="services">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: absoluteUrl(path),
          name: site.servicesPage.metaTitle,
          description: site.servicesPage.hero.body,
          inLanguage: site.htmlLang,
          about: { "@id": ORGANIZATION_ID },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: site.servicesPage.items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: item.title,
                description: item.paragraphs[0],
                provider: { "@id": ORGANIZATION_ID },
                areaServed: { "@type": "Country", name: "Iraq" },
              },
            })),
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: site.products.breadcrumbHome, path: `/${locale}` },
          { name: site.nav.services, path },
        ])}
      />
      <ServicesPage site={site} />
    </CatalogShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { absoluteUrl, breadcrumbJsonLd, ORGANIZATION_ID, pageMetadata } from "@/lib/seo";
import { AboutPage } from "@/components/site/AboutPage";
import { CatalogShell } from "@/components/site/products/CatalogShell";
import { JsonLd } from "@/components/site/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].aboutPage;
  return pageMetadata({
    locale,
    path: "/about",
    title: t.metaTitle,
    description: t.whoWeAre.paragraphs[0],
    images: [{ url: "/assets/about/hero-network-map.png", width: 1672, height: 941, alt: t.imageAlts.hero }],
  });
}

export default async function AboutRoute({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const site = content[locale];
  const path = `/${locale}/about`;

  return (
    <CatalogShell site={site} languagePath="/about" page="about">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: absoluteUrl(path),
          name: site.aboutPage.metaTitle,
          description: site.aboutPage.whoWeAre.paragraphs[0],
          inLanguage: site.htmlLang,
          about: { "@id": ORGANIZATION_ID },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: site.products.breadcrumbHome, path: `/${locale}` },
          { name: site.nav.about, path },
        ])}
      />
      <AboutPage site={site} />
    </CatalogShell>
  );
}

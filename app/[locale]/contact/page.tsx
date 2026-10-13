import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content, isLocale } from "@/lib/content";
import { absoluteUrl, breadcrumbJsonLd, ORGANIZATION_ID, pageMetadata } from "@/lib/seo";
import { ContactPage } from "@/components/site/ContactPage";
import { CatalogShell } from "@/components/site/products/CatalogShell";
import { JsonLd } from "@/components/site/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].contactPage;
  return pageMetadata({
    locale,
    path: "/contact",
    title: t.metaTitle,
    description: t.intro.body,
    images: [{ url: "/assets/contact/hero-global-network.png", width: 1828, height: 941, alt: t.imageAlts.hero }],
  });
}

export default async function ContactRoute({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const site = content[locale];
  const path = `/${locale}/contact`;

  return (
    <CatalogShell site={site} languagePath="/contact" page="contact">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: absoluteUrl(path),
          name: site.contactPage.metaTitle,
          description: site.contactPage.intro.body,
          inLanguage: site.htmlLang,
          about: { "@id": ORGANIZATION_ID },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: site.products.breadcrumbHome, path: `/${locale}` },
          { name: site.nav.contact, path },
        ])}
      />
      <ContactPage site={site} />
    </CatalogShell>
  );
}

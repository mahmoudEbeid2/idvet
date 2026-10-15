import type { Metadata } from "next";
import { isLocale, content } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { FigmaCanvas } from "@/components/site/FigmaCanvas";
import { Canvas, CANVAS_HEADER_HEIGHT, CANVAS_HEIGHT } from "@/components/site/Canvas";
import { Header } from "@/components/site/Header";
import { MobileSite } from "@/components/site/MobileSite";
import { ContactModalProvider } from "@/components/site/ContactModalContext";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const site = content[locale];
  return pageMetadata({
    locale,
    path: "",
    title: `IDVET — ${site.hero.eyebrow}`,
    description: site.hero.paragraph,
  });
}

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const site = content[locale];

  return (
    <ContactModalProvider locale={site.locale} form={site.form}>
      <MobileSite site={site} />
      <Header site={site} />
      <div className="hidden lg:block">
        <FigmaCanvas height={CANVAS_HEIGHT - CANVAS_HEADER_HEIGHT}>
          <Canvas site={site} />
        </FigmaCanvas>
      </div>
    </ContactModalProvider>
  );
}

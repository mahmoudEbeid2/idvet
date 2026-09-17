import { isLocale, content } from "@/lib/content";
import { notFound } from "next/navigation";
import { FigmaCanvas } from "@/components/site/FigmaCanvas";
import { Canvas, CANVAS_HEIGHT } from "@/components/site/Canvas";
import { MobileSite } from "@/components/site/MobileSite";
import { ContactModalProvider } from "@/components/site/ContactModalContext";

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
      <div className="hidden lg:block">
        <FigmaCanvas height={CANVAS_HEIGHT}>
          <Canvas site={site} />
        </FigmaCanvas>
      </div>
    </ContactModalProvider>
  );
}

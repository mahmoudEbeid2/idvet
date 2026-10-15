import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/content";
import { getProduct } from "@/lib/catalog/data";
import { safeDecode } from "@/lib/catalog/format";

type Props = { params: Promise<{ locale: string; slug: string; legacy: string }> };

// Product pages used to live at /products/{category}/{product}. Links and
// search results with the old URL move permanently to /products/{product}.
export default async function LegacyProductRoute({ params }: Props) {
  const { locale, legacy } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getProduct(safeDecode(legacy), locale);
  if (!product) notFound();
  permanentRedirect(`/${locale}/products/${product.slug}`);
}

import type { MetadataRoute } from "next";
import { locales } from "@/lib/content";
import { getSitemapCatalog } from "@/lib/catalog/data";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

// One <url> per page per language, each listing all its language versions
// (hreflang + x-default) — Google's recommended sitemap form for multilingual
// sites. Rendered per request (the catalog lives in the database).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, products } = await getSitemapCatalog("ar");
  const newest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map(Number))) : undefined);
  const catalogUpdated = newest([...categories, ...products].map((x) => x.updatedAt));

  const pages: { path: string; lastModified?: Date; priority: number; images?: string[] }[] = [
    { path: "", lastModified: catalogUpdated, priority: 1 },
    { path: "/products", lastModified: catalogUpdated, priority: 0.9 },
    { path: "/about", priority: 0.8 },
    ...categories.map((c) => ({
      path: `/products/${c.slug}`,
      lastModified: newest([c.updatedAt, ...products.filter((p) => p.categorySlug === c.slug).map((p) => p.updatedAt)]),
      priority: 0.8,
    })),
    ...products.map((p) => ({
      path: `/products/${p.categorySlug}/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.7,
      images: p.images.map(absoluteUrl),
    })),
  ];

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}${page.path}`),
      lastModified: page.lastModified,
      changeFrequency: "weekly" as const,
      priority: page.priority,
      alternates: { languages: languageAlternates(page.path) },
      ...(page.images?.length ? { images: page.images } : {}),
    })),
  );
}

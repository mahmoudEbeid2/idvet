import type { MetadataRoute } from "next";
import { locales } from "@/lib/content";
import { getSitemapCatalog } from "@/lib/catalog/data";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

// One <url> per page per language, each listing all its language versions
// (hreflang + x-default) — Google's recommended sitemap form for multilingual
// sites. Rendered per request (the catalog lives in the database).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, brands, products } = await getSitemapCatalog("ar");
  const newest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map(Number))) : undefined);
  const catalogUpdated = newest(products.map((p) => p.updatedAt));

  const pages: { path: string; lastModified?: Date; priority: number; images?: string[] }[] = [
    { path: "", lastModified: catalogUpdated, priority: 1 },
    { path: "/products", lastModified: catalogUpdated, priority: 0.9 },
    { path: "/about", priority: 0.8 },
    { path: "/contact", priority: 0.8 },
    { path: "/brands", priority: 0.8 },
    // One-category and one-brand views of the catalog are indexable landing pages.
    ...categories.map((c) => ({
      path: `/products?category=${encodeURIComponent(c.slug)}`,
      lastModified: c.updatedAt,
      priority: 0.8,
    })),
    ...brands.map((b) => ({
      path: `/products?brand=${encodeURIComponent(b.slug)}`,
      lastModified: b.updatedAt,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      path: `/products/${p.slug}`,
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

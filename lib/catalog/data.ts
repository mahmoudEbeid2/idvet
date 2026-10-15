import { cache } from "react";
import { connection } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/content/types";
import { uploadUrl } from "@/lib/storage";
import { KNOWN_BRANDS, brandSlug, knownBrand } from "./brands";
import { type CatalogFilters, type SortKey, normalizeSearch } from "./filters";
import { compositionRows, items, paragraphs, steps } from "./format";
import { pick } from "./i18n";

// Public catalog reads. Every function awaits connection() first so pages that
// use them render at request time — the Docker build has no database.
//
// The catalog is small (one distributor's range), so the listing loads every
// published product once per request and filters, counts and sorts in memory:
// facet counts then always agree with the results.

export interface CategoryView {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
}

export interface ImageView {
  src: string;
  width: number;
  height: number;
}

export interface ProductCardView {
  id: string;
  slug: string;
  name: string;
  code: string;
  /** Short description, shown on one line on cards. */
  summary: string;
  /** Display name: the known brand's spelling, else as typed. */
  brand: string;
  /** ?brand= value; "" when the product has no brand. */
  brandSlug: string;
  brandCountry: string;
  category: { slug: string; name: string; color: string; icon: string };
  image: ImageView | null;
  imageCount: number;
  certificateCount: number;
}

export interface CertificateView {
  id: string;
  title: string;
  issuer: string;
  issuedOn: string;
  src: string;
  size: number;
}

export interface ProductDetailView extends ProductCardView {
  dosageForm: string;
  species: string;
  about: string[];
  usage: string[];
  composition: { ingredient: string; amount: string }[];
  indications: string[];
  packSizes: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  images: ImageView[];
  certificates: CertificateView[];
}

export interface FacetOption {
  slug: string;
  name: string;
  /** Results this option would have with the other filters kept. */
  count: number;
  icon?: string;
  color?: string;
}

export interface CatalogResult {
  products: ProductCardView[];
  brands: FacetOption[];
  categories: FacetOption[];
  /** Published products in the whole catalog. */
  total: number;
}

const published = { published: true } satisfies Prisma.ProductWhereInput;
const order = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

const cardInclude = {
  category: true,
  images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 1 },
  _count: { select: { images: true, certificates: true } },
} satisfies Prisma.ProductInclude;

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

function toImage(row: { path: string; width: number; height: number }): ImageView {
  return { src: uploadUrl(row.path), width: row.width, height: row.height };
}

function toCard(row: CardRow, locale: Locale): ProductCardView {
  const known = knownBrand(row.brand);
  return {
    id: row.id,
    slug: row.slug,
    name: pick(row, "name", locale) || row.code,
    code: row.code,
    summary: pick(row, "summary", locale),
    brand: known?.name ?? row.brand.trim(),
    brandSlug: brandSlug(row.brand),
    brandCountry: known?.country[locale] ?? "",
    category: {
      slug: row.category.slug,
      name: pick(row.category, "name", locale),
      color: row.category.color,
      icon: row.category.icon,
    },
    image: row.images[0] ? toImage(row.images[0]) : null,
    imageCount: row._count.images,
    certificateCount: row._count.certificates,
  };
}

function collator(locale: Locale) {
  return new Intl.Collator(locale === "ku" ? "ckb" : locale, { sensitivity: "base", numeric: true });
}

export const getCategories = cache(async (locale: Locale): Promise<CategoryView[]> => {
  await connection();
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: { where: published } } } },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: pick(row, "name", locale),
    description: pick(row, "description", locale),
    icon: row.icon,
    color: row.color,
    productCount: row._count.products,
  }));
});

/** Every published product in the admin's order, with the text search looks at. */
const getPublishedRows = cache(async () => {
  await connection();
  return prisma.product.findMany({ where: published, include: cardInclude, orderBy: order });
});

/**
 * How well a product matches the search: name or trade name first, then the
 * active ingredients, then brand and description. 0 = no match.
 */
function searchScore(row: CardRow, query: string): number {
  const has = (...values: string[]) => values.some((v) => normalizeSearch(v).includes(query));
  if (has(row.nameKu, row.nameAr, row.nameEn, row.code)) {
    const starts = [row.nameKu, row.nameAr, row.nameEn, row.code].some((v) => normalizeSearch(v).startsWith(query));
    return starts ? 5 : 4;
  }
  if (has(row.compositionKu, row.compositionAr, row.compositionEn)) return 3;
  if (has(row.brand, row.tagsKu, row.tagsAr, row.tagsEn)) return 2;
  if (has(row.summaryKu, row.summaryAr, row.summaryEn)) return 1;
  return 0;
}

/** The listing: filtered and sorted products plus brand and category facets. */
export async function getCatalog(locale: Locale, filters: CatalogFilters): Promise<CatalogResult> {
  const [rows, categories] = await Promise.all([getPublishedRows(), getCategories(locale)]);
  const query = normalizeSearch(filters.q);

  // Products matching the search, best match first (stable: admin order within a score).
  const scored = rows
    .map((row) => ({ card: toCard(row, locale), score: query ? searchScore(row, query) : 1 }))
    .filter((r) => r.score > 0);
  const searched = query ? [...scored].sort((a, b) => b.score - a.score).map((r) => r.card) : scored.map((r) => r.card);

  const inBrands = (p: ProductCardView) => !filters.brands.length || filters.brands.includes(p.brandSlug);
  const inCategories = (p: ProductCardView) => !filters.categories.length || filters.categories.includes(p.category.slug);

  // Each facet counts with the *other* facet applied, so ticking an option
  // never changes its own group's numbers.
  const brandBase = searched.filter(inCategories);
  const categoryBase = searched.filter(inBrands);

  // The three represented brands always show; any other brand once it has products.
  const brandNames = new Map<string, string>(KNOWN_BRANDS.map((b) => [b.slug, b.name]));
  for (const row of rows) {
    const slug = brandSlug(row.brand);
    if (slug && !brandNames.has(slug)) brandNames.set(slug, row.brand.trim());
  }
  const brands = [...brandNames].map(([slug, name]) => ({
    slug,
    name,
    count: brandBase.filter((p) => p.brandSlug === slug).length,
  }));

  return {
    products: sortCards(searched.filter((p) => inBrands(p) && inCategories(p)), filters.sort, locale),
    brands,
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      color: c.color,
      count: categoryBase.filter((p) => p.category.slug === c.slug).length,
    })),
    total: rows.length,
  };
}

function sortCards(cards: ProductCardView[], sort: SortKey, locale: Locale) {
  if (sort === "relevance") return cards; // already in search-score / admin order
  const c = collator(locale);
  return [...cards].sort((a, b) =>
    sort === "brand"
      ? c.compare(a.brand || "￿", b.brand || "￿") || c.compare(a.name, b.name)
      : c.compare(a.name, b.name),
  );
}

/** A published product by slug, or null (unknown or unpublished). */
export const getProduct = cache(async (slug: string, locale: Locale): Promise<ProductDetailView | null> => {
  await connection();
  const row = await prisma.product.findUnique({
    where: { slug },
    include: {
      ...cardInclude,
      images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      certificates: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!row || !row.published) return null;

  return {
    ...toCard(row, locale),
    dosageForm: pick(row, "dosageForm", locale),
    species: pick(row, "species", locale),
    about: paragraphs(pick(row, "about", locale)),
    usage: steps(pick(row, "usage", locale)),
    composition: compositionRows(pick(row, "composition", locale)),
    indications: steps(pick(row, "indications", locale)),
    packSizes: items(pick(row, "packaging", locale)),
    tags: items(pick(row, "tags", locale)),
    seoTitle: pick(row, "seoTitle", locale),
    seoDescription: pick(row, "seoDescription", locale),
    images: row.images.map(toImage),
    certificates: row.certificates.map((c) => ({
      id: c.id,
      title: pick(c, "title", locale),
      issuer: c.issuer,
      issuedOn: c.issuedOn,
      src: uploadUrl(c.path),
      size: c.size,
    })),
  };
});

/**
 * "Related products" (same category) and "More from {brand}" (same brand,
 * not already shown as related), up to `take` each.
 */
export async function getRelated(
  product: Pick<ProductCardView, "id" | "brandSlug" | "category">,
  locale: Locale,
  take = 3,
): Promise<{ sameCategory: ProductCardView[]; sameBrand: ProductCardView[] }> {
  const others = (await getPublishedRows()).filter((row) => row.id !== product.id).map((row) => toCard(row, locale));
  const sameCategory = others.filter((p) => p.category.slug === product.category.slug).slice(0, take);
  const shown = new Set(sameCategory.map((p) => p.id));
  const sameBrand = product.brandSlug
    ? others.filter((p) => p.brandSlug === product.brandSlug && !shown.has(p.id)).slice(0, take)
    : [];
  return { sameCategory, sameBrand };
}

/** Number of distinct brands among published products. */
export async function countBrands(): Promise<number> {
  const rows = await getPublishedRows();
  return new Set(rows.map((r) => brandSlug(r.brand)).filter(Boolean)).size;
}

export interface SitemapCatalog {
  categories: { slug: string; name: string; updatedAt: Date }[];
  brands: { slug: string; name: string; updatedAt: Date }[];
  products: { slug: string; name: string; updatedAt: Date; images: string[] }[];
}

/** Every category and brand with published products, and every published product (sitemap, llms.txt). */
export async function getSitemapCatalog(locale: Locale): Promise<SitemapCatalog> {
  await connection();
  const products = await prisma.product.findMany({
    where: published,
    include: { category: true, images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    orderBy: order,
  });

  const newest = (dates: Date[]) => new Date(Math.max(...dates.map(Number)));
  const categories = new Map<string, { slug: string; name: string; updatedAt: Date; sort: number }>();
  const brands = new Map<string, { slug: string; name: string; updatedAt: Date }>();
  for (const p of products) {
    const c = categories.get(p.category.slug);
    categories.set(p.category.slug, {
      slug: p.category.slug,
      name: pick(p.category, "name", locale),
      updatedAt: newest([p.category.updatedAt, p.updatedAt, ...(c ? [c.updatedAt] : [])]),
      sort: p.category.sortOrder,
    });
    const slug = brandSlug(p.brand);
    if (!slug) continue;
    const b = brands.get(slug);
    brands.set(slug, {
      slug,
      name: knownBrand(p.brand)?.name ?? p.brand.trim(),
      updatedAt: newest([p.updatedAt, ...(b ? [b.updatedAt] : [])]),
    });
  }

  return {
    categories: [...categories.values()]
      .sort((a, b) => a.sort - b.sort)
      .map((c) => ({ slug: c.slug, name: c.name, updatedAt: c.updatedAt })),
    brands: [...brands.values()],
    products: products.map((p) => ({
      slug: p.slug,
      name: pick(p, "name", locale) || p.code,
      updatedAt: p.updatedAt,
      images: p.images.map((image) => uploadUrl(image.path)),
    })),
  };
}

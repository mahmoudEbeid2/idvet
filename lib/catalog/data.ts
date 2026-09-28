import { cache } from "react";
import { connection } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/content/types";
import { uploadUrl } from "@/lib/storage";
import { knownBrand } from "./brands";
import { paragraphs, steps } from "./format";
import { pick } from "./i18n";

// Public catalog reads. Every function awaits connection() first so pages that
// use them render at request time — the Docker build has no database.

export const SORT_KEYS = ["newest", "name", "brand"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export function parseSort(value: string | string[] | undefined): SortKey {
  return SORT_KEYS.find((key) => key === value) ?? "newest";
}

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
  brand: string;
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
  summary: string;
  dosageForm: string;
  packaging: string;
  species: string;
  about: string[];
  usage: string[];
  images: ImageView[];
  certificates: CertificateView[];
}

const published = { published: true } satisfies Prisma.ProductWhereInput;

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
  return {
    id: row.id,
    slug: row.slug,
    name: pick(row, "name", locale) || row.code,
    code: row.code,
    brand: row.brand,
    brandCountry: knownBrand(row.brand)?.country[locale] ?? "",
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

function sortCards(cards: ProductCardView[], sort: SortKey, locale: Locale) {
  if (sort === "newest") return cards; // already ordered by the query
  const collator = new Intl.Collator(locale === "ku" ? "ckb" : locale, { sensitivity: "base", numeric: true });
  return [...cards].sort((a, b) =>
    sort === "brand"
      ? collator.compare(a.brand || "￿", b.brand || "￿") || collator.compare(a.name, b.name)
      : collator.compare(a.name, b.name),
  );
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

export async function listProducts(
  locale: Locale,
  { query, categoryId, sort = "newest" }: { query?: string; categoryId?: string; sort?: SortKey } = {},
): Promise<ProductCardView[]> {
  await connection();
  const q = query?.trim().slice(0, 100);
  const contains = (field: string) => ({ [field]: { contains: q, mode: "insensitive" } });
  const where: Prisma.ProductWhereInput = {
    ...published,
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            "nameKu", "nameAr", "nameEn", "code", "brand",
            "summaryKu", "summaryAr", "summaryEn",
          ].map(contains) as Prisma.ProductWhereInput[],
        }
      : {}),
  };
  const rows = await prisma.product.findMany({
    where,
    include: cardInclude,
    // "newest": the admin's manual order first (0 by default), newest within it.
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return sortCards(rows.map((row) => toCard(row, locale)), sort, locale);
}

/** Number of distinct brands among published products. */
export async function countBrands(): Promise<number> {
  await connection();
  const rows = await prisma.product.findMany({
    where: { ...published, NOT: { brand: "" } },
    select: { brand: true },
    distinct: ["brand"],
  });
  return new Set(rows.map((r) => knownBrand(r.brand)?.name ?? r.brand.trim().toLowerCase())).size;
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
    summary: pick(row, "summary", locale),
    dosageForm: pick(row, "dosageForm", locale),
    packaging: pick(row, "packaging", locale),
    species: pick(row, "species", locale),
    about: paragraphs(pick(row, "about", locale)),
    usage: steps(pick(row, "usage", locale)),
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

/** Up to `take` other published products, same category first. */
export async function getRelated(
  product: { id: string; category: { slug: string } },
  locale: Locale,
  take = 3,
): Promise<ProductCardView[]> {
  await connection();
  const order = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];
  const same = await prisma.product.findMany({
    where: { ...published, id: { not: product.id }, category: { slug: product.category.slug } },
    include: cardInclude,
    orderBy: order,
    take,
  });
  const rest =
    same.length < take
      ? await prisma.product.findMany({
          where: { ...published, category: { slug: { not: product.category.slug } } },
          include: cardInclude,
          orderBy: order,
          take: take - same.length,
        })
      : [];
  return [...same, ...rest].map((row) => toCard(row, locale));
}

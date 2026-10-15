import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { missingLocales, pick } from "@/lib/catalog/i18n";
import { uploadUrl } from "@/lib/storage";
import { getAdminLang } from "./lang";
import { requireAdmin } from "./session";

// Admin reads. Each one checks the session: layouts don't re-run on every
// client navigation, so pages can't rely on the panel layout's check alone.
// Names are picked in the dashboard language, falling back like the site does.

const PRODUCT_TEXT = [
  "name", "summary", "dosageForm", "packaging", "species",
  "composition", "indications", "tags", "about", "usage", "seoTitle", "seoDescription",
] as const;

export async function getDashboard() {
  await requireAdmin();
  const lang = await getAdminLang();
  const [products, published, categories, images, certificates, recent] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.productImage.count(),
    prisma.certificate.count(),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { category: true, _count: { select: { images: true, certificates: true } } },
    }),
  ]);
  return {
    counts: { products, published, categories, images, certificates },
    recent: recent.map((p) => ({
      id: p.id,
      name: pick(p, "name", lang) || p.code,
      category: pick(p.category, "name", lang),
      published: p.published,
      images: p._count.images,
      certificates: p._count.certificates,
    })),
  };
}

export async function getCategoryOptions() {
  await requireAdmin();
  const lang = await getAdminLang();
  const rows = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return rows.map((c) => ({ id: c.id, name: pick(c, "name", lang) }));
}

export async function listAdminCategories() {
  await requireAdmin();
  const lang = await getAdminLang();
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: pick(c, "name", lang),
    /** The category's names in the other languages, for the row's second line. */
    otherNames: [c.nameKu, c.nameAr, c.nameEn].filter((n) => n.trim() && n !== pick(c, "name", lang)),
    icon: c.icon,
    color: c.color,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
    missing: missingLocales(c, ["name", "description"]),
  }));
}

export async function getAdminCategory(id: string) {
  await requireAdmin();
  return prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
}

export type ProductFilter = { q?: string; category?: string; status?: string };

export async function listAdminProducts(filter: ProductFilter) {
  await requireAdmin();
  const lang = await getAdminLang();
  const q = filter.q?.trim().slice(0, 100);
  const where: Prisma.ProductWhereInput = {
    ...(filter.category ? { categoryId: filter.category } : {}),
    ...(filter.status === "published" ? { published: true } : filter.status === "draft" ? { published: false } : {}),
    ...(q
      ? {
          OR: (["nameKu", "nameAr", "nameEn", "code", "brand", "slug"] as const).map((field) => ({
            [field]: { contains: q, mode: "insensitive" as const },
          })),
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 1 },
        certificates: { select: { titleKu: true, titleAr: true, titleEn: true } },
        _count: { select: { images: true } },
      },
    }),
    prisma.product.count(),
  ]);
  return {
    total,
    products: rows.map((p) => {
      const missing = new Set(missingLocales(p, [...PRODUCT_TEXT]));
      for (const c of p.certificates) for (const l of missingLocales(c, ["title"])) missing.add(l);
      return {
        id: p.id,
        name: pick(p, "name", lang) || p.code,
        code: p.code,
        brand: p.brand,
        category: pick(p.category, "name", lang),
        color: p.category.color,
        image: p.images[0] ? uploadUrl(p.images[0].path) : null,
        images: p._count.images,
        certificates: p.certificates.length,
        published: p.published,
        missing: (["Ku", "Ar", "En"] as const).filter((l) => missing.has(l)),
      };
    }),
  };
}

export async function getAdminProduct(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      certificates: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!product) return null;
  return {
    ...product,
    images: product.images.map((i) => ({ id: i.id, src: uploadUrl(i.path), width: i.width, height: i.height })),
    certificates: product.certificates.map((c) => ({
      id: c.id,
      titleKu: c.titleKu,
      titleAr: c.titleAr,
      titleEn: c.titleEn,
      issuer: c.issuer,
      issuedOn: c.issuedOn,
      size: c.size,
      src: uploadUrl(c.path),
      missing: missingLocales(c, ["title"]),
    })),
  };
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;
export type AdminCertificate = AdminProduct["certificates"][number];
export type AdminImage = AdminProduct["images"][number];

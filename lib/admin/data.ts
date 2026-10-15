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

// ---------------------------------------------------------------- inbox

export const CONTACT_STATUSES = ["new", "read", "archived"] as const;
export const QUOTE_STATUSES = ["new", "contacted", "closed"] as const;
export type ContactStatusValue = (typeof CONTACT_STATUSES)[number];
export type QuoteStatusValue = (typeof QUOTE_STATUSES)[number];

const isOneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);
export const isContactStatus = (v: unknown): v is ContactStatusValue => isOneOf(CONTACT_STATUSES, v);
export const isQuoteStatus = (v: unknown): v is QuoteStatusValue => isOneOf(QUOTE_STATUSES, v);

/** New contact messages and unopened quote requests, for the sidebar badges. */
export async function getUnreadCounts() {
  await requireAdmin();
  const [messages, quotes] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.quoteRequest.count({ where: { readAt: null } }),
  ]);
  return { messages, quotes };
}

const INBOX_LIMIT = 300;
const contains = (q: string) => ({ contains: q, mode: "insensitive" as const });

export type InboxFilter = { q?: string; status?: string };

/** Newest first. Without a status filter, archived messages are left out. */
export async function listContactMessages(filter: InboxFilter) {
  await requireAdmin();
  const q = filter.q?.trim().slice(0, 100);
  const where: Prisma.ContactMessageWhereInput = {
    ...(isContactStatus(filter.status)
      ? { status: filter.status }
      : filter.status === "all"
        ? {}
        : { status: { not: "archived" } }),
    ...(q ? { OR: (["name", "email", "phone", "subject", "message"] as const).map((f) => ({ [f]: contains(q) })) } : {}),
  };
  return prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: INBOX_LIMIT });
}

export async function listQuoteRequests(filter: InboxFilter) {
  await requireAdmin();
  const q = filter.q?.trim().slice(0, 100);
  const where: Prisma.QuoteRequestWhereInput = {
    ...(isQuoteStatus(filter.status) ? { status: filter.status } : {}),
    ...(q
      ? { OR: (["name", "contact", "productName", "company", "city"] as const).map((f) => ({ [f]: contains(q) })) }
      : {}),
  };
  return prisma.quoteRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: INBOX_LIMIT });
}

export async function getContactMessage(id: string) {
  await requireAdmin();
  return prisma.contactMessage.findUnique({ where: { id } });
}

export async function getQuoteRequest(id: string) {
  await requireAdmin();
  const lang = await getAdminLang();
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { product: { select: { id: true, slug: true, code: true, published: true, nameKu: true, nameAr: true, nameEn: true } } },
  });
  if (!quote) return null;
  const { product, ...rest } = quote;
  return {
    ...rest,
    /** Null when the product was deleted after the request (productName is kept). */
    product: product && {
      id: product.id,
      name: pick(product, "name", lang) || product.code,
      published: product.published,
      /** Public page, in the language the visitor used. */
      href: `/${quote.locale}/products/${product.slug}`,
    },
  };
}

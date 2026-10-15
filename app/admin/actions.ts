"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteUpload, deleteUploadFolder, uploadPathFromUrl } from "@/lib/storage";
import { clearLoginFailures, clientIp, loginBlockedFor, recordLoginFailure } from "@/lib/admin/rateLimit";
import { endSession, requireAdmin, startSession } from "@/lib/admin/session";
import { adminConfig, safeEqual } from "@/lib/admin/token";
import { ADMIN_LANG_COOKIE, isAdminLang } from "@/lib/admin/i18n";
import { getAdminT } from "@/lib/admin/lang";
import {
  PRESET_ICONS,
  SLUG_PATTERN,
  int,
  isHexColor,
  randomSlug,
  slugify,
  text,
  translated,
  type FormState,
} from "@/lib/admin/forms";

// Every action here starts with requireAdmin() (except login): proxy.ts only
// guards page requests, and a Server Action can be POSTed to directly.

function fieldsOf(form: FormData): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of form) if (typeof value === "string" && !key.startsWith("$")) fields[key] = value;
  return fields;
}

// ---------------------------------------------------------------- language

/** Saves the dashboard language (no session needed: the login page has the switcher too). */
export async function setAdminLang(lang: string): Promise<void> {
  if (!isAdminLang(lang)) return;
  (await cookies()).set(ADMIN_LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

// ---------------------------------------------------------------- session

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const config = adminConfig();
  const email = text(form, "email", 200);
  const t = await getAdminT();
  if (!config) return { error: t.errors.notConfigured, fields: { email } };

  const ip = clientIp(await headers());
  const wait = loginBlockedFor(ip);
  if (wait) return { error: t.errors.tooManyAttempts(wait), fields: { email } };

  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  const ok = safeEqual(email.toLowerCase(), config.email.toLowerCase()) && safeEqual(password, config.password);
  if (!ok) {
    recordLoginFailure(ip);
    return { error: t.errors.badLogin, fields: { email } };
  }

  clearLoginFailures(ip);
  await startSession(config);
  const next = text(form, "next", 500);
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- categories

export async function saveCategory(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const t = await getAdminT();
  const id = text(form, "id", 40);
  const fields = fieldsOf(form);
  const names = translated(form, "name", 80);
  const descriptions = translated(form, "description", 400);
  const color = text(form, "color", 7);
  const icon = text(form, "icon", 200);
  let slug = text(form, "slug", 80).toLowerCase();

  if (!names.nameKu && !names.nameAr && !names.nameEn) {
    return { error: t.errors.categoryNameRequired, fields };
  }
  if (!isHexColor(color)) return { error: t.errors.colorRequired, fields };
  const uploadedIcon = /^\/uploads\/categories\/[0-9a-f-]{36}\.(webp|png)$/.test(icon);
  if (!(PRESET_ICONS as readonly string[]).includes(icon) && !uploadedIcon) {
    return { error: t.errors.iconRequired, fields };
  }
  if (slug && !SLUG_PATTERN.test(slug)) {
    return { error: t.errors.slugInvalid, fields };
  }
  const explicitSlug = Boolean(slug);
  slug ||= slugify(names.nameEn) || randomSlug("category");

  const previous = id ? await prisma.category.findUnique({ where: { id } }) : null;
  if (id && !previous) return { error: t.errors.categoryGone, fields };

  const data = { ...names, ...descriptions, color, icon, sortOrder: int(form, "sortOrder") };
  const saved = await withUniqueSlug(slug, explicitSlug, (candidate) =>
    previous
      ? prisma.category.update({ where: { id }, data: { ...data, slug: candidate } })
      : prisma.category.create({ data: { ...data, slug: candidate } }),
  );
  if (!saved) return { error: t.errors.categorySlugTaken, fields };

  if (previous && previous.icon !== icon) await deleteUpload(uploadPathFromUrl(previous.icon));
  redirect(previous ? `/admin/categories/${saved.id}?saved=1` : "/admin/categories?created=1");
}

export async function deleteCategory(id: string): Promise<FormState> {
  await requireAdmin();
  const t = await getAdminT();
  const category = await prisma.category.findUnique({
    where: { id: String(id) },
    include: { _count: { select: { products: true } } },
  });
  if (!category) redirect("/admin/categories");
  if (category._count.products > 0) {
    return { error: t.errors.categoryHasProducts(t.count.products(category._count.products)) };
  }
  try {
    await prisma.category.delete({ where: { id: category.id } });
  } catch (error) {
    // A product was added in the meantime (onDelete: Restrict).
    if (error instanceof Prisma.PrismaClientKnownRequestError) return { error: t.errors.categoryHasProductsNow };
    throw error;
  }
  await deleteUpload(uploadPathFromUrl(category.icon));
  redirect("/admin/categories?deleted=1");
}

// ---------------------------------------------------------------- products

export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const t = await getAdminT();
  const id = text(form, "id", 40);
  const fields = fieldsOf(form);
  const categoryId = text(form, "categoryId", 40);
  const code = text(form, "code", 80);
  let slug = text(form, "slug", 80).toLowerCase();
  const data = {
    categoryId,
    brand: text(form, "brand", 60),
    code,
    published: form.get("published") === "on",
    sortOrder: int(form, "sortOrder"),
    ...translated(form, "name", 150),
    ...translated(form, "summary", 1000),
    ...translated(form, "dosageForm", 150),
    ...translated(form, "packaging", 500),
    ...translated(form, "species", 200),
    ...translated(form, "composition", 3000),
    ...translated(form, "indications", 3000),
    ...translated(form, "tags", 500),
    ...translated(form, "about", 8000),
    ...translated(form, "usage", 4000),
    ...translated(form, "seoTitle", 120),
    ...translated(form, "seoDescription", 320),
  };

  if (!categoryId || !(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) {
    return { error: t.errors.chooseCategory, fields };
  }
  if (!data.nameKu && !data.nameAr && !data.nameEn) {
    return { error: t.errors.productNameRequired, fields };
  }
  if (slug && !SLUG_PATTERN.test(slug)) {
    return { error: t.errors.slugInvalid, fields };
  }
  const explicitSlug = Boolean(slug);
  slug ||= slugify(data.nameEn) || slugify(code) || randomSlug("product");

  if (id && !(await prisma.product.findUnique({ where: { id }, select: { id: true } }))) {
    return { error: t.errors.productGone, fields };
  }
  const saved = await withUniqueSlug(slug, explicitSlug, (candidate) =>
    id
      ? prisma.product.update({ where: { id }, data: { ...data, slug: candidate } })
      : prisma.product.create({ data: { ...data, slug: candidate } }),
  );
  if (!saved) return { error: t.errors.productSlugTaken, fields };

  redirect(`/admin/products/${saved.id}?${id ? "saved" : "created"}=1`);
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: String(id) }, select: { id: true } });
  if (product) {
    await prisma.product.delete({ where: { id: product.id } }); // images + certificates cascade
    await deleteUploadFolder(`products/${product.id}`);
    await deleteUploadFolder(`certificates/${product.id}`);
  }
  redirect("/admin/products?deleted=1");
}

// ---------------------------------------------------------------- images + certificates

export async function deleteImage(id: string): Promise<void> {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({ where: { id: String(id) } });
  if (!image) return;
  await prisma.productImage.delete({ where: { id: image.id } });
  await deleteUpload(image.path);
}

export async function moveImage(id: string, direction: -1 | 1): Promise<void> {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({ where: { id: String(id) } });
  if (!image) return;
  const siblings = await prisma.productImage.findMany({
    where: { productId: image.productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  await reorder(siblings.map((s) => s.id), image.id, direction, (rowId, sortOrder) =>
    prisma.productImage.update({ where: { id: rowId }, data: { sortOrder } }),
  );
}

export async function updateCertificate(id: string, form: FormData): Promise<FormState> {
  await requireAdmin();
  const titles = translated(form, "title", 200);
  if (!titles.titleKu && !titles.titleAr && !titles.titleEn) {
    return { error: (await getAdminT()).errors.certificateTitleRequired, fields: fieldsOf(form) };
  }
  await prisma.certificate.update({
    where: { id: String(id) },
    data: { ...titles, issuer: text(form, "issuer", 120), issuedOn: text(form, "issuedOn", 40) },
  });
  return {};
}

export async function deleteCertificate(id: string): Promise<void> {
  await requireAdmin();
  const certificate = await prisma.certificate.findUnique({ where: { id: String(id) } });
  if (!certificate) return;
  await prisma.certificate.delete({ where: { id: certificate.id } });
  await deleteUpload(certificate.path);
}

export async function moveCertificate(id: string, direction: -1 | 1): Promise<void> {
  await requireAdmin();
  const certificate = await prisma.certificate.findUnique({ where: { id: String(id) } });
  if (!certificate) return;
  const siblings = await prisma.certificate.findMany({
    where: { productId: certificate.productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  await reorder(siblings.map((s) => s.id), certificate.id, direction, (rowId, sortOrder) =>
    prisma.certificate.update({ where: { id: rowId }, data: { sortOrder } }),
  );
}

// ---------------------------------------------------------------- inbox

/** Marks a contact message or quote request as read (called when its page opens). */
export async function markInboxRead(kind: string, id: string): Promise<void> {
  await requireAdmin();
  const where = { id: String(id), isRead: false };
  const { count } =
    kind === "quote"
      ? await prisma.quoteRequest.updateMany({ where, data: { isRead: true } })
      : await prisma.contactMessage.updateMany({ where, data: { isRead: true } });
  // Refresh the sidebar's unread badge (it lives in the panel layout).
  if (count) revalidatePath("/admin", "layout");
}

export async function deleteInboxItem(kind: string, id: string): Promise<void> {
  await requireAdmin();
  const where = { id: String(id) };
  if (kind === "quote") await prisma.quoteRequest.deleteMany({ where });
  else await prisma.contactMessage.deleteMany({ where });
  revalidatePath("/admin", "layout");
  redirect(`/admin/inbox?tab=${kind === "quote" ? "quotes" : "messages"}&deleted=1`);
}

// ---------------------------------------------------------------- helpers

/** Swaps `id` with its neighbour and rewrites every sortOrder as 0..n-1. */
async function reorder(
  ids: string[],
  id: string,
  direction: -1 | 1,
  update: (id: string, sortOrder: number) => Prisma.PrismaPromise<unknown>,
) {
  const from = ids.indexOf(id);
  const to = from + (direction === -1 ? -1 : 1);
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  await prisma.$transaction(ids.map((rowId, i) => update(rowId, i)));
}

/**
 * Runs `write` with `slug`; on a unique-slug clash it retries with -2, -3…
 * for generated slugs, and returns null for a slug the admin typed.
 */
async function withUniqueSlug<T>(slug: string, explicit: boolean, write: (slug: string) => Promise<T>): Promise<T | null> {
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? slug : `${slug}-${n}`;
    try {
      return await write(candidate);
    } catch (error) {
      const clash = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!clash) throw error;
      if (explicit) return null;
    }
  }
  return write(randomSlug(slug));
}

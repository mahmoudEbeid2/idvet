import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryOptions, listAdminProducts } from "@/lib/admin/data";
import { getAdminT } from "@/lib/admin/lang";
import { Card, MissingBadge, Notice, PageHeader, StatusBadge } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).products.title };
}

type Search = { q?: string; category?: string; status?: string; deleted?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const filter = {
    q: typeof params.q === "string" ? params.q : "",
    category: typeof params.category === "string" ? params.category : "",
    status: typeof params.status === "string" ? params.status : "",
  };
  const [{ products, total }, categories, t] = await Promise.all([
    listAdminProducts(filter),
    getCategoryOptions(),
    getAdminT(),
  ]);
  const filtered = Boolean(filter.q || filter.category || filter.status);

  return (
    <>
      <PageHeader
        title={t.products.title}
        description={t.products.inCatalog(t.count.products(total))}
        actions={
          <Link href="/admin/products/new" className={`${s.btn} ${s.primary}`}>
            {t.products.newProduct}
          </Link>
        }
      />
      {params.deleted && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="ok">{t.products.deleted}</Notice>
        </div>
      )}
      <form className={s.filters} method="get" role="search">
        <input
          className={`${s.in} ${s.q}`}
          name="q"
          type="search"
          defaultValue={filter.q}
          placeholder={t.products.searchPlaceholder}
          aria-label={t.products.search}
        />
        <select className={s.in} name="category" defaultValue={filter.category} aria-label={t.products.category}>
          <option value="">{t.products.allCategories}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className={s.in} name="status" defaultValue={filter.status} aria-label={t.products.status}>
          <option value="">{t.products.allStatuses}</option>
          <option value="published">{t.common.published}</option>
          <option value="draft">{t.common.draft}</option>
        </select>
        <button className={`${s.btn} ${s.secondary}`} type="submit">
          {t.products.filter}
        </button>
        {filtered && (
          <Link href="/admin/products" className={s.link}>
            {t.products.clearFilter}
          </Link>
        )}
      </form>
      <Card>
        {products.length ? (
          <ul className={s.rows}>
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className={s.row}>
                  <span className={s.thumb} style={{ background: p.color }}>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" loading="lazy" />
                    ) : (
                      t.common.noImage
                    )}
                  </span>
                  <span className={s.rowText}>
                    <b>{p.name}</b>
                    <span>
                      {[p.category, p.brand, p.code].filter(Boolean).map((part, i) => (
                        <span key={i}>
                          {i > 0 && " · "}
                          <bdi>{part}</bdi>
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className={s.badges}>
                    <MissingBadge langs={p.missing} t={t} />
                    <span className={`${s.badge} ${s.bGray}`}>{t.count.images(p.images)}</span>
                    <span className={`${s.badge} ${s.bGray}`}>{t.count.certificates(p.certificates)}</span>
                    <StatusBadge published={p.published} t={t} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.empty}>
            {filtered ? t.products.noMatch : t.products.empty}{" "}
            <Link href="/admin/products/new" className={s.link}>
              {t.products.addOne}
            </Link>
          </p>
        )}
      </Card>
    </>
  );
}

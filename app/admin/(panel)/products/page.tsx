import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryOptions, listAdminProducts } from "@/lib/admin/data";
import {
  CERTS,
  Card,
  IMAGES,
  MissingBadge,
  Notice,
  PRODUCTS,
  PageHeader,
  StatusBadge,
  arCount,
} from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "المنتجات" };

type Search = { q?: string; category?: string; status?: string; deleted?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const filter = {
    q: typeof params.q === "string" ? params.q : "",
    category: typeof params.category === "string" ? params.category : "",
    status: typeof params.status === "string" ? params.status : "",
  };
  const [{ products, total }, categories] = await Promise.all([listAdminProducts(filter), getCategoryOptions()]);
  const filtered = Boolean(filter.q || filter.category || filter.status);

  return (
    <>
      <PageHeader
        title="المنتجات"
        description={`${arCount(total, PRODUCTS)} في الكتالوج.`}
        actions={
          <Link href="/admin/products/new" className={`${s.btn} ${s.primary}`}>
            منتج جديد
          </Link>
        }
      />
      {params.deleted && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="ok">تم حذف المنتج وملفاته.</Notice>
        </div>
      )}
      <form className={s.filters} method="get" role="search">
        <input
          className={`${s.in} ${s.q}`}
          name="q"
          type="search"
          defaultValue={filter.q}
          placeholder="بحث بالاسم أو الاسم التجاري…"
          aria-label="بحث"
        />
        <select className={s.in} name="category" defaultValue={filter.category} aria-label="القسم">
          <option value="">كل الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className={s.in} name="status" defaultValue={filter.status} aria-label="الحالة">
          <option value="">كل الحالات</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
        </select>
        <button className={`${s.btn} ${s.secondary}`} type="submit">
          تصفية
        </button>
        {filtered && (
          <Link href="/admin/products" className={s.link}>
            مسح التصفية
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
                      "بدون صورة"
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
                    <MissingBadge langs={p.missing} />
                    <span className={`${s.badge} ${s.bGray}`}>{arCount(p.images, IMAGES)}</span>
                    <span className={`${s.badge} ${s.bGray}`}>{arCount(p.certificates, CERTS)}</span>
                    <StatusBadge published={p.published} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.empty}>
            {filtered ? "لا توجد منتجات مطابقة." : "لا توجد منتجات بعد."}{" "}
            <Link href="/admin/products/new" className={s.link}>
              أضف منتجاً
            </Link>
          </p>
        )}
      </Card>
    </>
  );
}

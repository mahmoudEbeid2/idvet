import Link from "next/link";
import { getDashboard } from "@/lib/admin/data";
import { getAdminT } from "@/lib/admin/lang";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export default async function DashboardPage() {
  const [{ counts, recent }, t] = await Promise.all([getDashboard(), getAdminT()]);

  return (
    <>
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.description}
        actions={
          <>
            <Link href="/admin/categories/new" className={`${s.btn} ${s.secondary}`}>
              {t.dashboard.newCategory}
            </Link>
            <Link href="/admin/products/new" className={`${s.btn} ${s.primary}`}>
              {t.dashboard.newProduct}
            </Link>
          </>
        }
      />
      <div className={s.stats}>
        <Link href="/admin/products" className={s.stat}>
          <p>{t.dashboard.products}</p>
          <b>{counts.products}</b>
          <small>{t.dashboard.publishedCount(counts.published)}</small>
        </Link>
        <Link href="/admin/categories" className={s.stat}>
          <p>{t.dashboard.categories}</p>
          <b>{counts.categories}</b>
        </Link>
        <div className={s.stat}>
          <p>{t.dashboard.images}</p>
          <b>{counts.images}</b>
        </div>
        <div className={s.stat}>
          <p>{t.dashboard.certificates}</p>
          <b>{counts.certificates}</b>
        </div>
      </div>
      <Card
        title={t.dashboard.recent}
        actions={
          <Link href="/admin/products" className={s.link}>
            {t.dashboard.allProducts}
          </Link>
        }
      >
        {recent.length ? (
          <ul className={s.rows}>
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className={s.row}>
                  <span className={s.rowText}>
                    <b>
                      {p.name} <span className={s.rowSub}>{p.category}</span>
                    </b>
                  </span>
                  <span className={s.rowSub}>
                    {t.count.images(p.images)} · {t.count.certificates(p.certificates)}
                  </span>
                  <StatusBadge published={p.published} t={t} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.empty}>
            {t.dashboard.empty}{" "}
            <Link href="/admin/products/new" className={s.link}>
              {t.dashboard.addFirst}
            </Link>
          </p>
        )}
      </Card>
    </>
  );
}

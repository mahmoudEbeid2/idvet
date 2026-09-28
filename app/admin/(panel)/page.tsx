import Link from "next/link";
import { getDashboard } from "@/lib/admin/data";
import { Card, CERTS, IMAGES, PageHeader, StatusBadge, arCount } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export default async function DashboardPage() {
  const { counts, recent } = await getDashboard();

  return (
    <>
      <PageHeader
        title="الرئيسية"
        description="ملخص الكتالوج. كل ما تضيفه هنا يظهر مباشرة في صفحة المنتجات على الموقع."
        actions={
          <>
            <Link href="/admin/categories/new" className={`${s.btn} ${s.secondary}`}>
              قسم جديد
            </Link>
            <Link href="/admin/products/new" className={`${s.btn} ${s.primary}`}>
              منتج جديد
            </Link>
          </>
        }
      />
      <div className={s.stats}>
        <Link href="/admin/products" className={s.stat}>
          <p>المنتجات</p>
          <b>{counts.products}</b>
          <small>{counts.published} منشور</small>
        </Link>
        <Link href="/admin/categories" className={s.stat}>
          <p>الأقسام</p>
          <b>{counts.categories}</b>
        </Link>
        <div className={s.stat}>
          <p>الصور</p>
          <b>{counts.images}</b>
        </div>
        <div className={s.stat}>
          <p>شهادات PDF</p>
          <b>{counts.certificates}</b>
        </div>
      </div>
      <Card
        title="آخر المنتجات المعدّلة"
        actions={
          <Link href="/admin/products" className={s.link}>
            كل المنتجات
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
                    {arCount(p.images, IMAGES)} · {arCount(p.certificates, CERTS)}
                  </span>
                  <StatusBadge published={p.published} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.empty}>
            لا توجد منتجات بعد.{" "}
            <Link href="/admin/products/new" className={s.link}>
              أضف أول منتج
            </Link>
          </p>
        )}
      </Card>
    </>
  );
}

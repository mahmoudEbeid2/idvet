import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCategories } from "@/lib/admin/data";
import { Card, MissingBadge, Notice, PRODUCTS, PageHeader, arCount } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "الأقسام" };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string }>;
}) {
  const [categories, { created, deleted }] = await Promise.all([listAdminCategories(), searchParams]);

  return (
    <>
      <PageHeader
        title="الأقسام"
        description="كل قسم له صفحة خاصة على الموقع تعرض المنتجات التابعة له."
        actions={
          <Link href="/admin/categories/new" className={`${s.btn} ${s.primary}`}>
            قسم جديد
          </Link>
        }
      />
      {(created || deleted) && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="ok">{created ? "تمت إضافة القسم." : "تم حذف القسم."}</Notice>
        </div>
      )}
      <Card>
        {categories.length ? (
          <ul className={s.rows}>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/categories/${c.id}`} className={s.row}>
                  <span className={s.catIc} style={{ background: c.color }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.icon} alt="" />
                  </span>
                  <span className={s.rowText}>
                    <b>{c.nameAr}</b>
                    <span>
                      {c.nameKu && <>{c.nameKu} · </>}
                      {c.nameEn && (
                        <>
                          <bdi>{c.nameEn}</bdi> ·{" "}
                        </>
                      )}
                      <span className={s.latin}>/{c.slug}</span>
                    </span>
                  </span>
                  <span className={s.badges}>
                    <MissingBadge langs={c.missing} />
                    <span className={`${s.badge} ${s.bBlue}`}>{arCount(c.productCount, PRODUCTS)}</span>
                    <span className={s.latin} style={{ fontSize: 12, color: "var(--muted-3)" }}>
                      #{c.sortOrder}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.empty}>
            لا توجد أقسام بعد.{" "}
            <Link href="/admin/categories/new" className={s.link}>
              أضف قسماً
            </Link>
          </p>
        )}
      </Card>
    </>
  );
}

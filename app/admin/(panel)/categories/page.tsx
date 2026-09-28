import type { Metadata } from "next";
import Link from "next/link";
import { listAdminCategories } from "@/lib/admin/data";
import { getAdminT } from "@/lib/admin/lang";
import { Card, MissingBadge, Notice, PageHeader } from "@/components/admin/ui";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).categories.title };
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string }>;
}) {
  const [categories, { created, deleted }, t] = await Promise.all([listAdminCategories(), searchParams, getAdminT()]);

  return (
    <>
      <PageHeader
        title={t.categories.title}
        description={t.categories.description}
        actions={
          <Link href="/admin/categories/new" className={`${s.btn} ${s.primary}`}>
            {t.categories.newCategory}
          </Link>
        }
      />
      {(created || deleted) && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="ok">{created ? t.categories.created : t.categories.deleted}</Notice>
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
                    <b>{c.name}</b>
                    <span>
                      {c.otherNames.map((name) => (
                        <span key={name}>
                          <bdi>{name}</bdi> ·{" "}
                        </span>
                      ))}
                      <span className={s.latin}>/{c.slug}</span>
                    </span>
                  </span>
                  <span className={s.badges}>
                    <MissingBadge langs={c.missing} t={t} />
                    <span className={`${s.badge} ${s.bBlue}`}>{t.count.products(c.productCount)}</span>
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
            {t.categories.empty}{" "}
            <Link href="/admin/categories/new" className={s.link}>
              {t.categories.addOne}
            </Link>
          </p>
        )}
      </Card>
    </>
  );
}

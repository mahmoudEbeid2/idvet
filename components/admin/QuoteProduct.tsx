import Link from "next/link";
import type { QuoteProductDetail } from "@/lib/admin/data";
import type { AdminMessages } from "@/lib/admin/i18n";
import { Card, StatusBadge } from "./ui";
import s from "./admin.module.css";

/**
 * The requested product on a quote's page, with what its public page shows.
 * When the product was deleted since, the snapshot saved with the request.
 */
export function QuoteProduct({
  product,
  snapshot,
  t,
}: {
  product: QuoteProductDetail | null;
  snapshot: { name: string; slug: string | null; image: string | null };
  t: AdminMessages;
}) {
  if (!product) {
    return (
      <Card title={t.inbox.product}>
        <div className={s.qp}>
          <ProductImage src={snapshot.image} t={t} />
          <div className={s.qpInfo}>
            <h3>
              <bdi>{snapshot.name}</bdi>
            </h3>
            {snapshot.slug && (
              <p className={s.qpMuted}>
                <bdi className={s.latin}>/{snapshot.slug}</bdi>
              </p>
            )}
            <p className={s.qpGone}>
              <b>{t.inbox.productGone}</b>
              {t.inbox.productGoneDetail}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const specs: [string, React.ReactNode][] = (
    [
      [t.productForm.brand, product.brand && (
        <>
          <span className={s.latin}>{product.brand}</span>
          {product.brandCountry && ` — ${product.brandCountry}`}
        </>
      )],
      [t.products.category, product.category],
      [t.productForm.dosageForm, product.dosageForm],
      [t.productForm.species, product.species],
      [t.productForm.packaging, product.packSizes.length > 0 && (
        <span className={s.qpChips}>
          {product.packSizes.map((size) => (
            <span key={size}>
              <bdi>{size}</bdi>
            </span>
          ))}
        </span>
      )],
    ] as [string, React.ReactNode][]
  ).filter(([, value]) => value);

  return (
    <Card
      title={t.inbox.product}
      actions={
        <div className={s.actions}>
          <a href={`/ar/products/${product.slug}`} target="_blank" rel="noopener" className={`${s.btn} ${s.secondary}`}>
            {t.common.viewOnSite}
          </a>
          <Link href={`/admin/products/${product.id}`} className={`${s.btn} ${s.secondary}`}>
            {t.inbox.editProduct}
          </Link>
        </div>
      }
    >
      <div className={s.qp}>
        <div className={s.qpMedia}>
          <ProductImage src={product.images[0] ?? null} color={product.color} t={t} />
          {product.images.length > 1 && (
            <div className={s.qpStrip}>
              {product.images.slice(1, 5).map((src) => (
                <a key={src} href={src} target="_blank" rel="noopener" style={{ background: product.color }} title={t.inbox.openImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className={s.qpInfo}>
          <div className={s.badges}>
            <h3>
              <bdi>{product.name}</bdi>
            </h3>
            <StatusBadge published={product.published} t={t} />
          </div>
          {product.code && (
            <p className={s.qpMuted}>
              <bdi className={s.latin}>{product.code}</bdi>
            </p>
          )}
          {product.otherNames.length > 0 && (
            <p className={s.qpMuted}>
              {t.inbox.otherNames}:{" "}
              {product.otherNames.map((n, i) => (
                <span key={n.lang}>
                  {i > 0 && " · "}
                  {t.common.langNames[n.lang]}: <bdi>{n.name}</bdi>
                </span>
              ))}
            </p>
          )}
          {product.summary && <p className={s.qpSummary}>{product.summary}</p>}
          {product.tags.length > 0 && (
            <span className={s.qpChips}>
              {product.tags.map((tag) => (
                <span key={tag}>
                  <bdi>{tag}</bdi>
                </span>
              ))}
            </span>
          )}
          {specs.length > 0 && (
            <dl className={s.dl}>
              {specs.map(([label, value]) => (
                <div key={label} style={{ display: "contents" }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {product.composition.length > 0 && (
            <div>
              <h4 className={s.qpH}>{t.productForm.composition}</h4>
              <table className={s.qpTable}>
                <tbody>
                  {product.composition.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <bdi>{row.ingredient}</bdi>
                      </td>
                      <td className={s.latin}>
                        <bdi>{row.amount}</bdi>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {product.indications.length > 0 && (
            <div>
              <h4 className={s.qpH}>{t.productForm.indications}</h4>
              <ul className={s.qpList}>
                {product.indications.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Main image, opening full size in a new tab. */
function ProductImage({ src, color, t }: { src: string | null; color?: string; t: AdminMessages }) {
  if (!src) {
    return (
      <span className={s.qpImg} style={{ background: color }}>
        {t.common.noImage}
      </span>
    );
  }
  return (
    <a href={src} target="_blank" rel="noopener" className={s.qpImg} style={{ background: color }} title={t.inbox.openImage}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" />
    </a>
  );
}

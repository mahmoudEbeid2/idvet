"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCertificate, moveCertificate, updateCertificate } from "@/app/admin/actions";
import type { AdminCertificate } from "@/lib/admin/data";
import { formatBytes } from "@/lib/catalog/format";
import { withFile } from "@/lib/admin/i18n";
import { useAdminT } from "./AdminLang";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { EarlierIcon, LaterIcon } from "./ImageManager";
import { upload } from "./upload";
import { Card, Field } from "./ui";
import s from "./admin.module.css";

const MAX_BYTES = 20 * 1024 * 1024;

function CertificateFields({ certificate }: { certificate?: AdminCertificate }) {
  const t = useAdminT();
  const c = t.certificates;
  return (
    <>
      <div className={s.grid3}>
        <Field label={c.titleKu}>
          <input name="titleKu" className={s.in} dir="rtl" lang="ckb" placeholder="بڕوانامەی شیکاری" defaultValue={certificate?.titleKu} />
        </Field>
        <Field label={c.titleAr}>
          <input name="titleAr" className={s.in} dir="rtl" lang="ar" placeholder="شهادة تحليل المنتج (COA)" defaultValue={certificate?.titleAr} />
        </Field>
        <Field label={c.titleEn}>
          <input name="titleEn" className={`${s.in} ${s.latin}`} lang="en" placeholder="Certificate of Analysis" defaultValue={certificate?.titleEn} />
        </Field>
      </div>
      <div className={s.grid2}>
        <Field label={c.issuer} hint={t.common.optional}>
          <input name="issuer" className={s.in} dir="auto" placeholder="SGS" defaultValue={certificate?.issuer} />
        </Field>
        <Field label={c.issuedOn} hint={c.issuedOnHint}>
          <input name="issuedOn" className={`${s.in} ${s.latin}`} placeholder="03/2026" defaultValue={certificate?.issuedOn} />
        </Field>
      </div>
    </>
  );
}

export function CertificateManager({ productId, certificates }: { productId: string; certificates: AdminCertificate[] }) {
  const router = useRouter();
  const t = useAdminT();
  const [items, setItems] = useState(certificates);
  const serverKey = certificates.map((c) => `${c.id}:${c.titleKu}:${c.titleAr}:${c.titleEn}:${c.issuer}:${c.issuedOn}`).join();
  const [seenKey, setSeenKey] = useState(serverKey);
  if (serverKey !== seenKey) {
    setSeenKey(serverKey);
    setItems(certificates);
  }

  const [editing, setEditing] = useState<string | null>(null);
  const [editError, setEditError] = useState<string>();
  const [saving, startSaving] = useTransition();
  const [, startTransition] = useTransition();

  const [progress, setProgress] = useState<number | null>(null);
  const [addNotice, setAddNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    setItems((list) => {
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    startTransition(async () => {
      await moveCertificate(items[index].id, direction);
      router.refresh();
    });
  }

  async function remove(id: string) {
    await deleteCertificate(id);
    setItems((list) => list.filter((c) => c.id !== id));
    router.refresh();
  }

  function saveEdit(id: string, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startSaving(async () => {
      const result = await updateCertificate(id, form);
      if (result.error) {
        setEditError(result.error);
        return;
      }
      setEditing(null);
      setEditError(undefined);
      router.refresh();
    });
  }

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form);
    const file = body.get("file");
    if (!(file instanceof File) || file.size === 0) return setAddNotice({ tone: "err", text: t.errors.choosePdf });
    if (file.size > MAX_BYTES) return setAddNotice({ tone: "err", text: withFile(file.name, t.errors.tooBig(20)) });
    if (!["titleKu", "titleAr", "titleEn"].some((name) => String(body.get(name) ?? "").trim())) {
      return setAddNotice({ tone: "err", text: t.errors.certificateTitleRequired });
    }
    body.set("productId", productId);
    setAddNotice(null);
    setProgress(0);
    try {
      await upload("/api/admin/uploads/certificate", body, t, setProgress);
      form.reset();
      setAddNotice({ tone: "ok", text: t.certificates.added });
      router.refresh();
    } catch (error) {
      setAddNotice({ tone: "err", text: (error as Error).message });
    } finally {
      setProgress(null);
    }
  }

  return (
    <Card id="certificates" title={t.certificates.title} description={t.certificates.description}>
      <div className={s.stack}>
        {items.length > 0 && (
          <ul className={s.certs}>
            {items.map((certificate, i) => (
              <li key={certificate.id}>
                <div className={s.certLine}>
                  <span className={s.pdfTag}>PDF</span>
                  <span className={s.certText}>
                    <b>{certificate.titleAr || certificate.titleKu || certificate.titleEn}</b>
                    <span>
                      {[certificate.issuer, certificate.issuedOn, formatBytes(certificate.size)]
                        .filter(Boolean)
                        .map((part, j) => (
                          <span key={j}>
                            {j > 0 && " · "}
                            <bdi>{part}</bdi>
                          </span>
                        ))}
                      {certificate.missing.length > 0 &&
                        ` · ${t.common.missing(certificate.missing.map((l) => t.common.langNames[l]).join(t.common.listSep))}`}
                    </span>
                  </span>
                  <span className={s.certTools}>
                    <a href={certificate.src} target="_blank" rel="noopener" className={s.link}>
                      {t.common.open}
                    </a>
                    <button
                      type="button"
                      className={s.link}
                      aria-expanded={editing === certificate.id}
                      onClick={() => {
                        setEditError(undefined);
                        setEditing(editing === certificate.id ? null : certificate.id);
                      }}
                    >
                      {t.common.edit}
                    </button>
                    <button type="button" className={s.iconBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label={t.common.earlier} title={t.common.earlier}>
                      <EarlierIcon />
                    </button>
                    <button
                      type="button"
                      className={s.iconBtn}
                      disabled={i === items.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label={t.common.later}
                      title={t.common.later}
                    >
                      <LaterIcon />
                    </button>
                    <ConfirmDeleteButton label={t.common.delete} variant="del" onConfirm={() => remove(certificate.id)} />
                  </span>
                </div>
                {editing === certificate.id && (
                  <form method="post" className={s.editBox} onSubmit={(e) => saveEdit(certificate.id, e)}>
                    <CertificateFields certificate={certificate} />
                    {editError && (
                      <p className={`${s.notice} ${s.err}`} role="alert">
                        {editError}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" className={`${s.btn} ${s.primary}`} disabled={saving}>
                        {saving ? t.common.saving : t.common.save}
                      </button>
                      <button type="button" className={`${s.btn} ${s.secondary}`} onClick={() => setEditing(null)}>
                        {t.common.cancel}
                      </button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        <form method="post" className={s.addBox} onSubmit={add} noValidate>
          <b>{t.certificates.add}</b>
          <Field label={t.certificates.file} htmlFor="certificate-file">
            <input id="certificate-file" name="file" type="file" className={s.fileIn} accept="application/pdf,.pdf" />
          </Field>
          <CertificateFields />
          {progress !== null && (
            <span className={s.progress} role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${Math.round(progress * 100)}%` }} />
            </span>
          )}
          {addNotice && (
            <p className={`${s.notice} ${addNotice.tone === "ok" ? s.ok : s.err}`} role={addNotice.tone === "err" ? "alert" : "status"}>
              {addNotice.text}
            </p>
          )}
          <div>
            <button className={`${s.btn} ${s.primary}`} type="submit" disabled={progress !== null}>
              {progress !== null ? t.certificates.uploading(Math.round(progress * 100)) : t.certificates.upload}
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}

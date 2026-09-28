"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CertificateView } from "@/lib/catalog/data";
import { formatBytes } from "@/lib/catalog/format";
import { CloseIcon, DocIcon, DownloadIcon, ExternalIcon, EyeIcon, PdfFileIcon } from "./icons";
import { useModal } from "./useModal";
import s from "./catalog.module.css";

interface Labels {
  heading: string;
  /** e.g. "3 ملفات PDF"; empty when there are no certificates. */
  countLabel: string;
  empty: string;
  view: string;
  openInNewTab: string;
  download: string;
  close: string;
}

/**
 * Phones and tablets can't show an embedded PDF usefully (iOS renders only the
 * first page), so there each row is a plain link that opens a new tab. On a
 * desktop the click is intercepted and the PDF opens in the in-page viewer.
 */
function canEmbedPdf() {
  return window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
}

export function CertificateList({ certificates, labels }: { certificates: CertificateView[]; labels: Labels }) {
  const [open, setOpen] = useState<CertificateView | null>(null);

  return (
    <section className={s.certs} aria-label={labels.heading}>
      <div className={s.certsHead}>
        <h2>
          <DocIcon /> {labels.heading}
        </h2>
        {labels.countLabel && <span>{labels.countLabel}</span>}
      </div>
      {certificates.length === 0 ? (
        <p className={s.noCerts}>{labels.empty}</p>
      ) : (
        certificates.map((certificate) => (
          <a
            key={certificate.id}
            href={certificate.src}
            target="_blank"
            rel="noopener"
            className={s.cert}
            onClick={(e) => {
              if (!canEmbedPdf()) return;
              e.preventDefault();
              setOpen(certificate);
            }}
          >
            <span className={s.certFile}>
              <PdfFileIcon />
            </span>
            <span className={s.certText}>
              <b>{certificate.title}</b>
              <small>
                {[certificate.issuer, certificate.issuedOn, formatBytes(certificate.size)]
                  .filter(Boolean)
                  .map((part, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      <bdi className={s.latin}>{part}</bdi>
                    </span>
                  ))}
              </small>
            </span>
            <span className={s.certView}>
              <EyeIcon /> {labels.view}
            </span>
          </a>
        ))
      )}
      {open && <PdfViewer certificate={open} labels={labels} onClose={() => setOpen(null)} />}
    </section>
  );
}

function PdfViewer({
  certificate,
  labels,
  onClose,
}: {
  certificate: CertificateView;
  labels: Labels;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useModal(closeRef, onClose);
  const fileName = `${certificate.title || "certificate"}.pdf`.replace(/[\\/:*?"<>|]+/g, " ");

  // Portalled to <body>: a sticky ancestor would otherwise trap it under the site header.
  return createPortal(
    <div className={s.modal} role="dialog" aria-modal="true" aria-label={certificate.title}>
      <div className={s.mBar}>
        <div className={s.mTitle}>
          <span className={s.certFile} style={{ width: 26, height: 32 }}>
            <PdfFileIcon />
          </span>
          <span>{certificate.title}</span>
        </div>
        <div className={s.mTools}>
          <a href={certificate.src} target="_blank" rel="noopener" aria-label={labels.openInNewTab} title={labels.openInNewTab}>
            <ExternalIcon />
          </a>
          <a href={certificate.src} download={fileName} aria-label={labels.download} title={labels.download}>
            <DownloadIcon />
          </a>
          <span className={s.mSep} />
          <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close} title={labels.close}>
            <CloseIcon />
          </button>
        </div>
      </div>
      <div
        className={s.mBody}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <iframe className={s.pdfFrame} src={certificate.src} title={certificate.title} />
      </div>
    </div>,
    document.body,
  );
}

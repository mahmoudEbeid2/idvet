// Icons from docs/design/products-page.html. Directional ones are drawn for
// RTL (forward points left); pass the `flip` class to mirror them for LTR.

type IconProps = { className?: string };

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Points toward the "next" side (left in RTL). */
export function NextIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Points toward the "previous" side (right in RTL). */
export function PrevIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ZoomIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M13 13l4 4M9 6.5v5M6.5 9h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3v10m-4-4 4 4 4-4M4 16h12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExternalIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M11 3h6v6M17 3l-8 8M14 12v4H4V6h4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="6" cy="7" r="1.3" fill="currentColor" />
      <path d="M3 12l4-3 3 2 3-2" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

export function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 2h7l4 4v12H5z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <circle cx="10" cy="10" r="2.3" fill="currentColor" />
    </svg>
  );
}

export function PdfFileIcon() {
  return (
    <svg viewBox="0 0 40 48" aria-hidden="true">
      <path d="M3 2h24l10 10v34H3z" fill="#fff" stroke="#d6d9dd" strokeWidth="1.5" />
      <path d="M27 2v10h10" fill="#eef0f2" stroke="#d6d9dd" strokeWidth="1.5" />
      <rect x="0" y="26" width="28" height="13" rx="2" fill="#c8413b" />
      <text x="14" y="36" textAnchor="middle" fontFamily="Roboto,Arial" fontWeight="700" fontSize="9" fill="#fff">
        PDF
      </text>
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 5h14M6 10h8M8.5 15h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"
      />
    </svg>
  );
}

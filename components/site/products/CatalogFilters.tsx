"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FacetOption } from "@/lib/catalog/data";
import { type CatalogFilters as Filters, filtersQuery } from "@/lib/catalog/filters";
import { CloseIcon, FilterIcon } from "./icons";
import { useModal } from "./useModal";
import { tint } from "./tint";
import s from "./catalog.module.css";

interface Labels {
  filtersHeading: string;
  filtersButton: string;
  brandFilter: string;
  categoryFilter: string;
  showResults: string;
  clearAll: string;
  close: string;
  sortApply: string;
}

/**
 * Brand and category checkboxes. A GET form, so filtering works without
 * JavaScript (the Apply button is only shown then); with JS each tick
 * navigates straight away and the server renders the filtered list, so the
 * URL is always the shareable state. Below 900px the panel is a drawer.
 */
export function CatalogFilters({
  base,
  filters,
  brands,
  categories,
  resultText,
  labels,
}: {
  /** /{locale}/products */
  base: string;
  filters: Filters;
  brands: FacetOption[];
  categories: FacetOption[];
  /** e.g. "12 products", for the drawer's close button. */
  resultText: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useOptimistic(filters);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeCount = current.brands.length + current.categories.length;

  function toggle(key: "brands" | "categories", slug: string) {
    const values = current[key].includes(slug) ? current[key].filter((v) => v !== slug) : [...current[key], slug];
    const next = { ...current, [key]: values };
    startTransition(() => {
      setCurrent(next);
      router.push(`${base}${filtersQuery(next)}`, { scroll: false });
    });
  }

  const group = (key: "brands" | "categories", legend: string, options: FacetOption[]) =>
    options.length > 0 && (
      <fieldset className={s.fGroup}>
        <legend>{legend}</legend>
        {options.map((option) => {
          const checked = current[key].includes(option.slug);
          return (
            <label key={option.slug} className={s.fOption} data-empty={option.count === 0 && !checked ? "" : undefined}>
              <input
                type="checkbox"
                name={key === "brands" ? "brand" : "category"}
                value={option.slug}
                checked={checked}
                onChange={() => toggle(key, option.slug)}
              />
              {option.icon && (
                <span className={s.sideIcon} style={tint(option.color ?? "#f1f2f4")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={option.icon} alt="" />
                </span>
              )}
              <span className={key === "brands" ? s.latin : undefined}>{option.name}</span>
              <span className={s.n}>{option.count}</span>
            </label>
          );
        })}
      </fieldset>
    );

  return (
    <div className={s.fCol}>
      <button type="button" className={s.fToggle} onClick={() => setOpen(true)} aria-expanded={open}>
        <FilterIcon /> {labels.filtersButton}
        {activeCount > 0 && <span className={s.fBadge}>{activeCount}</span>}
      </button>

      {open && <div className={s.fBackdrop} onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className={s.filters} data-open={open ? "" : undefined} aria-busy={pending}>
        {open && <DrawerEffects closeRef={closeRef} onClose={() => setOpen(false)} />}
        <div className={s.fHead}>
          <h2>{labels.filtersHeading}</h2>
          {activeCount > 0 && (
            <Link href={`${base}${filtersQuery({ q: current.q, sort: current.sort })}`} scroll={false} className={s.fClear}>
              {labels.clearAll}
            </Link>
          )}
          <button ref={closeRef} type="button" className={s.fClose} onClick={() => setOpen(false)} aria-label={labels.close}>
            <CloseIcon />
          </button>
        </div>
        <form method="get" action={base} className={s.fForm}>
          {current.q && <input type="hidden" name="q" value={current.q} />}
          {current.sort !== "relevance" && <input type="hidden" name="sort" value={current.sort} />}
          {group("brands", labels.brandFilter, brands)}
          {group("categories", labels.categoryFilter, categories)}
          <noscript>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`}>
              {labels.sortApply}
            </button>
          </noscript>
        </form>
        <div className={s.fFoot}>
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setOpen(false)}>
            {labels.showResults} ({resultText})
          </button>
        </div>
      </div>
    </div>
  );
}

/** Escape, scroll lock and focus handling while the phone drawer is open. */
function DrawerEffects({ closeRef, onClose }: { closeRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  useModal(closeRef, onClose);
  return null;
}

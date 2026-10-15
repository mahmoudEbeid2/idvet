"use client";

import { useRouter } from "next/navigation";
import { type CatalogFilters, type SortKey, filtersQuery } from "@/lib/catalog/filters";
import s from "./catalog.module.css";

/**
 * A GET form, so sorting works without JavaScript (the Apply button is only
 * shown then). With JS, changing the select navigates straight away and the
 * server renders the sorted list; the choice stays in ?sort= next to the filters.
 */
export function SortSelect({
  base,
  filters,
  labels,
}: {
  /** /{locale}/products */
  base: string;
  filters: CatalogFilters;
  labels: { sortLabel: string; sortRelevance: string; sortName: string; sortBrand: string; sortApply: string };
}) {
  const router = useRouter();

  return (
    <form method="get" action={base} className={s.sortForm}>
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {filters.brands.map((brand) => (
        <input key={`b-${brand}`} type="hidden" name="brand" value={brand} />
      ))}
      {filters.categories.map((category) => (
        <input key={`c-${category}`} type="hidden" name="category" value={category} />
      ))}
      <label htmlFor="sort">{labels.sortLabel}</label>
      <select
        id="sort"
        name="sort"
        defaultValue={filters.sort}
        onChange={(e) => {
          const sort = e.currentTarget.value as SortKey;
          router.push(`${base}${filtersQuery({ ...filters, sort })}`, { scroll: false });
        }}
      >
        <option value="relevance">{labels.sortRelevance}</option>
        <option value="name">{labels.sortName}</option>
        <option value="brand">{labels.sortBrand}</option>
      </select>
      <noscript>
        <button type="submit">{labels.sortApply}</button>
      </noscript>
    </form>
  );
}

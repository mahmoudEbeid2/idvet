"use client";

import { usePathname, useRouter } from "next/navigation";
import type { SortKey } from "@/lib/catalog/data";
import s from "./catalog.module.css";

/**
 * A GET form, so sorting works without JavaScript (the Apply button is only
 * shown then). With JS, changing the select navigates straight away and the
 * server renders the sorted list; the choice stays in ?sort=.
 */
export function SortSelect({
  value,
  labels,
}: {
  value: SortKey;
  labels: { sortLabel: string; sortNewest: string; sortName: string; sortBrand: string; sortApply: string };
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <form method="get" className={s.sortForm}>
      <label htmlFor="sort" className={s.srOnly}>
        {labels.sortLabel}
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={value}
        onChange={(e) => {
          const sort = e.currentTarget.value;
          router.push(sort === "newest" ? pathname : `${pathname}?sort=${sort}`, { scroll: false });
        }}
      >
        <option value="newest">{labels.sortNewest}</option>
        <option value="name">{labels.sortName}</option>
        <option value="brand">{labels.sortBrand}</option>
      </select>
      <noscript>
        <button type="submit">{labels.sortApply}</button>
      </noscript>
    </form>
  );
}

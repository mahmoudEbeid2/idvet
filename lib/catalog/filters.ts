// The catalog's filter state lives in the URL so every filtered view is a
// shareable link: /products?q=…&brand=hipro&brand=vetcare&category=medicines&sort=name
// Pure functions only: used by the server pages and by client components.

export const SORT_KEYS = ["relevance", "name", "brand"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface CatalogFilters {
  q: string;
  /** Brand slugs (lib/catalog/brands.ts brandSlug). */
  brands: string[];
  /** Category slugs. */
  categories: string[];
  sort: SortKey;
}

export type SearchParams = Record<string, string | string[] | undefined>;

export const EMPTY_FILTERS: CatalogFilters = { q: "", brands: [], categories: [], sort: "relevance" };

/** Repeated params (?brand=a&brand=b, what a GET form sends) and comma lists both work. */
function list(value: string | string[] | undefined): string[] {
  const values = (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim().toLowerCase().slice(0, 80))
    .filter(Boolean);
  return [...new Set(values)].slice(0, 20).sort();
}

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  return SORT_KEYS.find((key) => key === v) ?? "relevance";
}

export function parseFilters(params: SearchParams): CatalogFilters {
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  return {
    q: q?.trim().slice(0, 100) ?? "",
    brands: list(params.brand),
    categories: list(params.category),
    sort: parseSort(params.sort),
  };
}

/** "?q=…&brand=…&category=…&sort=…" (or "") with values in a stable order. */
export function filtersQuery(filters: Partial<CatalogFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const brand of [...(filters.brands ?? [])].sort()) params.append("brand", brand);
  for (const category of [...(filters.categories ?? [])].sort()) params.append("category", category);
  if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(filters.q || filters.brands.length || filters.categories.length);
}

/**
 * The view is a plain landing page for one category or one brand (no search,
 * nothing else ticked): indexable, with its own canonical URL and title.
 */
export function landingFacet(filters: CatalogFilters): { kind: "category" | "brand"; slug: string } | null {
  if (filters.q || filters.sort !== "relevance") return null;
  if (filters.categories.length === 1 && filters.brands.length === 0) return { kind: "category", slug: filters.categories[0] };
  if (filters.brands.length === 1 && filters.categories.length === 0) return { kind: "brand", slug: filters.brands[0] };
  return null;
}

/** Lower-cased, Arabic diacritics/tatweel removed and letter variants folded, for search. */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/\s+/g, " ")
    .trim();
}

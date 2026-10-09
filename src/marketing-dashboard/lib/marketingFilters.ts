import { JOB_TITLES, JOB_TITLE_WEIGHT_SUM } from "@/marketing-dashboard/lib/marketingJobTitles";

export type MarketingFilterField = "unit" | "functiegroep" | "bron" | "campagne" | "ad" | "consultant" | "functietitel";
export type MarketingFilterOperator = "is" | "isNiet" | "bevat" | "bevatNiet";

export interface MarketingFilterRule {
  id: string;
  field: MarketingFilterField;
  operator: MarketingFilterOperator;
  value: string;
}

export type MarketingFilterValues = Partial<Record<MarketingFilterField, string | undefined>>;

export const marketingFilterLabels: Record<MarketingFilterField, string> = {
  unit: "Unit",
  functiegroep: "Functiegroep",
  bron: "Bron",
  campagne: "Campagne",
  ad: "Ad",
  consultant: "Consultant",
  functietitel: "Functietitel",
};

export const marketingOperatorLabels: Record<MarketingFilterOperator, string> = {
  is: "is",
  isNiet: "is niet",
  bevat: "bevat",
  bevatNiet: "bevat niet",
};

function normalize(value: string, field: MarketingFilterField) {
  let normalized = value.trim().toLocaleLowerCase("nl-NL").replace(/\s+/g, " ");
  if (field === "bron") {
    normalized = normalized.replace(/^rcm:\s*/, "").replace(/\.nl$/, "");
  }
  if (field === "unit" || field === "functiegroep") {
    const aliases: Record<string, string> = {
      engineer: "engineering",
      engineers: "engineering",
      monteur: "monteurs",
      operator: "operators",
    };
    normalized = aliases[normalized] ?? normalized;
  }
  return normalized;
}

export function matchesMarketingFilters(values: MarketingFilterValues, filters: MarketingFilterRule[]) {
  return filters.every((filter) => {
    const rawValue = values[filter.field];
    if (!rawValue) return true;
    const candidate = normalize(rawValue, filter.field);
    const terms = filter.value
      .split(",")
      .map((term) => normalize(term, filter.field))
      .filter(Boolean);
    if (terms.length === 0) return true;
    const exact = terms.some((term) => candidate === term);
    const contains = terms.some((term) => candidate.includes(term));
    if (filter.operator === "is") return exact;
    if (filter.operator === "isNiet") return !exact;
    if (filter.operator === "bevat") return contains;
    return !contains;
  });
}

export function filterMarketingRows<T>(
  rows: T[],
  filters: MarketingFilterRule[],
  getValues: (row: T) => MarketingFilterValues,
) {
  if (filters.length === 0) return rows;
  const share = jobTitleShare(filters);
  const kept = rows.filter((row) => matchesMarketingFilters(getValues(row), filters));
  return share === 1 ? kept : kept.map((row) => scaleCounts(row, share));
}

/** Weight share of synthetic job titles passing every functietitel rule (1 = no title filter). */
export function jobTitleShare(filters: MarketingFilterRule[]) {
  const titleRules = filters.filter((f) => f.field === "functietitel");
  if (titleRules.length === 0) return 1;
  const w = JOB_TITLES.filter((t) => matchesMarketingFilters({ functietitel: t.name }, titleRules)).reduce((s, t) => s + t.weight, 0);
  return w / JOB_TITLE_WEIGHT_SUM;
}

function scaleCounts<T>(value: T, share: number): T {
  if (Array.isArray(value)) return value.map((v) => scaleCounts(v, share)) as T;
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k,
    typeof v === "number" ? (/quality|score|pct|percent|rate|ratio|^cpa$|^cpr$|^bem$/i.test(k) ? v : Math.round(v * share))
      : typeof v === "object" ? scaleCounts(v, share) : v,
  ])) as T;
}
/** Clicking a table label toggles that value inside one multi-value "is" rule per field, shared by every tab. */
export function quickFilterValues(filters: MarketingFilterRule[], field: MarketingFilterField): string[] {
  const rule = filters.find((f) => f.id === `quick-${field}`);
  return rule ? rule.value.split(",").map((v) => v.trim()).filter(Boolean) : [];
}
export function toggleQuickFilter(filters: MarketingFilterRule[], field: MarketingFilterField, value: string): MarketingFilterRule[] {
  const id = `quick-${field}`;
  const current = quickFilterValues(filters, field);
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  const rest = filters.filter((f) => f.id !== id);
  return next.length ? [...rest, { id, field, operator: "is", value: next.join(", ") }] : rest;
}
export const isQuickFilter = (filters: MarketingFilterRule[], field: MarketingFilterField, value: string) => quickFilterValues(filters, field).includes(value);
/** Tables that own a quick filter keep showing unselected rows (dimmed) so they stay clickable. */
export const withoutQuickFilter = (filters: MarketingFilterRule[], field: MarketingFilterField) => filters.filter((f) => f.id !== `quick-${field}`);
export const quickDimClass = (filters: MarketingFilterRule[], field: MarketingFilterField, value: string) =>
  quickFilterValues(filters, field).length > 0 && !isQuickFilter(filters, field, value) ? "opacity-40" : "";

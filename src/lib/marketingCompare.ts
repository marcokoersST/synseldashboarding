import { differenceInDays, format, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export function getRangeDayCount(range: DateRange | null | undefined): number {
  if (!range?.from || !range?.to) return 0;
  return differenceInDays(range.to, range.from) + 1;
}

export function getDefaultCompareRange(range: DateRange): DateRange | null {
  if (!range.from || !range.to) return null;
  const days = getRangeDayCount(range);
  return {
    from: subDays(range.from, days),
    to: subDays(range.from, 1),
  };
}

export function areDateRangesEqual(
  a: DateRange | null | undefined,
  b: DateRange | null | undefined,
): boolean {
  return a?.from?.getTime() === b?.from?.getTime() && a?.to?.getTime() === b?.to?.getTime();
}

export function formatDateRangeLabel(range: DateRange | null | undefined): string {
  if (!range?.from) return "";
  if (!range.to) return format(range.from, "d MMM yyyy", { locale: nl });
  return `${format(range.from, "d MMM", { locale: nl })} – ${format(range.to, "d MMM yyyy", { locale: nl })}`;
}

export function getCompareDisplayText(range: DateRange | null | undefined): string {
  return range?.from && range?.to ? `t.a.v. ${formatDateRangeLabel(range)}` : "t.a.v. vorige periode";
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizedHash(value: string): number {
  return hashString(value) / 4294967295;
}

interface ComparisonValueOptions {
  dateRange: DateRange;
  compareRange?: DateRange | null;
  seed: string;
  minRatio?: number;
  maxRatio?: number;
}

export function getComparisonValue(current: number, options: ComparisonValueOptions): number {
  if (!Number.isFinite(current) || current <= 0) return 0;

  const resolvedCompareRange = options.compareRange ?? getDefaultCompareRange(options.dateRange);
  const currentDays = Math.max(getRangeDayCount(options.dateRange), 1);
  const compareDays = Math.max(getRangeDayCount(resolvedCompareRange), 1);
  const durationFactor = compareDays / currentDays;

  const variance = normalizedHash(
    `${options.seed}-${resolvedCompareRange?.from?.toISOString() ?? "na"}-${resolvedCompareRange?.to?.toISOString() ?? "na"}`,
  );

  const minRatio = options.minRatio ?? 0.78;
  const maxRatio = options.maxRatio ?? 1.12;
  const performanceFactor = minRatio + variance * (maxRatio - minRatio);

  return Math.max(0, Math.round(current * durationFactor * performanceFactor));
}
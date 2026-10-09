import type { DateRange } from "react-day-picker-v9";
import { getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";

export interface QualityRow {
  qualityScore?: number | undefined;
  conversions: number;
}

/** Conversion-weighted mean: parent scores and totals are never summed. */
export function aggregateQualityScore(rows: QualityRow[]): number {
  const scored = rows.filter((row) => typeof row.qualityScore === "number");
  const weight = scored.reduce((sum, row) => sum + Math.max(0, row.conversions), 0);
  if (weight === 0) return 0;
  return scored.reduce((sum, row) => sum + Math.min(100, Math.max(0, row.qualityScore ?? 0)) * Math.max(0, row.conversions), 0) / weight;
}

export function formatQualityScore(value: number): string {
  return Math.min(100, Math.max(0, value)).toLocaleString("nl-NL", { maximumFractionDigits: 1 });
}

/** Local historical scores vary by row and period, never by period length.
 * Historical conversion weights do account for duration, just like other comparisons.
 * Aggregate historical rows rather than generating a separate parent/total score.
 */
export function aggregateComparisonQualityScore(rows: QualityRow[], dateRange: DateRange, compareRange: DateRange | null): number {
  if (!compareRange?.from || !compareRange.to) return aggregateQualityScore(rows);
  return aggregateQualityScore(rows.map(row => {
    const seed = `quality-${JSON.stringify(row)}`;
    return {
      qualityScore: typeof row.qualityScore === "number"
        ? Math.min(100, getComparisonValue(row.qualityScore, { dateRange: compareRange, compareRange, seed, minRatio: 0.9, maxRatio: 1.1 }))
        : undefined,
      conversions: getComparisonValue(row.conversions, { dateRange, compareRange, seed: `${seed}-conversions` }),
    };
  }));
}
/** Synthetic demo factors so differently-titled quality scores show distinct values (base = per bemiddelbare kandidaat). */
export const QUALITY_FACTORS = { conv: 0.94, bem: 1, inschrijving: 1.06 } as const;

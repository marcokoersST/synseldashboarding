import { TrendingDown, TrendingUp } from "lucide-react";
import type { DateRange } from "react-day-picker-v9";
import { aggregateComparisonQualityScore, formatQualityScore, type QualityRow } from "@/marketing-dashboard/lib/marketingQuality";
import { getCompareDisplayText } from "@/marketing-dashboard/lib/marketingCompare";
import { cn } from "@/marketing-dashboard/lib/utils";

interface Props {
  value: number;
  rows: QualityRow[];
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaOnly?: boolean;
  /** Demo factor for the conversion-level score (derived from the placeable-candidate score). */
  factor?: number;
}

export default function QualityScoreComparison({ value, rows, dateRange, compareRange, deltaOnly = false, factor = 1 }: Props) {
  value = Math.min(100, value * factor);
  const previous = Math.min(100, aggregateComparisonQualityScore(rows, dateRange, compareRange) * factor);
  const delta = previous > 0 ? (value - previous) / previous * 100 : value === 0 ? 0 : null;
  const Icon = (delta ?? 0) < 0 ? TrendingDown : TrendingUp;
  return <span className="flex flex-col gap-0.5">
    {!deltaOnly && <span>{formatQualityScore(value)}</span>}
    {compareRange?.from && compareRange.to && <span data-quality-delta title={`${getCompareDisplayText(compareRange)} · Quality score: ${formatQualityScore(previous)}`} className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium leading-tight", delta === null || delta === 0 ? "text-muted-foreground" : delta > 0 ? "text-forecast-positive" : "text-destructive")}>
      {delta !== null && delta !== 0 && <Icon className="size-2.5 shrink-0" />}
      {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
    </span>}
  </span>;
}
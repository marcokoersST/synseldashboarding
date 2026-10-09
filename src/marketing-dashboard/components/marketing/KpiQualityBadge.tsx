import type { DateRange } from "react-day-picker-v9";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";
import { aggregateQualityScore, formatQualityScore, QUALITY_FACTORS, type QualityRow } from "@/marketing-dashboard/lib/marketingQuality";

const FACTORS: Record<string, number> = { Conversions: QUALITY_FACTORS.conv, "Bemiddelbare kandidaten": QUALITY_FACTORS.bem, Inschrijven: QUALITY_FACTORS.inschrijving };

const LABELS: Record<string, string> = {
  Conversions: "Quality score per\nconversion",
  "Bemiddelbare kandidaten": "Quality score per\nbemiddelbare kandidaat",
  Inschrijven: "Quality score per\ninschrijving",
};

export function hasKpiQuality(label: string) {
  return label in LABELS;
}

interface Props {
  label: string;
  rows: QualityRow[];
  dateRange: DateRange;
  compareRange: DateRange | null;
  size?: "sm" | "lg";
}

/** Right-aligned quality block for KPI tiles; label wraps to two fixed lines so all tiles align. */
export default function KpiQualityBadge({ label, rows, dateRange, compareRange, size = "sm" }: Props) {
  const text = LABELS[label];
  if (!text) return null;
  const factor = FACTORS[label] ?? 1;
  const base = aggregateQualityScore(rows);
  const score = base == null ? base : Math.min(100, base * factor);
  const lg = size === "lg";
  return (
    <div className={`ml-auto shrink-0 text-right ${lg ? "w-[118px] [@media(max-height:850px)]:w-[100px]" : "w-[108px]"}`}>
      <p className={`whitespace-pre-line leading-tight text-muted-foreground ${lg ? "text-[11px] [@media(max-height:850px)]:text-[9px]" : "text-[10px]"}`}>{text}</p>
      <div className="mt-0.5 flex items-baseline justify-end gap-1.5">
        <span className={`font-semibold tabular-nums text-foreground ${lg ? "text-lg [@media(max-height:850px)]:text-sm" : "text-sm"}`}>{formatQualityScore(score)}</span>
        <QualityScoreComparison value={base ?? 0} factor={factor} rows={rows} dateRange={dateRange} compareRange={compareRange} deltaOnly />
      </div>
    </div>
  );
}

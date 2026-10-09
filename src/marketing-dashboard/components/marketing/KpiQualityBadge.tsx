import type { DateRange } from "react-day-picker-v9";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";
import { aggregateQualityScore, formatQualityScore, QUALITY_FACTORS, type QualityRow } from "@/marketing-dashboard/lib/marketingQuality";

const FACTORS: Record<string, number> = { Conversions: QUALITY_FACTORS.conv, "Bemiddelbare kandidaten": QUALITY_FACTORS.bem, Inschrijven: QUALITY_FACTORS.inschrijving };

const LABELS: Record<string, string> = {
  Conversions: "Quality per conversion",
  "Bemiddelbare kandidaten": "Quality per bem. kandidaat",
  Inschrijven: "Quality per inschrijving",
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

/** Compact quality chip for the top-right corner of KPI tiles; fixed shape so all tiles align. */
export default function KpiQualityBadge({ label, rows, dateRange, compareRange, size = "sm" }: Props) {
  const text = LABELS[label];
  if (!text) return null;
  const factor = FACTORS[label] ?? 1;
  const base = aggregateQualityScore(rows);
  const score = base == null ? base : Math.min(100, base * factor);
  const lg = size === "lg";
  return (
    <div
      className={`ml-auto flex shrink-0 flex-col items-end justify-center rounded-md border border-border/60 bg-muted/40 px-2 text-right ${
        lg ? "py-1.5 [@media(max-height:850px)]:py-1" : "py-1"
      }`}
    >
      <p className={`whitespace-nowrap leading-none text-muted-foreground ${lg ? "text-[10px] [@media(max-height:850px)]:text-[9px]" : "text-[9px]"}`}>{text}</p>
      <div className="mt-1 flex items-baseline justify-end gap-1.5 leading-none">
        <span className={`font-semibold tabular-nums text-foreground ${lg ? "text-base [@media(max-height:850px)]:text-sm" : "text-sm"}`}>{formatQualityScore(score)}</span>
        <QualityScoreComparison value={base ?? 0} factor={factor} rows={rows} dateRange={dateRange} compareRange={compareRange} deltaOnly />
      </div>
    </div>
  );
}

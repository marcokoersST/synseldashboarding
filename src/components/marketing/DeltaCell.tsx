import { TrendingUp, TrendingDown } from "lucide-react";
import { getComparisonValue } from "@/lib/marketingCompare";
import { deltaPercent, formatCurrency } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

export type DeltaMode = "percent" | "absolute";

interface DeltaCellProps {
  value: number;
  dateRange: DateRange;
  compareRange: DateRange | null;
  seed: string;
  format?: "number" | "currency" | "percentage";
  invertDelta?: boolean;
  deltaMode?: DeltaMode;
  /** Optional explicit previous value. When provided, overrides seed-based calculation. */
  previousValue?: number;
}

const formatValue = (value: number, format: "number" | "currency" | "percentage") => {
  if (format === "currency") return formatCurrency(Math.round(value));
  if (format === "percentage") return `${value.toFixed(1)}%`;
  return value.toLocaleString("nl-NL");
};

const DeltaCell = ({ value, dateRange, compareRange, seed, format = "number", invertDelta = false, deltaMode = "percent", previousValue }: DeltaCellProps) => {
  const formatted = formatValue(value, format);

  if (!compareRange) return <>{formatted}</>;

  const prev = previousValue !== undefined
    ? previousValue
    : getComparisonValue(value, { dateRange, compareRange, seed });
  const delta = deltaPercent(value, prev);

  if (delta === null) return <>{formatted}</>;

  const absoluteDelta = value - prev;
  const isPos = invertDelta ? delta < 0 : delta > 0;

  const displayDelta = deltaMode === "absolute"
    ? `${absoluteDelta > 0 ? "+" : ""}${formatValue(Math.abs(absoluteDelta) === absoluteDelta ? absoluteDelta : absoluteDelta, format === "percentage" ? "percentage" : format)}`
    : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;

  return (
    <div className="flex flex-col items-start">
      <span>{formatted}</span>
      <span className={`flex items-center gap-0.5 text-[11px] leading-tight ${isPos ? "text-emerald-600" : "text-red-500"}`}>
        {isPos ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
        {displayDelta}
      </span>
    </div>
  );
};

export default DeltaCell;

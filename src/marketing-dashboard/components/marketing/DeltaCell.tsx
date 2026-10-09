import { TrendingUp, TrendingDown } from "lucide-react";
import { getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";
import { deltaPercent, formatCurrency } from "@/marketing-dashboard/data/marketingHubData";
import type { DateRange } from "react-day-picker-v9";

export type DeltaMode = "percent" | "absolute";

interface DeltaCellProps {
  value: number;
  dateRange: DateRange;
  compareRange: DateRange | null;
  seed: string;
  format?: "number" | "currency" | "percentage" | undefined;
  invertDelta?: boolean | undefined;
  deltaMode?: DeltaMode | undefined;
  /** Optional explicit previous value. When provided, overrides seed-based calculation. */
  previousValue?: number | undefined;
  /** Which way the value and its comparison line sit inside the cell. */
  align?: "start" | "end" | undefined;
}

const formatValue = (value: number, format: "number" | "currency" | "percentage") => {
  if (format === "currency") return formatCurrency(Math.round(value));
  if (format === "percentage") return `${value.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  return value.toLocaleString("nl-NL");
};

const DeltaCell = ({ value, dateRange, compareRange, seed, format = "number", invertDelta = false, deltaMode = "percent", previousValue, align = "start" }: DeltaCellProps) => {
  const formatted = formatValue(value, format);

  if (!compareRange) return <>{formatted}</>;

  const prev = previousValue !== undefined
    ? previousValue
    : getComparisonValue(value, { dateRange, compareRange, seed });
  const delta = deltaPercent(value, prev);

  if (delta === null) return <>{formatted}</>;

  const absoluteDelta = value - prev;
  const isPos = invertDelta ? delta < 0 : delta > 0;

  const formatAbs = (v: number) => {
    if (format === "currency") return `${v > 0 ? "+" : v < 0 ? "-" : ""}${formatCurrency(Math.abs(Math.round(v)))}`;
    if (format === "percentage") return `${v > 0 ? "+" : ""}${v.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}pp`;
    return `${v > 0 ? "+" : ""}${v.toLocaleString("nl-NL")}`;
  };
  const formatPct = (v: number) => `${v > 0 ? "+" : ""}${v.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const displayDelta = deltaMode === "absolute"
    ? formatAbs(absoluteDelta)
    : formatPct(delta);

  return (
    <div className={`delta-cell flex flex-col ${align === "end" ? "items-end" : "items-start"}`}>
      <span>{formatted}</span>
      <span className={`flex items-center gap-0.5 text-[11px] leading-tight ${isPos ? "text-emerald-600" : "text-red-500"}`}>
        {isPos ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
        {displayDelta}
      </span>
    </div>
  );
};

export default DeltaCell;

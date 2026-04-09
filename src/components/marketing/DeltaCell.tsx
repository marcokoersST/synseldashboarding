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
  format?: "number" | "currency";
  invertDelta?: boolean;
  deltaMode?: DeltaMode;
}

const DeltaCell = ({ value, dateRange, compareRange, seed, format = "number", invertDelta = false, deltaMode = "percent" }: DeltaCellProps) => {
  const formatted = format === "currency" ? formatCurrency(Math.round(value)) : value.toLocaleString("nl-NL");

  if (!compareRange) return <>{formatted}</>;

  const prev = getComparisonValue(value, { dateRange, compareRange, seed });
  const delta = deltaPercent(value, prev);

  if (delta === null) return <>{formatted}</>;

  const absoluteDelta = value - prev;
  const isPos = invertDelta ? delta < 0 : delta > 0;

  const displayDelta = deltaMode === "absolute"
    ? `${absoluteDelta > 0 ? "+" : ""}${format === "currency" ? formatCurrency(Math.round(absoluteDelta)) : absoluteDelta.toLocaleString("nl-NL")}`
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

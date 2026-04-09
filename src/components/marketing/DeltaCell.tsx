import { TrendingUp, TrendingDown } from "lucide-react";
import { getComparisonValue } from "@/lib/marketingCompare";
import { deltaPercent, formatCurrency } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

interface DeltaCellProps {
  value: number;
  dateRange: DateRange;
  compareRange: DateRange | null;
  seed: string;
  format?: "number" | "currency";
  invertDelta?: boolean;
}

const DeltaCell = ({ value, dateRange, compareRange, seed, format = "number", invertDelta = false }: DeltaCellProps) => {
  const formatted = format === "currency" ? formatCurrency(Math.round(value)) : value.toLocaleString("nl-NL");

  if (!compareRange) return <>{formatted}</>;

  const prev = getComparisonValue(value, { dateRange, compareRange, seed });
  const delta = deltaPercent(value, prev);

  if (delta === null) return <>{formatted}</>;

  const isPos = invertDelta ? delta < 0 : delta > 0;

  return (
    <div className="flex flex-col items-start">
      <span>{formatted}</span>
      <span className={`flex items-center gap-0.5 text-[11px] leading-tight ${isPos ? "text-emerald-600" : "text-red-500"}`}>
        {isPos ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
        {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
      </span>
    </div>
  );
};

export default DeltaCell;

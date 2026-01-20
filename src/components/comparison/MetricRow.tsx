import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricRowProps {
  label: string;
  userValue: number;
  compareValue: number;
  format?: "number" | "currency" | "percentage";
  showProgress?: boolean;
  progressMax?: number;
  delay?: number;
  icon?: React.ReactNode;
}

export function MetricRow({
  label,
  userValue,
  compareValue,
  format = "number",
  showProgress = false,
  progressMax = 100,
  delay = 0,
  icon,
}: MetricRowProps) {
  const difference = userValue - compareValue;
  const isPositive = difference > 0;
  const isNegative = difference < 0;
  const isEqual = difference === 0;

  const formatValue = (value: number) => {
    switch (format) {
      case "currency":
        if (value >= 1000000) {
          return `€${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
          return `€${(value / 1000).toFixed(0)}K`;
        }
        return `€${value}`;
      case "percentage":
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const formatDifference = (diff: number) => {
    const absValue = Math.abs(diff);
    switch (format) {
      case "currency":
        if (absValue >= 1000000) {
          return `€${(absValue / 1000000).toFixed(2)}M`;
        } else if (absValue >= 1000) {
          return `€${(absValue / 1000).toFixed(0)}K`;
        }
        return `€${absValue}`;
      case "percentage":
        return `${absValue.toFixed(1)}%`;
      default:
        return absValue.toString();
    }
  };

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center py-4 border-b border-border/50 last:border-0">
      {/* User Column (Left) */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            <AnimatedNumber
              value={userValue}
              delay={delay}
              formatFn={format === "currency" ? (v) => formatValue(v) : format === "percentage" ? (v) => `${v.toFixed(1)}%` : undefined}
            />
          </span>
          {/* Difference indicator */}
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              isPositive && "bg-emerald-500/10 text-emerald-500",
              isNegative && "bg-red-500/10 text-red-500",
              isEqual && "bg-muted text-muted-foreground"
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isEqual && <Minus className="w-3 h-3" />}
            <span>
              {isPositive ? "+" : isNegative ? "-" : ""}
              {formatDifference(difference)}
            </span>
          </div>
        </div>
        {showProgress && (
          <div className="w-full max-w-[200px]">
            <AnimatedProgress
              value={(userValue / progressMax) * 100}
              delay={delay + 100}
              className="h-2"
            />
          </div>
        )}
      </div>

      {/* Center Label */}
      <div className="flex flex-col items-center gap-1 min-w-[120px]">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <span className="text-sm font-medium text-muted-foreground text-center">
          {label}
        </span>
      </div>

      {/* Compare Column (Right) */}
      <div className="flex flex-col items-start gap-2">
        <span className="text-2xl font-bold text-foreground">
          <AnimatedNumber
            value={compareValue}
            delay={delay + 50}
            formatFn={format === "currency" ? (v) => formatValue(v) : format === "percentage" ? (v) => `${v.toFixed(1)}%` : undefined}
          />
        </span>
        {showProgress && (
          <div className="w-full max-w-[200px]">
            <AnimatedProgress
              value={(compareValue / progressMax) * 100}
              delay={delay + 150}
              className="h-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}

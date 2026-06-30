import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDurationHMS } from "@/data/callDashboardingData";

export interface HeroCounterProps {
  label: string;
  value: number;
  total?: number;
  previousValue?: number;
  previousTotal?: number;
  format?: "number" | "duration";
  tone?: "default" | "in" | "out" | "positive" | "negative";
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  hideShare?: boolean;
  className?: string;
  /** Override the share label. Default "van totaal". */
  shareLabel?: string;
  /** Lower-is-better: invert delta colors. */
  inverse?: boolean;
}

const toneClass: Record<NonNullable<HeroCounterProps["tone"]>, string> = {
  default: "text-foreground",
  in: "text-teal",
  out: "text-primary",
  positive: "text-success",
  negative: "text-destructive",
};

function formatAbs(value: number, format: "number" | "duration") {
  if (format === "duration") return formatDurationHMS(value);
  return new Intl.NumberFormat("nl-NL").format(Math.round(value));
}

export function HeroCounter({
  label,
  value,
  total,
  previousValue,
  previousTotal,
  format = "number",
  tone = "default",
  icon,
  size = "md",
  hideShare = false,
  className,
  shareLabel = "van totaal",
  inverse = false,
}: HeroCounterProps) {
  const share = total && total > 0 ? value / total : null;
  const prevShare =
    previousTotal && previousTotal > 0 && previousValue !== undefined
      ? previousValue / previousTotal
      : null;

  // For duration share denominator we'll typically be passed total-duration
  // already; the formula stays the same (value/total).

  const valueSize =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";

  // Delta: absolute change in value if no share, otherwise share pp change.
  let deltaNode: React.ReactNode = null;
  if (previousValue !== undefined) {
    if (share !== null && prevShare !== null) {
      const pp = (share - prevShare) * 100;
      const up = pp > 0.05;
      const down = pp < -0.05;
      const good = inverse ? down : up;
      const bad = inverse ? up : down;
      deltaNode = (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[11px] font-medium",
            good && "text-success",
            bad && "text-destructive",
            !good && !bad && "text-muted-foreground",
          )}
        >
          {up ? <ArrowUp className="h-3 w-3" /> : down ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {pp >= 0 ? "+" : ""}
          {pp.toFixed(1)} pp
        </span>
      );
    } else {
      const diff = value - previousValue;
      const pct = previousValue > 0 ? (diff / previousValue) * 100 : 0;
      const up = diff > 0;
      const down = diff < 0;
      const good = inverse ? down : up;
      const bad = inverse ? up : down;
      deltaNode = (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[11px] font-medium",
            good && "text-success",
            bad && "text-destructive",
            !good && !bad && "text-muted-foreground",
          )}
        >
          {up ? <ArrowUp className="h-3 w-3" /> : down ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {previousValue > 0 ? `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%` : "—"}
        </span>
      );
    }
  }

  return (
    <div className={cn("flex flex-col items-center text-center space-y-1", className)}>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("font-bold tabular-nums leading-tight", valueSize, toneClass[tone])}>
        {formatAbs(value, format)}
      </div>
      {(deltaNode || (!hideShare && share !== null)) ? (
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          {!hideShare && share !== null && (
            <span className="tabular-nums font-medium text-foreground/80">
              {(share * 100).toFixed(share < 0.1 ? 1 : 0)}%
              <span className="ml-1 text-muted-foreground font-normal">{shareLabel}</span>
            </span>
          )}
          {deltaNode}
        </div>
      ) : (
        <div className="text-[11px] invisible" aria-hidden>.</div>
      )}

    </div>
  );
}


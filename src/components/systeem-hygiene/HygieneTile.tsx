import { ChevronRight } from "lucide-react";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { cn } from "@/lib/utils";
import {
  ENTITY_LABEL,
  ENTITY_SUBTITLE,
  STATUS_COLOR,
  STATUS_LABEL,
  type EntityKey,
  type EntitySummary,
} from "@/data/systeemHygieneData";

interface Props {
  entity: EntityKey;
  summary: EntitySummary;
  variant: "major" | "minor";
  onOpen: (e: EntityKey) => void;
}

export function HygieneTile({ entity, summary, variant, onOpen }: Props) {
  const color = STATUS_COLOR[summary.status];
  const total = summary.distribution.incomplete + summary.distribution.outdatedComplete + summary.distribution.freshComplete;
  const seg = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const isMajor = variant === "major";

  return (
    <button
      type="button"
      onClick={() => onOpen(entity)}
      className={cn(
        "group w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40",
        isMajor ? "min-h-[420px] flex flex-col" : "min-h-[160px] flex flex-col",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-semibold text-foreground truncate", isMajor ? "text-lg" : "text-sm")}>{ENTITY_LABEL[entity]}</h3>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {STATUS_LABEL[summary.status]}
            </span>
          </div>
          {isMajor && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ENTITY_SUBTITLE[entity]}</p>}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>

      {/* Rings + counter */}
      <div className={cn("mt-3 flex items-center gap-4", !isMajor && "gap-3")}>
        <div className="relative shrink-0">
          <AnimatedRing value={summary.score} size={isMajor ? 96 : 60} strokeWidth={isMajor ? 9 : 6} strokeColor={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-bold tabular-nums text-foreground", isMajor ? "text-2xl" : "text-base")} style={{ color }}>
              <AnimatedNumber value={summary.score} />
            </span>
            {isMajor && <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Hygiene</span>}
          </div>
        </div>
        {isMajor && (
          <div className="relative shrink-0">
            <AnimatedRing value={summary.requiredScore} size={72} strokeWidth={7} strokeColor="hsl(var(--primary))" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-semibold tabular-nums text-foreground">
                <AnimatedNumber value={summary.requiredScore} suffix="%" />
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground text-center px-1">Verplichte velden</span>
            </div>
          </div>
        )}
        <div className="ml-auto text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Updated 7d</div>
          <div className={cn("font-semibold tabular-nums text-foreground", isMajor ? "text-2xl" : "text-base")}>
            <AnimatedNumber value={summary.updatedPastWeek} />
          </div>
          {isMajor && (
            <div className="text-[10px] text-muted-foreground mt-0.5">{summary.recordCount.toLocaleString()} records</div>
          )}
        </div>
      </div>

      {/* Stacked distribution bar */}
      <div className="mt-3">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-destructive transition-all" style={{ width: `${seg(summary.distribution.incomplete)}%` }} />
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${seg(summary.distribution.outdatedComplete)}%` }} />
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${seg(summary.distribution.freshComplete)}%` }} />
        </div>
        {isMajor && (
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <span><span className="inline-block w-2 h-2 rounded-sm bg-destructive align-middle mr-1" />Incompleet {summary.distribution.incomplete.toLocaleString()}</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-amber-500 align-middle mr-1" />Compleet, oud {summary.distribution.outdatedComplete.toLocaleString()}</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-emerald-500 align-middle mr-1" />Compleet & fresh {summary.distribution.freshComplete.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Score breakdown (major only) */}
      {isMajor && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Required (50%)", value: summary.requiredScore },
            { label: "Process (25%)", value: summary.adminScore },
            { label: "Freshness (25%)", value: summary.freshnessScore },
          ].map(b => (
            <div key={b.label} className="rounded-md border border-border bg-card/50 px-2 py-1.5">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground truncate">{b.label}</div>
              <div className="text-sm font-semibold tabular-nums text-foreground">{b.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick summary */}
      {isMajor && (
        <div className="mt-auto pt-3 text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {summary.quickSummary}
        </div>
      )}
    </button>
  );
}

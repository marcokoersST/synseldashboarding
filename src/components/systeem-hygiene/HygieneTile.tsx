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
  const total =
    summary.distribution.incomplete +
    summary.distribution.outdatedComplete +
    summary.distribution.freshComplete;
  const seg = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  if (variant === "minor") {
    return <MinorTile entity={entity} summary={summary} onOpen={onOpen} color={color} seg={seg} />;
  }

  const updatedPct = Math.round(
    (summary.updatedPastWeek / Math.max(summary.recordCount, 1)) * 100,
  );
  const addedPct = Math.round(
    (summary.addedPastWeek / Math.max(summary.recordCount, 1)) * 100,
  );

  return (
    <button
      type="button"
      onClick={() => onOpen(entity)}
      className="group flex h-full min-h-[460px] w-full flex-col rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-6 pb-4 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-foreground">{ENTITY_LABEL[entity]}</h3>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {STATUS_LABEL[summary.status]}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{ENTITY_SUBTITLE[entity]}</p>
        </div>
        <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      {/* Hero: ring + stat column */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-6 px-6 py-6">
        <div className="relative shrink-0">
          <AnimatedRing value={summary.score} size={132} strokeWidth={11} strokeColor={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Hygiene</span>
            <span className="mt-0.5 text-4xl font-bold leading-none tabular-nums" style={{ color }}>
              <AnimatedNumber value={summary.score} />
            </span>
            <span className="mt-1 text-[9px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <StatLine
            label="Records"
            value={summary.recordCount.toLocaleString("nl-NL")}
            sub="totaal"
          />
          <StatLine
            label="Added 7d"
            value={summary.addedPastWeek.toLocaleString("nl-NL")}
            sub={`${addedPct}% van totaal`}
          />
          <StatLine
            label="Updated 7d"
            value={summary.updatedPastWeek.toLocaleString("nl-NL")}
            sub={`${updatedPct}% van totaal`}
          />
        </div>
      </div>

      {/* Distribution band */}
      <div className="border-t border-border/60 px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Record verdeling</span>
          <span className="text-[10px] tabular-nums text-muted-foreground">{total.toLocaleString("nl-NL")}</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-destructive transition-all" style={{ width: `${seg(summary.distribution.incomplete)}%` }} />
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${seg(summary.distribution.outdatedComplete)}%` }} />
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${seg(summary.distribution.freshComplete)}%` }} />
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-1 text-[10px] sm:grid-cols-3">
          <LegendItem color="bg-destructive" label="Incompleet" value={summary.distribution.incomplete} />
          <LegendItem color="bg-amber-500" label="Compleet, oud" value={summary.distribution.outdatedComplete} />
          <LegendItem color="bg-emerald-500" label="Fresh" value={summary.distribution.freshComplete} />
        </div>
      </div>

      {/* Score breakdown */}
      <div className="border-t border-border/60 px-6 py-4">
        <div className="mb-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Score breakdown</div>
        <div className="space-y-2.5">
          <BreakdownRow label="Required" weight="50%" value={summary.requiredScore} />
          <BreakdownRow label="Process" weight="25%" value={summary.adminScore} />
          <BreakdownRow label="Freshness" weight="25%" value={summary.freshnessScore} />
        </div>
      </div>

      {/* Footer summary */}
      <div className="mt-auto flex min-h-[64px] items-start border-t border-border/60 px-6 py-3 text-[11px] leading-relaxed text-muted-foreground">
        <span className="line-clamp-2 block">{summary.quickSummary}</span>
      </div>
    </button>
  );
}

// ---- Minor tile ------------------------------------------------------------

function MinorTile({
  entity,
  summary,
  onOpen,
  color,
  seg,
}: {
  entity: EntityKey;
  summary: EntitySummary;
  onOpen: (e: EntityKey) => void;
  color: string;
  seg: (n: number) => number;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entity)}
      className="group flex h-full min-h-[170px] w-full flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{ENTITY_LABEL[entity]}</h3>
          <span
            className="inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {STATUS_LABEL[summary.status]}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="relative shrink-0">
          <AnimatedRing value={summary.score} size={68} strokeWidth={6} strokeColor={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold tabular-nums" style={{ color }}>
              <AnimatedNumber value={summary.score} />
            </span>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1.5">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Added 7d</div>
            <div className="text-base font-semibold tabular-nums text-foreground leading-none">
              <AnimatedNumber value={summary.addedPastWeek} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Updated 7d</div>
            <div className="text-base font-semibold tabular-nums text-foreground leading-none">
              <AnimatedNumber value={summary.updatedPastWeek} />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {summary.recordCount.toLocaleString("nl-NL")} records
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-destructive" style={{ width: `${seg(summary.distribution.incomplete)}%` }} />
          <div className="h-full bg-amber-500" style={{ width: `${seg(summary.distribution.outdatedComplete)}%` }} />
          <div className="h-full bg-emerald-500" style={{ width: `${seg(summary.distribution.freshComplete)}%` }} />
        </div>
      </div>
    </button>
  );
}

// ---- Building blocks -------------------------------------------------------

function StatLine({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold leading-tight tabular-nums text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className={cn("inline-block h-2 w-2 shrink-0 rounded-sm", color)} />
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="ml-auto font-semibold tabular-nums text-foreground">
        {value.toLocaleString("nl-NL")}
      </span>
    </div>
  );
}

function BreakdownRow({ label, weight, value }: { label: string; weight: string; value: number }) {
  const barColor = STATUS_COLOR[value >= 85 ? "clean" : value >= 60 ? "attention" : "critical"];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-xs font-medium text-foreground">{label}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{weight}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

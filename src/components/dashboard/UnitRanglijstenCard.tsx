import { useLayoutEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Flame, Rocket, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allConsultantsList,
  getCurrentPeriodNumber,
  getRanglijstenData,
  type RankingColumn,
  type RankingEntry,
} from "@/data/ranglijstenData";

// Hardcoded mock identity — single source of truth for "the logged in consultant"
const CURRENT_CONSULTANT_NAME = "Robin Jansen";

const COLUMN_LABELS: Record<string, { title: string; doneLabel?: string }> = {
  Inschrijvingen: { title: "Inschrijvingen", doneLabel: "gedaan" },
  Acquisities: { title: "Acquisities / Voorstellen", doneLabel: "voorstellen" },
  Gesprekken: { title: "Gesprekken / Uitnodigingen", doneLabel: "uitnodigingen" },
  Intakes: { title: "Intakes", doneLabel: "van acq." },
  Plaatsingen: { title: "Plaatsingen / Detachering", doneLabel: "detachering" },
  "Niet begonnen": { title: "Niet begonnen" },
};

function shortName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length === 1) return fullName;
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0)}.`;
}

interface RatioInfo {
  text: string;
  tone?: "muted" | "red" | "orange" | "success";
  suffix?: string;
}

function formatRatio(entry: RankingEntry, col: string): RatioInfo | null {
  if (entry.value === 0 && entry.valueDone === undefined) return null;
  if (entry.valueDone === undefined) return null;

  if (col === "Inschrijvingen") {
    const pct = entry.value > 0 ? Math.round(((entry.valueDone ?? 0) / entry.value) * 100) : 0;
    return { text: `(${pct}%)`, tone: "muted" };
  }
  if (col === "Acquisities") {
    // value = acquisities, valueDone = voorstellen → percentage acquisities/voorstellen
    const pct = (entry.valueDone ?? 0) > 0 ? Math.round((entry.value / (entry.valueDone || 1)) * 100) : 0;
    let tone: RatioInfo["tone"] = "muted";
    if (pct > 0 && pct < 10) tone = "red";
    else if (pct > 0 && pct < 15) tone = "orange";
    return { text: `(${pct}%)`, tone };
  }
  if (col === "Gesprekken") {
    // value = gesprekken, valueDone = uitnodigingen — gesprekken/uitnodigingen %
    const pct = (entry.valueDone ?? 0) > 0 ? Math.round((entry.value / (entry.valueDone || 1)) * 100) : 0;
    return { text: `(${pct}%)`, tone: "muted" };
  }
  if (col === "Intakes") {
    const pct = (entry.valueDone ?? 0) > 0 ? Math.round((entry.value / (entry.valueDone || 1)) * 100) : 0;
    return { text: `${pct}%`, tone: pct < 80 && pct > 0 ? "orange" : "success", suffix: "van acq." };
  }
  if (col === "Plaatsingen") {
    const pct = entry.value > 0 ? Math.round(((entry.valueDone ?? 0) / entry.value) * 100) : 0;
    return { text: `(${pct}%)`, tone: "muted" };
  }
  return null;
}

function toneClass(tone?: RatioInfo["tone"]): string {
  switch (tone) {
    case "red": return "text-red-500";
    case "orange": return "text-orange-500";
    case "success": return "text-success";
    default: return "text-muted-foreground";
  }
}

interface RankColumnProps {
  column: RankingColumn;
  unit: string;
  selfName: string;
}

function RankColumn({ column, unit, selfName }: RankColumnProps) {
  const cfg = COLUMN_LABELS[column.title] ?? { title: column.title };
  const scrollRef = useRef<HTMLDivElement>(null);
  const selfRowRef = useRef<HTMLDivElement>(null);

  const unitEntries = useMemo(() => {
    const filtered = column.entries.filter((e) => e.unit === unit);
    filtered.sort((a, b) => b.value - a.value);
    return filtered.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [column, unit]);

  const unitTotal = useMemo(() => unitEntries.reduce((s, e) => s + e.value, 0), [unitEntries]);
  const unitTotalDone = useMemo(
    () => unitEntries.reduce((s, e) => s + (e.valueDone ?? 0), 0),
    [unitEntries]
  );

  // Trend: based on company-wide column total (proxy for unit trend)
  const delta = useMemo(() => {
    if (!column.previousTotal || column.previousTotal === 0) return 0;
    return ((column.total - column.previousTotal) / column.previousTotal) * 100;
  }, [column]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const row = selfRowRef.current;
    if (!container || !row) return;
    const target = row.offsetTop - container.clientHeight / 2 + row.clientHeight / 2;
    container.scrollTop = Math.max(0, target);
  }, [unitEntries]);

  return (
    <div className="rounded-md border border-border/60 bg-card/40 p-2 flex flex-col min-w-0 min-w-[150px]">
      {/* Header */}
      <div className="mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {cfg.title}
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-bold tabular-nums leading-none">{unitTotal}</span>
          {cfg.doneLabel && column.title !== "Niet begonnen" && (
            <span className="text-[10px] text-muted-foreground truncate">
              {column.title === "Inschrijvingen" ? "op naam" : column.title === "Intakes" ? "intakes" : cfg.doneLabel}
            </span>
          )}
        </div>
        {column.totalDone !== undefined && cfg.doneLabel && column.title !== "Intakes" && (
          <div className="text-[10px] text-success mt-0.5 flex items-center gap-1">
            <span>✓</span>
            <span className="font-semibold tabular-nums">{unitTotalDone}</span>
            <span className="text-muted-foreground">{cfg.doneLabel}</span>
          </div>
        )}

        {/* Trend line */}
        <div className="mt-1.5 flex items-center gap-1 text-[10px]">
          {delta >= 0 ? (
            <TrendingUp className="w-3 h-3 text-success" />
          ) : (
            <TrendingDown className="w-3 h-3 text-destructive" />
          )}
          <span className={cn("font-semibold tabular-nums", delta >= 0 ? "text-success" : "text-destructive")}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(0)}%
          </span>
          <span className="text-muted-foreground">t.o.v. vorige periode</span>
        </div>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="relative max-h-[260px] overflow-y-auto pr-1 space-y-0.5 scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {unitEntries.map((entry) => {
          const isSelf = entry.name === selfName;
          const ratio = formatRatio(entry, column.title);
          const showCheck = entry.valueDone !== undefined && column.title !== "Niet begonnen" && column.title !== "Intakes";

          // Top-3 icon (trophy / medal) — shown alongside the rank number
          const topIcon =
            entry.rank === 1 && entry.value > 0 ? <Trophy className="w-3 h-3 text-yellow-500" />
            : entry.rank === 2 && entry.value > 0 ? <Medal className="w-3 h-3 text-slate-400" />
            : entry.rank === 3 && entry.value > 0 ? <Medal className="w-3 h-3 text-amber-700" />
            : null;

          return (
            <div
              key={entry.name}
              ref={isSelf ? selfRowRef : undefined}
              className={cn(
                "flex items-center gap-1.5 px-1.5 py-1 rounded text-[11px] transition-colors",
                isSelf
                  ? "bg-gradient-to-r from-gold/30 via-gold/20 to-gold/10 ring-1 ring-gold/40 border-l-2 border-gold shadow-[0_0_12px_-3px_hsl(var(--gold)/0.55)]"
                  : "hover:bg-muted/40",
                entry.value === 0 && !isSelf && "opacity-50"
              )}
            >
              {/* Rank number — always visible */}
              <span
                className={cn(
                  "shrink-0 text-[10px] tabular-nums w-4 text-right",
                  isSelf ? "font-bold text-foreground" : "text-muted-foreground"
                )}
              >
                {entry.rank}.
              </span>

              {/* Top-3 icon (in addition to rank number) */}
              {topIcon && <span className="shrink-0">{topIcon}</span>}

              {/* Name */}
              <span
                className={cn(
                  "flex-1 truncate",
                  isSelf ? "font-bold text-foreground" : "font-normal text-foreground/90"
                )}
              >
                {isSelf ? entry.name : shortName(entry.name)}
              </span>

              {/* Status icons */}
              {entry.isHot && entry.value > 0 && (
                <Flame className="w-2.5 h-2.5 text-orange-500 shrink-0" />
              )}
              {entry.isRocket && entry.value > 0 && (
                <Rocket className="w-2.5 h-2.5 text-blue-500 shrink-0" />
              )}

              {/* Value */}
              <span className="tabular-nums font-semibold text-foreground shrink-0">
                {entry.value}
              </span>

              {/* Done value with check */}
              {showCheck && (
                <span className="tabular-nums text-success text-[10px] shrink-0 flex items-center gap-0.5">
                  <span>✓</span>
                  <span className="font-medium">{entry.valueDone}</span>
                </span>
              )}

              {/* Ratio / percentage */}
              {ratio && (
                <span className={cn("text-[9px] shrink-0 flex items-center gap-0.5", toneClass(ratio.tone))}>
                  <span className="font-semibold">{ratio.text}</span>
                  {ratio.suffix && <span className="text-muted-foreground font-normal">{ratio.suffix}</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  delay?: number;
}

export function UnitRanglijstenCard({ delay = 75 }: Props) {
  const self = useMemo(
    () => allConsultantsList.find((c) => c.fullName === CURRENT_CONSULTANT_NAME),
    []
  );
  const periodNum = getCurrentPeriodNumber();
  const columns = useMemo(() => getRanglijstenData(2026, "periode", periodNum), [periodNum]);

  if (!self) return null;

  return (
    <Card
      className="animate-fade-in-up mb-4"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />
            Mijn positie — {self.unit}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Jouw ranking binnen je unit · Periode P{periodNum} 2026
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {columns.map((col) => (
            <RankColumn
              key={col.title}
              column={col}
              unit={self.unit}
              selfName={self.fullName}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

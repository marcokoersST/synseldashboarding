import { useLayoutEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Flame, Rocket } from "lucide-react";
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

const COLUMN_LABELS: Record<string, { title: string; doneLabel?: string; suffix?: "x" | "%" }> = {
  Inschrijvingen: { title: "Inschrijvingen", doneLabel: "gedaan", suffix: "%" },
  Acquisities: { title: "Acquisities / Voorstellen", doneLabel: "voorstellen", suffix: "x" },
  Gesprekken: { title: "Gesprekken / Uitnodigingen", doneLabel: "uitnodigingen", suffix: "%" },
  Intakes: { title: "Intakes", doneLabel: "van acq.", suffix: "%" },
  Plaatsingen: { title: "Plaatsingen / Detachering", doneLabel: "detachering", suffix: "%" },
  "Niet begonnen": { title: "Niet begonnen" },
};

function shortName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length === 1) return fullName;
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0)}.`;
}

function formatRatio(entry: RankingEntry, col: string): string | null {
  if (entry.value === 0) return null;
  const cfg = COLUMN_LABELS[col];
  if (!cfg || entry.valueDone === undefined) return null;

  if (col === "Inschrijvingen" || col === "Plaatsingen") {
    const pct = Math.round(((entry.valueDone ?? 0) / entry.value) * 100);
    return `(${pct}%)`;
  }
  if (col === "Acquisities") {
    const ratio = (entry.valueDone ?? 0) / entry.value;
    return `×${ratio.toFixed(ratio >= 10 ? 0 : 1)}`;
  }
  if (col === "Gesprekken") {
    // value = gesprekken, valueDone = uitnodigingen. Show conversion gesprekken/uitnodigingen
    const pct = Math.round((entry.value / (entry.valueDone || 1)) * 100);
    return `(${pct}%)`;
  }
  if (col === "Intakes") {
    const pct = Math.round((entry.value / (entry.valueDone || 1)) * 100);
    return `${pct}% van acq.`;
  }
  return null;
}

interface RankColumnProps {
  column: RankingColumn;
  unit: string;
  selfName: string;
  delay: number;
}

function RankColumn({ column, unit, selfName }: RankColumnProps) {
  const cfg = COLUMN_LABELS[column.title] ?? { title: column.title };
  const scrollRef = useRef<HTMLDivElement>(null);
  const selfRowRef = useRef<HTMLDivElement>(null);

  // Filter entries to this unit, re-sort, re-rank
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

  // Center the self-row on mount
  useLayoutEffect(() => {
    const container = scrollRef.current;
    const row = selfRowRef.current;
    if (!container || !row) return;
    const target = row.offsetTop - container.clientHeight / 2 + row.clientHeight / 2;
    container.scrollTop = Math.max(0, target);
  }, [unitEntries]);

  return (
    <div className="flex flex-col min-w-0">
      {/* Header */}
      <div className="mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {cfg.title}
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-bold tabular-nums leading-none">{unitTotal}</span>
          {cfg.doneLabel && column.totalDone !== undefined && (
            <span className="text-[10px] text-muted-foreground truncate">
              {column.title === "Inschrijvingen" ? "op naam" : cfg.doneLabel}
            </span>
          )}
        </div>
        {column.totalDone !== undefined && cfg.doneLabel && (
          <div className="text-[10px] text-success mt-0.5 flex items-center gap-1">
            <span className="font-semibold tabular-nums">{unitTotalDone}</span>
            <span className="text-muted-foreground">{cfg.doneLabel}</span>
          </div>
        )}
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="relative max-h-[260px] overflow-y-auto pr-1 space-y-0.5 scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {unitEntries.map((entry) => {
          const isSelf = entry.name === selfName;
          const ratioText = formatRatio(entry, column.title);
          const showCheck = entry.valueDone !== undefined && column.title !== "Niet begonnen";

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
              {/* Rank or icon */}
              <div className="w-5 shrink-0 flex items-center justify-center">
                {entry.rank === 1 && entry.value > 0 ? (
                  <Trophy className="w-3 h-3 text-yellow-500" />
                ) : entry.rank === 2 && entry.value > 0 ? (
                  <Medal className="w-3 h-3 text-slate-400" />
                ) : entry.rank === 3 && entry.value > 0 ? (
                  <Medal className="w-3 h-3 text-amber-700" />
                ) : (
                  <span className="text-[10px] text-muted-foreground tabular-nums">{entry.rank}.</span>
                )}
              </div>

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

              {/* Ratio */}
              {ratioText && (
                <span className="text-[9px] text-muted-foreground shrink-0">{ratioText}</span>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {columns.map((col, i) => (
            <RankColumn
              key={col.title}
              column={col}
              unit={self.unit}
              selfName={self.fullName}
              delay={i * 40}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

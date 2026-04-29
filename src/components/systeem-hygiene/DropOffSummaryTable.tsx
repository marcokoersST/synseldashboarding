import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ENTITY_LABEL,
  STATUS_COLOR,
  getScoreStatus,
  type EntityKey,
  type EntityDropOff,
  type StepDropOff,
} from "@/data/systeemHygieneData";

// ---- Per-step drop-off table ----------------------------------------------

interface StepProps {
  rows: StepDropOff[];
  selectedStep?: string | null;
  onSelectStep?: (step: string | null) => void;
}

export function StepDropOffTable({ rows, selectedStep, onSelectStep }: StepProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card/50 p-4 text-center text-xs text-muted-foreground">
        Geen steps beschikbaar voor deze filterselectie.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/40">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left uppercase tracking-wider text-[10px] text-muted-foreground">
            <th className="px-3 py-2 font-medium">Step / Stage</th>
            <th className="px-3 py-2 font-medium text-right">Records</th>
            <th className="px-3 py-2 font-medium text-right">Compleet</th>
            <th className="px-3 py-2 font-medium text-right">Drop-off</th>
            <th className="px-3 py-2 font-medium text-right">Hygiene</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isSelected = selectedStep === r.step;
            const hygieneColor = STATUS_COLOR[getScoreStatus(r.hygieneScore)];
            return (
              <tr
                key={r.step}
                onClick={() => onSelectStep?.(isSelected ? null : r.step)}
                className={cn(
                  "border-b border-border/40 transition-colors",
                  onSelectStep && "cursor-pointer",
                  isSelected ? "bg-primary/10" : "hover:bg-muted/30",
                )}
              >
                <td className="px-3 py-2 font-medium text-foreground">{r.step}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.records.toLocaleString("nl-NL")}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.completePct}%</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {i === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <DropOffPill value={r.dropOffPct} />
                  )}
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums" style={{ color: hygieneColor }}>
                  {r.hygieneScore}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DropOffPill({ value }: { value: number }) {
  // value is delta (compleet% vs vorige step). Negatief = drop.
  const drop = -value; // positief = échte drop-off
  const abs = Math.abs(drop);
  let color = STATUS_COLOR.clean;
  if (abs > 15) color = STATUS_COLOR.critical;
  else if (abs > 8) color = STATUS_COLOR.attention;

  const Icon = drop > 0.5 ? ArrowDown : drop < -0.5 ? ArrowUp : Minus;
  const sign = drop > 0 ? "▼" : drop < 0 ? "▲" : "·";
  return (
    <span className="inline-flex items-center gap-1 font-medium" style={{ color }}>
      <Icon className="h-3 w-3" />
      <span>{sign} {abs.toFixed(0)}%</span>
    </span>
  );
}

// ---- Per-entity comparison table ------------------------------------------

interface EntityProps {
  rows: EntityDropOff[];
  highlight: EntityKey;
}

type SortKey = "entity" | "hygiene" | "required" | "process" | "freshness" | "deltaVsAvg";

export function EntityComparisonTable({ rows, highlight }: EntityProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "hygiene", dir: "desc" });

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string" && typeof bv === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.dir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return copy;
  }, [rows, sort]);

  const toggle = (key: SortKey) =>
    setSort(s => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/40">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left uppercase tracking-wider text-[10px] text-muted-foreground">
            <SortHead label="Entity" k="entity" sort={sort} onClick={toggle} align="left" />
            <SortHead label="Hygiene" k="hygiene" sort={sort} onClick={toggle} />
            <SortHead label="Required" k="required" sort={sort} onClick={toggle} />
            <SortHead label="Process" k="process" sort={sort} onClick={toggle} />
            <SortHead label="Freshness" k="freshness" sort={sort} onClick={toggle} />
            <SortHead label="Δ vs gem." k="deltaVsAvg" sort={sort} onClick={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => {
            const isMe = r.entity === highlight;
            const hygieneColor = STATUS_COLOR[getScoreStatus(r.hygiene)];
            return (
              <tr
                key={r.entity}
                className={cn(
                  "border-b border-border/40",
                  isMe ? "bg-primary/10 font-medium" : "hover:bg-muted/30",
                )}
              >
                <td className="px-3 py-2 text-foreground">
                  <span className="inline-flex items-center gap-2">
                    {ENTITY_LABEL[r.entity]}
                    {isMe && <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary">huidig</span>}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums" style={{ color: hygieneColor }}>{r.hygiene}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.required}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.process}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.freshness}%</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <DeltaCell value={r.deltaVsAvg} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SortHead({
  label,
  k,
  sort,
  onClick,
  align = "right",
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === k;
  return (
    <th className={cn("px-3 py-2 font-medium", align === "right" ? "text-right" : "text-left")}>
      <button
        type="button"
        onClick={() => onClick(k)}
        className="inline-flex items-center gap-1 uppercase tracking-wider text-[10px] text-muted-foreground hover:text-foreground"
      >
        <span>{label}</span>
        {active ? (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </button>
    </th>
  );
}

function DeltaCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted-foreground">±0</span>;
  const positive = value > 0;
  const color = positive ? STATUS_COLOR.clean : Math.abs(value) > 10 ? STATUS_COLOR.critical : STATUS_COLOR.attention;
  return (
    <span className="inline-flex items-center gap-1 font-medium" style={{ color }}>
      {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value}
    </span>
  );
}

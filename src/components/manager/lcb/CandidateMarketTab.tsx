import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  lcbMarketRows,
  lcbFunnelSteps,
  lcbBenchmarks,
  type LcbStepKey,
  type LcbConsultantRow,
} from "@/data/lcbMarketData";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, statusFromRatio, type LCBStatus } from "@/lib/lcbStatus";
import { DevNote } from "@/components/groeimodel/DevNote";

type SortKey = "consultantName" | "unit" | LcbStepKey | "drop" | "status";
type SortDir = "asc" | "desc";

const SHORT_STEP_LABEL: Record<LcbStepKey, string> = {
  toegewezen: "Toegew.",
  inschrijvingen: "Inschr.",
  acquisities: "Acquis.",
  voorstellen: "Voorst.",
  intakes: "Intakes",
  uitnodiging: "Uitnod.",
  gesprekken: "Gespr.",
  vervolg: "Vervolg",
  plaatsingen: "Plaats.",
};

interface Props {
  selectedUnits: string[];
  selectedConsultants: number[];
  search: string;
  onOpenStep: (consultantId: number, step: LcbStepKey) => void;
  onOpenConsultant: (consultantId: number) => void;
}

function biggestDropoff(row: LcbConsultantRow, benchmarks: Partial<Record<LcbStepKey, number>>) {
  let worst: { step: LcbStepKey; label: string; ratio: number } | null = null;
  for (let i = 1; i < lcbFunnelSteps.length; i++) {
    const cur = lcbFunnelSteps[i];
    const prev = lcbFunnelSteps[i - 1];
    const prevVal = row[prev.key] as number;
    if (prevVal <= 0) continue;
    const conv = (row[cur.key] as number) / prevVal;
    const bench = benchmarks[cur.key] ?? 0;
    const ratio = bench > 0 ? conv / bench : 1;
    if (!worst || ratio < worst.ratio) {
      worst = { step: cur.key, label: `${prev.label} → ${cur.label}`, ratio };
    }
  }
  return worst;
}

function overallStatus(row: LcbConsultantRow, benchmarks: Partial<Record<LcbStepKey, number>>): LCBStatus {
  const worst = biggestDropoff(row, benchmarks);
  if (!worst) return "clean";
  return statusFromRatio(worst.ratio);
}

export function CandidateMarketTab({
  selectedUnits, selectedConsultants, search, onOpenStep, onOpenConsultant,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("plaatsingen");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);

  const rows = useMemo(() => {
    let r = lcbMarketRows;
    if (selectedUnits.length > 0) r = r.filter((x) => selectedUnits.includes(x.unit));
    if (selectedConsultants.length > 0) r = r.filter((x) => selectedConsultants.includes(x.consultantId));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.consultantName.toLowerCase().includes(q));
    }
    return r;
  }, [selectedUnits, selectedConsultants, search]);

  const benchmarks = useMemo(() => {
    const out: Partial<Record<LcbStepKey, number>> = {};
    for (let i = 1; i < lcbFunnelSteps.length; i++) {
      const cur = lcbFunnelSteps[i].key;
      const prev = lcbFunnelSteps[i - 1].key;
      const ratios = rows.filter((r) => (r[prev] as number) > 0).map((r) => (r[cur] as number) / (r[prev] as number));
      out[cur] = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
    }
    return out;
  }, [rows]);

  const enriched = useMemo(() =>
    rows.map((r) => ({ row: r, worst: biggestDropoff(r, benchmarks), status: overallStatus(r, benchmarks) })),
    [rows, benchmarks],
  );

  const sorted = useMemo(() => {
    const arr = [...enriched];
    arr.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "consultantName" || sortKey === "unit") { av = a.row[sortKey]; bv = b.row[sortKey]; }
      else if (sortKey === "drop") { av = a.worst?.ratio ?? 1; bv = b.worst?.ratio ?? 1; }
      else if (sortKey === "status") {
        const order = { critical: 0, attention: 1, clean: 2 };
        av = order[a.status]; bv = order[b.status];
      } else { av = a.row[sortKey] as number; bv = b.row[sortKey] as number; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [enriched, sortKey, sortDir]);

  const totals = useMemo(() => {
    const t: Record<LcbStepKey, number> = {} as Record<LcbStepKey, number>;
    lcbFunnelSteps.forEach((s) => { t[s.key] = rows.reduce((acc, r) => acc + (r[s.key] as number), 0); });
    return t;
  }, [rows]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  return (
    <div className="relative h-full flex flex-col min-h-0">
      <DevNote
        id={2}
        floating
        floatingClassName="top-1 right-1"
        story={<><strong>As a manager</strong>, I want every consultant's sales funnel side by side with conversion %, drop-off and status, <strong>so that</strong> I can spot exactly where each consultant loses candidates.</>}
        logic={`Candidate Market table:

  • Rows: lcbMarketRows, filtered by selectedUnits,
    selectedConsultants and search (consultant name).
  • Columns: every step in lcbFunnelSteps
    (toegewezen → inschrijvingen → acquisities →
     voorstellen → intakes → uitnodiging → gesprekken →
     vervolg → plaatsingen) with a short header label.
  • Per-cell conversion = step / prevStep × 100; team
    benchmark = average of those ratios across visible
    rows; cell color = statusFromRatio(conv / bench)
    (clean / attention / critical).
  • Drop-off column = biggestDropoff(row) — the step
    with the lowest ratio versus benchmark.
  • Status column = overallStatus(row), derived from the
    worst drop-off.
  • Click a numeric cell → onOpenStep(consultantId, step)
    opens the LcbSplitOverlay with kandidaten or deals
    for that step. Click the name → consultantoverlay.
  • Footer row = totals + cumulative conversion across
    all visible consultants.`}
      />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sales funnel per consultant</h2>
          <p className="text-[11px] text-muted-foreground">
            Klik een cel voor de onderliggende kandidaten of deals. Klik op de naam voor het volledige consultantoverzicht.
          </p>
        </div>
      </div>


      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card relative">
        <table className="w-full text-xs border-collapse table-fixed">
          <colgroup>
            <col style={{ width: 200 }} />
            <col style={{ width: 120 }} />
            {lcbFunnelSteps.map((s) => (
              <col key={s.key} style={{ width: 90 }} />
            ))}
            <col style={{ width: 170 }} />
            <col style={{ width: 110 }} />
          </colgroup>
          <thead className="sticky top-0 z-20 bg-muted/70 backdrop-blur">
            <tr className="text-left">
              <Th sticky sortable onClick={() => toggleSort("consultantName")} active={sortKey === "consultantName"} dir={sortDir} highlight={hoverCol === "consultantName"}>Consultant</Th>
              <Th sortable onClick={() => toggleSort("unit")} active={sortKey === "unit"} dir={sortDir} highlight={hoverCol === "unit"}>Unit</Th>
              {lcbFunnelSteps.map((s) => (
                <Th key={s.key} align="right" sortable onClick={() => toggleSort(s.key as SortKey)} active={sortKey === s.key} dir={sortDir} highlight={hoverCol === s.key} title={s.label}>
                  {SHORT_STEP_LABEL[s.key] ?? s.label}
                </Th>
              ))}
              <Th sortable onClick={() => toggleSort("drop")} active={sortKey === "drop"} dir={sortDir} highlight={hoverCol === "drop"} title="Grootste drop-off">Drop-off</Th>
              <Th sortable onClick={() => toggleSort("status")} active={sortKey === "status"} dir={sortDir} highlight={hoverCol === "status"}>Status</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ row, worst, status }) => {
              const isRow = hoverRow === row.consultantId;
              return (
                <tr
                  key={row.consultantId}
                  className={cn("border-t border-border", isRow && "bg-muted/30")}
                  onMouseLeave={() => { if (hoverRow === row.consultantId) setHoverRow(null); }}
                >
                  <Td sticky highlight={isRow || hoverCol === "consultantName"} intersect={isRow && hoverCol === "consultantName"} onEnter={() => { setHoverRow(row.consultantId); setHoverCol("consultantName"); }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenConsultant(row.consultantId); }}
                      title={row.consultantName}
                      className="font-medium text-foreground hover:text-primary text-left truncate block w-full"
                    >
                      {row.consultantName}
                    </button>
                  </Td>
                  <Td highlight={isRow || hoverCol === "unit"} intersect={isRow && hoverCol === "unit"} onEnter={() => { setHoverRow(row.consultantId); setHoverCol("unit"); }}>
                    <span className="text-muted-foreground truncate block" title={row.unit}>{row.unit}</span>
                  </Td>
                  {lcbFunnelSteps.map((s, i) => {
                    const val = row[s.key] as number;
                    let conv: number | null = null;
                    let cellStatus: LCBStatus = "clean";
                    if (i > 0) {
                      const prevVal = row[lcbFunnelSteps[i - 1].key] as number;
                      if (prevVal > 0) {
                        conv = Math.round((val / prevVal) * 100);
                        const bench = benchmarks[s.key] ?? 0;
                        cellStatus = statusFromRatio(bench > 0 ? (val / prevVal) / bench : 1);
                      }
                    }
                    return (
                      <Td
                        key={s.key}
                        align="right"
                        highlight={isRow || hoverCol === s.key}
                        intersect={isRow && hoverCol === s.key}
                        onEnter={() => { setHoverRow(row.consultantId); setHoverCol(s.key); }}
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onOpenStep(row.consultantId, s.key); }}
                          className="inline-flex flex-col items-end px-1 py-0.5 rounded hover:text-primary"
                        >
                          <span className="font-semibold tabular-nums text-foreground">{val}</span>
                          {conv !== null && (
                            <span className={cn(
                              "text-[9px] leading-none mt-0.5 tabular-nums",
                              cellStatus === "clean" && "text-emerald-600 dark:text-emerald-400",
                              cellStatus === "attention" && "text-amber-600 dark:text-amber-400",
                              cellStatus === "critical" && "text-red-600 dark:text-red-400",
                            )}>{conv}%</span>
                          )}
                        </button>
                      </Td>
                    );
                  })}
                  <Td highlight={isRow || hoverCol === "drop"} intersect={isRow && hoverCol === "drop"} onEnter={() => { setHoverRow(row.consultantId); setHoverCol("drop"); }}>
                    <span className="text-[11px] text-muted-foreground truncate block" title={worst ? worst.label : undefined}>{worst ? worst.label : "—"}</span>
                  </Td>
                  <Td highlight={isRow || hoverCol === "status"} intersect={isRow && hoverCol === "status"} onEnter={() => { setHoverRow(row.consultantId); setHoverCol("status"); }}>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[status])}>
                      {LCB_STATUS_LABEL[status]}
                    </span>
                  </Td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={lcbFunnelSteps.length + 4} className="px-4 py-12 text-center text-xs text-muted-foreground">Geen consultants gevonden voor deze filters.</td></tr>
            )}
          </tbody>
          <tfoot className="sticky bottom-0 z-20 bg-card border-t-2 border-border">
            <tr className="font-semibold">
              <td className="sticky left-0 z-10 bg-card px-2 py-2 text-foreground border-r border-border">Totaal</td>
              <td className="px-2 py-2 text-muted-foreground">{rows.length} consultants</td>
              {lcbFunnelSteps.map((s, i) => {
                let conv: number | null = null;
                if (i > 0) {
                  const prev = totals[lcbFunnelSteps[i - 1].key];
                  if (prev > 0) conv = Math.round((totals[s.key] / prev) * 100);
                }
                return (
                  <td key={s.key} className="px-2 py-2 text-right tabular-nums">
                    <div className="flex flex-col items-end">
                      <span className="text-foreground">{totals[s.key]}</span>
                      {conv !== null && <span className="text-[9px] text-muted-foreground mt-0.5">{conv}%</span>}
                    </div>
                  </td>
                );
              })}
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Th({
  children, align = "left", sticky, sortable, onClick, active, dir, highlight, title,
}: {
  children: React.ReactNode; align?: "left" | "right"; sticky?: boolean;
  sortable?: boolean; onClick?: () => void; active?: boolean; dir?: SortDir; highlight?: boolean; title?: string;
}) {
  return (
    <th
      title={title}
      className={cn(
        "px-1.5 py-2 font-medium text-[10px] uppercase tracking-wider text-muted-foreground align-top",
        align === "right" && "text-right",
        sticky && "sticky left-0 z-30 bg-muted/70 backdrop-blur",
        sortable && "cursor-pointer select-none hover:text-foreground",
        active && "text-foreground",
        highlight && "text-foreground bg-muted/40",
      )}
      onClick={onClick}
    >
      <span className={cn("inline-flex items-start gap-1 whitespace-normal break-words leading-tight", align === "right" && "justify-end w-full")}>
        {children}
        {sortable && active && (dir === "asc" ? <ChevronUp className="h-3 w-3 flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-3 w-3 flex-shrink-0 mt-0.5" />)}
      </span>
    </th>
  );
}

function Td({
  children, align = "left", sticky, highlight, intersect, onEnter,
}: {
  children: React.ReactNode; align?: "left" | "right"; sticky?: boolean;
  highlight?: boolean; intersect?: boolean; onEnter?: () => void;
}) {
  return (
    <td
      onMouseEnter={onEnter}
      className={cn(
        "px-2 py-1.5",
        align === "right" && "text-right",
        sticky && "sticky left-0 z-10 bg-card border-r border-border",
        highlight && (sticky ? "bg-muted/40" : "bg-muted/30"),
        intersect && "bg-muted/80 dark:bg-muted",
      )}
    >
      {children}
    </td>
  );
}

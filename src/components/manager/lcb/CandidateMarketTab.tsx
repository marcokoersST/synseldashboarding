import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, BarChart3, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  consultantFunnelDataV2,
  funnelStepsV2,
  type ConsultantFunnelDataV2,
  type FunnelStepKey,
} from "@/data/managerOperationalDataV2";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, statusFromRatio, type LCBStatus } from "@/lib/lcbStatus";
import { SalesFunnelV2 } from "@/components/manager/v2/SalesFunnelV2";

type SortKey = "consultantName" | "unit" | FunnelStepKey | "drop" | "status";
type SortDir = "asc" | "desc";

interface Props {
  selectedUnits: string[];
  selectedConsultants: number[];
  search: string;
  onOpenStep: (consultantId: number, step: FunnelStepKey) => void;
  onOpenConsultant: (consultantId: number) => void;
}

// Compute benchmark conversion per consecutive step (avg ratio)
function useBenchmarks(rows: ConsultantFunnelDataV2[]) {
  return useMemo(() => {
    const out: Partial<Record<FunnelStepKey, number>> = {};
    for (let i = 1; i < funnelStepsV2.length; i++) {
      const cur = funnelStepsV2[i].key as FunnelStepKey;
      const prev = funnelStepsV2[i - 1].key as FunnelStepKey;
      const ratios = rows
        .filter((r) => (r[prev] as number) > 0)
        .map((r) => (r[cur] as number) / (r[prev] as number));
      out[cur] = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
    }
    return out;
  }, [rows]);
}

function biggestDropoff(row: ConsultantFunnelDataV2, benchmarks: Partial<Record<FunnelStepKey, number>>) {
  let worst: { step: FunnelStepKey; label: string; ratio: number } | null = null;
  for (let i = 1; i < funnelStepsV2.length; i++) {
    const cur = funnelStepsV2[i];
    const prev = funnelStepsV2[i - 1];
    const prevVal = row[prev.key as FunnelStepKey] as number;
    if (prevVal <= 0) continue;
    const conv = (row[cur.key as FunnelStepKey] as number) / prevVal;
    const bench = benchmarks[cur.key as FunnelStepKey] ?? 0;
    const ratio = bench > 0 ? conv / bench : 1;
    if (!worst || ratio < worst.ratio) {
      worst = { step: cur.key as FunnelStepKey, label: `${prev.label} → ${cur.label}`, ratio };
    }
  }
  return worst;
}

function overallStatus(row: ConsultantFunnelDataV2, benchmarks: Partial<Record<FunnelStepKey, number>>): LCBStatus {
  const worst = biggestDropoff(row, benchmarks);
  if (!worst) return "clean";
  return statusFromRatio(worst.ratio);
}

export function CandidateMarketTab({
  selectedUnits,
  selectedConsultants,
  search,
  onOpenStep,
  onOpenConsultant,
}: Props) {
  const [view, setView] = useState<"table" | "funnel">("table");
  const [sortKey, setSortKey] = useState<SortKey>("plaatsingen");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(() => {
    let r = consultantFunnelDataV2;
    if (selectedUnits.length > 0) r = r.filter((x) => selectedUnits.includes(x.unit));
    if (selectedConsultants.length > 0) r = r.filter((x) => selectedConsultants.includes(x.consultantId));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.consultantName.toLowerCase().includes(q));
    }
    return r;
  }, [selectedUnits, selectedConsultants, search]);

  const benchmarks = useBenchmarks(rows);

  const enriched = useMemo(
    () =>
      rows.map((r) => {
        const worst = biggestDropoff(r, benchmarks);
        return { row: r, worst, status: overallStatus(r, benchmarks) };
      }),
    [rows, benchmarks],
  );

  const sorted = useMemo(() => {
    const arr = [...enriched];
    arr.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "consultantName" || sortKey === "unit") {
        av = a.row[sortKey]; bv = b.row[sortKey];
      } else if (sortKey === "drop") {
        av = a.worst?.ratio ?? 1; bv = b.worst?.ratio ?? 1;
      } else if (sortKey === "status") {
        const order = { critical: 0, attention: 1, clean: 2 };
        av = order[a.status]; bv = order[b.status];
      } else {
        av = a.row[sortKey] as number; bv = b.row[sortKey] as number;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [enriched, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sales funnel per consultant</h2>
          <p className="text-[11px] text-muted-foreground">
            Klik een cel om kandidaten in die stap te zien. Klik een rij voor het volledige consultantoverzicht.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5 bg-card">
          <ViewBtn active={view === "table"} onClick={() => setView("table")} icon={<TableIcon className="h-3.5 w-3.5" />} label="Tabel" />
          <ViewBtn active={view === "funnel"} onClick={() => setView("funnel")} icon={<BarChart3 className="h-3.5 w-3.5" />} label="Cumulatieve funnel" />
        </div>
      </div>

      {view === "funnel" ? (
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-card p-3">
          <SalesFunnelV2 delay={0} selectedUnit={selectedUnits.length === 1 ? selectedUnits[0] : "all"} framed={false} />
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-20 bg-muted/60 backdrop-blur">
              <tr className="text-left">
                <Th sticky width="w-[180px]" sortable onClick={() => toggleSort("consultantName")} active={sortKey === "consultantName"} dir={sortDir}>Consultant</Th>
                <Th width="w-[110px]" sortable onClick={() => toggleSort("unit")} active={sortKey === "unit"} dir={sortDir}>Unit</Th>
                {funnelStepsV2.map((s) => (
                  <Th key={s.key} align="right" sortable onClick={() => toggleSort(s.key as SortKey)} active={sortKey === (s.key as SortKey)} dir={sortDir}>
                    {s.label}
                  </Th>
                ))}
                <Th sortable onClick={() => toggleSort("drop")} active={sortKey === "drop"} dir={sortDir}>Grootste drop-off</Th>
                <Th sortable onClick={() => toggleSort("status")} active={sortKey === "status"} dir={sortDir}>Status</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ row, worst, status }) => (
                <tr
                  key={row.consultantId}
                  className="border-t border-border hover:bg-muted/30 cursor-pointer group"
                  onClick={() => onOpenConsultant(row.consultantId)}
                >
                  <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/40 px-3 py-2 font-medium text-foreground whitespace-nowrap">
                    {row.consultantName}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{row.unit}</td>
                  {funnelStepsV2.map((s, i) => {
                    const key = s.key as FunnelStepKey;
                    const val = row[key] as number;
                    let conv: number | null = null;
                    let cellStatus: LCBStatus = "clean";
                    if (i > 0) {
                      const prevKey = funnelStepsV2[i - 1].key as FunnelStepKey;
                      const prevVal = row[prevKey] as number;
                      if (prevVal > 0) {
                        conv = Math.round((val / prevVal) * 100);
                        const bench = benchmarks[key] ?? 0;
                        cellStatus = statusFromRatio(bench > 0 ? (val / prevVal) / bench : 1);
                      }
                    }
                    return (
                      <td
                        key={key}
                        className="px-2 py-1 text-right tabular-nums"
                        onClick={(e) => { e.stopPropagation(); onOpenStep(row.consultantId, key); }}
                      >
                        <button
                          type="button"
                          className="inline-flex flex-col items-end px-1.5 py-0.5 rounded hover:bg-primary/10 hover:text-primary"
                        >
                          <span className="font-semibold text-foreground">{val}</span>
                          {conv !== null && (
                            <span className={cn(
                              "text-[9px] leading-none mt-0.5",
                              cellStatus === "clean" && "text-emerald-600 dark:text-emerald-400",
                              cellStatus === "attention" && "text-amber-600 dark:text-amber-400",
                              cellStatus === "critical" && "text-red-600 dark:text-red-400",
                            )}>
                              {conv}%
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-[11px] text-muted-foreground">
                    {worst ? worst.label : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[status])}>
                      {LCB_STATUS_LABEL[status]}
                    </span>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={funnelStepsV2.length + 4} className="px-4 py-12 text-center text-xs text-muted-foreground">Geen consultants gevonden voor deze filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Th({
  children,
  align = "left",
  sticky,
  width,
  sortable,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  sticky?: boolean;
  width?: string;
  sortable?: boolean;
  onClick?: () => void;
  active?: boolean;
  dir?: SortDir;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap",
        align === "right" && "text-right",
        sticky && "sticky left-0 z-30 bg-muted/60 backdrop-blur",
        width,
        sortable && "cursor-pointer select-none hover:text-foreground",
        active && "text-foreground",
      )}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && active && (dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </th>
  );
}

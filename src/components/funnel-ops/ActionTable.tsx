import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter as FilterIcon } from "lucide-react";
import { SLAStatusPill } from "./SLAStatusPill";
import { CandidateLink, UserLink } from "./CandidateLink";
import type { ActionRow, Tier } from "@/data/funnelOperationsData";
import { recruiterById, TIER_COLOR, SLA_MATRIX, NOW, HOUR } from "@/data/funnelOperationsData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type SortKey = "tier" | "kandidaat" | "sla" | "consultant";
type SortDir = "asc" | "desc";
type CategoryKey = Exclude<SortKey, "sla">;

const TIER_ORDER: Record<Tier, number> = { "85+": 0, "70-85": 1, "50-70": 2, "30-50": 3, "0-30": 4 };

export function ActionTable({ rows, dense }: { rows: ActionRow[]; dense?: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>("sla");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Record<CategoryKey, Set<string>>>({
    tier: new Set(), kandidaat: new Set(), consultant: new Set(),
  });

  const enriched = useMemo(() => rows.map(r => {
    const co = recruiterById(r.candidate.recruiterId);
    const deadline = r.candidate.toegewezenOp + SLA_MATRIX[r.candidate.tier].contactH * HOUR;
    // Positive => hours overdue. Negative => hours until deadline (dreigend).
    const hoursOver = (NOW - deadline) / HOUR;
    return { ...r, consultantName: co?.naam ?? "—", consultantId: co?.id ?? "", hoursOver };
  }), [rows]);

  // SLA range bounds (in hours)
  const slaBounds = useMemo(() => {
    if (!enriched.length) return { min: 0, max: 0 };
    const vals = enriched.map(r => r.hoursOver);
    return { min: Math.floor(Math.min(...vals)), max: Math.ceil(Math.max(...vals)) };
  }, [enriched]);

  const [slaRange, setSlaRange] = useState<[number, number] | null>(null);
  const activeRange: [number, number] = slaRange ?? [slaBounds.min, slaBounds.max];
  const slaActive = slaRange !== null && (slaRange[0] !== slaBounds.min || slaRange[1] !== slaBounds.max);

  const options = useMemo(() => ({
    tier: Array.from(new Set(enriched.map(r => r.candidate.tier))).sort((a, b) => TIER_ORDER[a as Tier] - TIER_ORDER[b as Tier]),
    kandidaat: Array.from(new Set(enriched.map(r => r.candidate.naam))).sort(),
    consultant: Array.from(new Set(enriched.map(r => r.consultantName))).sort(),
  }), [enriched]);

  const filtered = useMemo(() => enriched.filter(r => {
    if (filters.tier.size && !filters.tier.has(r.candidate.tier)) return false;
    if (filters.kandidaat.size && !filters.kandidaat.has(r.candidate.naam)) return false;
    if (filters.consultant.size && !filters.consultant.has(r.consultantName)) return false;
    if (r.hoursOver < activeRange[0] || r.hoursOver > activeRange[1]) return false;
    return true;
  }), [enriched, filters, activeRange]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "tier": return (TIER_ORDER[a.candidate.tier] - TIER_ORDER[b.candidate.tier]) * dir;
        case "kandidaat": return a.candidate.naam.localeCompare(b.candidate.naam) * dir;
        case "sla": return (b.hoursOver - a.hoursOver) * dir;
        case "consultant": return a.consultantName.localeCompare(b.consultantName) * dir;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const toggleFilter = (k: CategoryKey, v: string) => {
    setFilters(f => {
      const next = new Set(f[k]);
      if (next.has(v)) next.delete(v); else next.add(v);
      return { ...f, [k]: next };
    });
  };
  const clearFilter = (k: CategoryKey) => setFilters(f => ({ ...f, [k]: new Set() }));

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const cols: { key: SortKey; label: string; span: string }[] = [
    { key: "tier", label: "Tier", span: "col-span-1" },
    { key: "kandidaat", label: "Kandidaat", span: "col-span-4" },
    { key: "sla", label: "SLA", span: "col-span-3" },
    { key: "consultant", label: "Consultant", span: "col-span-4" },
  ];

  const fmtH = (h: number) => {
    const sign = h < 0 ? "−" : "";
    const abs = Math.abs(h);
    return `${sign}${abs < 10 ? abs.toFixed(1) : Math.round(abs)}u`;
  };

  return (
    <div>
      <div className="grid grid-cols-12 items-center gap-2 py-1.5 px-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border sticky top-0 z-10">
        {cols.map(c => {
          const isSla = c.key === "sla";
          const active = isSla ? slaActive : filters[c.key as CategoryKey].size > 0;
          return (
            <div key={c.key} className={cn(c.span, "flex items-center gap-1 min-w-0")}>
              <button
                onClick={() => toggleSort(c.key)}
                className="flex items-center gap-1 hover:text-foreground transition-colors text-left min-w-0"
              >
                <span className="truncate">{c.label}</span>
                <SortIcon k={c.key} />
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn("p-0.5 rounded hover:bg-muted transition-colors shrink-0", active && "text-primary")}
                    title={active ? "Filter actief" : "Filter"}
                  >
                    <FilterIcon className={cn("w-3 h-3", active && "fill-primary/20")} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className={cn("p-0", isSla ? "w-72" : "w-56")}>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium normal-case tracking-normal">Filter {c.label}</span>
                    <button
                      onClick={() => isSla ? setSlaRange(null) : clearFilter(c.key as CategoryKey)}
                      className="text-[10px] text-muted-foreground hover:text-foreground normal-case tracking-normal"
                    >Wissen</button>
                  </div>
                  {isSla ? (
                    <div className="p-4 space-y-3">
                      <div className="text-[11px] text-muted-foreground normal-case tracking-normal">
                        Negatief = nog tijd · Positief = uren te laat
                      </div>
                      <Slider
                        min={slaBounds.min}
                        max={slaBounds.max}
                        step={1}
                        value={activeRange}
                        onValueChange={(v) => setSlaRange([v[0], v[1]] as [number, number])}
                      />
                      <div className="flex items-center justify-between text-xs tabular-nums normal-case tracking-normal">
                        <span className="text-muted-foreground">Min</span>
                        <span className="font-medium">{fmtH(activeRange[0])}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{fmtH(activeRange[1])}</span>
                        <span className="text-muted-foreground">Max</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums normal-case tracking-normal">
                        <span>bereik {fmtH(slaBounds.min)}</span>
                        <span>{fmtH(slaBounds.max)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto py-1">
                      {options[c.key as CategoryKey].map(v => (
                        <label
                          key={v}
                          className="flex items-center gap-2 px-3 py-1 hover:bg-muted/50 cursor-pointer text-xs normal-case tracking-normal"
                        >
                          <Checkbox
                            checked={filters[c.key as CategoryKey].has(v)}
                            onCheckedChange={() => toggleFilter(c.key as CategoryKey, v)}
                          />
                          <span className="truncate">{v}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-sm text-muted-foreground p-4">Geen acties — alle SLA's binnen.</div>
      )}
      <div className="divide-y divide-border">
        {sorted.map(({ candidate: c, sla, consultantName, consultantId }) => (
          <div key={c.id} className={`grid grid-cols-12 items-center gap-2 ${dense ? "py-1.5" : "py-2"} px-2 text-sm hover:bg-muted/30`}>
            <div className="col-span-1">
              <span
                className="inline-flex items-center justify-center px-1.5 h-5 rounded text-[10px] font-semibold"
                style={{ background: `${TIER_COLOR[c.tier]}20`, color: TIER_COLOR[c.tier] }}
              >
                {c.tier}
              </span>
            </div>
            <div className="col-span-4 min-w-0">
              <CandidateLink id={c.id} name={c.naam} className="truncate" />
            </div>
            <div className="col-span-3"><SLAStatusPill sla={sla} /></div>
            <div className="col-span-4 text-xs truncate">
              {consultantId ? <UserLink id={consultantId} name={consultantName} /> : <span className="text-muted-foreground">—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

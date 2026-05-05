import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter as FilterIcon } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { SLAStatusPill } from "./SLAStatusPill";
import { CandidateLink, UserLink } from "./CandidateLink";
import type { ActionRow, Tier } from "@/data/funnelOperationsData";
import { recruiterById, TIER_COLOR } from "@/data/funnelOperationsData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type SortKey = "tier" | "kandidaat" | "reden" | "sla" | "consultant";
type SortDir = "asc" | "desc";

const TIER_ORDER: Record<Tier, number> = { "85+": 0, "70-85": 1, "50-70": 2, "30-50": 3, "0-30": 4 };
const SLA_ORDER = { verlopen: 0, dreigend: 1, binnen: 2, "n/a": 3 } as const;

export function ActionTable({ rows, dense }: { rows: ActionRow[]; dense?: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>("sla");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Record<SortKey, Set<string>>>({
    tier: new Set(), kandidaat: new Set(), reden: new Set(), sla: new Set(), consultant: new Set(),
  });

  const enriched = useMemo(() => rows.map(r => {
    const co = recruiterById(r.candidate.recruiterId);
    return { ...r, consultantName: co?.naam ?? "—", consultantId: co?.id ?? "" };
  }), [rows]);

  // Available options per column (always from full unfiltered set)
  const options = useMemo(() => ({
    tier: Array.from(new Set(enriched.map(r => r.candidate.tier))).sort((a, b) => TIER_ORDER[a as Tier] - TIER_ORDER[b as Tier]),
    kandidaat: Array.from(new Set(enriched.map(r => r.candidate.naam))).sort(),
    reden: Array.from(new Set(enriched.map(r => r.reason))).sort(),
    sla: Array.from(new Set(enriched.map(r => r.sla.label))).sort(),
    consultant: Array.from(new Set(enriched.map(r => r.consultantName))).sort(),
  }), [enriched]);

  const filtered = useMemo(() => enriched.filter(r => {
    if (filters.tier.size && !filters.tier.has(r.candidate.tier)) return false;
    if (filters.kandidaat.size && !filters.kandidaat.has(r.candidate.naam)) return false;
    if (filters.reden.size && !filters.reden.has(r.reason)) return false;
    if (filters.sla.size && !filters.sla.has(r.sla.label)) return false;
    if (filters.consultant.size && !filters.consultant.has(r.consultantName)) return false;
    return true;
  }), [enriched, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "tier": return (TIER_ORDER[a.candidate.tier] - TIER_ORDER[b.candidate.tier]) * dir;
        case "kandidaat": return a.candidate.naam.localeCompare(b.candidate.naam) * dir;
        case "reden": return a.reason.localeCompare(b.reason) * dir;
        case "sla": {
          const s = SLA_ORDER[a.sla.status] - SLA_ORDER[b.sla.status];
          if (s !== 0) return s * dir;
          return (b.sla.pctElapsed - a.sla.pctElapsed) * dir;
        }
        case "consultant": return a.consultantName.localeCompare(b.consultantName) * dir;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const toggleFilter = (k: SortKey, v: string) => {
    setFilters(f => {
      const next = new Set(f[k]);
      if (next.has(v)) next.delete(v); else next.add(v);
      return { ...f, [k]: next };
    });
  };
  const clearFilter = (k: SortKey) => setFilters(f => ({ ...f, [k]: new Set() }));

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

  return (
    <div>
      <div className="grid grid-cols-12 items-center gap-2 py-1.5 px-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border sticky top-0 z-10">
        {cols.map(c => {
          const active = filters[c.key].size > 0;
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
                    className={cn(
                      "p-0.5 rounded hover:bg-muted transition-colors shrink-0",
                      active && "text-primary"
                    )}
                    title={active ? `${filters[c.key].size} actief` : "Filter"}
                  >
                    <FilterIcon className={cn("w-3 h-3", active && "fill-primary/20")} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-0">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium normal-case tracking-normal">Filter {c.label}</span>
                    <button
                      onClick={() => clearFilter(c.key)}
                      className="text-[10px] text-muted-foreground hover:text-foreground normal-case tracking-normal"
                    >Wissen</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {options[c.key].map(v => (
                      <label
                        key={v}
                        className="flex items-center gap-2 px-3 py-1 hover:bg-muted/50 cursor-pointer text-xs normal-case tracking-normal"
                      >
                        <Checkbox
                          checked={filters[c.key].has(v)}
                          onCheckedChange={() => toggleFilter(c.key, v)}
                        />
                        <span className="truncate">{v}</span>
                      </label>
                    ))}
                  </div>
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

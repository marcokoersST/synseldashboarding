import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { SLAStatusPill } from "./SLAStatusPill";
import { CandidateLink, UserLink } from "./CandidateLink";
import type { ActionRow, Tier } from "@/data/funnelOperationsData";
import { recruiterById, TIER_COLOR } from "@/data/funnelOperationsData";
import { cn } from "@/lib/utils";

type SortKey = "tier" | "kandidaat" | "reden" | "sla" | "consultant";
type SortDir = "asc" | "desc";

const TIER_ORDER: Record<Tier, number> = { "85+": 0, "70-85": 1, "50-70": 2, "30-50": 3, "0-30": 4 };
const SLA_ORDER = { verlopen: 0, dreigend: 1, binnen: 2, "n/a": 3 } as const;

export function ActionTable({ rows, dense }: { rows: ActionRow[]; dense?: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>("sla");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Record<SortKey, string>>({
    tier: "", kandidaat: "", reden: "", sla: "", consultant: "",
  });

  const enriched = useMemo(() => rows.map(r => {
    // The "consultant" displayed here is the assigned recruiter from the candidate record
    // (per product spec these names represent consultants, despite the recruiterId field).
    const co = recruiterById(r.candidate.recruiterId);
    return { ...r, consultantName: co?.naam ?? "", consultantId: co?.id ?? "" };
  }), [rows]);

  const filtered = useMemo(() => {
    return enriched.filter(r => {
      if (filters.tier && !r.candidate.tier.toLowerCase().includes(filters.tier.toLowerCase())) return false;
      if (filters.kandidaat && !r.candidate.naam.toLowerCase().includes(filters.kandidaat.toLowerCase())) return false;
      if (filters.reden && !r.reason.toLowerCase().includes(filters.reden.toLowerCase())) return false;
      if (filters.sla && !r.sla.label.toLowerCase().includes(filters.sla.toLowerCase()) && !r.sla.status.toLowerCase().includes(filters.sla.toLowerCase())) return false;
      if (filters.consultant && !r.consultantName.toLowerCase().includes(filters.consultant.toLowerCase())) return false;
      return true;
    });
  }, [enriched, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "tier": return (TIER_ORDER[a.candidate.tier] - TIER_ORDER[b.candidate.tier]) * dir;
        case "kandidaat": return a.candidate.naam.localeCompare(b.candidate.naam) * dir;
        case "reden": return a.reason.localeCompare(b.reason) * dir;
        case "sla": {
          const s = (SLA_ORDER[a.sla.status] - SLA_ORDER[b.sla.status]);
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

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const cols: { key: SortKey; label: string; span: string }[] = [
    { key: "tier", label: "Tier", span: "col-span-1" },
    { key: "kandidaat", label: "Kandidaat", span: "col-span-3" },
    { key: "reden", label: "Reden", span: "col-span-3" },
    { key: "sla", label: "SLA", span: "col-span-2" },
    { key: "consultant", label: "Consultant", span: "col-span-3" },
  ];

  return (
    <div>
      {/* Sortable header */}
      <div className="grid grid-cols-12 items-center gap-2 py-1.5 px-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b border-border sticky top-0 z-10">
        {cols.map(c => (
          <button
            key={c.key}
            onClick={() => toggleSort(c.key)}
            className={cn(c.span, "flex items-center gap-1 hover:text-foreground transition-colors text-left")}
          >
            <span>{c.label}</span>
            <SortIcon k={c.key} />
          </button>
        ))}
      </div>
      {/* Filter row */}
      <div className="grid grid-cols-12 items-center gap-2 py-1.5 px-2 bg-background border-b border-border">
        {cols.map(c => (
          <input
            key={c.key}
            value={filters[c.key]}
            onChange={e => setFilters(f => ({ ...f, [c.key]: e.target.value }))}
            placeholder="Filter…"
            className={cn(c.span, "h-6 px-1.5 text-[11px] bg-muted/40 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary")}
          />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-sm text-muted-foreground p-4">Geen acties — alle SLA's binnen.</div>
      )}
      <div className="divide-y divide-border">
        {sorted.map(({ candidate: c, reason, sla, consultantName, consultantId }) => (
          <div key={c.id} className={`grid grid-cols-12 items-center gap-2 ${dense ? "py-1.5" : "py-2"} px-2 text-sm hover:bg-muted/30`}>
            <div className="col-span-1">
              <span
                className="inline-flex items-center justify-center px-1.5 h-5 rounded text-[10px] font-semibold"
                style={{ background: `${TIER_COLOR[c.tier]}20`, color: TIER_COLOR[c.tier] }}
              >
                {c.tier}
              </span>
            </div>
            <div className="col-span-3 min-w-0">
              <CandidateLink id={c.id} name={c.naam} className="truncate" />
            </div>
            <div className="col-span-3 text-muted-foreground truncate">{reason}</div>
            <div className="col-span-2"><SLAStatusPill sla={sla} /></div>
            <div className="col-span-3 text-xs truncate">
              {consultantName ? <UserLink id={consultantId} name={consultantName} /> : <span className="text-muted-foreground">—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

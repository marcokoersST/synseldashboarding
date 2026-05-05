import { useEffect, useMemo, useState } from "react";
import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { getActionList, recruiterById, consultantById, TIER_COLOR } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { TierBadge } from "@/components/funnel-ops/TierBadge";
import { SLAStatusPill } from "@/components/funnel-ops/SLAStatusPill";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TVActiesVandaag() {
  const [, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      setUpdatedAt(new Date());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => getActionList(), [updatedAt]);
  const verlopen = rows.filter(r => r.sla.status === "verlopen").length;
  const dreigend = rows.filter(r => r.sla.status === "dreigend").length;

  const tierMix = useMemo(() => {
    const tiers: Tier[] = ["85+", "70-85", "50-70", "30-50", "0-30"];
    return tiers.map(t => ({ tier: t, n: rows.filter(r => r.candidate.tier === t).length }));
  }, [rows]);

  return (
    <TVDashboardLayout title="Acties vandaag">
      <div className="flex flex-col h-full gap-3">
        {/* Header strip */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <div className="text-base font-bold tracking-tight">Acties vandaag</div>
              <div className="text-xs text-muted-foreground">Kandidaten die nu opvolging nodig hebben</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums">{rows.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">totaal open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-destructive">{verlopen}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">verlopen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-orange-500">{dreigend}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">dreigend</div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <RefreshCw className="w-3 h-3" />
              {updatedAt.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Tier mix */}
        <div className="grid grid-cols-5 gap-2">
          {tierMix.map(({ tier, n }) => (
            <div
              key={tier}
              className="rounded-lg border border-border bg-card px-3 py-2 flex items-center justify-between shadow-sm"
              style={{ borderLeftWidth: 4, borderLeftColor: TIER_COLOR[tier] }}
            >
              <span className="text-xs font-semibold" style={{ color: TIER_COLOR[tier] }}>Tier {tier}</span>
              <span className="text-lg font-bold tabular-nums">{n}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 rounded-lg border border-border bg-card overflow-hidden flex flex-col shadow-sm">
          <div className="grid grid-cols-12 items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border font-semibold">
            <div className="col-span-1">Tier</div>
            <div className="col-span-3">Kandidaat</div>
            <div className="col-span-3">Reden</div>
            <div className="col-span-2">SLA</div>
            <div className="col-span-2">Recruiter</div>
            <div className="col-span-1">Consultant</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {rows.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">Geen acties — alle SLA's binnen.</div>
            )}
            {rows.map(({ candidate: c, reason, sla }) => {
              const r = recruiterById(c.recruiterId);
              const co = consultantById(c.consultantId);
              const overdue = sla.status === "verlopen";
              return (
                <div
                  key={c.id}
                  className={cn(
                    "grid grid-cols-12 items-center gap-2 px-3 py-1.5 text-xs",
                    overdue && "bg-destructive/5"
                  )}
                >
                  <div className="col-span-1"><TierBadge tier={c.tier} /></div>
                  <div className="col-span-3 font-medium truncate">{c.naam}</div>
                  <div className="col-span-3 text-muted-foreground truncate">{reason}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <SLAStatusPill sla={sla} />
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground tabular-nums">
                      <Clock className="w-3 h-3" /> {Math.round(sla.pctElapsed * 100)}%
                    </span>
                  </div>
                  <div className="col-span-2 truncate">{r?.naam ?? "—"}</div>
                  <div className="col-span-1 truncate text-muted-foreground">{co?.naam ?? "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TVDashboardLayout>
  );
}

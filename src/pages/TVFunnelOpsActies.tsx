import { useEffect, useMemo, useState } from "react";
import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import {
  getActionList,
  recruiterById,
  consultantById,
} from "@/data/funnelOperationsData";
import { TierBadge } from "@/components/funnel-ops/TierBadge";
import { SLAStatusPill } from "@/components/funnel-ops/SLAStatusPill";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TVFunnelOpsActies() {
  const [, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setUpdatedAt(new Date());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => getActionList(), [updatedAt]);
  const verlopen = rows.filter((r) => r.sla.status === "verlopen").length;
  const dreigend = rows.filter((r) => r.sla.status === "dreigend").length;

  return (
    <TVDashboardLayout title="Funnel Operations · Acties vandaag">
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 rounded-lg border border-border bg-card overflow-hidden flex flex-col shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-base font-semibold">Acties vandaag</span>
              <span className="text-sm text-muted-foreground">
                {rows.length} open ·{" "}
                <span className="text-destructive font-medium">{verlopen} verlopen</span> ·{" "}
                <span className="text-orange-500 font-medium">{dreigend} dreigend</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5" />
              {updatedAt.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/20 border-b border-border font-semibold">
            <div className="col-span-1">Tier</div>
            <div className="col-span-4">Kandidaat</div>
            <div className="col-span-3">SLA</div>
            <div className="col-span-2">Recruiter</div>
            <div className="col-span-2">Consultant</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {rows.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Geen acties — alle SLA's binnen.
              </div>
            )}
            {rows.map(({ candidate: c, sla }) => {
              const r = recruiterById(c.recruiterId);
              const co = consultantById(c.consultantId);
              const overdue = sla.status === "verlopen";
              return (
                <div
                  key={c.id}
                  className={cn(
                    "grid grid-cols-12 items-center gap-2 px-4 py-2 text-xs",
                    overdue && "bg-destructive/5"
                  )}
                >
                  <div className="col-span-1">
                    <TierBadge tier={c.tier} />
                  </div>
                  <div className="col-span-4 font-medium truncate">{c.naam}</div>
                  <div className="col-span-3">
                    <SLAStatusPill sla={sla} />
                  </div>
                  <div className="col-span-2 truncate text-muted-foreground">
                    {r?.naam ?? "—"}
                  </div>
                  <div className="col-span-2 truncate text-muted-foreground">
                    {co?.naam ?? "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TVDashboardLayout>
  );
}

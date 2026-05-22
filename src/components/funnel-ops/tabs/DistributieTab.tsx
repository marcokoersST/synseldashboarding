import { Card } from "@/components/ui/card";
import { HitRateMatrix } from "../HitRateMatrix";
import { leadTimeMeters, kpis, getActionList, TIER_COLOR } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { ActionList } from "../ActionList";
import { TrendingUp, Gauge, Shuffle, LayoutGrid, AlertTriangle } from "lucide-react";
import { TileInfo } from "../TileInfo";

export function DistributieTab() {
  const meters = leadTimeMeters();
  const dist = kpis.distributieFit;
  const mismatch = getActionList(8);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* B3 — Snelheid */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" />B3 · Distributie-snelheid</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["Toewijzen","Eerste contact","Eerste gesprek"] as const).map((label, idx) => {
            const what =
              label === "Toewijzen"
                ? "Speed at which a candidate is moved from status 'Nieuw' to status '1 | Inschrijven' per Tier. Shows how quickly the recruitment team registers an incoming application as an actual signup."
                : label === "Eerste contact"
                ? "Time between the moment a candidate lands on status '1 | Inschrijven' with a Consultant and the first outgoing call attempt to that candidate."
                : "Time between the moment a candidate lands on status '1 | Inschrijven' and the first real phone conversation with the candidate (minimum 2 minutes of talk time).";
            const formula =
              label === "Toewijzen"
                ? "hours_to_assign = ts('1 | Inschrijven') − ts('Nieuw')\np50 / p90 aggregated per tier\nbar fill = value / SLA × 100"
                : label === "Eerste contact"
                ? "hours_to_first_call = ts(first_outbound_call) − ts('1 | Inschrijven')\np50 / p90 aggregated per tier\nbar fill = value / SLA × 100"
                : "hours_to_first_conversation = ts(first_call WHERE talk_time ≥ 120s) − ts('1 | Inschrijven')\np50 / p90 aggregated per tier\nbar fill = value / SLA × 100";
            return (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">{label} · lead-time per tier</div>
                <TileInfo title={`${label} · lead time`} what={what} formula={formula} source="leadTimeMeters()" notes="Tier SLAs are defined in SLA_MATRIX." />
              </div>
              <div className="space-y-1.5">
                {meters.map(m => {
                  const value = idx === 1 ? m.p50 : idx === 2 ? m.p90 : m.p50 / 2;
                  const sla = idx === 0 ? m.sla / 4 : idx === 1 ? m.sla : m.sla * 12;
                  const pct = Math.min(100, (value / sla) * 100);
                  return (
                    <div key={m.tier} className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-8" style={{ color: TIER_COLOR[m.tier as Tier] }}>{m.tier}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full" style={{ width: `${pct}%`, background: pct < 80 ? "hsl(var(--success))" : pct < 100 ? "hsl(25 90% 55%)" : "hsl(var(--destructive))" }} />
                      </div>
                      <span className="text-[11px] tabular-nums w-12 text-right text-muted-foreground">{value.toFixed(1)}u</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            );
          })}
        </div>
      </section>

      {/* B4 — Juistheid */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2"><Shuffle className="w-4 h-4 text-orange-500" />B4 · Distributie-juistheid</h2>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Optimalisatie-potentie</div>
                <TileInfo title="Optimisation potential" what="Gap between current placements and the ideal placements that would result from optimal consultant routing. Quantifies the cost of mis-assignments." formula="ideal = actual × 1.18\npotential = ideal − actual" source="kpis.distributieFit" notes="The Forecast tab shows per-candidate which consultant should pick them up." />
              </div>
              <div className="text-xl font-semibold">
                Huidige plaatsingen: <span className="tabular-nums">{dist.actual}</span> · ideale distributie: <span className="tabular-nums">{dist.ideal}</span>{" "}
                <span className="text-orange-500">(+{dist.ideal - dist.actual})</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Bij toewijzen op basis van historische hit-rates per consultant × functiegroep.</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-primary" />Hit-rate matrix · consultant × functiegroep</h3>
            <TileInfo title="Hit-rate matrix" what="Historical conversion percentage per consultant and job family. Cells with n<5 are hidden to avoid drawing conclusions on thin data." formula="hit_rate = placed / assigned × 100" source="hitRateMatrix(mode)" notes="Toggle 'historical' vs '12-week rolling' to inspect the stability of the scores." />
          </div>
          <HitRateMatrix />
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />SLA action list</h3>
              <p className="text-xs text-muted-foreground">Candidates with a breached or imminent Contact-SLA. Open RecruitCRM in a new tab to follow up.</p>
            </div>
            <TileInfo title="SLA action list" what="Candidates ranked by SLA urgency (breached first, then at-risk). Drives the next-best-action queue for recruiters." formula="getActionList(8) — sort by SLA deadline asc" source="getActionList()" />
          </div>
          <ActionList rows={mismatch} />
        </Card>
      </section>
    </div>
  );
}

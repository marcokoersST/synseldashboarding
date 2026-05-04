import { Card } from "@/components/ui/card";
import { HitRateMatrix } from "../HitRateMatrix";
import { leadTimeMeters, kpis, getActionList, TIER_COLOR } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { ActionList } from "../ActionList";
import { TrendingUp } from "lucide-react";
import { TileInfo } from "../TileInfo";

export function DistributieTab() {
  const meters = leadTimeMeters();
  const dist = kpis.distributieFit;
  const mismatch = getActionList(8);

  return (
    <div className="space-y-6">
      {/* B3 — Snelheid */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">B3 · Distributie-snelheid</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["Toewijzen","Eerste contact","Eerste gesprek"] as const).map((label, idx) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">{label} · lead-time per tier</div>
                <TileInfo title={`${label} · lead time`} what={`P50 and P90 lead time per tier for the "${label.toLowerCase()}" step. Reveals where the funnel slows down for the most valuable cohorts.`} formula="p50 = median(hours); p90 = 90th percentile\nbar fill = value / SLA × 100" source="leadTimeMeters()" notes="Tier SLAs are defined in SLA_MATRIX." />
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
          ))}
        </div>
      </section>

      {/* B4 — Juistheid */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">B4 · Distributie-juistheid</h2>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Optimalisatie-potentie</div>
                <TileInfo title="Optimalisatie-potentie" what="Verschil tussen huidige plaatsingen en het ideaal bij optimale consultant-routing." formula="ideal = actual × 1.18\npotentie = ideal − actual" source="kpis.distributieFit" notes="Op het Forecast-tabblad kan je per kandidaat zien wie naar wie moet." />
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
            <h3 className="text-sm font-semibold">Hit-rate matrix · consultant × functiegroep</h3>
            <TileInfo title="Hit-rate matrix" what="Historische conversie-percentage per consultant en functiegroep. Cellen met n<5 worden niet getoond." formula="hit_rate = geplaatst / toegewezen × 100" source="hitRateMatrix(mode)" notes="Toggle 'historisch' vs '12-weeks rollend' toont stabiliteit van de scores." />
          </div>
          <HitRateMatrix />
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">SLA-actielijst</h3>
              <p className="text-xs text-muted-foreground">Kandidaten met een verlopen of dreigende Contact-SLA. Klik door naar RecruitCRM voor opvolging.</p>
            </div>
            <TileInfo title="SLA-actielijst" what="Kandidaten gesorteerd op SLA-urgentie (verlopen eerst, dan dreigend)." formula="getActionList(8) — sort by SLA-deadline asc" source="getActionList()" />
          </div>
          <ActionList rows={mismatch} />
        </Card>
      </section>
    </div>
  );
}

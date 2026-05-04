import { FunnelQualityLayout } from "@/components/funnel-quality/FunnelQualityLayout";
import { InfoTooltip } from "@/components/funnel-quality/InfoTooltip";
import { CounterfactualChart } from "@/components/funnel-quality/CounterfactualChart";
import { MixSlider } from "@/components/funnel-quality/MixSlider";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";
import { trendData, mixShareAnnotations, counterfactual2025Gap } from "@/data/funnelQualityData";

export default function FunnelQualityMixImpact() {
  return (
    <FunnelQualityLayout
      title="Mix-impact analyse"
      subtitle="Hoeveel plaatsingen zijn we 'misgelopen' door de mix-shift? En wat kan een gerichte mix-keuze opleveren?"
    >
      {/* Counterfactual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold">Counterfactual: werkelijk vs mix-stabiel scenario</h2>
            <InfoTooltip text="Werkelijke plaatsingen per kwartaal vs. een scenario waarbij de mix nieuw/heract gelijk was gebleven aan 2023. Het verschil is de 'gemiste' opbrengst." />
          </div>
          <CounterfactualChart height={300} />
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-destructive">Gemist in 2025:</span> ~{counterfactual2025Gap} extra plaatsingen indien de instroom-mix gelijk was gebleven aan 2023.
          </p>
        </div>

        {/* Mix slider */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold">Mix-slider</h2>
            <InfoTooltip text="Verschuif de schuiven en zie real-time wat de verwachte plaatsingen zijn op basis van vaste cohortconversies." />
          </div>
          <MixSlider />
        </div>
      </div>

      {/* Stacked area mix-aandeel */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Aandeel heractivering over tijd</h2>
          <InfoTooltip defKey="mixShare" />
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={trendData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={2} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0, 70]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <Area type="monotone" dataKey="pctHeractivering" stroke="hsl(25 95% 53%)" fill="hsl(25 95% 53%)" fillOpacity={0.25} name="% heractivering" />
              {mixShareAnnotations.first40 && (
                <ReferenceLine x={mixShareAnnotations.first40} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: "Eerste mnd >40%", fontSize: 10, fill: "hsl(var(--muted-foreground))", position: "top" }} />
              )}
              {mixShareAnnotations.first50 && (
                <ReferenceLine x={mixShareAnnotations.first50} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: "Eerste mnd >50%", fontSize: 10, fill: "hsl(var(--destructive))", position: "top" }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </FunnelQualityLayout>
  );
}

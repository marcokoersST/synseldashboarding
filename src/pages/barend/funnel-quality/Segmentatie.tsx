import { FunnelQualityLayout } from "@/components/funnel-quality/FunnelQualityLayout";
import { InfoTooltip } from "@/components/funnel-quality/InfoTooltip";
import { ForestPlot } from "@/components/funnel-quality/ForestPlot";
import { BubbleScatter } from "@/components/funnel-quality/BubbleScatter";
import { miniSurvivalByCluster } from "@/data/funnelQualityData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const NEW = "hsl(142 71% 45%)";
const REACT = "hsl(25 95% 53%)";

export default function FunnelQualitySegmentatie() {
  return (
    <FunnelQualityLayout
      title="Segmentatie"
      subtitle="Verschilt het effect per cluster of regio? Check op Simpson's paradox via small-multiples en hazard ratios per segment."
    >
      {/* Small-multiples KM per cluster */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Mini KM-curves per cluster</h2>
          <InfoTooltip text="Survival-curves per vacaturetitel cluster. Visueel patroon-checken of de groen-vs-oranje gap consistent is." />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {miniSurvivalByCluster.map((row) => (
            <div key={row.cluster} className="rounded-md border border-border bg-background p-2">
              <p className="text-[11px] font-medium text-foreground mb-1 truncate">{row.cluster}</p>
              <div style={{ width: "100%", height: 110 }}>
                <ResponsiveContainer>
                  <LineChart data={row.points} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 8 }} hide />
                    <YAxis domain={[0.9, 1]} tick={{ fontSize: 8 }} hide />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 10 }} formatter={(v: number) => `${(v * 100).toFixed(2)}%`} labelFormatter={(d) => `Dag ${d}`} />
                    <Line type="monotone" dataKey="newSurv" stroke={NEW} strokeWidth={1.6} dot={false} />
                    <Line type="monotone" dataKey="reactSurv" stroke={REACT} strokeWidth={1.6} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forest plot */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Forest plot — HR per (cluster × regio)</h2>
          <InfoTooltip defKey="hr" />
        </div>
        <ForestPlot />
      </div>

      {/* Bubble scatter */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Cohortconversie 6m: Nieuw vs Heractivering</h2>
          <InfoTooltip text="Bubbles onder de y=x lijn zijn segmenten waar heractivering significant slechter presteert dan nieuw. Bubble-grootte = n." />
        </div>
        <BubbleScatter height={340} />
      </div>
    </FunnelQualityLayout>
  );
}

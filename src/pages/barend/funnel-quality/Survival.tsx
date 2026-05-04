import { useState } from "react";
import { FunnelQualityLayout } from "@/components/funnel-quality/FunnelQualityLayout";
import { InfoTooltip } from "@/components/funnel-quality/InfoTooltip";
import { KMChart } from "@/components/funnel-quality/KMChart";
import { CohortHeatmap } from "@/components/funnel-quality/CohortHeatmap";
import { CohortDetailPanel } from "@/components/funnel-quality/CohortDetailPanel";
import { logRankResult, survivalMedians } from "@/data/funnelQualityData";
import { CheckCircle2 } from "lucide-react";

export default function FunnelQualitySurvival() {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <FunnelQualityLayout
      title="Cohort Survival"
      subtitle="Wetenschappelijk zuivere vergelijking tussen nieuwe kandidaten en heractiveringen — Kaplan-Meier + log-rank."
    >
      {/* KM-curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-semibold">Kaplan-Meier survival curves</h2>
            <InfoTooltip defKey="survival" />
          </div>
          <KMChart height={360} />
        </div>

        {/* Log-rank result */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Log-rank test</h2>
              <InfoTooltip text="Statistische test of de twee survival-curves significant van elkaar verschillen. p<0.05 = wel significant." />
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">χ²</span><span className="font-bold tabular-nums">{logRankResult.chiSquare}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">df</span><span className="font-bold tabular-nums">{logRankResult.df}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">p-waarde</span><span className="font-bold tabular-nums text-emerald-600">{logRankResult.p}</span></div>
            </div>
            <div className="mt-3 p-2 rounded-md bg-emerald-500/10 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{logRankResult.interpretation}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-border space-y-1.5 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Mediaan tijd-tot-plaatsing</p>
            <div className="flex justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Nieuw</span><span className="font-bold tabular-nums">{survivalMedians.nieuw} dagen</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" />Heractivering</span><span className="font-bold tabular-nums">{survivalMedians.heractivering} dagen</span></div>
          </div>
        </div>
      </div>

      {/* Cohort heatmap */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Cohort heatmap — cumulatieve conversie %</h2>
          <InfoTooltip text="Rijen = inschrijvingsmaand. Kolommen = cohortleeftijd in maanden. Cellen kleuren met conversie %. Klik een rij voor cohort-detail." />
        </div>
        <CohortHeatmap selectedMonth={selected} onSelectMonth={(m) => { setSelected(m); setOpen(true); }} />
      </div>

      <CohortDetailPanel month={selected} open={open} onClose={() => setOpen(false)} />
    </FunnelQualityLayout>
  );
}

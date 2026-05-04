import { FunnelQualityLayout } from "@/components/funnel-quality/FunnelQualityLayout";
import { InfoTooltip } from "@/components/funnel-quality/InfoTooltip";
import { CoxTable } from "@/components/funnel-quality/CoxTable";
import { SchoenfeldPlot } from "@/components/funnel-quality/SchoenfeldPlot";
import { Button } from "@/components/ui/button";
import { coxModel, modelFit } from "@/data/funnelQualityData";
import { Download } from "lucide-react";

function downloadCsv() {
  const header = "covariate,coef,hr,ci_low,ci_high,p_value\n";
  const rows = coxModel.map((r) => `"${r.covariate}",${r.coef},${r.hr},${r.ciLow},${r.ciHigh},${r.p}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cox-model-output.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function FunnelQualityStats() {
  return (
    <FunnelQualityLayout
      title="Statistische output"
      subtitle="Volledige Cox proportional hazards modeluitkomst, fit-statistieken en methodologie — voor verantwoording en reproductie."
    >
      {/* Model fit cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Concordance index", value: modelFit.concordanceIndex.toFixed(2) },
          { label: "AIC", value: modelFit.aic.toLocaleString("nl-NL") },
          { label: "n events", value: modelFit.nEvents.toLocaleString("nl-NL") },
          { label: "n censored", value: modelFit.nCensored.toLocaleString("nl-NL") },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Cox model output */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Cox proportional hazards — modeloutput</h2>
            <InfoTooltip text="Coëfficiënten, hazard ratios, betrouwbaarheidsintervallen en p-waarden voor alle covariaten in het model." />
          </div>
          <Button size="sm" variant="outline" className="gap-2" onClick={downloadCsv}>
            <Download className="w-3.5 h-3.5" />
            Exporteer CSV
          </Button>
        </div>
        <CoxTable />
      </div>

      {/* Schoenfeld */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Schoenfeld residuals — proportional hazards check</h2>
          <InfoTooltip text="Visuele check van de proportional-hazards aanname. Een vlakke residuelijn ≈ aanname houdt stand." />
        </div>
        <SchoenfeldPlot />
      </div>

      {/* Methodology */}
      <div className="rounded-lg border border-border bg-card p-4 prose prose-sm max-w-none">
        <h2 className="text-sm font-semibold mb-2">Methodologie</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We gebruiken <strong>Kaplan-Meier (KM)</strong> overlevingsanalyse om voor elk cohort de overlevingscurve te schatten — d.w.z.
          het percentage kandidaten dat op tijdstip t nog niet geplaatst is. Censoring wordt toegepast op kandidaten die op de peildatum
          nog in de pijp zitten.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          De <strong>log-rank test</strong> toetst of de overlevingscurves van twee groepen (nieuw vs heractivering) statistisch significant
          verschillen. χ²-statistiek met 1 vrijheidsgraad; p-waarde &lt; 0,05 = significant verschil.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          Met <strong>Cox proportional hazards regressie</strong> schatten we de marginale bijdrage van elk type instroom, gecontroleerd voor
          plaatsbaarheidscore, NLQF, ervaring, regio, cluster en marktindex. Aannames: proportional hazards (gecheckt via Schoenfeld), geen
          informatieve censoring. <em>Beperking:</em> mock-data — replicatie op productie nodig vóór beleidsbesluit.
        </p>
      </div>
    </FunnelQualityLayout>
  );
}

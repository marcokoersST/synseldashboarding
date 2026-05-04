import { FunnelQualityLayout } from "@/components/funnel-quality/FunnelQualityLayout";
import { InfoTooltip } from "@/components/funnel-quality/InfoTooltip";
import { trendData, trendInsights } from "@/data/funnelQualityData";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart,
} from "recharts";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const NEW = "hsl(142 71% 45%)";
const REACT = "hsl(25 95% 53%)";
const PLACE = "hsl(259 94% 51%)";

function Tile({ icon: Icon, label, value, suffix, tone, defKey }: any) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
        {defKey && <InfoTooltip defKey={defKey} />}
      </div>
      <p className={cn("text-2xl font-bold tabular-nums mt-1", tone)}>
        {value}{suffix}
      </p>
    </div>
  );
}

export default function FunnelQualityTrend() {
  return (
    <FunnelQualityLayout
      title="Trend & Stagnatie"
      subtitle="Inschrijvingen stijgen, plaatsingen stagneren — gedreven door verschuiving in instroom-mix."
    >
      {/* Insight tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Tile icon={TrendingUp} label="Mix-shift heractivering / jaar" value={`+${trendInsights.mixShiftPerYear}`} suffix=" pp" tone="text-orange-600" defKey="mixShare" />
        <Tile icon={TrendingDown} label="Plaatsingen geannualiseerd vs 2023" value={trendInsights.placementsAnnualizedVs2023} suffix="%" tone="text-destructive" />
        <Tile icon={Activity} label="p-waarde mix-trend" value={trendInsights.pTrendMix.toExponential(1)} suffix="" tone="text-emerald-600" />
      </div>

      {/* Stacked bar + plaatsingen line */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Inschrijvingen (gestapeld) vs. plaatsingen</h2>
          <InfoTooltip text="Stacked bars per maand (groen = nieuw, oranje = heractivering). Lijn = plaatsingen per maand op secundaire y-as." />
        </div>
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            <ComposedChart data={trendData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={2} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: PLACE }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="nieuw" stackId="a" fill={NEW} name="Nieuw" />
              <Bar yAxisId="left" dataKey="heractivering" stackId="a" fill={REACT} name="Heractivering" />
              <Line yAxisId="right" type="monotone" dataKey="plaatsingen" stroke={PLACE} strokeWidth={2.5} dot={false} name="Plaatsingen" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indexed trendlines */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold">Geïndexeerde groei (jan-2023 = 100)</h2>
          <InfoTooltip text="Toont divergentie: inschrijvingen-totaal en nieuwe-kandidaat-volume vs plaatsingen, allen herschaald naar januari 2023 = 100." />
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="totalIdx" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} name="Inschrijvingen totaal" />
              <Line type="monotone" dataKey="nieuwIdx" stroke={NEW} strokeWidth={2} dot={false} name="Nieuwe kandidaten" />
              <Line type="monotone" dataKey="plaatsingenIdx" stroke={PLACE} strokeWidth={2} dot={false} name="Plaatsingen" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </FunnelQualityLayout>
  );
}

import { Card } from "@/components/ui/card";
import { SourceTreeView } from "../SourceTreeView";
import { ScoreHistogram } from "../ScoreHistogram";
import { QualityHeatmap } from "../QualityHeatmap";
import { dailyInstroom, kpis, candidates } from "@/data/funnelOperationsData";
import { CandidateLink } from "../CandidateLink";
import { TierBadge } from "../TierBadge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TileInfo } from "../TileInfo";

export function InstroomTab() {
  const trend = dailyInstroom;
  const top = [...candidates]
    .filter(c => c.score >= 75 && (Date.now() - c.toegewezenOp) < 7 * 24 * 3600 * 1000)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return (
    <div className="space-y-6">
      {/* A1 — Volume */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">A1 · Instroom volume</h2>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-muted-foreground">Instroom per dag (8 weken) — gestapeld nieuw / bestaand</div>
            <TileInfo title="Instroom per dag" what="Stapelgrafiek met dagelijkse instroom van nieuwe en bestaande kandidaten over 8 weken." formula="bucket per dag uit candidates.toegewezenOp\nsplit op candidate.type" source="dailyInstroom" notes="Geseed met 1729 — getallen wijken bewust niet af tussen sessies." />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="dag" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={6} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="nieuw" stackId="a" fill="hsl(var(--success))" name="Nieuw" />
                <Bar dataKey="bestaand" stackId="a" fill="hsl(25 90% 55%)" name="Bestaand" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <SourceTreeView />
      </section>

      {/* A2 — Kwaliteit */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">A2 · Instroom kwaliteit</h2>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Hero</div>
          <div className="mt-1 text-2xl">
            Gem. plaatsbaarheidscore deze week is{" "}
            <span className="font-bold text-3xl tabular-nums">{kpis.instroomKwaliteit.value}</span>{" "}
            <span className={`text-sm font-semibold ${kpis.instroomKwaliteit.value - kpis.instroomKwaliteit.prev >= 0 ? "text-success" : "text-destructive"}`}>
              ({kpis.instroomKwaliteit.value - kpis.instroomKwaliteit.prev >= 0 ? "+" : ""}{kpis.instroomKwaliteit.value - kpis.instroomKwaliteit.prev} vs vorige week)
            </span>.
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ScoreHistogram filter="totaal" title="Score-verdeling · totaal" />
          <ScoreHistogram filter="nieuw" title="Score-verdeling · nieuw" />
          <ScoreHistogram filter="bestaand" title="Score-verdeling · bestaand" />
        </div>
        <QualityHeatmap />

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-sm font-semibold">Top kandidaten laatste 7 dagen (score ≥75)</div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground bg-muted/20">
              <tr>
                <th className="text-left p-2 font-normal">Kandidaat</th>
                <th className="p-2 font-normal">Tier</th>
                <th className="p-2 font-normal text-right">Score</th>
                <th className="text-left p-2 font-normal">Unit</th>
                <th className="text-left p-2 font-normal">Functiegroep</th>
                <th className="text-left p-2 font-normal">Bron</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {top.map(c => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="p-2"><CandidateLink id={c.id} name={c.naam} /></td>
                  <td className="p-2"><TierBadge tier={c.tier} /></td>
                  <td className="p-2 text-right tabular-nums font-semibold">{c.score}</td>
                  <td className="p-2">{c.unit}</td>
                  <td className="p-2">{c.functiegroep}</td>
                  <td className="p-2 text-muted-foreground">{c.bron}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

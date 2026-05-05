import { Card } from "@/components/ui/card";
import { SourceTreeView } from "../SourceTreeView";
import { ScoreHistogram } from "../ScoreHistogram";
import { QualityHeatmap } from "../QualityHeatmap";
import { dailyInstroom, kpis, candidates } from "@/data/funnelOperationsData";
import { CandidateLink } from "../CandidateLink";
import { TierBadge } from "../TierBadge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TileInfo } from "../TileInfo";
import { BarChart3, GitBranch, LineChart as LineIcon, Grid3x3, Trophy } from "lucide-react";

export function InstroomTab() {
  const trend = dailyInstroom;
  const top = [...candidates]
    .filter(c => c.score >= 75 && (Date.now() - c.toegewezenOp) < 7 * 24 * 3600 * 1000)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* A1 — Volume */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2"><LineIcon className="w-4 h-4 text-success" />A1 · Instroom volume</h2>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-muted-foreground">Instroom per dag (8 weken) — gestapeld nieuw / bestaand</div>
            <TileInfo title="Daily inflow" what="Stacked bar chart of daily candidate inflow over 8 weeks, split by new vs returning candidates. Used to detect demand patterns and channel-mix shifts." formula="bucket per day from candidates.toegewezenOp\nsplit on candidate.type" source="dailyInstroom" notes="Seeded PRNG (seed 1729) — values are deliberately stable across sessions." />
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
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-medium text-muted-foreground">Bron-treeview · volume per hoofdbron en sub-bron</div>
            <TileInfo
              title="Source treeview · volume per utm_medium"
              what={
                "Hierarchical breakdown of candidate volume per utm_medium and its sub-channel (utm_source). Per row: total volume, % new vs returning, average placeability score (0-100) and conversion to status Inschrijven.\n\n" +
                "Mediums:\n" +
                "  1. Jobboards paid       → utm_medium = paid_jobboard\n" +
                "  2. Jobboards organic    → utm_medium = organic_jobboard\n" +
                "  3. Paid social          → utm_medium = paid_social\n" +
                "  4. Organic social       → utm_medium = organic_social\n" +
                "  5. Reactivation         → utm_medium = app OR mail\n" +
                "  6. Direct               → utm_medium = direct_mail OR direct_telefoon\n" +
                "  7. CV databases         → utm_medium = cv_database\n" +
                "  8. LinkedIn recruiter   → utm_medium = recruiter"
              }
              formula={
                "totaal     = count(candidates with utm_medium = m)\n" +
                "%nieuw     = count(type = nieuw) / totaal × 100\n" +
                "score      = mean(placeability_score) over candidates in m\n" +
                "conversie  = count(status reached '1 | Inschrijven') / totaal × 100"
              }
              source="sourceTree · RecruitCRM utm_medium / utm_source + placeability score"
            />
          </div>
          <SourceTreeView />
        </Card>
      </section>

      {/* A2 — Kwaliteit */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />A2 · Instroom kwaliteit</h2>
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Grid3x3 className="w-4 h-4 text-primary" />Score-verdeling per type</h3>
            <TileInfo title="Score distribution" what="Number of candidates per tier (D through A+), broken down by total, new and returning candidates. Used to monitor whether sourcing keeps producing the expected quality mix." formula="bucket on tier field\nA+: 90-100 · A: 75-89 · B: 55-74 · C: 35-54 · D: 0-34" source="scoreHistogram(filter)" notes="Mock distribution: 5/15/30/35/15." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ScoreHistogram filter="totaal" title="Score-verdeling · totaal" />
            <ScoreHistogram filter="nieuw" title="Score-verdeling · nieuw" />
            <ScoreHistogram filter="bestaand" title="Score-verdeling · bestaand" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2"><GitBranch className="w-4 h-4 text-primary" />Kwaliteit per Unit × Functiegroep</h3>
            <TileInfo title="Quality heatmap" what="Average placeability score per Business Unit and job family. Reveals where strong demand meets weak supply (or vice versa)." formula="cell = avg(score) WHERE unit=X AND functiegroep=Y" source="qualityHeatmap(filter)" notes="Cells with n<5 are dimmed — too thin to draw conclusions." />
          </div>
          <QualityHeatmap />
        </div>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" />Top kandidaten laatste 7 dagen (score ≥75)</div>
            <TileInfo title="Top candidates" what="The 12 highest-scoring candidates that entered the funnel in the last 7 days. Click a name to open the candidate profile in RecruitCRM." formula="filter: score ≥ 75 AND assigned ≤ 7d ago\nsort: score desc · top 12" source="candidates" />
          </div>
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

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { DevNote } from "@/components/groeimodel/DevNote";

const CONSULTANT_DEV_LOGIC = `Naam: Name of the consultants

Actieve vacatures: amount of open vacancies the consultant has on their name.

# matches: the amount of candidates that were matched on the vacancies where the consultant is the owner

# plaatsingen: the amount of placements that were matched on the vacancies where the consultant is the owner.

After this each are the conversion rates from this step since the previous step in the funnel.`;
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FUNNEL_STEPS,
  consultantRows,
  teamFunnel,
  vacatureRows,
  type PreMatchingFilters,
} from "@/data/preMatchingData";

interface Props {
  filters: PreMatchingFilters;
  onSelectVacature: (id: string) => void;
}

const STEP_LABELS = [
  "Match → consultant",
  "Consultant → kandidaat",
  "Kandidaat → klant",
  "Klant → plaatsing",
];

export function ConsultantInzichtTab({ filters, onSelectVacature }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(() => consultantRows(filters), [filters]);
  const team = useMemo(() => teamFunnel(filters), [filters]);
  const teamSteps = [1, 2, 3, 4].map((i) => team[i].conversion ?? 0);

  const vacRows = useMemo(() => vacatureRows(filters), [filters]);

  if (selected) {
    const row = rows.find((r) => r.consultant === selected);
    const chartData = STEP_LABELS.map((label, i) => ({
      stap: label,
      consultant: Math.round(row?.steps[i + 1] ?? 0),
      team: Math.round(teamSteps[i]),
    }));
    const mine = vacRows.filter((v) => v.vacature.consultant === selected);

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug naar alle consultants
        </Button>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Consultant</div>
            <div className="text-lg font-bold text-foreground">{selected}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Actieve vacatures</div>
            <div className="text-2xl font-bold tabular-nums text-foreground">{row?.actieveVacatures ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Matches in periode</div>
            <div className="text-2xl font-bold tabular-nums text-foreground">{row?.matches ?? 0}</div>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversie per funnelstap — consultant vs. teamgemiddelde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="stap" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis unit="%" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number, n: string) => [`${v}%`, n === "consultant" ? selected : "Team"]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === "consultant" ? selected : "Teamgemiddelde")} />
                  <Bar dataKey="consultant" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="team" fill="hsl(var(--muted-foreground))" fillOpacity={0.45} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vacatures van {selected}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Vacature</th>
                  <th className="px-3 py-2 text-left font-medium">Klant</th>
                  <th className="px-3 py-2 text-right font-medium"># Matches</th>
                  <th className="px-3 py-2 text-right font-medium"># Plaatsingen</th>
                  <th className="px-3 py-2 text-right font-medium">Conversie%</th>
                  <th className="px-3 py-2 text-right font-medium">Gemiste kansen</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((r) => (
                  <tr
                    key={r.vacature.id}
                    onClick={() => onSelectVacature(r.vacature.id)}
                    className="cursor-pointer border-t border-border hover:bg-muted/40"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">{r.vacature.titel}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.vacature.klant}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.matches}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.plaatsingen}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.conversie.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.gemisteKansen}</td>
                  </tr>
                ))}
                {mine.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      Geen vacatures binnen de huidige filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Conversie per funnelstap — alle consultants</CardTitle>
        <p className="text-xs text-muted-foreground">Klik op een rij voor de individuele drill-down.</p>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Consultant</th>
              <th className="px-3 py-2 text-right font-medium">Actieve vac.</th>
              <th className="px-3 py-2 text-right font-medium"># Matches</th>
              <th className="px-3 py-2 text-right font-medium"># Plaatsingen</th>
              {STEP_LABELS.map((l) => (
                <th key={l} className="px-3 py-2 text-right font-medium">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.consultant}
                onClick={() => setSelected(r.consultant)}
                className="cursor-pointer border-t border-border hover:bg-muted/40"
              >
                <td className="px-3 py-2 font-medium text-foreground">{r.consultant}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.actieveVacatures}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.matches}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.plaatsingen}</td>
                {[1, 2, 3, 4].map((i) => {
                  const v = r.steps[i] ?? 0;
                  const delta = v - teamSteps[i - 1];
                  return (
                    <td
                      key={i}
                      className={cn(
                        "px-3 py-2 text-right tabular-nums",
                        delta >= 5 ? "text-emerald-600" : delta <= -5 ? "text-destructive" : "text-foreground",
                      )}
                    >
                      {v.toFixed(1)}%
                      <span className="ml-1 text-[10px] opacity-70">
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(1)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/40 font-semibold">
              <td className="px-3 py-2">Teamgemiddelde</td>
              <td className="px-3 py-2" />
              <td className="px-3 py-2 text-right tabular-nums">{team[0].count}</td>
              <td className="px-3 py-2 text-right tabular-nums">{team[4].count}</td>
              {teamSteps.map((v, i) => (
                <td key={i} className="px-3 py-2 text-right tabular-nums">{v.toFixed(1)}%</td>
              ))}
            </tr>
          </tfoot>
        </table>
        <div className="px-3 py-2 text-[11px] text-muted-foreground">
          Stappen: {FUNNEL_STEPS.join(" → ")}
        </div>
      </CardContent>
    </Card>
  );
}

export default ConsultantInzichtTab;

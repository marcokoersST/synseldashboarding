import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import FunnelSteps from "@/components/pre-matching/FunnelSteps";
import {
  aggregateFunnel,
  filterMatches,
  trendByWeek,
  vacatureRows,
  type PreMatchingFilters,
} from "@/data/preMatchingData";

type SortKey = "gemisteKansen" | "matches" | "plaatsingen" | "conversie" | "titel";

const SERIES = [
  { key: "s1", label: "Match → consultant", color: "hsl(var(--primary))" },
  { key: "s2", label: "Consultant → kandidaat", color: "hsl(199 89% 48%)" },
  { key: "s3", label: "Kandidaat → klant", color: "hsl(38 92% 50%)" },
  { key: "s4", label: "Klant → plaatsing", color: "hsl(142 71% 45%)" },
  { key: "e2e", label: "Match → plaatsing (totaal)", color: "hsl(280 65% 55%)" },
] as const;

interface Props {
  filters: PreMatchingFilters;
  onSelectVacature: (id: string) => void;
}

export function OverviewTab({ filters, onSelectVacature }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "gemisteKansen", dir: "desc" });
  const [visible, setVisible] = useState<string[]>(SERIES.map((s) => s.key));

  const ms = useMemo(() => filterMatches(filters), [filters]);
  const funnel = useMemo(() => aggregateFunnel(ms), [ms]);
  const trend = useMemo(() => trendByWeek(ms), [ms]);
  const rows = useMemo(() => vacatureRows(filters), [filters]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const val = (r: typeof a) =>
        sort.key === "titel" ? r.vacature.titel : (r[sort.key] as number);
      const av = val(a);
      const bv = val(b);
      if (typeof av === "string" && typeof bv === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [rows, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));

  const Th = ({ k, children, align = "right" }: { k: SortKey; children: React.ReactNode; align?: "left" | "right" }) => (
    <th className={cn("px-3 py-2 font-medium", align === "right" ? "text-right" : "text-left")}>
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
        {children}
        <ArrowUpDown className={cn("h-3 w-3", sort.key === k ? "opacity-100" : "opacity-30")} />
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Totaalfunnel</h2>
        <FunnelSteps data={funnel} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Alle vacatures — gesorteerd op grootste gemiste kans</CardTitle>
          <p className="text-xs text-muted-foreground">
            Gemiste kans = matches met matchscore &gt; 80% die nooit bij de consultant zijn aangekomen.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-muted/60 text-muted-foreground backdrop-blur">
                <tr>
                  <Th k="titel" align="left">Vacature</Th>
                  <th className="px-3 py-2 text-left font-medium">Klant</th>
                  <th className="px-3 py-2 text-left font-medium">Consultant</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <Th k="matches"># Matches</Th>
                  <Th k="plaatsingen"># Plaatsingen</Th>
                  <Th k="conversie">Conversie%</Th>
                  <Th k="gemisteKansen">Gemiste kansen</Th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.vacature.id}
                    onClick={() => onSelectVacature(r.vacature.id)}
                    className="cursor-pointer border-t border-border hover:bg-muted/40"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">{r.vacature.titel}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.vacature.klant}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.vacature.consultant}</td>
                    <td className="px-3 py-2">
                      <Badge variant={r.vacature.status === "actief" ? "default" : "secondary"} className="text-[10px]">
                        {r.vacature.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.matches}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.plaatsingen}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.conversie.toFixed(1)}%</td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-semibold tabular-nums",
                        r.gemisteKansen >= 5 ? "text-destructive" : r.gemisteKansen >= 2 ? "text-amber-600" : "text-muted-foreground",
                      )}
                    >
                      {r.gemisteKansen}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                      Geen vacatures binnen de huidige filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-2">
          <CardTitle className="text-sm">Conversie per funnelstap over tijd</CardTitle>
          <div className="flex flex-wrap gap-1">
            {SERIES.map((s) => (
              <button
                key={s.key}
                onClick={() =>
                  setVisible((v) => (v.includes(s.key) ? v.filter((x) => x !== s.key) : [...v, s.key]))
                }
                className={cn(
                  "rounded border px-2 py-0.5 text-[11px] transition-colors",
                  visible.includes(s.key) ? "bg-muted text-foreground" : "text-muted-foreground opacity-60",
                )}
              >
                <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis unit="%" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number, n: string) => [`${v}%`, n]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {SERIES.filter((s) => visible.includes(s.key)).map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OverviewTab;

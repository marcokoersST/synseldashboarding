import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import FunnelSteps from "@/components/pre-matching/FunnelSteps";
import VacatureTable from "@/components/pre-matching/VacatureTable";
import {
  aggregateFunnel,
  filterMatches,
  trendByWeek,
  type PreMatchingFilters,
} from "@/data/preMatchingData";

const SERIES = [
  { key: "s1", label: "Match → consultant", color: "hsl(var(--primary))" },
  { key: "s2", label: "Consultant → kandidaat", color: "hsl(199 89% 48%)" },
  { key: "s3", label: "Kandidaat → klant", color: "hsl(38 92% 50%)" },
  { key: "s4", label: "Klant → plaatsing", color: "hsl(142 71% 45%)" },
  { key: "e2e", label: "Match → plaatsing (totaal)", color: "hsl(280 65% 55%)" },
] as const;

interface Props {
  filters: PreMatchingFilters;
  filterState: PreMatchingFilters;
  onFiltersChange: (f: PreMatchingFilters) => void;
  onSelectVacature: (id: string) => void;
}

export function OverviewTab({ filters, filterState, onFiltersChange, onSelectVacature }: Props) {
  const [visible, setVisible] = useState<string[]>(SERIES.map((s) => s.key));

  const ms = useMemo(() => filterMatches(filters), [filters]);
  const funnel = useMemo(() => aggregateFunnel(ms), [ms]);
  const trend = useMemo(() => trendByWeek(ms), [ms]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Totaalfunnel</h2>
        <FunnelSteps data={funnel} />
      </div>

      <VacatureTable
        filters={filters}
        filterState={filterState}
        onFiltersChange={onFiltersChange}
        onSelectVacature={onSelectVacature}
        showFilters={false}

      />


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

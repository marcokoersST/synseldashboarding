import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import { reverseMatchingSteps, deltaPercent } from "@/data/marketingHubData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DateRange } from "react-day-picker";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.25)",
];

const ReverseMatchingTab = ({ dateRange, compareRange }: Props) => {
  const steps = reverseMatchingSteps;
  const compareText = getCompareDisplayText(compareRange);

  const conversions = useMemo(() => {
    return steps.map((step, i) => {
      const prev = i === 0 ? null : steps[i - 1].volume;
      const pct = prev !== null && prev > 0 ? ((step.volume / prev) * 100).toFixed(1) : null;
      return { ...step, conversionPct: pct };
    });
  }, [steps]);

  const totalConversion = steps.length > 1 && steps[0].volume > 0
    ? ((steps[steps.length - 1].volume / steps[0].volume) * 100).toFixed(1)
    : null;

  const kpis = useMemo(() => {
    const instroom = steps[0]?.volume ?? 0;
    const geplaatst = steps[steps.length - 1]?.volume ?? 0;
    const previousInstroom = getComparisonValue(instroom, { dateRange, compareRange, seed: "reverse-matching-instroom" });
    const previousGeplaatst = getComparisonValue(geplaatst, { dateRange, compareRange, seed: "reverse-matching-geplaatst" });
    return [
      { label: "Instroom", value: instroom, delta: deltaPercent(instroom, previousInstroom) },
      { label: "Geplaatst", value: geplaatst, delta: deltaPercent(geplaatst, previousGeplaatst) },
      { label: "Totale conversie", value: totalConversion ? parseFloat(totalConversion) : 0, delta: null, suffix: "%" },
    ];
  }, [steps, totalConversion, dateRange, compareRange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const isPos = kpi.delta !== null && kpi.delta > 0;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.suffix ? `${kpi.value}${kpi.suffix}` : kpi.value}</p>
                {kpi.delta !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isPos ? "text-emerald-600" : "text-red-500"}`}>
                    {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{kpi.delta > 0 ? "+" : ""}{kpi.delta.toFixed(1)}%</span>
                    <span className="text-muted-foreground ml-1">{compareText}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Reverse Matching Funnel</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Stap</th>
                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Volume</th>
                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Conversie (step-to-step)</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((row) => (
                <tr key={row.step} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{row.step}</td>
                  <td className="p-4">{row.volume.toLocaleString("nl-NL")}</td>
                  <td className="p-4">{row.conversionPct ? `${row.conversionPct}%` : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Funnel Visualisatie</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={steps} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="step" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]} />
              <Tooltip />
              <Bar dataKey="volume" name="Volume" radius={[4, 4, 0, 0]}>
                {steps.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReverseMatchingTab;

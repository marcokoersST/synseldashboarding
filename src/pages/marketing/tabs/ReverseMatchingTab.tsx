import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reverseMatchingSteps, formatCurrency } from "@/data/marketingHubData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DateRange } from "react-day-picker";

interface Props { dateRange: DateRange; }

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.25)",
];

const ReverseMatchingTab = ({ dateRange }: Props) => {
  const steps = reverseMatchingSteps;

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

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Instroom</p>
            <p className="text-2xl font-bold">{steps[0]?.volume ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Geplaatst</p>
            <p className="text-2xl font-bold">{steps[steps.length - 1]?.volume ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Totale conversie</p>
            <p className="text-2xl font-bold">{totalConversion ? `${totalConversion}%` : "–"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel table */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Reverse Matching Funnel</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stap</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Conversie (step-to-step)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversions.map((row) => (
                <TableRow key={row.step}>
                  <TableCell className="font-medium">{row.step}</TableCell>
                  <TableCell>{row.volume.toLocaleString("nl-NL")}</TableCell>
                  <TableCell>{row.conversionPct ? `${row.conversionPct}%` : "–"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Funnel chart */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Funnel Visualisatie</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={steps} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="step" tick={{ fontSize: 12 }} />
              <YAxis />
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

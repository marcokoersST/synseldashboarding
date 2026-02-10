import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forecastData } from "@/data/consultantData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";

export default function Forecasting() {
  return (
    <ConsultantLayout title="Forecasting" subtitle="Voorspel je maand — gewogen pipeline en scenario's">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <AnimatedCard delay={0}>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-4xl font-bold"><AnimatedNumber value={forecastData.placements.weighted} decimals={1} /></p>
              <p className="text-sm text-muted-foreground">Gewogen plaatsingen</p>
              <p className="text-xs text-muted-foreground mt-1">{forecastData.placements.unweighted} ongewogen · {forecastData.placements.confidence}% confidence</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={100} className="col-span-2">
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Margeforecast per Periode</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={forecastData.marginPerPeriod}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
                  <Bar dataKey="forecast" fill="hsl(var(--teal))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="w-4 h-4" />Risico Forecast</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {forecastData.risks.map((r) => (
                <div key={r.deal} className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{r.deal}</span>
                    <Badge variant="destructive" className="text-[10px]">{r.probability}% uitval</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.reason} · €{r.margin.toLocaleString()} marge</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Als-Dan Scenario's</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {forecastData.scenarios.map((s) => (
                <div key={s.action} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <p className="text-sm font-medium">{s.action}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-green-600 font-medium">{s.forecastIncrease}</span>
                    <span className="text-xs text-muted-foreground">{s.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

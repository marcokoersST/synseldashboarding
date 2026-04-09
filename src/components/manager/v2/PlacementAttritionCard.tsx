import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { CalendarX2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { attritionProjectionData } from "@/data/managerRevenueDetailData";

export function PlacementAttritionCard({ delay = 0 }: { delay?: number }) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const totalStoppers = attritionProjectionData.reduce((s, p) => s + p.expectedAttrition, 0);
  const totalImpact = attritionProjectionData.reduce((s, p) => s + p.revenueLoss, 0);

  const chartData = attritionProjectionData.map(d => ({
    period: d.period,
    attrition: d.expectedAttrition,
    revenueLoss: d.revenueLoss,
  }));

  const selectedDetail = attritionProjectionData.find(d => d.period === selectedPeriod);

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <CalendarX2 className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Verwachte Afvallers</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalStoppers} verwachte stoppers — €{totalImpact.toFixed(0)}k omzetrisico
            </p>
          </div>
        </div>

        {/* Line chart */}
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number, name: string) => [name === "attrition" ? value : `€${value}k`, name === "attrition" ? "Stoppers" : "Omzetrisico"]}
              />
              <Line yAxisId="left" type="monotone" dataKey="attrition" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ fill: "hsl(var(--destructive))", r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="revenueLoss" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-destructive rounded-full" /> Stoppers</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary rounded-full" style={{ background: "repeating-linear-gradient(90deg, hsl(var(--primary)) 0 3px, transparent 3px 6px)" }} /> Omzetrisico</span>
        </div>

        {/* Period table */}
        <div className="overflow-auto rounded border border-border/30">
          <table className="w-full text-xs">
            <thead className="bg-card">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Periode</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Verwachte stoppers</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Omzetrisico</th>
              </tr>
            </thead>
            <tbody>
              {attritionProjectionData.map(period => (
                <tr key={period.period}
                  className={cn(
                    "border-b border-border/30 cursor-pointer transition-colors",
                    selectedPeriod === period.period ? "bg-primary/5" : "hover:bg-muted/20",
                    period.expectedAttrition >= 3 && "text-destructive"
                  )}
                  onClick={() => setSelectedPeriod(selectedPeriod === period.period ? null : period.period)}
                >
                  <td className="py-2 px-3 font-semibold">{period.period}</td>
                  <td className="py-2 px-3 text-center tabular-nums">{period.expectedAttrition}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold">-€{period.revenueLoss.toFixed(1)}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selectedDetail && (
          <div className="bg-muted/10 border border-primary/10 rounded-lg px-4 py-4 mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground">Detail: {selectedDetail.period}</h4>
              <button onClick={() => setSelectedPeriod(null)} className="text-[10px] text-muted-foreground hover:text-foreground">Sluiten ✕</button>
            </div>
            <div className="space-y-2">
              {selectedDetail.candidates.map((c, i) => (
                <div key={i} className="rounded-lg bg-card border border-border/30 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{c.candidateName}</span>
                    <span className="text-xs font-semibold tabular-nums text-destructive">-€{c.revenue.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Consultant: {c.consultantName}</p>
                  <p className="text-[11px] text-muted-foreground">{c.notes}</p>
                  <div className="flex items-start gap-1.5 mt-1">
                    <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-foreground">{c.aiAnalysis}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

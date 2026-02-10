import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { funnelSteps, stepDurations, channelWinRates } from "@/data/consultantData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

export default function SalesFunnel() {
  const maxCount = funnelSteps[0].count;
  const followUpRate = 78;

  return (
    <ConsultantLayout title="Sales Funnel" subtitle="Van kandidaat binnen tot plaatsing — met conversie per stap">
      {/* Funnel */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader className="glass-header"><CardTitle>Sales Funnel (9 stappen)</CardTitle></CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              {funnelSteps.map((step, i) => {
                const width = Math.max(8, Math.sqrt(step.count / maxCount) * 100);
                const conversion = i > 0 ? ((step.count / funnelSteps[i - 1].count) * 100).toFixed(0) : "100";
                return (
                  <div key={step.step} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-28 text-right">{step.step}</span>
                    <div className="flex-1 relative">
                      <div className="h-8 rounded-md flex items-center px-3 transition-all" style={{ width: `${width}%`, backgroundColor: step.color, minWidth: "60px" }}>
                        <span className="text-xs font-bold text-white">{step.count}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">{conversion}%</span>
                  </div>
                );
              })}
            </div>
            {/* Bottleneck */}
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">⚠️ Bottleneck: Voorstel → Gesprek (62% verlies)</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-1">Van 45 voorstellen leiden er slechts 28 tot een gesprek. Focus op follow-up en CTA.</p>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-3 gap-4">
        {/* Doorlooptijd */}
        <AnimatedCard delay={100} className="col-span-1">
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">Doorlooptijd per Stap</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stepDurations} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="step" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => `${v} dagen`} />
                  <Bar dataKey="days" fill="hsl(var(--teal))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Afspraken-nakoming */}
        <AnimatedCard delay={200}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">Afspraken Nakoming</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--success))" strokeWidth="8" strokeDasharray={`${followUpRate * 2.64} ${264 - followUpRate * 2.64}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold"><AnimatedNumber value={followUpRate} />%</span>
                  <span className="text-[10px] text-muted-foreground">binnen 24u</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Winrate per kanaal */}
        <AnimatedCard delay={300}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">Winrate per Kanaal</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {channelWinRates.map((ch) => (
                  <div key={ch.channel}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{ch.channel}</span>
                      <span className="text-muted-foreground">{ch.rate}% ({ch.placements} plts)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(ch.rate * 10, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

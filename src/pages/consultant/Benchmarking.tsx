import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { benchmarkData, leagueTableData, topPerformerInsights } from "@/data/consultantData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Lightbulb } from "lucide-react";

export default function Benchmarking() {
  const radarData = benchmarkData.map(b => ({ kpi: b.kpi, jij: (b.you / b.top) * 100, team: (b.teamAvg / b.top) * 100 }));

  return (
    <ConsultantLayout title="Benchmarking" subtitle="Vergelijk jezelf slim met je team en top-performers">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Bar chart vergelijking */}
        <AnimatedCard delay={0}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Jij vs Team vs Top</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={benchmarkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="kpi" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="you" fill="hsl(var(--teal))" name="Jij" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="teamAvg" fill="hsl(var(--gold))" name="Team gem." radius={[0, 4, 4, 0]} />
                  <Bar dataKey="top" fill="hsl(var(--primary))" name="Top" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Radar - Jouw sterke punten */}
        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Jouw Sterke Punten</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <RechartsRadar data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="kpi" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Jij" dataKey="jij" stroke="hsl(var(--teal))" fill="hsl(var(--teal))" fillOpacity={0.3} />
                  <Radar name="Team" dataKey="team" stroke="hsl(var(--gold))" fill="hsl(var(--gold))" fillOpacity={0.15} />
                </RechartsRadar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Top performer breakdown */}
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="w-4 h-4" />Top Performer Breakdown</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {topPerformerInsights.map((ins, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">{ins.insight}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{ins.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* League tables */}
        <AnimatedCard delay={300} className="col-span-2">
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">League Tables</CardTitle></CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="plaatsingen">
                <TabsList><TabsTrigger value="plaatsingen">Plaatsingen</TabsTrigger><TabsTrigger value="marge">Marge</TabsTrigger></TabsList>
                {(["plaatsingen", "marge"] as const).map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="space-y-2 mt-2">
                      {leagueTableData[tab].map((p) => (
                        <div key={p.rank} className={`flex items-center gap-3 p-2 rounded-lg ${p.isUser ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"}`}>
                          <span className="text-lg font-bold text-muted-foreground w-8">#{p.rank}</span>
                          <span className={`flex-1 text-sm font-medium ${p.isUser ? "text-primary" : ""}`}>{p.name}</span>
                          <span className="text-sm font-bold">{tab === "marge" ? `€${p.value.toLocaleString()}` : p.value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityROI, callBlockCorrelation, trendData } from "@/data/consultantData";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowRight } from "lucide-react";

export default function ActiviteitResultaat() {
  return (
    <ConsultantLayout title="Activiteit vs Resultaat" subtitle="Eerlijk inzicht: wat levert je inspanning op?">
      {/* ROI trechter */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader className="glass-header"><CardTitle>Activiteiten-ROI Trechter</CardTitle></CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              {activityROI.map((stage, i) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-foreground"><AnimatedNumber value={stage.count} /></span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{stage.stage}</p>
                  </div>
                  {i < activityROI.length - 1 && (
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{((activityROI[i + 1].count / stage.count) * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Belblokken vs plaatsingen */}
        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Belblokken vs Plaatsingen</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={callBlockCorrelation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="callBlocks" fill="hsl(var(--teal))" name="Belblokken" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="placements" fill="hsl(var(--gold))" name="Plaatsingen" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Kwaliteit x Volume matrix */}
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Kwaliteit × Volume Matrix</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="relative w-full aspect-square max-w-[280px] mx-auto border border-border rounded-lg overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="border-r border-b border-border p-3 bg-orange-50 dark:bg-orange-950/20 flex flex-col justify-center items-center">
                    <p className="text-xs font-medium text-center">Hoog volume</p>
                    <p className="text-xs text-center text-muted-foreground">Laag resultaat</p>
                    <p className="text-[10px] text-orange-600 mt-1">⚠️ Verkeerde focus</p>
                  </div>
                  <div className="border-b border-border p-3 bg-green-50 dark:bg-green-950/20 flex flex-col justify-center items-center">
                    <p className="text-xs font-medium text-center">Hoog volume</p>
                    <p className="text-xs text-center text-muted-foreground">Hoog resultaat</p>
                    <p className="text-[10px] text-green-600 mt-1">⭐ Gold standard</p>
                  </div>
                  <div className="border-r border-border p-3 bg-red-50 dark:bg-red-950/20 flex flex-col justify-center items-center">
                    <p className="text-xs font-medium text-center">Laag volume</p>
                    <p className="text-xs text-center text-muted-foreground">Laag resultaat</p>
                    <p className="text-[10px] text-red-600 mt-1">🚨 Actie nodig</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 flex flex-col justify-center items-center">
                    <p className="text-xs font-medium text-center">Laag volume</p>
                    <p className="text-xs text-center text-muted-foreground">Hoog resultaat</p>
                    <p className="text-[10px] text-blue-600 mt-1">💡 Schaal op!</p>
                  </div>
                </div>
                {/* User position dot */}
                <div className="absolute" style={{ top: "35%", left: "55%", transform: "translate(-50%, -50%)" }}>
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-lg" />
                  <span className="text-[10px] font-bold ml-2">Jij</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Trendline */}
      <AnimatedCard delay={300}>
        <Card>
          <CardHeader className="glass-header"><CardTitle className="text-base">Trendline: Opbouwen vs Weglekken</CardTitle></CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="pipeline" stroke="hsl(var(--teal))" strokeWidth={2} name="Pipeline" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="lost" stroke="hsl(var(--destructive))" strokeWidth={2} name="Verloren" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}

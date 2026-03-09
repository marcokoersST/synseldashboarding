import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { qualityOverview } from "@/data/hendrikData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldCheck, AlertTriangle, Mail, Users } from "lucide-react";

export default function OverzichtV2() {
  return (
    <ConsultantLayout title="Kwaliteitsoverzicht V2" subtitle="Hoofddashboard kwaliteitsmeting consultants">
      {/* KPI tiles */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Kwaliteitsscore", value: qualityOverview.overallScore, suffix: "/10", icon: ShieldCheck, color: "text-accent" },
          { label: "Klachten deze periode", value: qualityOverview.complaintsThisPeriod, icon: AlertTriangle, color: "text-destructive" },
          { label: "Gem. Personalisatiegraad", value: qualityOverview.avgPersonalization, suffix: "%", icon: Mail, color: "text-primary" },
          { label: "DMU Foutpercentage", value: qualityOverview.dmuErrorRate, suffix: "%", icon: Users, color: "text-destructive" },
        ].map((kpi, i) => (
          <AnimatedCard key={kpi.label} delay={i * 80}>
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                </div>
                <span className="text-3xl font-bold text-foreground">
                  <AnimatedNumber value={kpi.value} />{kpi.suffix || ""}
                </span>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Consultant risk table */}
        <AnimatedCard delay={350} className="col-span-2">
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Risico per Consultant</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground pb-2 border-b">
                  <span className="col-span-2">Consultant</span>
                  <span className="text-center">Score</span>
                  <span className="text-center">Klachten</span>
                  <span className="text-center">DMU fouten</span>
                </div>
                {qualityOverview.consultantRisk.map((c) => (
                  <div key={c.name} className="grid grid-cols-5 items-center py-1.5 text-sm">
                    <span className="col-span-2 font-medium flex items-center gap-2">
                      <Badge variant={c.risk === "green" ? "default" : c.risk === "orange" ? "secondary" : "destructive"} className="w-2 h-2 p-0 rounded-full" />
                      {c.name}
                    </span>
                    <span className="text-center font-bold">{c.score}</span>
                    <span className="text-center">{c.complaints}</span>
                    <span className="text-center">{c.dmuErrors}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Trend chart */}
        <AnimatedCard delay={450}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Score Trend</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={qualityOverview.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[5, 9]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

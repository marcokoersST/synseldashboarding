import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { topWinningCompanies, topLosingCompanies, emailMetrics, weekPlanningScore, energyChecks, pipelineQuality } from "@/data/consultantData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

export default function ExtraDashboards() {
  const totalPipeline = pipelineQuality.a + pipelineQuality.b + pipelineQuality.c;

  return (
    <ConsultantLayout title="Extra Dashboards" subtitle="Gekke maar bruikbare inzichten">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <AnimatedCard delay={0}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">🏆 Top 5 waar we scoren</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {topWinningCompanies.map((c, i) => (
                <div key={c.company} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.company}</p>
                    <p className="text-xs text-muted-foreground">{c.reason}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{c.placements} plts</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">💀 Top 5 waar we verliezen</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {topLosingCompanies.map((c, i) => (
                <div key={c.company} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.company}</p>
                    <p className="text-xs text-muted-foreground">{c.reason}</p>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">{c.losses} verloren</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">📧 Onderwerpregel Score</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {emailMetrics.subjectLines.map((s) => (
                <div key={s.subject} className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium mb-1 truncate">{s.subject}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span>Open: {s.openRate}%</span>
                    <span>Click: {s.clickRate}%</span>
                    <span>Reply: {s.replyRate}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">📅 Weekplanning Score</CardTitle></CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold"><AnimatedNumber value={weekPlanningScore.score} />%</p>
              <p className="text-sm text-muted-foreground mt-1">{weekPlanningScore.executed} / {weekPlanningScore.planned} blokken uitgevoerd</p>
              <Progress value={weekPlanningScore.score} className="h-2 mt-4" />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={400}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">⚡ Energie Check</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-center gap-3">
                {energyChecks.map((e) => (
                  <div key={e.day} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{e.day}</p>
                    {e.done ? <CheckCircle className="w-6 h-6 text-green-500 mx-auto" /> : <XCircle className="w-6 h-6 text-red-400 mx-auto" />}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm">Pipeline Kwaliteit</p>
                <div className="flex gap-2 mt-2 justify-center">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">A: {pipelineQuality.a}</Badge>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">B: {pipelineQuality.b}</Badge>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400">C: {pipelineQuality.c}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

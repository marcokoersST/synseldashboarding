import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { conversationScores, bdcScores, listeningScores, objectionHandling, callReviewHeatmap, improvementPoints } from "@/data/consultantData";
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function Gesprekskwaliteit() {
  const radarData = Object.entries(conversationScores).map(([key, value]) => ({ subject: key.charAt(0).toUpperCase() + key.slice(1), score: value, fullMark: 100 }));

  return (
    <ConsultantLayout title="Gesprekskwaliteit" subtitle="Coaching-proof inzicht in jouw gespreksvaardigheden">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Radar chart */}
        <AnimatedCard delay={0}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">Score per Fase</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <RechartsRadar data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--teal))" fill="hsl(var(--teal))" fillOpacity={0.3} />
                </RechartsRadar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* BDC Score */}
        <AnimatedCard delay={100}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">BDC-Score</CardTitle></CardHeader>
            <CardContent className="p-6">
              {Object.entries(bdcScores).map(([key, value]) => (
                <div key={key} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium">{key}</span>
                    <span className="font-bold"><AnimatedNumber value={value} />%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: value >= 80 ? "hsl(var(--success))" : value >= 60 ? "hsl(var(--gold))" : "hsl(var(--destructive))" }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Luisteren/samenvatten/doorvragen */}
        <AnimatedCard delay={200}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">Luisteren & Doorvragen</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              {Object.entries(listeningScores).map(([key, data]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium">{key}</span>
                    <span className="font-bold">{data.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${data.score}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{data.feedback}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Objection handling */}
        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Objection Handling</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="text-center flex-1 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600"><AnimatedNumber value={objectionHandling.won} /></p>
                  <p className="text-xs text-muted-foreground">Gewonnen</p>
                </div>
                <div className="text-center flex-1 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-2xl font-bold text-red-500"><AnimatedNumber value={objectionHandling.lost} /></p>
                  <p className="text-xs text-muted-foreground">Verloren</p>
                </div>
              </div>
              <div className="space-y-2">
                {objectionHandling.examples.map((ex, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-muted/50">
                    <span className={`font-medium ${ex.result === "won" ? "text-green-600" : "text-red-500"}`}>"{ex.objection}"</span>
                    <span className="text-muted-foreground"> — {ex.response}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Heatmap */}
        <AnimatedCard delay={400}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Call Review Heatmap</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-1">
                <div className="flex gap-1 mb-1">
                  <span className="w-24" />
                  {["W1", "W2", "W3", "W4"].map((w) => (
                    <span key={w} className="flex-1 text-center text-[10px] text-muted-foreground">{w}</span>
                  ))}
                </div>
                {callReviewHeatmap.map((row) => (
                  <div key={row.category} className="flex gap-1">
                    <span className="w-24 text-[11px] text-muted-foreground truncate">{row.category}</span>
                    {[row.week1, row.week2, row.week3, row.week4].map((v, i) => (
                      <div key={i} className="flex-1 h-7 rounded flex items-center justify-center text-[10px] font-medium text-white"
                        style={{ backgroundColor: v >= 8 ? "hsl(var(--success))" : v >= 6 ? "hsl(var(--gold))" : "hsl(var(--destructive))" }}>
                        {v}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Top 3 verbeterpunten */}
        <AnimatedCard delay={500}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Top 3 Verbeterpunten</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {improvementPoints.map((p, i) => (
                <div key={i} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-primary">#{i + 1}</span>
                    <Badge variant={p.impact === "high" ? "destructive" : "default"} className="text-[10px]">{p.impact} impact</Badge>
                  </div>
                  <p className="text-sm">{p.point}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

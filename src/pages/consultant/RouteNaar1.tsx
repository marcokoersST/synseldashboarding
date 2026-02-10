import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gapAnalysis, leverageActions, weeklyPlaybook } from "@/data/consultantData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar } from "lucide-react";

export default function RouteNaar1() {
  return (
    <ConsultantLayout title="Route naar #1" subtitle="Wat moet je doen om de beste te worden?">
      {/* Gap analyse */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader className="glass-header"><CardTitle>Gap-analyse t.o.v. Top 10</CardTitle></CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gapAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="kpi" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="you" fill="hsl(var(--teal))" name="Jij" radius={[4, 4, 0, 0]} />
                <Bar dataKey="top" fill="hsl(var(--primary))" name="Top" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-2 gap-4">
        {/* 3 hefboom-acties */}
        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Target className="w-4 h-4" />3 Hefboom-Acties</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {leverageActions.map((a, i) => (
                <div key={i} className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-primary">#{i + 1}</span>
                    <Badge variant={a.effort === "low" ? "secondary" : "default"} className="text-[10px]">{a.effort} effort</Badge>
                  </div>
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-green-600 mt-1">{a.expectedEffect}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Personal playbook */}
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Calendar className="w-4 h-4" />Personal Playbook</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {weeklyPlaybook.map((day) => (
                  <div key={day.day}>
                    <p className="text-sm font-bold text-foreground mb-1">{day.day}</p>
                    <div className="flex flex-wrap gap-1">
                      {day.blocks.map((block) => (
                        <Badge key={block} variant="outline" className="text-[10px]">{block}</Badge>
                      ))}
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

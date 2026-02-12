import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { followUpData } from "@/data/hendrikData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const callbackDonut = [
  { name: "Nagekomen", value: followUpData.callbackFollowUp.kept },
  { name: "Gemist", value: followUpData.callbackFollowUp.missed },
];

export default function OpvolgingHygiene() {
  return (
    <ConsultantLayout title="Opvolging & Hygiëne" subtitle="Terugbelafspraken, intakes, notitielezing en systeemhygiëne">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Callback follow-up */}
        <AnimatedCard delay={0}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Terugbelafspraken</CardTitle></CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={callbackDonut} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                    <Cell fill="hsl(var(--accent))" />
                    <Cell fill="hsl(var(--destructive))" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-lg font-bold"><AnimatedNumber value={followUpData.callbackFollowUp.kept} />% nagekomen</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Intake status */}
        <AnimatedCard delay={80}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Intakes Status</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              {[
                { label: "Afgerond", value: followUpData.intakeStatus.completed, color: "bg-accent" },
                { label: "Lopend", value: followUpData.intakeStatus.pending, color: "bg-primary" },
                { label: "Te laat", value: followUpData.intakeStatus.overdue, color: "bg-destructive" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-bold">{s.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.value / 62) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Note reading proxy */}
        <AnimatedCard delay={160}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Notitielezing (proxy)</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground pb-1 border-b">
                  <span>Consultant</span>
                  <span className="text-center">Gem. tijd</span>
                  <span className="text-center">Scroll %</span>
                </div>
                {followUpData.noteReading.map((n) => (
                  <div key={n.name} className="grid grid-cols-3 py-1">
                    <span className="truncate">{n.name.split(" ")[0]}</span>
                    <span className="text-center">{n.avgReadTime}s</span>
                    <span className="text-center">{n.avgScrollDepth}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* System hygiene */}
      <AnimatedCard delay={250}>
        <Card>
          <CardHeader><CardTitle className="text-base">Systeemhygiëne Score per Consultant</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {followUpData.systemHygiene.map((c) => (
                <div key={c.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-36 truncate">{c.name}</span>
                  <div className="flex-1">
                    <Progress value={c.overallScore} className="h-2" />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{c.overallScore}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}

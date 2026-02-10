import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crmCompleteness, followUpDiscipline, dataQuality, postCallSpeed, costlyMistakes } from "@/data/consultantData";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function CRMHygiene() {
  const donutData = [
    { name: "Op tijd", value: followUpDiscipline.onTime },
    { name: "Te laat", value: followUpDiscipline.late },
  ];

  return (
    <ConsultantLayout title="CRM Hygiëne" subtitle="Data-discipline meetbaar maken">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Compleetheid */}
        <AnimatedCard delay={0}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Compleetheid Kandidaten</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <span className="text-3xl font-bold"><AnimatedNumber value={crmCompleteness.candidates.score} />%</span>
              </div>
              <div className="space-y-1">
                {crmCompleteness.candidates.missing.map((m) => (
                  <p key={m} className="text-xs text-red-500">⚠️ {m}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Compleetheid Klanten</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <span className="text-3xl font-bold"><AnimatedNumber value={crmCompleteness.clients.score} />%</span>
              </div>
              <div className="space-y-1">
                {crmCompleteness.clients.missing.map((m) => (
                  <p key={m} className="text-xs text-red-500">⚠️ {m}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Opvolgdiscipline donut */}
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Opvolgdiscipline</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={donutData} innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={2}>
                    <Cell fill="hsl(var(--success))" />
                    <Cell fill="hsl(var(--destructive))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Op tijd {followUpDiscipline.onTime}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Te laat {followUpDiscipline.late}%</span>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Datakwaliteit</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="text-center mb-3"><span className="text-3xl font-bold"><AnimatedNumber value={dataQuality.score} />%</span></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Dubbelingen</span><span className="font-medium text-red-500">{dataQuality.duplicates}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Missende CP's</span><span className="font-medium text-orange-500">{dataQuality.missingContacts}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Verouderde vacatures</span><span className="font-medium text-amber-500">{dataQuality.outdatedVacancies}</span></div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={400}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Na-Call-Mail Snelheid</CardTitle></CardHeader>
            <CardContent className="p-6 text-center">
              <span className="text-3xl font-bold text-foreground">{postCallSpeed.average}</span>
              <p className="text-sm text-muted-foreground mt-1">gemiddelde tijd</p>
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div><p className="font-medium text-green-600">{postCallSpeed.best}</p><p className="text-muted-foreground">beste</p></div>
                <div><p className="font-medium text-primary">{postCallSpeed.target}</p><p className="text-muted-foreground">target</p></div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Fouten Tracker</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {costlyMistakes.map((m) => (
                <div key={m.mistake} className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium">{m.mistake}</p>
                  <p className="text-[10px] text-muted-foreground">{m.frequency}x → {m.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

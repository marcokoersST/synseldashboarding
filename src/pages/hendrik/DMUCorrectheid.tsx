import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dmuData } from "@/data/hendrikData";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const donutData = [
  { name: "Correct", value: dmuData.correct },
  { name: "Incorrect", value: dmuData.incorrect },
];
const COLORS = ["hsl(var(--accent))", "hsl(var(--destructive))"];

export default function DMUCorrectheid() {
  const pct = Math.round((dmuData.correct / (dmuData.correct + dmuData.incorrect)) * 100);

  return (
    <ConsultantLayout title="DMU/CP Correctheid" subtitle="Correctheid DMU/contactpersonen, foutpercentages en top-offenders">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Donut */}
        <AnimatedCard delay={0}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Correct vs Incorrect</CardTitle></CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {donutData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-2xl font-bold text-foreground mt-2"><AnimatedNumber value={pct} />% correct</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Recent errors table */}
        <AnimatedCard delay={100} className="col-span-2">
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Recente DMU-fouten</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground pb-2 border-b">
                  <span>Consultant</span>
                  <span>Klant</span>
                  <span>Verwacht CP</span>
                  <span>Geselecteerd CP</span>
                </div>
                {dmuData.recentErrors.map((e, i) => (
                  <div key={i} className="grid grid-cols-4 text-sm py-1.5 border-b border-border/50">
                    <span className="font-medium">{e.consultant}</span>
                    <span className="text-muted-foreground">{e.client}</span>
                    <span className="text-accent">{e.expectedCP}</span>
                    <span className="text-destructive">{e.selectedCP}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Trend */}
      <AnimatedCard delay={200}>
        <Card>
          <CardHeader><CardTitle className="text-base">Correctheidspercentage per Periode</CardTitle></CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dmuData.trendPerPeriod}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="pct" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} name="Correctheid %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}

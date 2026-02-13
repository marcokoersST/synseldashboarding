import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertTriangle, Phone, Mail, Timer } from "lucide-react";
import { consultants } from "@/data/hendrikData";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";

// ── Mock data ──
interface TimeTarget {
  label: string;
  deadline: string;
  icon: typeof Clock;
  description: string;
}

const timeTargets: TimeTarget[] = [
  { label: "Acquisitie klaargezet", deadline: "09:45", icon: Mail, description: "Alle acquisitie-activiteiten voorbereid en klaargezet" },
  { label: "Acquisitie afgerond", deadline: "12:00", icon: CheckCircle2, description: "Alle acquisitie-gesprekken en -acties afgerond" },
  { label: "Klanten nagebeld", deadline: "14:00", icon: Phone, description: "Alle klanten waarbij geacquireerd is nagebeld" },
];

interface ConsultantSpeed {
  name: string;
  acquisitieKlaar: { time: string; onTime: boolean };
  acquisitieAfgerond: { time: string; onTime: boolean };
  klantenNagebeld: { time: string; onTime: boolean };
  weekScore: number; // percentage of days on time this week
  periodTrend: number[]; // last 6 periods
}

const consultantSpeeds: ConsultantSpeed[] = [
  { name: "Sophie de Vries", acquisitieKlaar: { time: "09:32", onTime: true }, acquisitieAfgerond: { time: "11:48", onTime: true }, klantenNagebeld: { time: "13:42", onTime: true }, weekScore: 95, periodTrend: [88, 90, 91, 93, 94, 95] },
  { name: "Thomas Bakker", acquisitieKlaar: { time: "09:41", onTime: true }, acquisitieAfgerond: { time: "11:55", onTime: true }, klantenNagebeld: { time: "13:58", onTime: true }, weekScore: 88, periodTrend: [80, 82, 85, 86, 87, 88] },
  { name: "Emma Visser", acquisitieKlaar: { time: "09:38", onTime: true }, acquisitieAfgerond: { time: "12:05", onTime: false }, klantenNagebeld: { time: "13:50", onTime: true }, weekScore: 82, periodTrend: [75, 78, 79, 80, 81, 82] },
  { name: "Anna Smit", acquisitieKlaar: { time: "09:44", onTime: true }, acquisitieAfgerond: { time: "11:52", onTime: true }, klantenNagebeld: { time: "14:12", onTime: false }, weekScore: 78, periodTrend: [70, 72, 74, 76, 77, 78] },
  { name: "Fleur Mulder", acquisitieKlaar: { time: "09:50", onTime: false }, acquisitieAfgerond: { time: "12:15", onTime: false }, klantenNagebeld: { time: "13:55", onTime: true }, weekScore: 72, periodTrend: [65, 68, 69, 70, 71, 72] },
  { name: "Niels de Groot", acquisitieKlaar: { time: "09:48", onTime: false }, acquisitieAfgerond: { time: "12:08", onTime: false }, klantenNagebeld: { time: "14:20", onTime: false }, weekScore: 65, periodTrend: [55, 58, 60, 62, 63, 65] },
  { name: "Mark Peters", acquisitieKlaar: { time: "10:02", onTime: false }, acquisitieAfgerond: { time: "12:22", onTime: false }, klantenNagebeld: { time: "14:35", onTime: false }, weekScore: 58, periodTrend: [50, 52, 54, 55, 56, 58] },
  { name: "Daan de Boer", acquisitieKlaar: { time: "10:10", onTime: false }, acquisitieAfgerond: { time: "12:30", onTime: false }, klantenNagebeld: { time: "14:45", onTime: false }, weekScore: 48, periodTrend: [40, 42, 44, 45, 46, 48] },
  { name: "Bram Jansen", acquisitieKlaar: { time: "10:15", onTime: false }, acquisitieAfgerond: { time: "12:45", onTime: false }, klantenNagebeld: { time: "15:00", onTime: false }, weekScore: 35, periodTrend: [28, 30, 31, 32, 33, 35] },
  { name: "Lisa van Dijk", acquisitieKlaar: { time: "10:25", onTime: false }, acquisitieAfgerond: { time: "13:00", onTime: false }, klantenNagebeld: { time: "15:20", onTime: false }, weekScore: 25, periodTrend: [18, 20, 21, 22, 23, 25] },
];

const teamAverages = [
  { target: "Acquisitie klaargezet", onTimePercentage: 40 },
  { target: "Acquisitie afgerond", onTimePercentage: 30 },
  { target: "Klanten nagebeld", onTimePercentage: 40 },
];

const trendData = ["P8", "P9", "P10", "P11", "P12", "P13"].map((period, i) => ({
  period,
  klaargezet: 35 + i * 3 + Math.round(Math.sin(i) * 2),
  afgerond: 28 + i * 3 + Math.round(Math.cos(i) * 2),
  nagebeld: 32 + i * 4 + Math.round(Math.sin(i * 1.5) * 2),
}));

function getScoreColor(score: number) {
  if (score >= 80) return "text-accent";
  if (score >= 60) return "text-amber-500";
  return "text-destructive";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-accent/10";
  if (score >= 60) return "bg-amber-500/10";
  return "bg-destructive/10";
}

export default function SnelheidSalesproces() {
  return (
    <ConsultantLayout title="Snelheid Salesproces">
      <div className="space-y-6">
        {/* Tijdsdoelen overzicht */}
        <AnimatedCard delay={0}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                Dagelijkse Tijdsdoelen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {timeTargets.map((target, i) => {
                  const avg = teamAverages[i];
                  const Icon = target.icon;
                  return (
                    <div key={target.label} className="rounded-xl border border-border/50 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{target.label}</p>
                          <p className="text-xs text-muted-foreground">{target.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">vóór {target.deadline}</span>
                        <Badge variant={avg.onTimePercentage >= 60 ? "default" : "destructive"} className="text-xs">
                          {avg.onTimePercentage}% op tijd
                        </Badge>
                      </div>
                      <Progress value={avg.onTimePercentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Trend chart */}
        <AnimatedCard delay={100}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Trend: % Op Tijd per Periode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value: number) => [`${value}%`]}
                    />
                    <Legend />
                    <Bar dataKey="klaargezet" name="Klaargezet (09:45)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="afgerond" name="Afgerond (12:00)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nagebeld" name="Nagebeld (14:00)" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Consultant tabel */}
        <AnimatedCard delay={200}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Snelheid per Consultant — Vandaag
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Consultant</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                        <div className="flex flex-col items-center">
                          <span>Klaargezet</span>
                          <span className="text-xs text-primary">vóór 09:45</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                        <div className="flex flex-col items-center">
                          <span>Afgerond</span>
                          <span className="text-xs text-primary">vóór 12:00</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                        <div className="flex flex-col items-center">
                          <span>Nagebeld</span>
                          <span className="text-xs text-primary">vóór 14:00</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-medium">Week Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultantSpeeds.map((c, i) => (
                      <tr key={c.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{c.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {c.acquisitieKlaar.onTime ? (
                              <CheckCircle2 className="w-4 h-4 text-accent" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                            <span className={c.acquisitieKlaar.onTime ? "text-accent" : "text-destructive"}>
                              {c.acquisitieKlaar.time}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {c.acquisitieAfgerond.onTime ? (
                              <CheckCircle2 className="w-4 h-4 text-accent" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                            <span className={c.acquisitieAfgerond.onTime ? "text-accent" : "text-destructive"}>
                              {c.acquisitieAfgerond.time}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {c.klantenNagebeld.onTime ? (
                              <CheckCircle2 className="w-4 h-4 text-accent" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                            <span className={c.klantenNagebeld.onTime ? "text-accent" : "text-destructive"}>
                              {c.klantenNagebeld.time}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-bold ${getScoreColor(c.weekScore)}`}>{c.weekScore}%</span>
                            <div className={`w-16 h-1.5 rounded-full ${getScoreBg(c.weekScore)}`}>
                              <div
                                className={`h-full rounded-full transition-all ${c.weekScore >= 80 ? "bg-accent" : c.weekScore >= 60 ? "bg-amber-500" : "bg-destructive"}`}
                                style={{ width: `${c.weekScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

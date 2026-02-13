import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { consultantGrowthProfiles, orgConsultants } from "@/data/groeiplanData";
import {
  Target, ShieldCheck, Brain, Euro, Filter, Heart,
  TrendingUp, Award, AlertTriangle, ChevronRight, Sparkles,
  Star, Users, BarChart3, Trophy, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

const dimensionIcons: Record<string, typeof Target> = {
  target: Target, shield: ShieldCheck, brain: Brain, euro: Euro, funnel: Filter, heart: Heart,
};

const tierColors: Record<string, string> = {
  "Starter": "bg-muted text-muted-foreground",
  "Gevorderd": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Professional": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Expert": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Top Performer": "bg-accent/20 text-accent border-accent/30",
};

const impactColors = {
  hoog: "bg-accent/20 text-accent border-accent/30",
  midden: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  laag: "bg-muted text-muted-foreground",
};

const categoryLabels = { kpi: "KPI", kwaliteit: "Kwaliteit", omzet: "Omzet", coaching: "Coaching" };
const categoryColors = { kpi: "bg-blue-500", kwaliteit: "bg-emerald-500", omzet: "bg-amber-500", coaching: "bg-purple-500" };

function scoreColor(score: number) {
  if (score >= 80) return "text-accent";
  if (score >= 60) return "text-amber-400";
  return "text-destructive";
}

export default function ConsultantGroeiplan() {
  const [selectedName, setSelectedName] = useState(consultantGrowthProfiles[0].name);
  const profile = useMemo(() => consultantGrowthProfiles.find(p => p.name === selectedName)!, [selectedName]);

  const radarData = profile.dimensions.map(d => ({
    subject: d.label,
    score: d.score,
    fullMark: 100,
  }));

  return (
    <ConsultantLayout title="Consultant Groeiplan" subtitle="Geïntegreerd overzicht van KPI, omzet, kwaliteit en ontwikkelpunten per consultant">
      {/* Consultant selector */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedName} onValueChange={setSelectedName}>
          <SelectTrigger className="w-64 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {consultantGrowthProfiles.map(p => (
              <SelectItem key={p.name} value={p.name} className="text-sm">
                <span>{p.name}</span>
                <span className="ml-2 text-muted-foreground text-xs">· {p.role}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge className={tierColors[profile.tier]}>
          <Star className="w-3 h-3 mr-1" />
          {profile.tier}
        </Badge>
        <span className="text-xs text-muted-foreground">{profile.role} · {profile.department}</span>
      </div>

      {/* Overall score + key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <AnimatedCard delay={0}>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-5 h-5 text-accent mx-auto mb-1" />
              <div className={`text-2xl font-bold ${scoreColor(profile.overallScore)}`}>
                <AnimatedNumber value={profile.overallScore} suffix="%" />
              </div>
              <span className="text-[10px] text-muted-foreground">Overall Score</span>
            </CardContent>
          </Card>
        </AnimatedCard>
        {[
          { icon: BarChart3, label: "KPI Completie", value: profile.kpiCompletion, suffix: "%" },
          { icon: ShieldCheck, label: "Kwaliteit", value: profile.qualityScore, suffix: "/10", decimals: 1 },
          { icon: Euro, label: "Omzet", value: profile.revenue / 1000, suffix: "k", prefix: "€" },
          { icon: Award, label: "Plaatsingen", value: profile.placements, suffix: `/${profile.placementsTarget}` },
        ].map((m, i) => (
          <AnimatedCard key={m.label} delay={(i + 1) * 60}>
            <Card className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  <AnimatedNumber value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals || 0} />
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      {/* Radar + Trend row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Radar chart */}
        <AnimatedCard delay={350}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Competentieprofiel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Period trend */}
        <AnimatedCard delay={400}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Ontwikkeling per periode
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={profile.periodTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="overall" name="Overall" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="kpi" name="KPI" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="quality" name="Kwaliteit" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="revenue" name="Omzet" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Dimension bars + Salary/Bonus progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Dimensions */}
        <AnimatedCard delay={500} className="lg:col-span-2">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                Prestatie per dimensie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.dimensions.map((dim) => {
                const Icon = dimensionIcons[dim.icon] || Target;
                return (
                  <div key={dim.label} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-foreground">{dim.label}</span>
                        <span className={`text-xs font-bold ${scoreColor(dim.score)}`}>{dim.score}%</span>
                      </div>
                      <Progress value={dim.score} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Salary & Bonus */}
        <AnimatedCard delay={550}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Euro className="w-4 h-4 text-accent" />
                Salaris & Bonus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Salaristrap</span>
                  <span className="font-medium text-foreground">€{profile.salary.toLocaleString()} → €{profile.nextSalary.toLocaleString()}</span>
                </div>
                <Progress value={profile.salaryProgress} className="h-2" />
                <span className="text-[10px] text-muted-foreground">{profile.salaryProgress}% van volgende stap</span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Bonus voortgang</span>
                  <span className="font-medium text-foreground">€{profile.bonus.toLocaleString()} / €{profile.bonusTarget.toLocaleString()}</span>
                </div>
                <Progress value={(profile.bonus / profile.bonusTarget) * 100} className="h-2" />
                <span className="text-[10px] text-muted-foreground">{Math.round((profile.bonus / profile.bonusTarget) * 100)}% van target</span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Omzet vs target</span>
                  <span className="font-medium text-foreground">€{(profile.revenue / 1000).toFixed(0)}k / €{(profile.revenueTarget / 1000).toFixed(0)}k</span>
                </div>
                <Progress value={(profile.revenue / profile.revenueTarget) * 100} className="h-2" />
              </div>
              <div className="pt-2 border-t border-border/30 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground">AI-Coach</span>
                  <p className={`text-sm font-bold ${profile.aiCoachAvg >= 8 ? "text-accent" : profile.aiCoachAvg >= 6 ? "text-amber-400" : "text-destructive"}`}>{profile.aiCoachAvg.toFixed(1)}/10</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">NPS Score</span>
                  <p className={`text-sm font-bold ${profile.npsScore >= 8 ? "text-accent" : profile.npsScore >= 6 ? "text-amber-400" : "text-destructive"}`}>{profile.npsScore.toFixed(1)}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Development actions */}
      <AnimatedCard delay={650}>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Top Ontwikkelpunten — Routekaart naar succes
            </CardTitle>
            <p className="text-xs text-muted-foreground">Geprioriteerde acties om {profile.name} naar het volgende niveau te brengen</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.developmentActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold shrink-0 mt-0.5">
                    {action.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">{action.area}</span>
                      <span className={`w-2 h-2 rounded-full ${categoryColors[action.category]}`} />
                      <span className="text-[10px] text-muted-foreground">{categoryLabels[action.category]}</span>
                      <Badge className={`ml-auto text-[10px] ${impactColors[action.impact]}`}>{action.impact} impact</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{action.action}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Horse Race Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Unit Ranking */}
        <AnimatedCard delay={750}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Ranking binnen unit ({profile.department})
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">Positie t.o.v. collega's in je unit (max 12)</p>
            </CardHeader>
            <CardContent className="p-0">
              {(() => {
                const unitMembers = orgConsultants.filter(c => c.department === profile.department);
                const rank = unitMembers.findIndex(c => c.name === profile.name) + 1;
                return (
                  <>
                    <div className="px-4 pb-2 flex items-center gap-3">
                      <span className="text-2xl font-bold text-foreground">#{rank}</span>
                      <span className="text-xs text-muted-foreground">van {unitMembers.length}</span>
                      <Progress value={(1 - (rank - 1) / unitMembers.length) * 100} className="h-2 flex-1" />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-[10px]">#</TableHead>
                          <TableHead className="text-[10px]">Consultant</TableHead>
                          <TableHead className="text-[10px] text-right">Score</TableHead>
                          <TableHead className="w-10 text-[10px] text-center">Δ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unitMembers.map((c, i) => {
                          const isSelected = c.name === profile.name;
                          return (
                            <TableRow key={c.name} className={isSelected ? "bg-accent/10 font-semibold" : ""}>
                              <TableCell className="py-1.5 text-xs">
                                {i < 3 ? <Trophy className={`w-3.5 h-3.5 ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-400" : "text-orange-400"}`} /> : <span className="text-muted-foreground">{i + 1}</span>}
                              </TableCell>
                              <TableCell className="py-1.5">
                                <span className={`text-xs ${isSelected ? "text-accent" : "text-foreground"}`}>{c.name}</span>
                                <span className="text-[10px] text-muted-foreground ml-1.5">{c.role}</span>
                              </TableCell>
                              <TableCell className="py-1.5 text-right text-xs font-bold">{c.overallScore}</TableCell>
                              <TableCell className="py-1.5 text-center">
                                {c.delta > 0 ? <ArrowUp className="w-3 h-3 text-accent inline" /> : c.delta < 0 ? <ArrowDown className="w-3 h-3 text-destructive inline" /> : <Minus className="w-3 h-3 text-muted-foreground inline" />}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Organization Ranking */}
        <AnimatedCard delay={850}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                Ranking organisatiebreed
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">Positie t.o.v. alle ~50 consultants</p>
            </CardHeader>
            <CardContent className="p-0">
              {(() => {
                const rank = orgConsultants.findIndex(c => c.name === profile.name) + 1;
                const total = orgConsultants.length;
                const nearby = orgConsultants.map((c, i) => ({ ...c, pos: i + 1 })).filter(c => {
                  const pos = orgConsultants.findIndex(x => x.name === c.name);
                  return Math.abs(pos - (rank - 1)) <= 3 || pos < 3;
                });
                // Deduplicate and sort
                const shown = [...new Map(nearby.map(c => [c.name, c])).values()].sort((a, b) => a.pos - b.pos);
                return (
                  <>
                    <div className="px-4 pb-2 flex items-center gap-3">
                      <span className="text-2xl font-bold text-foreground">#{rank}</span>
                      <span className="text-xs text-muted-foreground">van {total}</span>
                      <Progress value={(1 - (rank - 1) / total) * 100} className="h-2 flex-1" />
                    </div>
                    <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10 text-[10px]">#</TableHead>
                            <TableHead className="text-[10px]">Consultant</TableHead>
                            <TableHead className="text-[10px]">Unit</TableHead>
                            <TableHead className="text-[10px] text-right">Score</TableHead>
                            <TableHead className="w-10 text-[10px] text-center">Δ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shown.map((c, i) => {
                            const isSelected = c.name === profile.name;
                            const prevPos = i > 0 ? shown[i - 1].pos : 0;
                            const showGap = i > 0 && c.pos - prevPos > 1;
                            return (
                              <>
                                {showGap && (
                                  <TableRow key={`gap-${i}`}>
                                    <TableCell colSpan={5} className="py-0.5 text-center text-[10px] text-muted-foreground/50">···</TableCell>
                                  </TableRow>
                                )}
                                <TableRow key={c.name} className={isSelected ? "bg-accent/10 font-semibold" : ""}>
                                  <TableCell className="py-1.5 text-xs">
                                    {c.pos <= 3 ? <Trophy className={`w-3.5 h-3.5 ${c.pos === 1 ? "text-amber-400" : c.pos === 2 ? "text-gray-400" : "text-orange-400"}`} /> : <span className="text-muted-foreground">{c.pos}</span>}
                                  </TableCell>
                                  <TableCell className="py-1.5">
                                    <span className={`text-xs ${isSelected ? "text-accent" : "text-foreground"}`}>{c.name}</span>
                                  </TableCell>
                                  <TableCell className="py-1.5 text-[10px] text-muted-foreground">{c.department}</TableCell>
                                  <TableCell className="py-1.5 text-right text-xs font-bold">{c.overallScore}</TableCell>
                                  <TableCell className="py-1.5 text-center">
                                    {c.delta > 0 ? <ArrowUp className="w-3 h-3 text-accent inline" /> : c.delta < 0 ? <ArrowDown className="w-3 h-3 text-destructive inline" /> : <Minus className="w-3 h-3 text-muted-foreground inline" />}
                                  </TableCell>
                                </TableRow>
                              </>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}

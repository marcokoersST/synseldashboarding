import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { consultantWerkgeluk } from "@/data/werkgelukData";
import {
  Smile, TrendingUp, TrendingDown, Minus, Trophy, Target, Sparkles,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

function scoreColor(s: number) {
  if (s >= 75) return "text-accent";
  if (s >= 55) return "text-amber-400";
  return "text-destructive";
}

function trendIcon(d: number) {
  if (d > 0) return <TrendingUp className="w-3.5 h-3.5 text-accent inline" />;
  if (d < 0) return <TrendingDown className="w-3.5 h-3.5 text-destructive inline" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground inline" />;
}

function progressColor(s: number) {
  if (s >= 75) return "bg-emerald-500";
  if (s >= 55) return "bg-amber-500";
  return "bg-red-500";
}

export default function Werkgeluk() {
  const [selectedName, setSelectedName] = useState(consultantWerkgeluk[0].name);
  const profile = useMemo(() => consultantWerkgeluk.find(p => p.name === selectedName)!, [selectedName]);

  const radarData = profile.dimensions.map(d => ({
    subject: d.label,
    score: d.score,
    fullMark: 100,
  }));

  return (
    <ConsultantLayout title="Werkgeluk" subtitle="Holistische graadmeter van groei, erkenning en impact per consultant">
      {/* Selector */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedName} onValueChange={setSelectedName}>
          <SelectTrigger className="w-64 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {consultantWerkgeluk.map(p => (
              <SelectItem key={p.name} value={p.name} className="text-sm">{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge className={`${profile.overallScore >= 75 ? "bg-accent/20 text-accent border-accent/30" : profile.overallScore >= 55 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-destructive/20 text-destructive border-destructive/30"}`}>
          <Smile className="w-3 h-3 mr-1" />
          {profile.overallScore}% Werkgeluk
        </Badge>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <AnimatedCard delay={0}>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-5 h-5 text-accent mx-auto mb-1" />
              <div className={`text-2xl font-bold ${scoreColor(profile.overallScore)}`}>
                <AnimatedNumber value={profile.overallScore} suffix="%" />
              </div>
              <span className="text-[10px] text-muted-foreground">Werkgeluk Score</span>
            </CardContent>
          </Card>
        </AnimatedCard>
        {profile.dimensions.map((dim, i) => (
          <AnimatedCard key={dim.key} delay={(i + 1) * 60}>
            <Card className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{dim.emoji}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{dim.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${scoreColor(dim.score)}`}>{dim.score}%</span>
                  <span className="flex items-center gap-0.5 text-[10px]">
                    {trendIcon(dim.trend)}
                    <span className={dim.trend > 0 ? "text-accent" : dim.trend < 0 ? "text-destructive" : "text-muted-foreground"}>
                      {dim.trend > 0 ? "+" : ""}{dim.trend}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      {/* Radar + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnimatedCard delay={350}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Werkgeluk Profiel
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

        <AnimatedCard delay={400}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Ontwikkeling over tijd
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
                  <Line type="monotone" dataKey="overall" name="Werkgeluk" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="kpi" name="KPI" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="salaris" name="Salaris" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="kandidaat" name="Kandidaat" stroke="#f472b6" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="droombaan" name="Droombaan" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Dimension detail bars + Trophies & Droombaan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AnimatedCard delay={500} className="lg:col-span-2">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smile className="w-4 h-4 text-accent" />
                Dimensies in detail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.dimensions.map((dim) => (
                <div key={dim.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{dim.emoji}</span>
                      <span className="text-xs font-medium text-foreground">{dim.label}</span>
                      <span className="flex items-center gap-0.5 text-[10px]">
                        {trendIcon(dim.trend)}
                        <span className={dim.trend > 0 ? "text-accent" : dim.trend < 0 ? "text-destructive" : "text-muted-foreground"}>
                          {dim.trend > 0 ? "+" : ""}{dim.trend}
                        </span>
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${scoreColor(dim.score)}`}>{dim.score}%</span>
                  </div>
                  <Progress value={dim.score} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{dim.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <div className="space-y-6">
          {/* Droombaan counter */}
          <AnimatedCard delay={550}>
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  🎯 Droombaan Teller
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="text-4xl font-bold text-accent mb-1">
                  <AnimatedNumber value={profile.droombaanCount} />
                </div>
                <p className="text-xs text-muted-foreground">kandidaten aan een droombaan geholpen</p>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Trofeeënkast */}
          <AnimatedCard delay={600}>
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Trofeeënkast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.trophies.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nog geen trofeeën behaald</p>
                ) : (
                  <div className="space-y-2">
                    {profile.trophies.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                        <span className="text-lg">{t.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground">{t.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>

      {/* Leaderboard */}
      <AnimatedCard delay={700}>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Werkgeluk Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-[10px]">#</TableHead>
                  <TableHead className="text-[10px]">Consultant</TableHead>
                  <TableHead className="text-[10px] text-right">Score</TableHead>
                  <TableHead className="text-[10px] text-right">🎯 Droombaan</TableHead>
                  <TableHead className="text-[10px] text-right">🏆 Trofeeën</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultantWerkgeluk.map((c, i) => {
                  const isSelected = c.name === selectedName;
                  return (
                    <TableRow key={c.name} className={isSelected ? "bg-accent/10 font-semibold" : ""}>
                      <TableCell className="py-1.5 text-xs">
                        {i < 3 ? <Trophy className={`w-3.5 h-3.5 ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-400" : "text-orange-400"}`} /> : <span className="text-muted-foreground">{i + 1}</span>}
                      </TableCell>
                      <TableCell className="py-1.5">
                        <span className={`text-xs ${isSelected ? "text-accent" : "text-foreground"}`}>{c.name}</span>
                      </TableCell>
                      <TableCell className={`py-1.5 text-right text-xs font-bold ${scoreColor(c.overallScore)}`}>{c.overallScore}%</TableCell>
                      <TableCell className="py-1.5 text-right text-xs">{c.droombaanCount}</TableCell>
                      <TableCell className="py-1.5 text-right text-xs">{c.trophies.length}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}

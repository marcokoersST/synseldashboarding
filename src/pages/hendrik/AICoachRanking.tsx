import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { consultantCoachRankings, coachCategories, periodLabels, type PeriodKey } from "@/data/aiCoachData";
import { Trophy, Phone, Handshake, UserCheck, Sparkles, ChevronDown, ChevronRight, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const coachIcons = [Phone, Phone, UserCheck, Handshake];
const coachColors = ["text-blue-400", "text-emerald-400", "text-amber-400", "text-purple-400"];
const chartColors = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

function scoreBadge(score: number) {
  if (score >= 8) return <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">{score.toFixed(1)}</Badge>;
  if (score >= 6) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">{score.toFixed(1)}</Badge>;
  return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">{score.toFixed(1)}</Badge>;
}

function rankIcon(rank: number) {
  if (rank === 1) return <span className="text-yellow-400 font-bold">🥇</span>;
  if (rank === 2) return <span className="text-gray-300 font-bold">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold">🥉</span>;
  return <span className="text-muted-foreground text-sm">{rank}</span>;
}

export default function AICoachRanking() {
  const [period, setPeriod] = useState<PeriodKey>("week");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState(consultantCoachRankings[0].name);

  const sorted = [...consultantCoachRankings]
    .map((c) => {
      const pd = c.periodData[period];
      return { ...c, activeScores: pd.scores, activeAverage: pd.average, devPoints: pd.developmentPoints };
    })
    .sort((a, b) => b.activeAverage - a.activeAverage);

  const trendChartData = useMemo(() => {
    const consultant = consultantCoachRankings.find(c => c.name === selectedConsultant);
    if (!consultant) return [];
    const trend = consultant.trendData[period] || [];
    return trend.map(tp => ({
      name: tp.label,
      ...tp.scores,
      Gemiddeld: tp.average,
    }));
  }, [selectedConsultant, period]);

  return (
    <ConsultantLayout title="AI-Coach Ranking" subtitle="Beoordeling per gespreksonderdeel op basis van transcript-analyse">
      {/* Period selector */}
      <div className="mb-5">
        <Tabs value={period} onValueChange={(v) => { setPeriod(v as PeriodKey); setExpandedRow(null); }}>
          <TabsList className="bg-secondary">
            {(Object.keys(periodLabels) as PeriodKey[]).map((k) => (
              <TabsTrigger key={k} value={k} className="text-xs px-4">
                {periodLabels[k]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {coachCategories.map((cat, i) => {
          const Icon = coachIcons[i];
          const best = sorted.reduce((top, c) => {
            const s = c.activeScores.find(s => s.category === cat)?.score ?? 0;
            return s > top.score ? { name: c.name, score: s } : top;
          }, { name: "", score: 0 });

          return (
            <AnimatedCard key={cat} delay={i * 80}>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${coachColors[i]}`} />
                    <span className="text-xs text-muted-foreground font-medium truncate">{cat}</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    <AnimatedNumber value={best.score} decimals={1} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Beste: {best.name}</span>
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Trend chart */}
      <AnimatedCard delay={300}>
        <Card className="bg-card border-border/50 mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Score-ontwikkeling per {periodLabels[period].toLowerCase()}
              </CardTitle>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger className="w-52 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {consultantCoachRankings.map(c => (
                    <SelectItem key={c.name} value={c.name} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Beoordeling 1–10 per gespreksonderdeel over tijd</p>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <ReferenceLine y={6} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.3} label={{ value: "Norm", position: "insideTopLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {coachCategories.map((cat, i) => (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    stroke={chartColors[i]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartColors[i] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="Gemiddeld"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2.5}
                  strokeDasharray="6 3"
                  dot={{ r: 3, fill: "hsl(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Main ranking table */}
      <AnimatedCard delay={450}>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  Ranking op AI-Coach Beoordeling
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Score per gespreksonderdeel (0 – 10) · <span className="text-accent font-medium">{periodLabels[period]}</span> · Klik op een rij voor ontwikkelpunten
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Consultant</TableHead>
                  {coachCategories.map((cat, i) => {
                    const Icon = coachIcons[i];
                    return (
                      <TableHead key={cat} className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Icon className={`w-3.5 h-3.5 ${coachColors[i]}`} />
                          <span className="text-[10px] leading-tight">{cat}</span>
                        </div>
                      </TableHead>
                    );
                  })}
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px]">Gemiddeld</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c, idx) => {
                  const isExpanded = expandedRow === c.name;
                  return (
                    <>
                      <TableRow
                        key={c.name}
                        className="border-border/30 hover:bg-muted/30 cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : c.name)}
                      >
                        <TableCell className="text-center">{rankIcon(idx + 1)}</TableCell>
                        <TableCell className="px-0">
                          {isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{c.name}</TableCell>
                        {coachCategories.map(cat => {
                          const s = c.activeScores.find(s => s.category === cat)?.score ?? 0;
                          return <TableCell key={cat} className="text-center">{scoreBadge(s)}</TableCell>;
                        })}
                        <TableCell className="text-center font-bold text-sm">
                          {scoreBadge(c.activeAverage)}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${c.name}-dev`} className="border-border/20 bg-muted/10">
                          <TableCell colSpan={3} className="pt-1 pb-3 align-top">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" /> Ontwikkelpunten ({periodLabels[period]})
                            </span>
                          </TableCell>
                          {coachCategories.map((cat, ci) => (
                            <TableCell key={cat} className="align-top pt-1 pb-3">
                              <div className="space-y-1.5">
                                {(c.devPoints[cat] || []).map((dp, di) => (
                                  <div key={di} className="flex items-start gap-1.5">
                                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${coachColors[ci].replace("text-", "bg-")}`} />
                                    <div>
                                      <p className="text-[11px] font-medium text-foreground leading-tight">{dp.label}</p>
                                      <p className="text-[10px] text-muted-foreground leading-snug">{dp.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          ))}
                          <TableCell />
                        </TableRow>
                      )}
                    </>
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

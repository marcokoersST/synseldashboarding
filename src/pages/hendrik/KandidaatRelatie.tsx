import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  candidateJourneys,
  stageLabels,
  stageEmoji,
  overallSentimentTrend,
  priorityLabels,
  followUpMetrics,
  candidateNPSScores,
  googleReviews,
  companyGoogleRating,
  companyGoogleReviewCount,
  type CandidateJourney,
} from "@/data/kandidaatRelatieData";
import { consultants } from "@/data/hendrikData";
import {
  Heart, Smile, Meh, Frown, Sparkles, MessageCircleHeart,
  Search, Star, TrendingUp, Users, Brain, Target,
  Phone, CheckCircle2, XCircle, ClipboardCheck, Clock,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, BarChart, Bar,
} from "recharts";

const happinessConfig = {
  very_happy: { icon: Heart, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Zeer tevreden" },
  happy: { icon: Smile, color: "text-blue-400", bg: "bg-blue-500/20", label: "Tevreden" },
  neutral: { icon: Meh, color: "text-amber-400", bg: "bg-amber-500/20", label: "Neutraal" },
  unhappy: { icon: Frown, color: "text-red-400", bg: "bg-red-500/20", label: "Ontevreden" },
};

export default function KandidaatRelatie() {
  const [selectedConsultant, setSelectedConsultant] = useState("all");

  const filtered = useMemo(() => {
    if (selectedConsultant === "all") return candidateJourneys;
    return candidateJourneys.filter((c) => c.consultant === selectedConsultant);
  }, [selectedConsultant]);

  const avgSentiment = useMemo(() => {
    if (filtered.length === 0) return 0;
    return +(filtered.reduce((s, c) => s + c.sentimentScore, 0) / filtered.length).toFixed(1);
  }, [filtered]);

  const insightRate = useMemo(() => {
    if (filtered.length === 0) return 0;
    return Math.round((filtered.filter((c) => c.deepInsightFound).length / filtered.length) * 100);
  }, [filtered]);

  const avgPriorities = useMemo(() => {
    if (filtered.length === 0) return [];
    const keys = Object.keys(filtered[0].priorities) as (keyof CandidateJourney["priorities"])[];
    return keys.map((key) => ({
      subject: priorityLabels[key]?.replace(/^.+\s/, "") ?? key,
      value: +(filtered.reduce((s, c) => s + c.priorities[key], 0) / filtered.length).toFixed(1),
      fullMark: 10,
    }));
  }, [filtered]);

  const sortedByStage = useMemo(() => [...filtered].sort((a, b) => b.stage - a.stage), [filtered]);

  return (
    <ConsultantLayout
      title="Relatie & Kandidaat Geluk"
      subtitle="Bouw de ideale relatie op en vind de droombaan voor elke kandidaat"
    >
      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
          <SelectTrigger className="w-56 bg-card border-border">
            <SelectValue placeholder="Alle consultants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle consultants</SelectItem>
            {consultants.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-muted-foreground">
          {filtered.length} kandidaten actief
        </Badge>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Heart, label: "Gem. Sentiment", value: avgSentiment, suffix: "/10", color: "text-emerald-400" },
          { icon: Brain, label: "Deep Insight %", value: insightRate, suffix: "%", color: "text-purple-400" },
          { icon: Star, label: "Droombaan bereikt", value: filtered.filter((c) => c.stage === 5).length, suffix: `/${filtered.length}`, color: "text-amber-400" },
          { icon: TrendingUp, label: "In proces", value: filtered.filter((c) => c.stage > 0 && c.stage < 5).length, suffix: "", color: "text-blue-400" },
        ].map((kpi) => (
          <AnimatedCard key={kpi.label} delay={100}>
            <Card className="bg-card border-border">
              <CardContent className="pt-5 pb-4 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-muted flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedNumber value={kpi.value} />{kpi.suffix}
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      {/* Middle row: Sentiment Trend + Priorities Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AnimatedCard delay={200}>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Sentiment Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={overallSentimentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[5, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line type="monotone" dataKey="score" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ r: 4 }} name="Sentiment" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={250}>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Kandidaat Prioriteiten (gem.)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={avgPriorities}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="value" stroke="hsl(262, 83%, 58%)" fill="hsl(262, 83%, 58%)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Horse Race: Candidate Journey Tracker */}
      <AnimatedCard delay={300}>
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Kandidaat Journey — Op weg naar de Droombaan
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Elke kandidaat is een mens, geen nummertje. Volg hun reis naar de ideale carrièrestap.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Stage headers */}
            <div className="hidden md:grid grid-cols-[200px_1fr] gap-4 mb-2">
              <div />
              <div className="grid grid-cols-6 gap-1">
                {stageLabels.map((label, i) => (
                  <div key={label} className="text-center">
                    <span className="text-lg">{stageEmoji[i]}</span>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate rows */}
            {sortedByStage.map((candidate) => {
              const hConfig = happinessConfig[candidate.happinessLevel];
              const HIcon = hConfig.icon;
              const progressPct = (candidate.stage / 5) * 100;

              return (
                <div
                  key={candidate.id}
                  className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 items-center p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  {/* Candidate info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-border">
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback>{candidate.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{candidate.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{candidate.role}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <HIcon className={`w-3.5 h-3.5 ${hConfig.color}`} />
                        <span className={`text-[10px] font-medium ${hConfig.color}`}>{candidate.sentimentScore}</span>
                        {candidate.deepInsightFound && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-purple-500/40 text-purple-400">
                            💡 Insight
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Journey track */}
                  <div className="relative">
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${progressPct}%`,
                          background: candidate.stage === 5
                            ? "linear-gradient(90deg, hsl(142, 71%, 45%), hsl(48, 96%, 53%))"
                            : candidate.sentimentScore >= 8
                              ? "hsl(142, 71%, 45%)"
                              : candidate.sentimentScore >= 6.5
                                ? "hsl(217, 91%, 60%)"
                                : "hsl(0, 84%, 60%)",
                        }}
                      />
                    </div>
                    {/* Stage markers */}
                    <div className="absolute inset-0 grid grid-cols-6">
                      {stageLabels.map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                          <div
                            className={`w-3 h-3 rounded-full border-2 transition-all ${
                              i <= candidate.stage
                                ? "bg-primary border-primary scale-110"
                                : "bg-muted border-border"
                            } ${i === candidate.stage ? "ring-2 ring-primary/30 ring-offset-1 ring-offset-background" : ""}`}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Quote */}
                    {candidate.quote && (
                      <p className="text-[10px] text-muted-foreground italic mt-2 pl-1">"{candidate.quote}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Opvolging & Betrokkenheid Kwaliteit */}
      <AnimatedCard delay={350}>
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-teal-400" />
              Opvolging & Betrokkenheid Kwaliteit
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Hoe goed worden kandidaten begeleid? Bellen vóór het gesprek, briefing, snel nabellen en afspraken nakomen.
            </p>
          </CardHeader>
          <CardContent>
            {(() => {
              const data = selectedConsultant === "all"
                ? followUpMetrics
                : followUpMetrics.filter((f) => f.consultant === selectedConsultant);
              if (data.length === 0) return <p className="text-sm text-muted-foreground">Geen data beschikbaar voor deze consultant.</p>;

              return (
                <div className="space-y-4">
                  {data.map((entry) => (
                    <div key={entry.consultant} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground">{entry.consultant}</p>
                        <Badge
                          variant="outline"
                          className={
                            entry.overallScore >= 85
                              ? "border-emerald-500/40 text-emerald-400"
                              : entry.overallScore >= 70
                                ? "border-blue-500/40 text-blue-400"
                                : "border-amber-500/40 text-amber-400"
                          }
                        >
                          Score: {entry.overallScore}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {entry.metrics.map((m) => (
                          <div key={m.label} className="text-center">
                            <span className="text-xl">{m.emoji}</span>
                            <p className="text-[11px] font-medium text-foreground mt-1">{m.label}</p>
                            <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${m.score}%`,
                                  background: m.score >= 85
                                    ? "hsl(142, 71%, 45%)"
                                    : m.score >= 70
                                      ? "hsl(217, 91%, 60%)"
                                      : "hsl(38, 92%, 50%)",
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{m.score}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* NPS Scores per Kandidaat + Google Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* NPS Overview */}
        <AnimatedCard delay={370} className="lg:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                NPS-Scores per Kandidaat
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Hoe tevreden zijn kandidaten over hun ervaring met de consultant?</p>
            </CardHeader>
            <CardContent>
              {/* NPS summary bar */}
              {(() => {
                const npsFiltered = selectedConsultant === "all"
                  ? candidateNPSScores
                  : candidateNPSScores.filter((n) => n.consultant === selectedConsultant);
                const promoters = npsFiltered.filter((n) => n.category === "promoter").length;
                const passives = npsFiltered.filter((n) => n.category === "passive").length;
                const detractors = npsFiltered.filter((n) => n.category === "detractor").length;
                const total = npsFiltered.length || 1;
                const npsValue = Math.round(((promoters - detractors) / total) * 100);
                const avgRating = +(npsFiltered.reduce((s, n) => s + n.npsRating, 0) / total).toFixed(1);

                return (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{npsValue > 0 ? "+" : ""}{npsValue}</p>
                        <p className="text-[10px] text-muted-foreground">NPS Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{avgRating}</p>
                        <p className="text-[10px] text-muted-foreground">Gem. Rating</p>
                      </div>
                      <div className="flex-1 flex gap-1 h-4 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 transition-all" style={{ width: `${(promoters / total) * 100}%` }} />
                        <div className="bg-amber-400 transition-all" style={{ width: `${(passives / total) * 100}%` }} />
                        <div className="bg-red-500 transition-all" style={{ width: `${(detractors / total) * 100}%` }} />
                      </div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {promoters} Promoters</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {passives} Passief</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {detractors} Detractors</span>
                      </div>
                    </div>

                    {/* Individual NPS rows */}
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {npsFiltered.map((nps) => (
                        <div key={nps.candidateId} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                          <Avatar className="w-8 h-8 border border-border shrink-0">
                            <AvatarImage src={nps.avatar} alt={nps.name} />
                            <AvatarFallback>{nps.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{nps.name}</p>
                              <Badge variant="outline" className={
                                nps.category === "promoter" ? "border-emerald-500/40 text-emerald-400 text-[9px]" :
                                nps.category === "passive" ? "border-amber-500/40 text-amber-400 text-[9px]" :
                                "border-red-500/40 text-red-400 text-[9px]"
                              }>
                                {nps.npsRating}/10
                              </Badge>
                              <span className="text-[10px] text-muted-foreground ml-auto">{nps.date}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 italic">"{nps.feedback}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Google Reviews */}
        <AnimatedCard delay={390}>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <span className="text-lg">⭐</span>
                Google Reviews
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(companyGoogleRating) ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">{companyGoogleRating}</span>
                <span className="text-xs text-muted-foreground">({companyGoogleReviewCount} reviews)</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {googleReviews.map((review, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      {review.avatar ? (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">{review.author[0]}</div>
                      )}
                      <span className="text-sm font-medium text-foreground">{review.author}</span>
                      <div className="flex ml-auto">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{review.text}"</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">{review.date}</span>
                      {review.linkedConsultant && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-border text-muted-foreground">
                          → {review.linkedConsultant}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Bottom: Happiness Distribution */}
      <AnimatedCard delay={400}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Geluksverdeling & Vraag achter de Vraag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.entries(happinessConfig) as [CandidateJourney["happinessLevel"], typeof happinessConfig.very_happy][]).map(([level, config]) => {
                const count = filtered.filter((c) => c.happinessLevel === level).length;
                const HIcon = config.icon;
                return (
                  <div key={level} className={`rounded-xl p-4 ${config.bg} border border-border/50 text-center`}>
                    <HIcon className={`w-8 h-8 mx-auto mb-2 ${config.color}`} />
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                De wens achter de wens ontdekken
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bij <strong>{insightRate}%</strong> van de kandidaten is een dieper inzicht gevonden — de vraag achter de vraag, 
                de behoefte achter de behoefte. Dit leidt tot betere matches, hogere tevredenheid en langere plaatsingen. 
                Kandidaten komen tot een nieuw inzicht over de voor hen best passende baan wanneer de consultant verder kijkt 
                dan het CV en écht luistert naar wat iemand drijft.
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}

import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { cn } from "@/lib/utils";
import { consultantSkillData, type ConsultantSkillData } from "@/data/managerPerformanceData";
import { consultantQualityData, teamAvgNps } from "@/data/managerPerformanceDataV2";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  TrendingDown,
  Target,
  Star,
  ArrowRight,
  Users,
  GitCompare,
  X,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Helpers ───

interface SkillMetric {
  key: string;
  label: string;
  value: number;
  max: number;
  category: "skills" | "operational" | "ratings";
}

function getSkillMetrics(c: ConsultantSkillData): SkillMetric[] {
  return [
    { key: "relatieKlant", label: "Relatie Klant", value: c.relatieScoreKlant, max: 10, category: "skills" },
    { key: "relatieKand", label: "Relatie Kandidaat", value: c.relatieScoreKandidaat, max: 10, category: "skills" },
    { key: "pitching", label: "Pitching Power", value: c.pitchingPower, max: 100, category: "skills" },
    { key: "response", label: "Responsiveness", value: c.responsiveness, max: 100, category: "skills" },
    { key: "networking", label: "Networking", value: c.networking, max: 100, category: "skills" },
    { key: "bezwaar", label: "Bezwaarverlegging", value: c.bezwaarverlegging, max: 100, category: "skills" },
    { key: "inschr", label: "Proc. Inschrijving", value: c.procedureInschrijving, max: 100, category: "operational" },
    { key: "acq", label: "Proc. Acquisitie", value: c.procedureAcquisities, max: 100, category: "operational" },
    { key: "hygiene", label: "Systeem Hygiëne", value: c.systeemHygieneScore, max: 100, category: "operational" },
    { key: "npsKlant", label: "NPS Klant", value: c.npsKlant, max: 100, category: "ratings" },
    { key: "npsKand", label: "NPS Kandidaat", value: c.npsKandidaat, max: 100, category: "ratings" },
  ];
}

function overallScore(c: ConsultantSkillData): number {
  const metrics = getSkillMetrics(c);
  const normalised = metrics.map(m => (m.value / m.max) * 100);
  return Math.round(normalised.reduce((a, b) => a + b, 0) / normalised.length);
}

function scoreRing(pct: number) {
  if (pct >= 75) return "text-success border-success/30 bg-success/8";
  if (pct >= 55) return "text-amber-500 border-amber-500/30 bg-amber-500/8";
  return "text-destructive border-destructive/30 bg-destructive/8";
}

const categoryLabels: Record<string, string> = {
  skills: "Kernvaardigheden",
  operational: "Operationele vaardigheden",
  ratings: "Ratings & Sentiment",
};

function actionForWeakness(metric: SkillMetric): string {
  const map: Record<string, string> = {
    relatieKlant: "Plan klantgesprekken in voor relatieverdieping",
    relatieKand: "Besteed meer tijd aan kandidaat follow-up",
    pitching: "Oefen pitch met AI-coach sessie",
    response: "Stel notificaties in, reageer binnen 2 uur",
    networking: "Bezoek minimaal 1 branche-event deze maand",
    bezwaar: "Oefen bezwaarverlegging scenario's met team lead",
    inschr: "Review inschrijvingsprocedure met team lead",
    acq: "Shadow een senior bij acquisitiegesprekken",
    npsKlant: "Analyseer recente klantfeedback en acteer",
    npsKand: "Verbeter kandidaat-communicatie na plaatsing",
    hygiene: "Ruim CRM op: sluit inactieve vacatures",
  };
  return map[metric.key] || "Focus verbetering nodig";
}

// ─── Overview Summary ───

function PerformanceSummary({ filteredData }: { filteredData: ConsultantSkillData[] }) {
  const avgScore = Math.round(filteredData.reduce((s, c) => s + overallScore(c), 0) / filteredData.length);
  const belowNorm = filteredData.filter(c => overallScore(c) < 55).length;
  const avgVolume = Math.round(filteredData.reduce((s, c) => s + c.procedureInschrijving + c.procedureAcquisities, 0) / filteredData.length / 2);
  const avgQuality = Math.round(filteredData.reduce((s, c) => s + c.pitchingPower + c.responsiveness + c.networking, 0) / filteredData.length / 3);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 border border-primary/10 p-3">
        <span className={cn("text-2xl font-bold", avgScore >= 70 ? "text-success" : avgScore >= 55 ? "text-amber-500" : "text-destructive")}>{avgScore}%</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">Gem. Score</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 border border-primary/10 p-3">
        <span className={cn("text-2xl font-bold", belowNorm > 0 ? "text-destructive" : "text-success")}>{belowNorm}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">Onder norm</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 border border-primary/10 p-3">
        <div className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-teal" />
          <span className="text-xl font-bold text-foreground">{avgVolume}%</span>
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5">Gem. Volume</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 border border-primary/10 p-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-primary" />
          <span className="text-xl font-bold text-foreground">{avgQuality}%</span>
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5">Gem. Kwaliteit</span>
      </div>
    </div>
  );
}

// ─── NPS / Sentiment Overview ───

function QualitySentimentOverview() {
  return (
    <div className="flex items-center gap-4 mb-4 p-3 rounded-lg border border-border/50 bg-secondary/20">
      <div className="flex-1 flex items-center gap-3">
        <div className="text-center">
          <span className="text-lg font-bold text-foreground">{teamAvgNps.klant}</span>
          <span className="text-[10px] text-muted-foreground block">NPS Klant</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <span className="text-lg font-bold text-foreground">{teamAvgNps.kandidaat}</span>
          <span className="text-[10px] text-muted-foreground block">NPS Kandidaat</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <span className={cn("text-lg font-bold", teamAvgNps.sentiment >= 70 ? "text-success" : teamAvgNps.sentiment >= 50 ? "text-amber-500" : "text-destructive")}>{teamAvgNps.sentiment}%</span>
          <span className="text-[10px] text-muted-foreground block">Sentiment</span>
        </div>
      </div>
      {/* NPS distribution mini */}
      <div className="flex gap-1">
        {consultantQualityData.map(c => (
          <div key={c.consultantId} className={cn(
            "w-2 rounded-full",
            c.sentimentScore >= 70 ? "bg-success" : c.sentimentScore >= 50 ? "bg-amber-500" : "bg-destructive"
          )} style={{ height: `${Math.max(c.sentimentScore / 3, 8)}px` }}
            title={`${c.consultantName}: ${c.sentimentScore}%`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Skill Bar with team average ───

function SkillBar({ label, pct, teamAvg }: { label: string; pct: number; teamAvg?: number }) {
  const color = pct >= 75 ? "bg-success" : pct >= 55 ? "bg-amber-500" : "bg-destructive";
  const trend = teamAvg !== undefined ? pct - teamAvg : 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-32 truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden relative">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
        {teamAvg !== undefined && (
          <div className="absolute top-0 h-full w-0.5 bg-foreground/30" style={{ left: `${teamAvg}%` }} title={`Team gem: ${Math.round(teamAvg)}`} />
        )}
      </div>
      <span className="font-semibold tabular-nums w-8 text-right text-foreground">{Math.round(pct)}</span>
      {teamAvg !== undefined && (
        <span className={cn("text-[10px] w-10 text-right tabular-nums",
          trend > 5 ? "text-success" : trend < -5 ? "text-destructive" : "text-muted-foreground"
        )}>
          {trend > 0 ? "+" : ""}{Math.round(trend)}
          {trend > 5 ? " ↑" : trend < -5 ? " ↓" : ""}
        </span>
      )}
    </div>
  );
}

// ─── Consultant Row ───

function ConsultantRow({ data, rank, teamAvgs, onCompareToggle, isCompareSelected }: {
  data: ConsultantSkillData;
  rank: number;
  teamAvgs: Record<string, number>;
  onCompareToggle?: () => void;
  isCompareSelected?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const score = overallScore(data);
  const metrics = getSkillMetrics(data);
  const sorted = [...metrics].sort((a, b) => (a.value / a.max) - (b.value / b.max));
  const weaknesses = sorted.slice(0, 2);
  const strengths = sorted.slice(-2).reverse();

  // Coaching focus: biggest gap below team average
  const coachingFocus = metrics
    .map(m => ({ ...m, gap: (m.value / m.max) * 100 - (teamAvgs[m.key] || 0) }))
    .filter(m => m.gap < -10)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 2);

  const quality = consultantQualityData.find(q => q.consultantId === data.consultantId);

  const skillsByCategory = {
    skills: metrics.filter(m => m.category === "skills"),
    operational: metrics.filter(m => m.category === "operational"),
    ratings: metrics.filter(m => m.category === "ratings"),
  };

  return (
    <div className={cn("border border-border/50 rounded-lg overflow-hidden", isCompareSelected && "ring-2 ring-primary/30")}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left">
        {onCompareToggle && (
          <Checkbox checked={isCompareSelected} onCheckedChange={() => onCompareToggle()} onClick={e => e.stopPropagation()} className="w-4 h-4" />
        )}
        <span className="text-xs text-muted-foreground w-4 shrink-0 tabular-nums">{rank}</span>
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold", scoreRing(score))}>
          {score}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{data.consultantName}</div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {strengths.map(s => (
              <Badge key={s.key} variant="outline" className="text-[10px] py-0 border-success/30 text-success bg-success/5">
                <Star className="w-2.5 h-2.5 mr-0.5" />{s.label}
              </Badge>
            ))}
            {coachingFocus.length > 0 && (
              <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-600 bg-amber-500/5">
                <Target className="w-2.5 h-2.5 mr-0.5" />Coaching: {coachingFocus[0].label}
              </Badge>
            )}
            {quality && quality.sentimentTrend < -5 && (
              <Badge variant="outline" className="text-[10px] py-0 border-destructive/30 text-destructive bg-destructive/5">
                <TrendingDown className="w-2.5 h-2.5 mr-0.5" />Sentiment ↓
              </Badge>
            )}
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border/50 bg-secondary/10 px-4 py-3 space-y-4">
          {(["skills", "operational", "ratings"] as const).map(cat => (
            <div key={cat} className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">{categoryLabels[cat]}</span>
              <div className="space-y-1">
                {skillsByCategory[cat].map(m => (
                  <SkillBar key={m.key} label={m.label} pct={(m.value / m.max) * 100} teamAvg={teamAvgs[m.key]} />
                ))}
              </div>
            </div>
          ))}

          {/* Sentiment detail */}
          {quality && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Sentiment & NPS detail</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md bg-secondary/30 px-2 py-1.5 text-center">
                  <span className="text-sm font-bold text-foreground">{quality.npsKlant}</span>
                  <span className="text-[10px] text-muted-foreground block">NPS Klant</span>
                </div>
                <div className="rounded-md bg-secondary/30 px-2 py-1.5 text-center">
                  <span className="text-sm font-bold text-foreground">{quality.npsKandidaat}</span>
                  <span className="text-[10px] text-muted-foreground block">NPS Kand.</span>
                </div>
                <div className="rounded-md bg-secondary/30 px-2 py-1.5 text-center">
                  <span className={cn("text-sm font-bold", quality.sentimentTrend > 0 ? "text-success" : quality.sentimentTrend < -5 ? "text-destructive" : "text-foreground")}>
                    {quality.sentimentScore}%
                    {quality.sentimentTrend > 0 ? " ↑" : quality.sentimentTrend < -5 ? " ↓" : ""}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Sentiment</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {weaknesses.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Aanbevolen acties
              </span>
              <div className="space-y-1">
                {weaknesses.map(w => (
                  <div key={w.key} className="flex items-start gap-2 text-xs text-foreground bg-amber-500/5 border border-amber-500/15 rounded-md px-2.5 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">{w.label}</span>
                      <span className="text-muted-foreground"> — {actionForWeakness(w)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Comparison ───

function ComparisonPanel({ ids, onClose }: { ids: [number, number]; onClose: () => void }) {
  const [a, b] = ids.map(id => consultantSkillData.find(c => c.consultantId === id)!);
  if (!a || !b) return null;
  const metricsA = getSkillMetrics(a);
  const metricsB = getSkillMetrics(b);

  return (
    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-primary" />
          {a.consultantName} vs {b.consultantName}
        </h4>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="w-3.5 h-3.5" /></Button>
      </div>
      {(["skills", "operational", "ratings"] as const).map(cat => (
        <div key={cat} className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">{categoryLabels[cat]}</span>
          {metricsA.filter(m => m.category === cat).map(mA => {
            const mB = metricsB.find(m => m.key === mA.key)!;
            const pctA = (mA.value / mA.max) * 100;
            const pctB = (mB.value / mB.max) * 100;
            const diff = Math.round(pctA - pctB);
            return (
              <div key={mA.key} className="flex items-center gap-2 text-xs">
                <span className="w-32 text-muted-foreground truncate shrink-0">{mA.label}</span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pctA}%` }} />
                  </div>
                  <span className="font-semibold tabular-nums w-7 text-right text-teal">{Math.round(pctA)}</span>
                </div>
                <span className={cn("text-[10px] w-8 text-center font-bold tabular-nums",
                  diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {diff > 0 ? "+" : ""}{diff}
                </span>
                <div className="flex-1 flex items-center gap-1">
                  <span className="font-semibold tabular-nums w-7 text-primary">{Math.round(pctB)}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pctB}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
        <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded bg-teal" />{a.consultantName}</div>
        <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded bg-primary" />{b.consultantName}</div>
      </div>
    </div>
  );
}

// ─── Main ───

interface PerformanceCardV2Props {
  delay?: number;
  selectedUnit?: string;
}

export function PerformanceCardV2({ delay = 0, selectedUnit }: PerformanceCardV2Props) {
  const filteredData = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return consultantSkillData;
    return consultantSkillData.filter(c => c.unit === selectedUnit);
  }, [selectedUnit]);

  const ranked = [...filteredData].sort((a, b) => overallScore(b) - overallScore(a));
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);

  // Team averages per metric
  const teamAvgs = useMemo(() => {
    const allMetrics = filteredData.map(getSkillMetrics);
    const avgs: Record<string, number> = {};
    if (allMetrics.length === 0) return avgs;
    allMetrics[0].forEach((_, idx) => {
      const key = allMetrics[0][idx].key;
      const vals = allMetrics.map(ms => (ms[idx].value / ms[idx].max) * 100);
      avgs[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
    });
    return avgs;
  }, [filteredData]);

  const toggleCompare = (id: number) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Performance & Kwaliteit</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Volume, kwaliteit & coaching</p>
            </div>
          </div>
          <Button variant={compareMode ? "secondary" : "outline"} size="sm" className="h-7 text-xs gap-1"
            onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}>
            <GitCompare className="w-3 h-3" />Vergelijk
          </Button>
        </div>

        <PerformanceSummary filteredData={filteredData} />
        <QualitySentimentOverview />

        {compareMode && compareIds.length === 2 && (
          <div className="mb-4">
            <ComparisonPanel ids={compareIds as [number, number]} onClose={() => setCompareIds([])} />
          </div>
        )}
        {compareMode && compareIds.length < 2 && (
          <p className="text-xs text-muted-foreground mb-3 px-1">Selecteer 2 consultants om te vergelijken ({compareIds.length}/2)</p>
        )}

        <div className="space-y-2 flex-1 overflow-y-auto">
          {ranked.map((c, i) => (
            <ConsultantRow key={c.consultantId} data={c} rank={i + 1} teamAvgs={teamAvgs}
              onCompareToggle={compareMode ? () => toggleCompare(c.consultantId) : undefined}
              isCompareSelected={compareIds.includes(c.consultantId)} />
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}

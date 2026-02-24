import { useState } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { cn } from "@/lib/utils";
import { consultantSkillData, type ConsultantSkillData } from "@/data/managerPerformanceData";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Target,
  Star,
  ArrowRight,
  Users,
  GitCompare,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Skill categorization ───

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
  const normalised = metrics.map((m) => (m.value / m.max) * 100);
  return Math.round(normalised.reduce((a, b) => a + b, 0) / normalised.length);
}

function scoreRing(pct: number) {
  if (pct >= 75) return "text-success border-success/30 bg-success/8";
  if (pct >= 55) return "text-amber-500 border-amber-500/30 bg-amber-500/8";
  return "text-destructive border-destructive/30 bg-destructive/8";
}

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

const categoryLabels: Record<string, string> = {
  skills: "Kernvaardigheden",
  operational: "Operationele vaardigheden",
  ratings: "Ratings",
};

// ─── Sub-components ───

function OverallScoreBadge({ score }: { score: number }) {
  return (
    <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold", scoreRing(score))}>
      {score}
    </div>
  );
}

function SkillBar({ label, pct, small, compareValue }: { label: string; pct: number; small?: boolean; compareValue?: number }) {
  const color = pct >= 75 ? "bg-success" : pct >= 55 ? "bg-amber-500" : "bg-destructive";
  const compareColor = compareValue !== undefined ? (compareValue >= 75 ? "bg-primary/60" : compareValue >= 55 ? "bg-primary/40" : "bg-primary/30") : "";
  return (
    <div className={cn("flex items-center gap-2", small ? "text-[10px]" : "text-xs")}>
      <span className="text-muted-foreground w-32 truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden relative">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
        {compareValue !== undefined && (
          <div className={cn("absolute top-0 h-full rounded-full opacity-50", compareColor)} style={{ width: `${compareValue}%` }} />
        )}
      </div>
      <span className="font-semibold tabular-nums w-8 text-right text-foreground">{Math.round(pct)}</span>
      {compareValue !== undefined && (
        <span className="font-medium tabular-nums w-8 text-right text-primary/70">{Math.round(compareValue)}</span>
      )}
    </div>
  );
}

function ConsultantInsightRow({ data, rank, onCompareToggle, isCompareSelected }: { data: ConsultantSkillData; rank: number; onCompareToggle?: () => void; isCompareSelected?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const score = overallScore(data);
  const metrics = getSkillMetrics(data);
  const sorted = [...metrics].sort((a, b) => (a.value / a.max) - (b.value / b.max));
  const weaknesses = sorted.slice(0, 2);
  const strengths = sorted.slice(-2).reverse();

  const skillsByCategory = {
    skills: metrics.filter(m => m.category === "skills"),
    operational: metrics.filter(m => m.category === "operational"),
    ratings: metrics.filter(m => m.category === "ratings"),
  };

  return (
    <div className={cn("border border-border/50 rounded-lg overflow-hidden", isCompareSelected && "ring-2 ring-primary/30")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
      >
        {onCompareToggle && (
          <Checkbox
            checked={isCompareSelected}
            onCheckedChange={(e) => { e; onCompareToggle(); }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4"
          />
        )}
        <span className="text-xs text-muted-foreground w-4 shrink-0 tabular-nums">{rank}</span>
        <OverallScoreBadge score={score} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{data.consultantName}</div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {strengths.map((s) => (
              <Badge key={s.key} variant="outline" className="text-[10px] py-0 border-success/30 text-success bg-success/5">
                <Star className="w-2.5 h-2.5 mr-0.5" />{s.label}
              </Badge>
            ))}
            {weaknesses.map((w) => (
              <Badge key={w.key} variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-600 bg-amber-500/5">
                <Target className="w-2.5 h-2.5 mr-0.5" />{w.label}
              </Badge>
            ))}
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
                {skillsByCategory[cat].map((m) => (
                  <SkillBar key={m.key} label={m.label} pct={(m.value / m.max) * 100} />
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> Aanbevolen acties
            </span>
            <div className="space-y-1">
              {weaknesses.map((w) => (
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
        </div>
      )}
    </div>
  );
}

// ─── Comparison Panel ───

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
          {metricsA.filter(m => m.category === cat).map((mA) => {
            const mB = metricsB.find(m => m.key === mA.key)!;
            const pctA = (mA.value / mA.max) * 100;
            const pctB = (mB.value / mB.max) * 100;
            return (
              <div key={mA.key} className="flex items-center gap-2 text-xs">
                <span className="w-32 text-muted-foreground truncate shrink-0">{mA.label}</span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pctA}%` }} />
                  </div>
                  <span className="font-semibold tabular-nums w-7 text-right text-teal">{Math.round(pctA)}</span>
                </div>
                <span className="text-muted-foreground/40">|</span>
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

// ─── Team Gap Analysis ───

function TeamGapAnalysis() {
  const allMetrics = consultantSkillData.map(getSkillMetrics);
  const metricKeys = allMetrics[0].map((m) => m.key);
  const avgByMetric = metricKeys.map((key) => {
    const values = allMetrics.map((ms) => {
      const m = ms.find((x) => x.key === key)!;
      return (m.value / m.max) * 100;
    });
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const label = allMetrics[0].find((x) => x.key === key)!.label;
    return { key, label, avg };
  });
  const sorted = [...avgByMetric].sort((a, b) => a.avg - b.avg);
  const gaps = sorted.slice(0, 3);
  const topSkills = sorted.slice(-2).reverse();

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> Team aandachtspunten
        </span>
        {gaps.map((g) => <SkillBar key={g.key} label={g.label} pct={g.avg} small />)}
      </div>
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-success" /> Team sterktes
        </span>
        {topSkills.map((g) => <SkillBar key={g.key} label={g.label} pct={g.avg} small />)}
      </div>
    </div>
  );
}

// ─── Main Component ───

interface ProcesKernvaardighedenCardProps {
  delay?: number;
  selectedUnit?: string;
}

export function ProcesKernvaardighedenCard({ delay = 0 }: ProcesKernvaardighedenCardProps) {
  const ranked = [...consultantSkillData].sort((a, b) => overallScore(b) - overallScore(a));
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);

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
              <h3 className="text-sm font-medium text-foreground">Proces & Kernvaardigheden</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Inzichten en aanbevolen acties per consultant</p>
            </div>
          </div>
          <Button
            variant={compareMode ? "secondary" : "outline"}
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
          >
            <GitCompare className="w-3 h-3" />
            Vergelijk
          </Button>
        </div>

        {/* Team-level gap analysis */}
        <div className="mb-4 p-3 rounded-lg border border-border/50 bg-secondary/20">
          <TeamGapAnalysis />
        </div>

        {/* Comparison panel */}
        {compareMode && compareIds.length === 2 && (
          <div className="mb-4">
            <ComparisonPanel ids={compareIds as [number, number]} onClose={() => setCompareIds([])} />
          </div>
        )}
        {compareMode && compareIds.length < 2 && (
          <p className="text-xs text-muted-foreground mb-3 px-1">Selecteer 2 consultants om te vergelijken ({compareIds.length}/2)</p>
        )}

        {/* Ranked consultant list */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {ranked.map((c, i) => (
            <ConsultantInsightRow
              key={c.consultantId}
              data={c}
              rank={i + 1}
              onCompareToggle={compareMode ? () => toggleCompare(c.consultantId) : undefined}
              isCompareSelected={compareIds.includes(c.consultantId)}
            />
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}

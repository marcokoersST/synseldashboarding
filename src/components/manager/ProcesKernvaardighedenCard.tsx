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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Helpers ───

interface SkillMetric {
  key: string;
  label: string;
  value: number;
  max: number;
  category: "kern" | "procedure" | "nps" | "hygiene";
}

function getSkillMetrics(c: ConsultantSkillData): SkillMetric[] {
  return [
    { key: "relatieKlant", label: "Relatie Klant", value: c.relatieScoreKlant, max: 10, category: "kern" },
    { key: "relatieKand", label: "Relatie Kandidaat", value: c.relatieScoreKandidaat, max: 10, category: "kern" },
    { key: "pitching", label: "Pitching Power", value: c.pitchingPower, max: 100, category: "kern" },
    { key: "response", label: "Responsiveness", value: c.responsiveness, max: 100, category: "kern" },
    { key: "networking", label: "Networking", value: c.networking, max: 100, category: "kern" },
    { key: "inschr", label: "Proc. Inschrijving", value: c.procedureInschrijving, max: 100, category: "procedure" },
    { key: "acq", label: "Proc. Acquisitie", value: c.procedureAcquisities, max: 100, category: "procedure" },
    { key: "npsKlant", label: "NPS Klant", value: c.npsKlant, max: 100, category: "nps" },
    { key: "npsKand", label: "NPS Kandidaat", value: c.npsKandidaat, max: 100, category: "nps" },
    { key: "hygiene", label: "Systeem Hygiëne", value: c.systeemHygieneScore, max: 100, category: "hygiene" },
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
    inschr: "Review inschrijvingsprocedure met team lead",
    acq: "Shadow een senior bij acquisitiegesprekken",
    npsKlant: "Analyseer recente klantfeedback en acteer",
    npsKand: "Verbeter kandidaat-communicatie na plaatsing",
    hygiene: "Ruim CRM op: sluit inactieve vacatures",
  };
  return map[metric.key] || "Focus verbetering nodig";
}

// ─── Sub-components ───

function OverallScoreBadge({ score }: { score: number }) {
  return (
    <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold", scoreRing(score))}>
      {score}
    </div>
  );
}

function SkillBar({ label, pct, small }: { label: string; pct: number; small?: boolean }) {
  const color = pct >= 75 ? "bg-success" : pct >= 55 ? "bg-amber-500" : "bg-destructive";
  return (
    <div className={cn("flex items-center gap-2", small ? "text-[10px]" : "text-xs")}>
      <span className="text-muted-foreground w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-semibold tabular-nums w-8 text-right text-foreground">{Math.round(pct)}</span>
    </div>
  );
}

function ConsultantInsightRow({ data, rank }: { data: ConsultantSkillData; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const score = overallScore(data);
  const metrics = getSkillMetrics(data);
  const sorted = [...metrics].sort((a, b) => (a.value / a.max) - (b.value / b.max));
  const weaknesses = sorted.slice(0, 2);
  const strengths = sorted.slice(-2).reverse();

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
      >
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

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/50 bg-secondary/10 px-4 py-3 space-y-4">
          {/* All skill bars */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Alle vaardigheden</span>
            <div className="space-y-1">
              {metrics.map((m) => (
                <SkillBar key={m.key} label={m.label} pct={(m.value / m.max) * 100} />
              ))}
            </div>
          </div>

          {/* Suggested actions */}
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

// ─── Team Gap Analysis ───

function TeamGapAnalysis() {
  // Average each metric across all consultants
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
        {gaps.map((g) => (
          <div key={g.key} className="flex items-center gap-2">
            <SkillBar label={g.label} pct={g.avg} small />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-success" /> Team sterktes
        </span>
        {topSkills.map((g) => (
          <div key={g.key} className="flex items-center gap-2">
            <SkillBar label={g.label} pct={g.avg} small />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───

interface ProcesKernvaardighedenCardProps {
  delay?: number;
}

export function ProcesKernvaardighedenCard({ delay = 0 }: ProcesKernvaardighedenCardProps) {
  const ranked = [...consultantSkillData].sort((a, b) => overallScore(b) - overallScore(a));

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Proces & Kernvaardigheden</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Inzichten en aanbevolen acties per consultant</p>
        </div>

        {/* Team-level gap analysis */}
        <div className="mb-4 p-3 rounded-lg border border-border/50 bg-secondary/20">
          <TeamGapAnalysis />
        </div>

        {/* Ranked consultant list */}
        <div className="space-y-2 flex-1">
          {ranked.map((c, i) => (
            <ConsultantInsightRow key={c.consultantId} data={c} rank={i + 1} />
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}

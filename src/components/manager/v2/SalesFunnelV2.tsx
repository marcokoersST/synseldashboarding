import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, ArrowUpDown, ArrowUp, ArrowDown, TrendingDown, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIInsightNote } from "./AIInsightNote";
import {
  funnelStepsV2,
  consultantFunnelDataV2,
  unitFunnelTotalsV2,
  getConversionV2,
  consultantDetailData,
  type FunnelStepKey,
  type ConsultantFunnelDataV2,
} from "@/data/managerOperationalDataV2";

function useDetailToggle() {
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(false);
  const toggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newMode = !isDetailMode;
      setIsDetailMode(newMode);
      setDisplayMode(newMode);
      setTimeout(() => setIsTransitioning(false), 120);
    }, 300);
  };
  return { isDetailMode, isTransitioning, displayMode, toggle };
}

const funnelColors = [
  "hsl(175, 50%, 78%)", "hsl(175, 50%, 72%)", "hsl(175, 52%, 64%)", "hsl(175, 53%, 60%)",
  "hsl(175, 55%, 55%)", "hsl(175, 55%, 51%)", "hsl(175, 58%, 44%)", "hsl(175, 60%, 37%)", "hsl(175, 65%, 27%)",
];

// ─── Overview: Horizontal Step Chart (compact redesign) ───

function FunnelOverview({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const totals = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return unitFunnelTotalsV2;
    const filtered = consultantFunnelDataV2.filter(c => c.unit === selectedUnit);
    if (filtered.length === 0) return unitFunnelTotalsV2;
    const result = {} as Record<FunnelStepKey, number>;
    funnelStepsV2.forEach(s => {
      result[s.key] = filtered.reduce((sum, c) => sum + c[s.key], 0);
    });
    return result;
  }, [selectedUnit]);

  const data = funnelStepsV2.map(s => ({
    ...s,
    value: totals[s.key] || 0,
  }));
  const max = Math.max(data[0].value, 1);

  return (
    <div className="space-y-1">
      {data.map((step, i) => {
        const widthPct = Math.max(((step.value / max) * 100), 8);
        const prevStepValue = i > 0 ? data[i - 1].value : 0;
        const convPct = i > 0 && prevStepValue > 0 ? getConversionV2(step.value, prevStepValue) : null;
        const isLow = convPct !== null && convPct < 40;
        const isMed = convPct !== null && convPct < 60 && !isLow;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-[85px] text-right shrink-0 truncate">{step.label}</span>
            <div className="flex-1 flex items-center gap-1.5">
              <div
                className="h-7 rounded-md flex items-center justify-end pr-2 transition-all duration-700 ease-out"
                style={{ width: `${widthPct}%`, backgroundColor: funnelColors[i], minWidth: "40px" }}
              >
                <span className="text-white text-[11px] font-bold tabular-nums">
                  <AnimatedNumber value={step.value} delay={delay + i * 50} />
                </span>
              </div>
              {convPct !== null && (
                <span className={cn(
                  "text-[10px] font-semibold tabular-nums shrink-0",
                  isLow ? "text-destructive" : isMed ? "text-amber-500" : "text-muted-foreground"
                )}>
                  {convPct}%{isLow && " ⚠"}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {totals.toegewezen > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 mt-2">
          <span className="text-xs font-medium text-foreground">
            Totaal: {totals.toegewezen} → {totals.plaatsingen}
          </span>
          <span className="text-sm font-bold text-primary">
            {((totals.plaatsingen / totals.toegewezen) * 100).toFixed(1)}% conversie
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Detail: Consultant Table with Click-through ───

type SortKey = FunnelStepKey | "consultantName" | "biggestDrop";

function getConversionForStep(row: ConsultantFunnelDataV2, stepIdx: number): number | null {
  if (stepIdx === 0) return null;
  const keys = funnelStepsV2.map(s => s.key);
  const prev = row[keys[stepIdx - 1]];
  const curr = row[keys[stepIdx]];
  if (prev === 0) return 0;
  return Math.round((curr / prev) * 100);
}

function findBiggestDrop(row: ConsultantFunnelDataV2): { stepLabel: string; convPct: number } {
  let worst = { stepLabel: "", convPct: 100 };
  funnelStepsV2.forEach((step, i) => {
    if (i === 0) return;
    const conv = getConversionForStep(row, i);
    if (conv !== null && conv < worst.convPct) {
      worst = { stepLabel: step.label, convPct: conv };
    }
  });
  return worst;
}

const categoryColors = { "A+": "text-primary font-bold", "A": "text-accent font-medium", "B": "text-muted-foreground" };

function FunnelDetailTable({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("consultantName");
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedConsultant, setExpandedConsultant] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let data = [...consultantFunnelDataV2];
    if (selectedUnit && selectedUnit !== "all") {
      data = data.filter(c => c.unit === selectedUnit);
    }
    return data;
  }, [selectedUnit]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "consultantName") {
        return sortAsc ? a.consultantName.localeCompare(b.consultantName) : b.consultantName.localeCompare(a.consultantName);
      }
      if (sortKey === "biggestDrop") {
        const dropA = findBiggestDrop(a).convPct;
        const dropB = findBiggestDrop(b).convPct;
        return sortAsc ? dropA - dropB : dropB - dropA;
      }
      const va = a[sortKey as FunnelStepKey];
      const vb = b[sortKey as FunnelStepKey];
      return sortAsc ? va - vb : vb - va;
    });
  }, [filtered, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 inline ml-0.5 opacity-30" />;
    return sortAsc ? <ArrowUp className="w-3 h-3 inline ml-0.5" /> : <ArrowDown className="w-3 h-3 inline ml-0.5" />;
  };

  const teamAvgs = useMemo(() => {
    const avgs: Record<string, number> = {};
    funnelStepsV2.forEach((step, i) => {
      if (i === 0) return;
      const convs = filtered.map(r => getConversionForStep(r, i)).filter(v => v !== null) as number[];
      avgs[step.key] = convs.length > 0 ? Math.round(convs.reduce((a, b) => a + b, 0) / convs.length) : 0;
    });
    return avgs;
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="overflow-auto max-h-[520px] rounded-md border border-border/40">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground sticky left-0 bg-card z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] cursor-pointer min-w-[140px]"
                onClick={() => toggleSort("consultantName")}>
                Consultant <SortIcon k="consultantName" />
              </th>
              {funnelStepsV2.map((step, i) => (
                <th key={step.key} className={cn(
                  "text-center py-2 px-1.5 font-medium text-muted-foreground cursor-pointer whitespace-nowrap hover:text-foreground",
                  i > 0 && "border-l border-border/30"
                )} onClick={() => toggleSort(step.key as SortKey)}>
                  <div className="text-[10px]">{step.label}</div>
                  <SortIcon k={step.key as SortKey} />
                </th>
              ))}
              <th className="text-center py-2 px-1.5 font-medium text-muted-foreground border-l border-border/30 whitespace-nowrap">
                <div className="text-[10px]">Dealsluiters</div>
              </th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground cursor-pointer border-l border-border/30 whitespace-nowrap"
                onClick={() => toggleSort("biggestDrop")}>
                <div className="flex items-center gap-1 justify-center">
                  <TrendingDown className="w-3 h-3" /> Drop
                </div>
                <SortIcon k="biggestDrop" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => {
              const drop = findBiggestDrop(row);
              const isExpanded = expandedConsultant === row.consultantId;
              return (
                <tr key={row.consultantId}
                  className={cn("border-b border-border/30 cursor-pointer transition-colors", isExpanded ? "bg-primary/5" : "hover:bg-muted/20")}
                  onClick={() => setExpandedConsultant(isExpanded ? null : row.consultantId)}
                >
                  <td className="py-2 px-2 font-medium text-foreground sticky left-0 bg-card z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-1">
                      {isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                      <div>
                        <span className="text-xs">{row.consultantName}</span>
                        <span className="text-[10px] text-muted-foreground block">{row.unit}</span>
                      </div>
                    </div>
                  </td>
                  {funnelStepsV2.map((step, i) => {
                    const prevKey = `prev${step.key.charAt(0).toUpperCase()}${step.key.slice(1)}` as keyof ConsultantFunnelDataV2;
                    const prev = row[prevKey] as number;
                    const curr = row[step.key];
                    const trendDown = prev > 0 && curr < prev;
                    return (
                      <td key={step.key} className={cn(
                        "text-center py-2 px-1.5 tabular-nums",
                        i > 0 && "border-l border-border/30",
                        trendDown && "text-destructive"
                      )}>
                        <span className="font-semibold">{curr}</span>
                        {trendDown && <span className="text-[9px] ml-0.5">↓</span>}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 px-1.5 tabular-nums font-semibold border-l border-border/30">
                    {row.dealsluiters}
                  </td>
                  <td className={cn(
                    "text-center py-2 px-2 border-l border-border/30",
                    drop.convPct < 40 ? "text-destructive" : drop.convPct < 60 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    <div className="text-[10px] font-medium">{drop.stepLabel}</div>
                    <div className="text-[11px] font-bold">{drop.convPct}%</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel below table */}
      {expandedConsultant !== null && (() => {
        const row = sorted.find(r => r.consultantId === expandedConsultant);
        const detail = consultantDetailData.find(d => d.consultantId === expandedConsultant);
        if (!row || !detail) return null;
        return (
          <div className="bg-muted/10 border border-primary/10 rounded-lg px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground">Detail: {row.consultantName}</h4>
              <button onClick={() => setExpandedConsultant(null)} className="text-[10px] text-muted-foreground hover:text-foreground">Sluiten ✕</button>
            </div>
            <div className="overflow-auto max-h-[200px] rounded border border-border/30">
              <table className="w-full text-[11px]">
                <thead className="bg-card sticky top-0">
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Kandidaat</th>
                    <th className="text-center py-1.5 px-2 font-medium text-muted-foreground">Categorie</th>
                    <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Kanaal</th>
                    <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Datum</th>
                    <th className="text-center py-1.5 px-2 font-medium text-muted-foreground">AI Score</th>
                    <th className="text-center py-1.5 px-2 font-medium text-muted-foreground">Profiel</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.candidates.map(cand => (
                    <tr key={cand.id} className="border-b border-border/20 hover:bg-muted/20">
                      <td className="py-1.5 px-2 font-medium text-foreground">{cand.name}</td>
                      <td className={cn("py-1.5 px-2 text-center", categoryColors[cand.category])}>{cand.category}</td>
                      <td className="py-1.5 px-2 text-muted-foreground capitalize">{cand.status}</td>
                      <td className="py-1.5 px-2 text-muted-foreground">{cand.intakeKanaal ?? "–"}</td>
                      <td className="py-1.5 px-2 text-muted-foreground">{cand.contactPersoon ?? "–"}</td>
                      <td className="py-1.5 px-2 text-muted-foreground">{cand.toewijzingsDatum}</td>
                      <td className="py-1.5 px-2 text-center tabular-nums">
                        {cand.aiScore ? (
                          <span className={cn("font-semibold", cand.aiScore >= 80 ? "text-accent" : cand.aiScore >= 60 ? "text-primary" : "text-destructive")}>{cand.aiScore}</span>
                        ) : "–"}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <a href="#" className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#0066FF]/10 hover:bg-[#0066FF]/20 transition-colors" title="Open in Recruit CRM">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="4" fill="#0066FF"/>
                            <text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">R</text>
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2">
              {funnelStepsV2.slice(1).map((step, i) => {
                const conv = getConversionForStep(row, i + 1);
                return (
                  <div key={step.key} className="text-center px-2 py-1 rounded bg-card border border-border/30">
                    <div className="text-[9px] text-muted-foreground">{funnelStepsV2[i].label} → {step.label}</div>
                    <div className={cn("text-xs font-bold tabular-nums",
                      conv !== null && conv < 40 ? "text-destructive" : conv !== null && conv < 60 ? "text-amber-500" : "text-foreground"
                    )}>{conv !== null ? `${conv}%` : "–"}</div>
                  </div>
                );
              })}
            </div>
            <AIInsightNote insights={[
              ...detail.aiInsights.map(text => ({ type: "observation" as const, text })),
              { type: "forecast" as const, text: detail.prognose },
            ]} />
          </div>
        );
      })()}
    </div>
  );
}

// ─── Main ───

interface SalesFunnelV2Props {
  delay?: number;
  selectedUnit?: string;
}

export function SalesFunnelV2({ delay = 0, selectedUnit }: SalesFunnelV2Props) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Sales Funnel</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Per consultant met conversies & detail" : "9-staps conversie overzicht"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80">
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className={cn(
          "transition-all duration-400 ease-in-out",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode
            ? <FunnelDetailTable delay={delay} selectedUnit={selectedUnit} />
            : <FunnelOverview delay={delay} selectedUnit={selectedUnit} />
          }
        </div>
      </div>
    </AnimatedCard>
  );
}

import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Maximize2, Minimize2, ArrowUpDown, TrendingUp, TrendingDown, Lightbulb, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import { consultantOutreachData, unitOutreachTotals } from "@/data/managerOperationalDataV2";
import { outreachDetailData } from "@/data/managerOutreachDetailData";

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

function formatTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function TrendArrow({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-0.5 text-success text-[10px]"><TrendingUp className="w-3 h-3" />+{value}%</span>;
  if (value < 0) return <span className="flex items-center gap-0.5 text-destructive text-[10px]"><TrendingDown className="w-3 h-3" />{value}%</span>;
  return <span className="text-muted-foreground text-[10px]">0%</span>;
}

// ─── Overview ───

function OutreachOverview({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const totals = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return unitOutreachTotals;
    const filtered = consultantOutreachData.filter(c => c.unit === selectedUnit);
    if (filtered.length === 0) return unitOutreachTotals;
    return {
      callsIn: filtered.reduce((s, c) => s + c.callsIn, 0),
      callsOut: filtered.reduce((s, c) => s + c.callsOut, 0),
      totalMinutes: filtered.reduce((s, c) => s + c.totalMinutes, 0),
      qualityScore: +(filtered.reduce((s, c) => s + c.qualityScore, 0) / filtered.length).toFixed(1),
      emailsSent: filtered.reduce((s, c) => s + c.emailsSent, 0),
      emailsReceived: filtered.reduce((s, c) => s + c.emailsReceived, 0),
      totalOutreach: filtered.reduce((s, c) => s + c.totalOutreach, 0),
    };
  }, [selectedUnit]);

  const metrics = [
    { label: "Calls In", value: totals.callsIn, icon: Phone, color: "text-primary" },
    { label: "Calls Uit", value: totals.callsOut, icon: Phone, color: "text-primary" },
    { label: "E-mails", value: totals.emailsSent, icon: Mail, color: "text-teal" },
    { label: "Totaal Outreach", value: totals.totalOutreach, icon: null, color: "text-foreground" },
    { label: "Beltijd", value: totals.totalMinutes, icon: null, color: "text-foreground", format: formatTime },
    { label: "Kwaliteitsscore", value: totals.qualityScore, icon: null, color: totals.qualityScore >= 7.5 ? "text-success" : totals.qualityScore >= 7 ? "text-foreground" : "text-destructive", isDecimal: true },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((m, i) => (
        <div key={i} className="flex flex-col items-center justify-center rounded-xl bg-primary/5 border border-primary/10 p-3">
          {m.icon && <m.icon className={cn("h-4 w-4 mb-1.5", m.color)} />}
          {m.format ? (
            <span className={cn("text-xl font-bold", m.color)}>{m.format(m.value)}</span>
          ) : m.isDecimal ? (
            <span className={cn("text-xl font-bold", m.color)}>{m.value}</span>
          ) : (
            <AnimatedNumber value={m.value} delay={delay + 100 + i * 50} className={cn("text-xl font-bold", m.color)} />
          )}
          <span className="text-[10px] text-muted-foreground mt-0.5">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Detail ───

type SortKey = "consultantName" | "callsIn" | "callsOut" | "emailsSent" | "totalOutreach" | "qualityScore" | "totalMinutes";

function OutreachDetail({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("totalOutreach");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedConsultant, setExpandedConsultant] = useState<number | null>(null);

  const avgOutreach = useMemo(() => {
    const data = consultantOutreachData;
    return data.reduce((s, c) => s + c.totalOutreach, 0) / data.length;
  }, []);

  const sorted = useMemo(() => {
    let data = [...consultantOutreachData];
    if (selectedUnit && selectedUnit !== "all") data = data.filter(c => c.unit === selectedUnit);
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [sortKey, sortAsc, selectedUnit]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "consultantName", label: "Consultant" },
    { key: "callsIn", label: "Calls In" },
    { key: "callsOut", label: "Calls Uit" },
    { key: "emailsSent", label: "E-mails" },
    { key: "totalOutreach", label: "Totaal" },
    { key: "totalMinutes", label: "Beltijd" },
    { key: "qualityScore", label: "Kwaliteit" },
  ];

  const detailData = outreachDetailData.find(d => d.consultantId === expandedConsultant);
  const expandedRow = sorted.find(r => r.consultantId === expandedConsultant);

  const tableEl = (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {columns.map(col => (
              <th key={col.key}
                className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort(col.key)}>
                <div className="flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
            ))}
            <th className="text-center py-2 px-2 font-medium text-muted-foreground">Trend</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => {
            const belowAvg = row.totalOutreach < avgOutreach * 0.7;
            const isExpanded = expandedConsultant === row.consultantId;
            return (
              <tr key={row.consultantId} className={cn(
                "border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer",
                belowAvg && "bg-destructive/5",
                isExpanded && "bg-primary/5"
              )}
                onClick={() => setExpandedConsultant(isExpanded ? null : row.consultantId)}
              >
                <td className="py-2 px-2 font-medium text-foreground">
                  {row.consultantName}
                  {belowAvg && <span className="ml-1 text-[9px] text-destructive font-bold">⚠</span>}
                </td>
                <td className="py-2 px-2 tabular-nums">{row.callsIn}</td>
                <td className="py-2 px-2 tabular-nums">{row.callsOut}</td>
                <td className="py-2 px-2 tabular-nums">{row.emailsSent}</td>
                <td className={cn("py-2 px-2 tabular-nums font-semibold", belowAvg ? "text-destructive" : "text-foreground")}>{row.totalOutreach}</td>
                <td className="py-2 px-2 tabular-nums">{formatTime(row.totalMinutes)}</td>
                <td className="py-2 px-2 tabular-nums">
                  <span className={cn("font-semibold",
                    row.qualityScore >= 8 ? "text-success" : row.qualityScore >= 7 ? "text-foreground" : "text-destructive"
                  )}>
                    {row.qualityScore.toFixed(1)}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2 justify-center">
                    <TrendArrow value={row.callTrend} />
                    <TrendArrow value={row.emailTrend} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const detailEl = expandedConsultant !== null && detailData && expandedRow && (
    <div className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-background pb-2 border-b border-border">
        <h4 className="text-xs font-semibold text-foreground">Detail: {expandedRow.consultantName}</h4>
        <button onClick={() => setExpandedConsultant(null)} className="text-[10px] text-muted-foreground hover:text-foreground">Sluiten ✕</button>
      </div>

      {/* Trend justification */}
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-lg bg-card border border-border/30 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Phone className="h-3 w-3 text-primary" />
            <p className="text-[10px] font-semibold text-muted-foreground">Call trend</p>
            <TrendArrow value={expandedRow.callTrend} />
          </div>
          <p className="text-xs text-foreground">{detailData.trendJustification.callTrend}</p>
        </div>
        <div className="rounded-lg bg-card border border-border/30 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Mail className="h-3 w-3 text-teal" />
            <p className="text-[10px] font-semibold text-muted-foreground">E-mail trend</p>
            <TrendArrow value={expandedRow.emailTrend} />
          </div>
          <p className="text-xs text-foreground">{detailData.trendJustification.emailTrend}</p>
        </div>
      </div>

      {/* Recent calls */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <PhoneCall className="h-3.5 w-3.5 text-primary" />
          <p className="text-[10px] font-semibold text-muted-foreground">Laatste 10 calls · Gem. duur: {formatDuration(detailData.avgCallDuration)}</p>
        </div>
        <div className="overflow-auto max-h-[200px] rounded border border-border/30">
          <table className="w-full text-[11px]">
            <thead className="bg-card sticky top-0">
              <tr className="border-b border-border">
                <th className="text-left py-1 px-2 font-medium text-muted-foreground">Contact</th>
                <th className="text-center py-1 px-2 font-medium text-muted-foreground">Richting</th>
                <th className="text-right py-1 px-2 font-medium text-muted-foreground">Duur</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground">Datum</th>
                <th className="text-center py-1 px-2 font-medium text-muted-foreground">Resultaat</th>
              </tr>
            </thead>
            <tbody>
              {detailData.recentCalls.map(call => (
                <tr key={call.id} className="border-b border-border/20 hover:bg-muted/20">
                  <td className="py-1 px-2 text-foreground">{call.contactName}</td>
                  <td className="py-1 px-2 text-center">
                    <span className={cn("text-[10px] font-medium", call.direction === "out" ? "text-primary" : "text-teal")}>
                      {call.direction === "out" ? "↑ Uit" : "↓ In"}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-right tabular-nums text-foreground">{formatDuration(call.duration)}</td>
                  <td className="py-1 px-2 text-muted-foreground">{call.date}</td>
                  <td className="py-1 px-2 text-center">
                    <span className={cn("text-[10px]",
                      call.outcome === "connected" ? "text-success" : call.outcome === "voicemail" ? "text-amber-500" : "text-destructive"
                    )}>
                      {call.outcome === "connected" ? "Verbonden" : call.outcome === "voicemail" ? "Voicemail" : "Geen gehoor"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Quality explanation */}
      <div className="rounded-lg bg-card border border-border/30 p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-primary" />
          <p className="text-[10px] font-semibold text-muted-foreground">AI Kwaliteitsanalyse — Score: {detailData.aiQualityExplanation.score}</p>
        </div>
        <p className="text-xs text-foreground">{detailData.aiQualityExplanation.summary}</p>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-[10px] font-semibold text-success mb-1">Sterke punten</p>
            <ul className="space-y-0.5">
              {detailData.aiQualityExplanation.strengths.map((s, i) => (
                <li key={i} className="text-[11px] text-foreground">✓ {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-destructive mb-1">Verbeterpunten</p>
            <ul className="space-y-0.5">
              {detailData.aiQualityExplanation.weaknesses.map((w, i) => (
                <li key={i} className="text-[11px] text-foreground">✗ {w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 min-w-0">{tableEl}</div>
      {detailEl && (
        <aside className="w-full lg:w-[400px] shrink-0 lg:border-l lg:border-border lg:pl-4 max-h-[calc(100vh-220px)] overflow-y-auto">
          {detailEl}
        </aside>
      )}
    </div>
  );
}

// ─── Main ───

interface OutreachCardV2Props {
  delay?: number;
  selectedUnit?: string;
  framed?: boolean;
}

export function OutreachCardV2({ delay = 0, selectedUnit, framed = true }: OutreachCardV2Props) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  const body = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {framed && <Phone className="h-5 w-5 text-primary" />}
          <div>
            {framed && <h3 className="text-sm font-medium text-foreground">Outreach & Contactactiviteit</h3>}
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Per consultant" : "Calls, e-mails & kwaliteit"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle}
          className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80">
          {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className={cn(
        "flex-1 transition-all duration-400 ease-in-out",
        isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
      )}>
        {displayMode ? <OutreachDetail delay={delay} selectedUnit={selectedUnit} /> : <OutreachOverview delay={delay} selectedUnit={selectedUnit} />}
      </div>
    </>
  );

  if (!framed) return <div className="flex flex-col">{body}</div>;
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">{body}</div>
    </AnimatedCard>
  );
}

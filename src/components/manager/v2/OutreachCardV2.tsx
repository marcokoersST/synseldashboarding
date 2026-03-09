import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Maximize2, Minimize2, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { consultantOutreachData, unitOutreachTotals } from "@/data/managerOperationalDataV2";

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

  return (
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
            return (
              <tr key={row.consultantId} className={cn(
                "border-b border-border/50 hover:bg-secondary/20 transition-colors",
                belowAvg && "bg-destructive/5"
              )}>
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
}

// ─── Main ───

interface OutreachCardV2Props {
  delay?: number;
  selectedUnit?: string;
}

export function OutreachCardV2({ delay = 0, selectedUnit }: OutreachCardV2Props) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Outreach & Contactactiviteit</h3>
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
      </div>
    </AnimatedCard>
  );
}

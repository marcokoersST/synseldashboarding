import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Zap, Maximize2, Minimize2, Flame, Star, UserPlus, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { consultantCallData, unitCallTotals } from "@/data/managerOperationalData";

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
  return `${h}:${String(m).padStart(2, "0")}:00`;
}

// ─── Overview ───

function CallsOverview({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const totals = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return unitCallTotals;
    const filtered = consultantCallData.filter(c => c.unit === selectedUnit);
    if (filtered.length === 0) return unitCallTotals;
    return {
      inbound: filtered.reduce((s, c) => s + c.inbound, 0),
      outbound: filtered.reduce((s, c) => s + c.outbound, 0),
      totalMinutes: filtered.reduce((s, c) => s + c.totalMinutes, 0),
      qualityScore: +(filtered.reduce((s, c) => s + c.qualityScore, 0) / filtered.length).toFixed(1),
    };
  }, [selectedUnit]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 border border-primary/10 p-4">
        <PhoneIncoming className="h-5 w-5 text-primary mb-2" />
        <AnimatedNumber value={totals.inbound} delay={delay + 100} className="text-2xl font-bold text-foreground" />
        <span className="text-xs text-muted-foreground mt-1">Inkomend</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 border border-primary/10 p-4">
        <PhoneOutgoing className="h-5 w-5 text-primary mb-2" />
        <AnimatedNumber value={totals.outbound} delay={delay + 150} className="text-2xl font-bold text-foreground" />
        <span className="text-xs text-muted-foreground mt-1">Uitgaand</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-teal/5 border border-teal/10 p-4">
        <Clock className="h-5 w-5 text-teal mb-2" />
        <span className="text-2xl font-bold text-foreground">{formatTime(totals.totalMinutes)}</span>
        <span className="text-xs text-muted-foreground mt-1">Totale beltijd</span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-success/5 border border-success/10 p-4">
        <Zap className="h-5 w-5 text-success mb-2" />
        <span className="text-2xl font-bold text-foreground">{totals.qualityScore}</span>
        <span className="text-xs text-muted-foreground mt-1">Kwaliteitsscore</span>
      </div>
    </div>
  );
}

// ─── Detail ───

type SortKey = "consultantName" | "inbound" | "outbound" | "totalMinutes" | "qualityScore" | "missed";

function CallsDetail({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("consultantName");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    let data = [...consultantCallData];
    if (selectedUnit && selectedUnit !== "all") {
      data = data.filter(c => c.unit === selectedUnit);
    }
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
    { key: "inbound", label: "Inkomend" },
    { key: "outbound", label: "Uitgaand" },
    { key: "totalMinutes", label: "Beltijd" },
    { key: "qualityScore", label: "Kwaliteit" },
    { key: "missed", label: "Gemist" },
  ];

  const totalContactStatus = sorted.reduce(
    (acc, c) => ({
      warmRelation: acc.warmRelation + c.contactStatus.warmRelation,
      preferredCP: acc.preferredCP + c.contactStatus.preferredCP,
      newContact: acc.newContact + c.contactStatus.newContact,
    }),
    { warmRelation: 0, preferredCP: 0, newContact: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {columns.map(col => (
                <th key={col.key}
                  className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.consultantId} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="py-2 px-2 font-medium text-foreground">{row.consultantName}</td>
                <td className="py-2 px-2 tabular-nums">{row.inbound}</td>
                <td className="py-2 px-2 tabular-nums">{row.outbound}</td>
                <td className="py-2 px-2 tabular-nums">{formatTime(row.totalMinutes)}</td>
                <td className="py-2 px-2 tabular-nums">
                  <span className={cn(
                    "font-semibold",
                    row.qualityScore >= 8 ? "text-success" : row.qualityScore >= 7 ? "text-foreground" : "text-destructive"
                  )}>
                    {row.qualityScore.toFixed(1)}
                  </span>
                </td>
                <td className="py-2 px-2 tabular-nums text-muted-foreground">{row.missed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border pt-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2 block">Contact status (unit totaal)</span>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
            <Flame className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{totalContactStatus.warmRelation}</p>
              <p className="text-[10px] text-muted-foreground">Warme relatie</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
            <Star className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{totalContactStatus.preferredCP}</p>
              <p className="text-[10px] text-muted-foreground">Voorkeurs CP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
            <UserPlus className="h-4 w-4 text-teal" />
            <div>
              <p className="text-sm font-semibold text-foreground">{totalContactStatus.newContact}</p>
              <p className="text-[10px] text-muted-foreground">Nieuw contact</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ───

interface ManagerCallsCardProps {
  delay?: number;
  selectedUnit?: string;
}

export function ManagerCallsCard({ delay = 0, selectedUnit }: ManagerCallsCardProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-[480px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Gesprekken</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {displayMode ? "Per consultant" : "Unit-totalen"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80">
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className={cn(
          "flex-1 transition-all duration-400 ease-in-out overflow-y-auto min-h-0",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? <CallsDetail delay={delay} selectedUnit={selectedUnit} /> : <CallsOverview delay={delay} selectedUnit={selectedUnit} />}
        </div>
      </div>
    </AnimatedCard>
  );
}

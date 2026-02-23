import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Maximize2, Minimize2, Search, ArrowUpDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { dealRecords, dealStageCounts, dealStages, type DealRecord } from "@/data/managerOperationalData";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

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

const stageColors: Record<string, string> = {
  "2.3": "bg-teal/15 text-teal border-teal/30",
  "3.0": "bg-primary/15 text-primary border-primary/30",
  "3.1": "bg-primary/20 text-primary border-primary/40",
  "3.2": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "3.3": "bg-amber-500/20 text-amber-600 border-amber-500/40",
  "3.4": "bg-success/15 text-success border-success/30",
};

// ─── Overview: flowchart scorecards ───

function OpvolgingOverview({ delay }: { delay: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {dealStageCounts.map((stage, i) => (
        <div key={stage.code} className="flex items-center gap-2 shrink-0">
          <div className={cn(
            "flex flex-col items-center justify-center rounded-xl border px-4 py-3 min-w-[100px]",
            stageColors[stage.code]
          )}>
            <AnimatedNumber value={stage.count} delay={delay + i * 80} className="text-2xl font-bold" />
            <span className="text-[10px] font-medium mt-1 text-center leading-tight">{stage.code}</span>
            <span className="text-[9px] text-center leading-tight opacity-70 mt-0.5">{stage.label}</span>
          </div>
          {i < dealStageCounts.length - 1 && (
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Detail: records list + consultant stage matrix ───

function OpvolgingDetail({ delay }: { delay: number }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"dealStage" | "lastModified">("dealStage");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let data = [...dealRecords];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.consultantName.toLowerCase().includes(q) ||
        d.candidateName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== "all") {
      data = data.filter(d => d.dealStage === stageFilter);
    }
    data.sort((a, b) => {
      if (sortKey === "dealStage") return sortAsc ? a.dealStage.localeCompare(b.dealStage) : b.dealStage.localeCompare(a.dealStage);
      return sortAsc ? a.lastModified.getTime() - b.lastModified.getTime() : b.lastModified.getTime() - a.lastModified.getTime();
    });
    return data;
  }, [search, stageFilter, sortKey, sortAsc]);

  // Consultant x stage matrix
  const consultantNames = [...new Set(dealRecords.map(r => r.consultantName))];
  const matrix = useMemo(() => {
    return consultantNames.map(name => {
      const row: Record<string, number> = {};
      dealStages.forEach(s => {
        row[s.code] = dealRecords.filter(r => r.consultantName === name && r.dealStage === s.code).length;
      });
      return { name, ...row };
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Scorecards (same as overview) */}
      <OpvolgingOverview delay={delay} />

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Zoek consultant, kandidaat of deal..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="bg-secondary/50 rounded-lg text-xs font-medium text-foreground px-2 py-1.5 border-0 outline-none cursor-pointer"
        >
          <option value="all">Alle stages</option>
          {dealStages.map(s => <option key={s.code} value={s.code}>{s.code} - {s.label}</option>)}
        </select>
      </div>

      {/* Records list */}
      <div className="max-h-[280px] overflow-y-auto scrollbar-thin space-y-1.5">
        {filtered.map(record => (
          <div key={record.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0", stageColors[record.dealStage])}>
                {record.dealStage}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{record.candidateName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{record.consultantName} · {record.id}</p>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
              {format(record.lastModified, "d MMM", { locale: nl })}
            </span>
          </div>
        ))}
      </div>

      {/* Consultant x Stage matrix */}
      <div className="border-t border-border pt-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Per consultant per stage</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Consultant</th>
                {dealStages.map(s => (
                  <th key={s.code} className="text-center py-1.5 px-2 font-medium text-muted-foreground">{s.code}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.name} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-1.5 px-2 font-medium text-foreground">{row.name}</td>
                  {dealStages.map(s => (
                    <td key={s.code} className="text-center py-1.5 px-2 tabular-nums">
                      <span className={cn(
                        "inline-block min-w-[20px] rounded-md px-1 py-0.5",
                        (row[s.code] as number) > 0 ? stageColors[s.code] : "text-muted-foreground/40"
                      )}>
                        {row[s.code] as number}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main ───

interface OpvolgingCardProps {
  delay?: number;
}

export function OpvolgingCard({ delay = 0 }: OpvolgingCardProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Opvolging</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Records per deal stage" : "Overzicht deal stages"}
            </p>
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
          {displayMode ? <OpvolgingDetail delay={delay} /> : <OpvolgingOverview delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}

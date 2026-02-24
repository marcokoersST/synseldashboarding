import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Maximize2, Minimize2, Search, ArrowUpDown, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { dealRecords, dealStageCounts, dealStages, type DealRecord } from "@/data/managerOperationalData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInCalendarDays, isWeekend } from "date-fns";
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

function getWorkdaysSince(date: Date): number {
  const now = new Date();
  let count = 0;
  const d = new Date(date);
  while (d < now) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) count++;
  }
  return count;
}

function getRowAgeClass(lastModified: Date): string {
  const workdays = getWorkdaysSince(lastModified);
  if (workdays > 10) return "bg-destructive/10";
  if (workdays > 5) return "bg-amber-500/10";
  return "";
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

function OpvolgingOverview({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const filteredCounts = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return dealStageCounts;
    const filtered = dealRecords.filter(r => r.unit === selectedUnit);
    return dealStages.map(stage => ({
      ...stage,
      count: filtered.filter(r => r.dealStage === stage.code).length,
    }));
  }, [selectedUnit]);
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {filteredCounts.map((stage, i) => (
        <div key={stage.code} className="flex items-center gap-2 shrink-0">
          <div className={cn(
            "flex flex-col items-center justify-center rounded-xl border px-4 py-3 min-w-[100px]",
            stageColors[stage.code]
          )}>
            <AnimatedNumber value={stage.count} delay={delay + i * 80} className="text-2xl font-bold" />
            <span className="text-[10px] font-medium mt-1 text-center leading-tight">{stage.code}</span>
            <span className="text-[9px] text-center leading-tight opacity-70 mt-0.5">{stage.label}</span>
          </div>
          {i < filteredCounts.length - 1 && (
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Detail ───

type SortKey = "dealStage" | "candidateName" | "consultantName" | "id" | "lastModified";

function OpvolgingDetail({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("dealStage");
  const [sortAsc, setSortAsc] = useState(true);

  const baseRecords = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return dealRecords;
    return dealRecords.filter(r => r.unit === selectedUnit);
  }, [selectedUnit]);

  const consultantNames = useMemo(() => [...new Set(baseRecords.map(r => r.consultantName))].sort(), [baseRecords]);

  const filtered = useMemo(() => {
    let data = [...baseRecords];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.consultantName.toLowerCase().includes(q) ||
        d.candidateName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== "all") data = data.filter(d => d.dealStage === stageFilter);
    if (consultantFilter !== "all") data = data.filter(d => d.consultantName === consultantFilter);

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "dealStage": cmp = a.dealStage.localeCompare(b.dealStage); break;
        case "candidateName": cmp = a.candidateName.localeCompare(b.candidateName); break;
        case "consultantName": cmp = a.consultantName.localeCompare(b.consultantName); break;
        case "id": cmp = a.id.localeCompare(b.id); break;
        case "lastModified": cmp = a.lastModified.getTime() - b.lastModified.getTime(); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return data;
  }, [search, stageFilter, consultantFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === "dealStage"); }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3 h-3 inline ml-0.5 opacity-30" />;
    return sortAsc ? <ArrowUp className="w-3 h-3 inline ml-0.5" /> : <ArrowDown className="w-3 h-3 inline ml-0.5" />;
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "dealStage", label: "Stage" },
    { key: "candidateName", label: "Kandidaat" },
    { key: "consultantName", label: "Consultant" },
    { key: "id", label: "Deal ID" },
    { key: "lastModified", label: "Laatste aanpassing" },
  ];

  // Consultant x stage matrix
  const matrix = useMemo(() => {
    return consultantNames.map(name => {
      const row: Record<string, number> = {};
      dealStages.forEach(s => {
        row[s.code] = dealRecords.filter(r => r.consultantName === name && r.dealStage === s.code).length;
      });
      return { name, ...row };
    });
  }, [consultantNames]);

  return (
    <div className="space-y-4">
      <OpvolgingOverview delay={delay} />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
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
        <Select value={consultantFilter} onValueChange={setConsultantFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Alle consultants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle consultants</SelectItem>
            {consultantNames.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records table */}
      <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="text-left py-2 px-3 font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-0.5">
                    {col.label}
                    {getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(record => {
              const ageClass = getRowAgeClass(record.lastModified);
              const isHighlighted = consultantFilter !== "all" && record.consultantName === consultantFilter;
              const isFaded = consultantFilter !== "all" && record.consultantName !== consultantFilter;

              return (
                <tr
                  key={record.id}
                  className={cn(
                    "border-b border-border/50 transition-all",
                    ageClass,
                    isHighlighted && "ring-1 ring-primary/20",
                    isFaded && "opacity-30",
                    !isFaded && "hover:bg-muted/30"
                  )}
                >
                  <td className="py-2 px-3">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", stageColors[record.dealStage])}>
                      {record.dealStage}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm font-medium text-foreground">{record.candidateName}</td>
                  <td className="py-2 px-3 text-sm text-muted-foreground">{record.consultantName}</td>
                  <td className="py-2 px-3 text-sm tabular-nums text-muted-foreground">{record.id.replace("DEAL-", "")}</td>
                  <td className="py-2 px-3 text-sm text-muted-foreground">{format(record.lastModified, "d MMM yyyy", { locale: nl })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
                <tr key={row.name} className={cn(
                  "border-b border-border/50 hover:bg-secondary/20",
                  consultantFilter !== "all" && row.name !== consultantFilter && "opacity-30"
                )}>
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

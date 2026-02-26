import { useState, useCallback, useEffect } from "react";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { ranglijstenWeekColumns, ranglijstenPeriodeColumns, ranglijstenFilters, allColumnTitles } from "@/data/ranglijstenData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Flame, TrendingUp, TrendingDown, Columns3, ChevronDown } from "lucide-react";

function ComparisonBar({ current, previous }: { current: number; previous: number }) {
  const delta = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const max = Math.max(current, previous);
  const currentPct = max > 0 ? (current / max) * 100 : 0;
  const previousPct = max > 0 ? (previous / max) * 100 : 0;

  return (
    <div className="mt-2 space-y-1">
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/25"
          style={{ width: `${previousPct}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700"
          style={{ width: `${currentPct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {delta >= 0 ? (
          <TrendingUp className="w-3 h-3 text-accent" />
        ) : (
          <TrendingDown className="w-3 h-3 text-destructive" />
        )}
        <span className={cn("font-semibold", delta >= 0 ? "text-accent" : "text-destructive")}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(0)}%
        </span>
        {" "}t.o.v. vorige periode
      </p>
    </div>
  );
}

function getRankStyle(rank: number) {
  if (rank === 1) return "border-l-[3px] border-l-amber-400 bg-amber-50/50 font-semibold";
  if (rank === 2) return "border-l-[3px] border-l-slate-400 bg-amber-50/40 font-semibold";
  if (rank === 3) return "border-l-[3px] border-l-orange-400 bg-amber-50/30 font-semibold";
  if (rank <= 10) return "border-l-[2px] border-l-blue-300 bg-blue-50/60";
  return "";
}

function RankIcon({ rank, isTop3 }: { rank: number; isTop3?: boolean }) {
  const size = isTop3 ? "w-4 h-4" : "w-3.5 h-3.5";
  if (rank === 1) return <span className="tv-wave-1"><Trophy className={cn(size, "text-amber-500")} /></span>;
  if (rank === 2) return <span className="tv-wave-2"><Medal className={cn(size, "text-slate-400")} /></span>;
  if (rank === 3) return <span className="tv-wave-3"><Medal className={cn(size, "text-orange-400")} /></span>;
  return null;
}

interface EntryRowProps {
  entry: { rank: number; name: string; firstName: string; lastName: string; value: number; isHot?: boolean };
  displayName?: string;
  compact?: boolean;
}

function EntryRow({ entry, displayName, compact }: EntryRowProps) {
  const isTop3 = entry.rank <= 3;
  const shownName = displayName ?? entry.name;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm px-1.5 border-b border-border/20",
        isTop3 ? "py-2" : "py-1",
        compact ? "text-xs" : "text-sm",
        getRankStyle(entry.rank),
        entry.isHot && entry.value > 0 && "bg-orange-50/60",
        entry.value === 0 && "opacity-30"
      )}
    >
      <span className={cn(
        "w-5 text-left shrink-0 flex items-center justify-start gap-0.5",
        isTop3 ? "text-sm font-bold" : "text-xs text-muted-foreground"
      )}>
        <RankIcon rank={entry.rank} isTop3={isTop3} />
        {entry.rank > 3 && `${entry.rank}.`}
      </span>
      <span className={cn(
        "min-w-0 truncate text-foreground",
        isTop3 ? "text-base font-bold" : "",
        entry.isHot && entry.value > 0 && "text-orange-700 font-medium"
      )}>
        {shownName}
      </span>
      <span className={cn(
        "tabular-nums shrink-0 ml-auto flex items-center gap-1",
        isTop3 ? "text-base font-bold" : "font-semibold",
        "text-foreground"
      )}>
        {entry.isHot && entry.value > 0 && <Flame className="w-3 h-3 text-orange-500 tv-fire" />}
        {entry.value}
      </span>
    </div>
  );
}

function RanglijstenContent() {
  const [jaar, setJaar] = useState("2026");
  const [selectedPeriode, setSelectedPeriode] = useState("P1");
  const [selectedWeek, setSelectedWeek] = useState("W1");
  const [selectedUnits, setSelectedUnits] = useState<string[]>(["Alle units"]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem("ranglijsten-columns");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...allColumnTitles];
  });
  const isCompact = useTVCompact();

  const [tvViewMode, setTvViewMode] = useState<"week" | "periode">("week");

  const toggleColumn = useCallback((title: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(title)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== title);
      }
      return [...prev, title];
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem("ranglijsten-columns", JSON.stringify(selectedColumns));
  }, [selectedColumns]);

  const activeView = tvViewMode;
  const allColumns = activeView === "periode" ? ranglijstenPeriodeColumns : ranglijstenWeekColumns;
  const columns = allColumns.filter((col) => selectedColumns.includes(col.title));

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        {!isCompact && (
          <>
            <Select value={jaar} onValueChange={setJaar}>
              <SelectTrigger className="w-[140px] bg-card border-border">
                <SelectValue placeholder="Jaar" />
              </SelectTrigger>
              <SelectContent>
                {ranglijstenFilters.jaren.map((j) => (
                  <SelectItem key={j} value={String(j)}>Jaar: {j}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge
                variant={tvViewMode === "week" ? "default" : "secondary"}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => setTvViewMode("week")}
              >
                Week
              </Badge>
              <Badge
                variant={tvViewMode === "periode" ? "default" : "secondary"}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => setTvViewMode("periode")}
              >
                Periode
              </Badge>
            </div>

            <Select
              value={tvViewMode === "week" ? selectedWeek : selectedPeriode}
              onValueChange={tvViewMode === "week" ? setSelectedWeek : setSelectedPeriode}
            >
              <SelectTrigger className={cn("bg-card border-border", tvViewMode === "week" ? "w-[110px]" : "w-[100px]")}>
                <SelectValue placeholder={tvViewMode === "week" ? "Week" : "Periode"} />
              </SelectTrigger>
              <SelectContent>
                {(tvViewMode === "week" ? ranglijstenFilters.weeknummers : ranglijstenFilters.periodenummers).map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns3 className="w-4 h-4" />
                  Kolommen ({selectedColumns.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <p className="text-sm font-medium mb-3">Zichtbare kolommen</p>
                <div className="space-y-2">
                  {allColumnTitles.map((title) => (
                    <label key={title} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedColumns.includes(title)}
                        onCheckedChange={() => toggleColumn(title)}
                      />
                      {title}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-[160px] justify-between bg-card border-border">
                  {selectedUnits.includes("Alle units") ? "Alle units" : `${selectedUnits.length} unit${selectedUnits.length > 1 ? "s" : ""}`}
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <p className="text-sm font-medium mb-3">Units</p>
                <div className="space-y-2">
                  {ranglijstenFilters.units.filter(u => u !== "Alle units").map((u) => (
                    <label key={u} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedUnits.includes("Alle units") || selectedUnits.includes(u)}
                        onCheckedChange={() => {
                          setSelectedUnits(prev => {
                            if (prev.includes("Alle units")) {
                              // Was "all" → select only this one
                              return [u];
                            }
                            if (prev.includes(u)) {
                              const next = prev.filter(x => x !== u);
                              return next.length === 0 ? ["Alle units"] : next;
                            }
                            const next = [...prev, u];
                            const allNonAlle = ranglijstenFilters.units.filter(x => x !== "Alle units");
                            return next.length === allNonAlle.length ? ["Alle units"] : next;
                          });
                        }}
                      />
                      {u}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}

      </div>

      {/* Ranking Columns */}
      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => {
          const top3 = col.entries.slice(0, 3);
          const rest = col.entries.slice(3);
          const half = Math.ceil(rest.length / 2);
          const leftEntries = rest.slice(0, half);
          const rightEntries = rest.slice(half);

          return (
            <div key={col.title} className="min-w-0 rounded-lg border border-border p-3 bg-card">
              <h2 className="text-xs font-semibold text-muted-foreground mb-1 truncate uppercase tracking-wide">{col.title}</h2>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {col.total.toLocaleString("nl-NL")}
              </p>
              <ComparisonBar current={col.total} previous={col.previousTotal} />

              {/* Top 3 full-width */}
              <div className="mt-3 space-y-0">
                {top3.map((entry) => (
                  <EntryRow key={`${entry.rank}-${entry.name}`} entry={entry} />
                ))}
              </div>

              {/* Rest in two columns, abbreviated names */}
              <div className="mt-1 grid grid-cols-2 gap-x-3">
                <div className="space-y-0">
                  {leftEntries.map((entry) => (
                    <EntryRow key={`${entry.rank}-${entry.name}`} entry={entry} displayName={`${entry.firstName} ${entry.lastName[0]}.`} compact />
                  ))}
                </div>
                <div className="space-y-0">
                  {rightEntries.map((entry) => (
                    <EntryRow key={`${entry.rank}-${entry.name}`} entry={entry} displayName={`${entry.firstName} ${entry.lastName[0]}.`} compact />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function TVRanglijsten() {
  return (
    <TVDashboardLayout title="Ranglijsten">
      <RanglijstenContent />
    </TVDashboardLayout>
  );
}

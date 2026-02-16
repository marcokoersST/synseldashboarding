import { useState, useEffect, useRef, useCallback } from "react";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { ranglijstenWeekColumns, ranglijstenPeriodeColumns, ranglijstenFilters, allColumnTitles } from "@/data/ranglijstenData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Flame, TrendingUp, TrendingDown, Columns3 } from "lucide-react";

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

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-3.5 h-3.5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-3.5 h-3.5 text-orange-400" />;
  return null;
}

function AutoScrollArea({ children, isCompact }: { children: React.ReactNode; isCompact: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<"down" | "up">("down");
  const pauseRef = useRef(false);

  useEffect(() => {
    if (!isCompact) return;
    const el = containerRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (pauseRef.current) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;

      if (directionRef.current === "down") {
        el.scrollTop += 1;
        if (el.scrollTop >= maxScroll) {
          directionRef.current = "up";
          pauseRef.current = true;
          setTimeout(() => { pauseRef.current = false; }, 2000);
        }
      } else {
        el.scrollTop -= 1;
        if (el.scrollTop <= 0) {
          directionRef.current = "down";
          pauseRef.current = true;
          setTimeout(() => { pauseRef.current = false; }, 2000);
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isCompact]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", isCompact ? "h-[calc(100vh-240px)]" : "h-[calc(100vh-320px)] overflow-y-auto")}
    >
      {children}
    </div>
  );
}

function RanglijstenContent() {
  const [jaar, setJaar] = useState("2026");
  
  const [selectedPeriode, setSelectedPeriode] = useState("P1");
  const [unit, setUnit] = useState("Alle units");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([...allColumnTitles]);
  const isCompact = useTVCompact();

  // Auto-swap between week and periode in TV mode
  const [autoView, setAutoView] = useState<"week" | "periode">("week");
  const [tvViewMode, setTvViewMode] = useState<"auto" | "week" | "periode">("auto");

  useEffect(() => {
    if (!isCompact) {
      setAutoView("week");
      return;
    }
    if (tvViewMode === "week") { setAutoView("week"); return; }
    if (tvViewMode === "periode") { setAutoView("periode"); return; }
    const interval = setInterval(() => {
      setAutoView((v) => (v === "week" ? "periode" : "week"));
    }, 10000);
    return () => clearInterval(interval);
  }, [isCompact, tvViewMode]);

  const toggleColumn = useCallback((title: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(title)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== title);
      }
      return [...prev, title];
    });
  }, []);

  const activeView = isCompact ? autoView : (tvViewMode === "periode" ? "periode" : "week");
  const allColumns = activeView === "periode" ? ranglijstenPeriodeColumns : ranglijstenWeekColumns;
  const columns = allColumns.filter((col) => selectedColumns.includes(col.title));

  return (
    <>
      {/* Filters + TV indicator */}
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

            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-[100px] bg-card border-border">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                {ranglijstenFilters.periodenummers.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
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

            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-[160px] bg-card border-border">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {ranglijstenFilters.units.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {isCompact && (
          <>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Badge
                variant={tvViewMode === "auto" ? "default" : "secondary"}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => setTvViewMode("auto")}
              >
                Auto {tvViewMode === "auto" && <span className="ml-1 text-[10px] opacity-70">({autoView === "week" ? "W" : "P"})</span>}
              </Badge>
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
          </>
        )}
      </div>

      {/* Ranking Columns */}
      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <div key={col.title} className="min-w-0">
            <h2 className="text-xs font-semibold text-muted-foreground mb-1 truncate uppercase tracking-wide">{col.title}</h2>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {col.total.toLocaleString("nl-NL")}
            </p>
            <ComparisonBar current={col.total} previous={col.previousTotal} />

            {isCompact ? (
              <>
                <div className="mt-3 space-y-0">
                  {col.entries.filter(e => e.rank <= 10).map((entry) => (
                    <div
                      key={`${entry.rank}-${entry.name}`}
                      className={cn(
                        "flex items-center gap-2 py-1.5 text-sm rounded-sm px-1.5 border-b border-border/20",
                        getRankStyle(entry.rank),
                        entry.isHot && entry.value > 0 && "bg-orange-50/60",
                        entry.value === 0 && "opacity-50"
                      )}
                    >
                      <span className={cn(
                        "w-5 text-right shrink-0 text-xs flex items-center justify-end gap-0.5",
                        entry.rank <= 3 ? "font-bold" : "text-muted-foreground"
                      )}>
                        <RankIcon rank={entry.rank} />
                        {entry.rank > 3 && `${entry.rank}.`}
                      </span>
                      <span className={cn(
                        "truncate flex-1 text-foreground",
                        entry.isHot && entry.value > 0 && "text-orange-700 font-medium"
                      )}>
                        {entry.name}
                      </span>
                      <span className={cn(
                        "tabular-nums shrink-0 flex items-center gap-1",
                        entry.rank <= 3 ? "font-bold" : "font-semibold",
                        "text-foreground"
                      )}>
                        {entry.isHot && entry.value > 0 && <Flame className="w-3 h-3 text-orange-500" />}
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
                <AutoScrollArea isCompact={isCompact}>
                  <div className="space-y-0">
                    {col.entries.filter(e => e.rank > 10).map((entry) => (
                      <div
                        key={`${entry.rank}-${entry.name}`}
                        className={cn(
                          "flex items-center gap-2 py-1.5 text-sm rounded-sm px-1.5 border-b border-border/10",
                          entry.value === 0 && "opacity-50"
                        )}
                      >
                        <span className="w-5 text-right shrink-0 text-xs text-muted-foreground">
                          {entry.rank}.
                        </span>
                        <span className={cn(
                          "truncate flex-1 text-foreground",
                          entry.isHot && entry.value > 0 && "text-orange-700 font-medium"
                        )}>
                          {entry.name}
                        </span>
                        <span className={cn(
                          "tabular-nums shrink-0 flex items-center gap-1 font-semibold text-foreground"
                        )}>
                          {entry.isHot && entry.value > 0 && <Flame className="w-3 h-3 text-orange-500" />}
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </AutoScrollArea>
              </>
            ) : (
              <div className="mt-3 space-y-0 h-[calc(100vh-320px)] overflow-y-auto">
                {col.entries.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    className={cn(
                      "flex items-center gap-2 py-1.5 text-sm rounded-sm px-1.5 border-b border-border/20",
                      getRankStyle(entry.rank),
                      entry.isHot && entry.value > 0 && "bg-orange-50/60",
                      entry.value === 0 && "opacity-50"
                    )}
                  >
                    <span className={cn(
                      "w-5 text-right shrink-0 text-xs flex items-center justify-end gap-0.5",
                      entry.rank <= 3 ? "font-bold" : "text-muted-foreground"
                    )}>
                      <RankIcon rank={entry.rank} />
                      {entry.rank > 3 && `${entry.rank}.`}
                    </span>
                    <span className={cn(
                      "truncate flex-1 text-foreground",
                      entry.isHot && entry.value > 0 && "text-orange-700 font-medium"
                    )}>
                      {entry.name}
                    </span>
                    <span className={cn(
                      "tabular-nums shrink-0 flex items-center gap-1",
                      entry.rank <= 3 ? "font-bold" : "font-semibold",
                      "text-foreground"
                    )}>
                      {entry.isHot && entry.value > 0 && <Flame className="w-3 h-3 text-orange-500" />}
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
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

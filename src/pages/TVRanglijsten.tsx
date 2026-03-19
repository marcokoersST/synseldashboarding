import { useState, useCallback, useMemo, useRef, useLayoutEffect, useEffect, type ReactNode } from "react";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { getRanglijstenData, ranglijstenFilters, allColumnTitles, getCurrentWeekNumber, getCurrentPeriodNumber } from "@/data/ranglijstenData";
import type { RankingColumn } from "@/data/ranglijstenData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Flame, TrendingUp, TrendingDown, Columns3, ChevronDown, CircleAlert, CircleMinus, Rocket, ChevronLeft, ChevronRight, CheckCircle2, Check } from "lucide-react";

const STATUS_ICON_COLUMNS = new Set(["Acquisities", "Voorstellen", "Gesprekken", "Intakes", "Plaatsingen"]);

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

function getRankStyle(rank: number, isNegative?: boolean) {
  if (isNegative) {
    if (rank === 1) return "border-l-[3px] border-l-rose-400 bg-rose-50/40 font-semibold";
    if (rank === 2) return "border-l-[3px] border-l-rose-300 bg-rose-50/30 font-semibold";
    if (rank === 3) return "border-l-[3px] border-l-rose-200 bg-rose-50/20 font-semibold";
    if (rank <= 10) return "border-l-[2px] border-l-rose-200 bg-rose-50/10";
    return "";
  }
  if (rank === 1) return "border-l-[3px] border-l-amber-400 bg-amber-50/50 font-semibold";
  if (rank === 2) return "border-l-[3px] border-l-slate-400 bg-amber-50/40 font-semibold";
  if (rank === 3) return "border-l-[3px] border-l-orange-400 bg-amber-50/30 font-semibold";
  if (rank <= 10) return "border-l-[2px] border-l-blue-300 bg-blue-50/60";
  return "";
}

function RankIcon({ rank, isTop3, isNegative }: { rank: number; isTop3?: boolean; isNegative?: boolean }) {
  const size = isTop3 ? "w-4 h-4" : "w-3.5 h-3.5";
  if (isNegative) {
    if (rank === 1) return <CircleAlert className={cn(size, "text-rose-400/70")} />;
    if (rank === 2) return <CircleMinus className={cn(size, "text-slate-400")} />;
    if (rank === 3) return <CircleMinus className={cn(size, "text-orange-400/70")} />;
    return null;
  }
  if (rank === 1) return <span className="tv-wave-1"><Trophy className={cn(size, "text-amber-500")} /></span>;
  if (rank === 2) return <span className="tv-wave-2"><Medal className={cn(size, "text-slate-400")} /></span>;
  if (rank === 3) return <span className="tv-wave-3"><Medal className={cn(size, "text-orange-400")} /></span>;
  return null;
}

interface EntryRowProps {
  entry: { rank: number; name: string; firstName: string; lastName: string; value: number; isHot?: boolean; isRocket?: boolean };
  displayName?: string;
  compact?: boolean;
  isNegative?: boolean;
  showStatusIcons?: boolean;
  isPlain?: boolean;
}

function EntryRow({ entry, displayName, compact, isNegative, showStatusIcons, isPlain }: EntryRowProps) {
  const isTop3 = !isPlain && entry.rank <= 3;
  const shownName = displayName ?? entry.name;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm px-1.5 border-b border-border/20 break-inside-avoid",
        isTop3 ? (compact ? "py-1" : "py-2") : "py-1",
        compact || isPlain ? "text-xs" : "text-sm",
        !isPlain && getRankStyle(entry.rank, isNegative),
        !isPlain && entry.isHot && entry.value > 0 && "bg-orange-50/60",
        entry.value === 0 && "text-orange-600"
      )}
    >
      <span className={cn(
        "w-5 text-left shrink-0 flex items-center justify-start gap-0.5",
        isTop3 ? (compact ? "text-xs font-bold" : "text-sm font-bold") : "text-xs",
        entry.value !== 0 && !isTop3 && "text-muted-foreground"
      )}>
        {!isPlain && <RankIcon rank={entry.rank} isTop3={isTop3} isNegative={isNegative} />}
        {(isPlain || entry.rank > 3) && `${entry.rank}.`}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 text-foreground",
          isTop3 ? (compact ? "text-sm font-semibold" : "text-base font-bold") : "text-[11px]",
          !isPlain && entry.isHot && entry.value > 0 && "text-orange-700 font-medium",
          entry.value === 0 && "text-orange-600",
          !isTop3 && "truncate"
        )}
      >
        {shownName}
      </span>
      <span className={cn(
        "tabular-nums shrink-0 ml-auto flex items-center gap-1",
        isTop3 ? (compact ? "text-sm font-semibold" : "text-base font-bold") : "font-semibold",
        entry.value !== 0 && "text-foreground"
      )}>
        {!isPlain && showStatusIcons && entry.isHot && entry.value > 0 && <Flame className="w-3 h-3 text-orange-500 tv-fire" />}
        {!isPlain && showStatusIcons && entry.isRocket && entry.value > 0 && <Rocket className="w-3 h-3 text-blue-500 tv-rocket" />}
        {entry.value}
      </span>
    </div>
  );
}

function AutoColumnsWrapper({ children, isCompact }: { children: ReactNode; isCompact: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const childArray = useMemo(() => {
    const arr: ReactNode[] = [];
    const flatChildren = Array.isArray(children) ? children : [children];
    flatChildren.forEach(child => { if (child != null) arr.push(child); });
    return arr;
  }, [children]);
  const [layout, setLayout] = useState<{ cols: 1 | 2; splitAt: number; compressed: boolean }>({ cols: 1, splitAt: 0, compressed: false });

  useLayoutEffect(() => {
    if (!isCompact || !containerRef.current || !measureRef.current) return;

    const measure = () => {
      const firstRow = measureRef.current?.children[0] as HTMLElement;
      if (!firstRow || !containerRef.current || childArray.length === 0) return;
      const rowH = firstRow.getBoundingClientRect().height;
      const available = containerRef.current.clientHeight;
      if (available <= 0 || rowH <= 0) return;
      const fitInOne = Math.floor(available / rowH);

      if (childArray.length <= fitInOne) {
        setLayout({ cols: 1, splitAt: 0, compressed: false });
      } else if (childArray.length <= fitInOne * 2) {
        setLayout({ cols: 2, splitAt: fitInOne, compressed: false });
      } else {
        const half = Math.ceil(childArray.length / 2);
        setLayout({ cols: 2, splitAt: half, compressed: true });
      }
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [children, isCompact, childArray.length]);
  if (!isCompact) return <div className="mt-1">{children}</div>;

  const col1 = layout.cols === 2 ? childArray.slice(0, layout.splitAt) : childArray;
  const col2 = layout.cols === 2 ? childArray.slice(layout.splitAt) : [];

  return (
    <div ref={containerRef} className="mt-1 flex-1 min-h-0 overflow-hidden relative">
      <div ref={measureRef} className="absolute opacity-0 pointer-events-none w-full">{childArray.slice(0, 1)}</div>
      <div className={cn("h-full", layout.cols === 2 ? "flex gap-x-2" : "")}>
        <div className={cn("flex flex-col", layout.cols === 2 && "flex-1 min-w-0")}>
          {col1.map((child, i) => (
              <div key={i} className={layout.compressed ? "[&>div]:py-px [&>div]:gap-0.5 [&>div]:text-[10px]" : ""}>
              {child}
            </div>
          ))}
        </div>
        {col2.length > 0 && (
          <div className="flex-1 min-w-0 flex flex-col">
            {col2.map((child, i) => (
              <div key={i} className={layout.compressed ? "[&>div]:py-px [&>div]:gap-0.5 [&>div]:text-[10px]" : ""}>
                {child}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function applyUnitFilter(columns: RankingColumn[], selectedUnits: string[]): RankingColumn[] {
  if (selectedUnits.includes("Alle units")) return columns;
  return columns.map(col => {
    const filtered = col.entries
      .filter(e => selectedUnits.includes((e as any).unit))
      .map((e, i) => ({ ...e, rank: i + 1 }));
    const total = filtered.reduce((s, e) => s + e.value, 0);
    const ratio = col.total > 0 ? total / col.total : 0;
    const previousTotal = Math.round(col.previousTotal * ratio);
    return { ...col, entries: filtered, total, previousTotal };
  });
}

function RanglijstenContent() {
  const currentYear = new Date().getFullYear();
  const currentWeek = getCurrentWeekNumber();
  const currentPeriod = getCurrentPeriodNumber();

  const [jaar, setJaar] = useState(String(currentYear));
  const [selectedPeriode, setSelectedPeriode] = useState(`P${currentPeriod}`);
  const [selectedWeek, setSelectedWeek] = useState(`W${currentWeek}`);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(["Alle units"]);
  const [pendingUnits, setPendingUnits] = useState<string[]>(["Alle units"]);
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([...allColumnTitles]);
  const isCompact = useTVCompact();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [tvViewMode, setTvViewMode] = useState<"week" | "periode">("week");

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scrollByDir = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  const toggleColumn = useCallback((title: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(title)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== title);
      }
      return [...prev, title];
    });
  }, []);

  const currentNum = tvViewMode === "week"
    ? parseInt(selectedWeek.replace("W", ""), 10)
    : parseInt(selectedPeriode.replace("P", ""), 10);

  const rawColumns = useMemo(() => {
    return getRanglijstenData(parseInt(jaar, 10), tvViewMode, currentNum);
  }, [jaar, tvViewMode, currentNum]);

  const columns = useMemo(() => {
    const unitFiltered = applyUnitFilter(rawColumns, selectedUnits);
    return unitFiltered.filter((col) => selectedColumns.includes(col.title));
  }, [rawColumns, selectedUnits, selectedColumns]);

  useEffect(() => {
    if (isCompact) return;
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    const ro = new ResizeObserver(() => updateScrollButtons());
    ro.observe(el);
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", updateScrollButtons); };
  }, [isCompact, updateScrollButtons, columns]);

  return (
    <div className={cn(isCompact && "flex flex-col h-full")}>
      {/* Filters */}
      <div className={cn("flex items-center gap-4", isCompact ? "mb-2" : "mb-4")}>
        {isCompact && (
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Ranglijsten
            <span className="text-primary">·</span>
            <span className="text-primary">
              {tvViewMode === "week" ? `Week ${currentNum}` : `Periode ${currentNum}`}
            </span>
          </h1>
        )}
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

            <Popover open={unitPopoverOpen} onOpenChange={(open) => {
              setUnitPopoverOpen(open);
              if (open) setPendingUnits([...selectedUnits]);
            }}>
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
                        checked={pendingUnits.includes("Alle units") || pendingUnits.includes(u)}
                        onCheckedChange={() => {
                          setPendingUnits(prev => {
                            if (prev.includes("Alle units")) {
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
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    setSelectedUnits([...pendingUnits]);
                    setUnitPopoverOpen(false);
                  }}
                >
                  Toepassen
                </Button>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>

      {/* Legend */}
      <div className={cn("flex flex-wrap items-start gap-2 mb-3", isCompact ? "text-xs" : "text-sm")}>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border/40 px-3 py-1.5">
          <Flame className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="font-bold text-orange-700">On Fire</span>
          <span className="text-muted-foreground">— Min. +30% groei t.o.v. vorige periode (rolling)</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border/40 px-3 py-1.5">
          <Rocket className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-bold text-blue-600">Raket</span>
          <span className="text-muted-foreground">— Min. 3 posities ingehaald in laatste 5 dagen</span>
        </div>
      </div>

      {/* Ranking Columns */}
      {!isCompact && (
        <div className="relative">
          {canScrollLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card shadow-md border-border"
              onClick={() => scrollByDir("left")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {canScrollRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-card shadow-md border-border"
              onClick={() => scrollByDir("right")}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          <div ref={scrollRef} className="overflow-x-auto scroll-smooth">
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}
            >
              {columns.map((col) => {
                const isNegative = col.title === "Niet begonnen";
                const isPlain = col.title === "Inschrijvingen";
                const showStatusIcons = STATUS_ICON_COLUMNS.has(col.title);
                const top3 = isPlain ? [] : col.entries.slice(0, 3);
                const rest = isPlain ? col.entries : col.entries.slice(3);

                return (
                  <div key={col.title} className="min-w-0 rounded-lg border border-border p-3 bg-card">
                    <h2 className="text-xs font-semibold text-muted-foreground mb-1 truncate uppercase tracking-wide">{col.title}</h2>
                    <p className="text-3xl font-bold text-foreground tabular-nums">
                      {col.total.toLocaleString("nl-NL")}
                    </p>
                    <ComparisonBar current={col.total} previous={col.previousTotal} />
                    {top3.length > 0 && (
                      <div className="mt-3 space-y-0">
                        {top3.map((entry) => (
                          <EntryRow key={`${entry.rank}-${entry.name}`} entry={entry} isNegative={isNegative} showStatusIcons={showStatusIcons} />
                        ))}
                      </div>
                    )}
                    <AutoColumnsWrapper isCompact={false}>
                      {rest.map((entry) => (
                        <EntryRow
                          key={`${entry.rank}-${entry.name}`}
                          entry={entry}
                          displayName={`${entry.firstName} ${entry.lastName[0]}.`}
                          compact
                          isNegative={isNegative}
                          showStatusIcons={showStatusIcons}
                          isPlain={isPlain}
                        />
                      ))}
                    </AutoColumnsWrapper>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isCompact && (
        <div
          className="grid gap-2 flex-1 min-h-0"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, gridTemplateRows: '1fr' }}
        >
          {columns.map((col) => {
            const isNegative = col.title === "Niet begonnen";
            const isPlain = col.title === "Inschrijvingen";
            const showStatusIcons = STATUS_ICON_COLUMNS.has(col.title);
            const top3 = isPlain ? [] : col.entries.slice(0, 3);
            const rest = isPlain ? col.entries : col.entries.slice(3);

            return (
              <div key={col.title} className="min-w-0 rounded-lg border border-border p-3 bg-card flex flex-col min-h-0 overflow-hidden">
                <h2 className="text-xs font-semibold text-muted-foreground mb-1 truncate uppercase tracking-wide">{col.title}</h2>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {col.total.toLocaleString("nl-NL")}
                </p>
                <ComparisonBar current={col.total} previous={col.previousTotal} />
                {top3.length > 0 && (
                  <div className="mt-3 space-y-0">
                    {top3.map((entry) => (
                      <EntryRow key={`${entry.rank}-${entry.name}`} entry={entry} compact isNegative={isNegative} showStatusIcons={showStatusIcons} />
                    ))}
                  </div>
                )}
                <AutoColumnsWrapper isCompact={true}>
                  {rest.map((entry) => (
                    <EntryRow
                      key={`${entry.rank}-${entry.name}`}
                      entry={entry}
                      displayName={`${entry.firstName} ${entry.lastName[0]}.`}
                      compact
                      isNegative={isNegative}
                      showStatusIcons={showStatusIcons}
                      isPlain={isPlain}
                    />
                  ))}
                </AutoColumnsWrapper>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TVRanglijsten() {
  return (
    <TVDashboardLayout title="Ranglijsten">
      <RanglijstenContent />
    </TVDashboardLayout>
  );
}
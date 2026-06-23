import { useState, useCallback, useMemo, useRef, useLayoutEffect, useEffect, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { getRanglijstenData, ranglijstenFilters, allColumnTitles, getCurrentWeekNumber, getCurrentPeriodNumber, allConsultantsList, getBelstatistiekenColumn, formatBeltijd } from "@/data/ranglijstenData";
import type { RankingColumn, BelScope } from "@/data/ranglijstenData";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Trophy, Medal, TrendingUp, TrendingDown, Columns3, ChevronDown, CircleAlert, CircleMinus, ChevronLeft, ChevronRight, CheckCircle2, Check, ArrowUpDown, CalendarIcon, ArrowLeftRight, Phone, PhoneOutgoing, PhoneIncoming } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

const STATUS_ICON_COLUMNS = new Set(["Acquisities", "Gesprekken", "Intakes", "Plaatsingen"]);

function shortName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName.charAt(0)}.`;
}

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

// Column configuration for dual-value display
const COLUMN_CONFIG: Record<string, { headerTitle: string; primaryLabel: string; doneLabel: string; isInverse: boolean; isRatioOnly?: boolean; ratioLabel?: string; isTimeSecondary?: boolean }> = {
  "Inschrijvingen": { headerTitle: "Inschrijvingen", primaryLabel: "op naam", doneLabel: "gedaan", isInverse: false },
  "Acquisities": { headerTitle: "Acquisities / Voorstellen", primaryLabel: "acquisities", doneLabel: "voorstellen", isInverse: false },
  "Gesprekken": { headerTitle: "Gesprekken / Uitnodigingen", primaryLabel: "gesprekken", doneLabel: "uitnodigingen", isInverse: true },
  "Intakes": { headerTitle: "Intakes", primaryLabel: "intakes", doneLabel: "van acquisities", isInverse: true, isRatioOnly: true, ratioLabel: "van acq." },
  "Plaatsingen": { headerTitle: "Plaatsingen / Detachering", primaryLabel: "plaatsingen", doneLabel: "detachering", isInverse: false },
  "Belstatistieken": { headerTitle: "Belstatistieken (Uitgaand)", primaryLabel: "telefoontjes", doneLabel: "beltijd", isInverse: false, isTimeSecondary: true },
};

const SORT_OPTIONS: Record<string, { value: string; done?: string }> = {
  "Inschrijvingen": { value: "Op naam", done: "Op gedaan" },
  "Acquisities": { value: "Op acquisities", done: "Op voorstellen" },
  "Gesprekken": { value: "Op gesprekken", done: "Op uitnodigingen" },
  "Intakes": { value: "Op intakes", done: "Op % van acq." },
  "Plaatsingen": { value: "Op plaatsingen", done: "Op detachering" },
  "Niet begonnen": { value: "Op niet begonnen" },
  "Belstatistieken": { value: "Op aantal telefoontjes", done: "Op beltijd" },
};

interface EntryRowProps {
  entry: { rank: number; name: string; firstName: string; lastName: string; value: number; valueDone?: number };
  displayName?: string;
  compact?: boolean;
  isNegative?: boolean;
  showStatusIcons?: boolean;
  isPlain?: boolean;
  isAcquisities?: boolean;
  isInverseRatio?: boolean;
  isRatioOnly?: boolean;
  ratioLabel?: string;
  isTimeSecondary?: boolean;
  primaryScope?: "uitgaand" | "totaal";
  secondaryScope?: "uitgaand" | "totaal";
}

/** Scope indicator: green outgoing icon for "uitgaand", green+blue combo for "totaal" (in+uit). */
function ScopeIcon({ scope, size = 12, className }: { scope: "uitgaand" | "totaal"; size?: number; className?: string }) {
  if (scope === "uitgaand") {
    return <PhoneOutgoing className={cn("text-emerald-500 shrink-0", className)} style={{ width: size, height: size }} aria-label="Uitgaand" />;
  }
  // mixed: stack outgoing (green) over incoming (blue) for compact combi indicator
  return (
    <span className={cn("inline-flex items-center shrink-0", className)} aria-label="Totaal (inkomend + uitgaand)" title="Totaal: inkomend + uitgaand">
      <PhoneOutgoing className="text-emerald-500" style={{ width: size, height: size }} />
      <PhoneIncoming className="text-sky-500 -ml-[3px]" style={{ width: size, height: size }} />
    </span>
  );
}

function EntryRow({ entry, displayName, compact, isNegative, showStatusIcons, isPlain, isAcquisities, isInverseRatio, isRatioOnly, ratioLabel, isTimeSecondary, primaryScope, secondaryScope }: EntryRowProps) {
  const isTop3 = !isPlain && entry.rank <= 3;
  const shownName = displayName ?? shortName(entry.firstName, entry.lastName);
  
  const hasSecondary = (entry.valueDone != null && !isRatioOnly) || (isRatioOnly && entry.valueDone != null);

  // Build secondary content
  let secondaryContent: ReactNode = null;
  if (entry.valueDone != null && !isRatioOnly) {
    if (isTimeSecondary) {
      secondaryContent = (
        <span className="tabular-nums flex items-center gap-0.5 text-emerald-600">
          {secondaryScope ? <ScopeIcon scope={secondaryScope} size={12} /> : <Phone className="w-3 h-3 shrink-0" />}
          <span className={cn(isTop3 ? "text-[clamp(9px,0.9vw,14px)] font-bold" : "text-[10px] font-semibold")}>
            {formatBeltijd(entry.valueDone)}
          </span>
        </span>
      );
    } else {
    secondaryContent = (
      <span className="tabular-nums flex items-center gap-0.5 text-emerald-600">
        <Check className="w-3 h-3 shrink-0" />
        <span className={cn(isTop3 ? "text-[clamp(9px,0.9vw,14px)] font-bold" : "text-[10px] font-semibold")}>
          {entry.valueDone}
        </span>
        {entry.value > 0 && (
          isAcquisities ? (
            <span className={cn(
              "font-semibold shrink-0",
              isTop3 ? "text-[9px]" : "text-[8px]",
              (() => {
                const ratio = entry.valueDone! / entry.value;
                if (ratio < 10) return "text-red-500";
                if (ratio < 15) return "text-orange-500";
                return "text-muted-foreground";
              })()
            )}>
              ×{(entry.valueDone! / entry.value).toFixed(1)}
            </span>
          ) : (
            <span className={cn("text-muted-foreground font-normal shrink-0", isTop3 ? "text-[9px]" : "text-[8px]")}>
              ({isInverseRatio
                ? (entry.valueDone! > 0 ? Math.round((entry.value / entry.valueDone!) * 100) : 0)
                : Math.round((entry.valueDone! / entry.value) * 100)
              }%)
            </span>
          )
        )}
      </span>
    );
    }
  }
  if (isRatioOnly && entry.valueDone != null) {
    const pct = entry.valueDone > 0 ? Math.round((entry.value / entry.valueDone) * 100) : 0;
    secondaryContent = (
      <span className={cn(
        "tabular-nums shrink-0 font-semibold",
        isTop3 ? "text-[10px]" : "text-[10px]",
        pct < 80 ? "text-orange-500" : "text-emerald-600"
      )}>
        {pct}%
        <span className="text-muted-foreground font-normal text-[8px] ml-0.5">{ratioLabel}</span>
      </span>
    );
  }

  // Use CSS grid for top-3 to guarantee slot containment
  if (isTop3) {
    return (
      <div
        className={cn(
          "grid items-center rounded-sm px-1 border-b border-border/20 break-inside-avoid",
          compact ? "py-1" : "py-1.5",
          getRankStyle(entry.rank, isNegative),
          entry.value === 0 && "text-orange-600"
        )}
        style={{
          gridTemplateColumns: `1rem 1fr auto ${hasSecondary ? 'auto' : '0px'}`,
          gap: '4px',
        }}
      >
        {/* Rank icon */}
        <span className="flex items-center justify-start shrink-0">
          <RankIcon rank={entry.rank} isTop3 isNegative={isNegative} />
        </span>
        {/* Name — contained in its grid slot, overflow hidden, no ellipsis */}
        <span
          className={cn(
            "min-w-0 whitespace-nowrap overflow-hidden font-semibold text-foreground",
            "text-[clamp(7px,0.7vw,12px)]",
            entry.value === 0 && "text-orange-600"
          )}
          style={{ textOverflow: 'clip' }}
        >
          {shownName}
        </span>
        {/* Primary value */}
        <span className={cn(
          "tabular-nums font-bold text-right text-foreground flex items-center justify-end gap-0.5",
          "text-[clamp(9px,0.9vw,14px)]",
          entry.value === 0 && "text-orange-600"
        )}>
          {primaryScope && <ScopeIcon scope={primaryScope} size={11} />}
          {entry.value.toLocaleString("nl-NL")}
        </span>
        {/* Secondary value block */}
        {hasSecondary ? (
          <span className="flex items-center">{secondaryContent}</span>
        ) : <span />}
      </div>
    );
  }

  // Non-top-3: keep flex layout (simpler, smaller rows)
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-sm px-1 border-b border-border/20 break-inside-avoid",
        "py-0.5",
        compact || isPlain ? "text-xs" : "text-sm",
        !isPlain && getRankStyle(entry.rank, isNegative),
        entry.value === 0 && "text-orange-600"
      )}
    >
      <span className={cn(
        "w-4 text-left shrink-0 flex items-center justify-start gap-0.5 text-xs",
        entry.value !== 0 && "text-muted-foreground"
      )}>
        {!isPlain && <RankIcon rank={entry.rank} isNegative={isNegative} />}
        {(isPlain || entry.rank > 3) && `${entry.rank}.`}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 whitespace-nowrap overflow-hidden text-foreground text-[9px]",
          entry.value === 0 && "text-orange-600"
        )}
        style={{ textOverflow: 'clip' }}
      >
        {shownName}
      </span>
      <span className={cn(
        "tabular-nums shrink-0 ml-auto text-[10px] font-semibold flex items-center gap-0.5",
        entry.value !== 0 && "text-foreground"
      )}>
        {primaryScope && <ScopeIcon scope={primaryScope} size={10} />}
        {entry.value.toLocaleString("nl-NL")}
      </span>
      {secondaryContent}
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
    const totalDone = col.totalDone != null ? filtered.reduce((s, e) => s + (e.valueDone ?? 0), 0) : undefined;
    const previousTotalDone = col.previousTotalDone != null ? Math.round(col.previousTotalDone * ratio) : undefined;
    return { ...col, entries: filtered, total, previousTotal, totalDone, previousTotalDone };
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
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>(["Alle consultants"]);
  const [pendingConsultants, setPendingConsultants] = useState<string[]>(["Alle consultants"]);
  const [consultantPopoverOpen, setConsultantPopoverOpen] = useState(false);
  const [consultantSearch, setConsultantSearch] = useState("");
  const [hideInactive, setHideInactive] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([...allColumnTitles]);
  const [swapNietBegonnen, setSwapNietBegonnen] = useState(false);
  const [callsScope, setCallsScope] = useState<BelScope>("uitgaand");
  const [durationScope, setDurationScope] = useState<BelScope>("uitgaand");

  const belScopeLabel = useMemo(() => {
    if (callsScope === "uitgaand" && durationScope === "uitgaand") return "Uitgaand";
    if (callsScope === "totaal" && durationScope === "totaal") return "Totaal";
    return "Gemengd";
  }, [callsScope, durationScope]);
  const belHeaderTitle = `Belstatistieken (${belScopeLabel})`;
  const isCompact = useTVCompact();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [sortModes, setSortModes] = useState<Record<string, string>>({
    "Inschrijvingen": "name",
    "Acquisities": "value",
    "Gesprekken": "value",
    "Intakes": "value",
    "Plaatsingen": "value",
    "Niet begonnen": "value",
    "Belstatistieken": "value",
  });

  const [tvViewMode, setTvViewMode] = useState<"week" | "periode" | "custom">("week");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

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

  const effectiveViewMode = tvViewMode === "custom" ? "week" : tvViewMode;
  const currentNum = effectiveViewMode === "week"
    ? parseInt(selectedWeek.replace("W", ""), 10)
    : parseInt(selectedPeriode.replace("P", ""), 10);

  const rawColumns = useMemo(() => {
    const cols = getRanglijstenData(parseInt(jaar, 10), effectiveViewMode, currentNum);
    if (swapNietBegonnen) {
      const bel = getBelstatistiekenColumn(parseInt(jaar, 10), effectiveViewMode, currentNum, { callsScope, durationScope });
      return cols.map(c => c.title === "Niet begonnen" ? bel : c);
    }
    return cols;
  }, [jaar, effectiveViewMode, currentNum, swapNietBegonnen, callsScope, durationScope]);

  const sortEntries = useCallback((entries: typeof rawColumns[0]["entries"], colTitle: string) => {
    const mode = sortModes[colTitle];
    if (!mode) return entries;
    const sorted = [...entries].sort((a, b) => {
      if (mode === "name") return b.value - a.value; // "Op naam" = sort by primary value (not alphabetical)
      if (mode === "done") return ((b as any).valueDone ?? 0) - ((a as any).valueDone ?? 0);
      return b.value - a.value; // "value" default
    });
    return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [sortModes]);

  // Available consultants based on selected units
  const availableConsultants = useMemo(() => {
    let list = allConsultantsList;
    if (!selectedUnits.includes("Alle units")) {
      list = list.filter(c => selectedUnits.includes(c.unit));
    }
    if (hideInactive) {
      list = list.filter(c => c.isActive);
    }
    return list;
  }, [selectedUnits, hideInactive]);

  // Reset consultant selection when units change
  useEffect(() => {
    setSelectedConsultants(["Alle consultants"]);
    setPendingConsultants(["Alle consultants"]);
  }, [selectedUnits]);

  function applyConsultantFilter(cols: RankingColumn[], selected: string[]): RankingColumn[] {
    if (selected.includes("Alle consultants")) return cols;
    return cols.map(col => {
      const filtered = col.entries
        .filter(e => selected.includes(e.name))
        .map((e, i) => ({ ...e, rank: i + 1 }));
      const total = filtered.reduce((s, e) => s + e.value, 0);
      const ratio = col.total > 0 ? total / col.total : 0;
      const previousTotal = Math.round(col.previousTotal * ratio);
      const totalDone = col.totalDone != null ? filtered.reduce((s, e) => s + (e.valueDone ?? 0), 0) : undefined;
      const previousTotalDone = col.previousTotalDone != null ? Math.round(col.previousTotalDone * ratio) : undefined;
      return { ...col, entries: filtered, total, previousTotal, totalDone, previousTotalDone };
    });
  }

  const columns = useMemo(() => {
    const unitFiltered = applyUnitFilter(rawColumns, selectedUnits);
    const consultantFiltered = applyConsultantFilter(unitFiltered, selectedConsultants);
    const filtered = consultantFiltered.filter((col) => {
      if (col.title === "Belstatistieken") return selectedColumns.includes("Niet begonnen");
      return selectedColumns.includes(col.title);
    });
    return filtered.map(col => {
      if (sortModes[col.title]) {
        return { ...col, entries: sortEntries(col.entries, col.title) };
      }
      return col;
    });
  }, [rawColumns, selectedUnits, selectedConsultants, selectedColumns, sortEntries, sortModes]);

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
              {tvViewMode === "custom" && customDateRange?.from
                ? customDateRange.to
                  ? `${format(customDateRange.from, "d MMM", { locale: nl })} – ${format(customDateRange.to, "d MMM", { locale: nl })}`
                  : format(customDateRange.from, "d MMM", { locale: nl })
                : tvViewMode === "week" ? `Week ${currentNum}` : `Periode ${currentNum}`}
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
              <Badge
                variant={tvViewMode === "custom" ? "default" : "secondary"}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => setTvViewMode("custom")}
              >
                Aangepast
              </Badge>
            </div>

            {tvViewMode === "week" && (
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[110px] bg-card border-border">
                  <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                  {ranglijstenFilters.weeknummers.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {tvViewMode === "periode" && (
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                <SelectTrigger className="w-[100px] bg-card border-border">
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  {ranglijstenFilters.periodenummers.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {tvViewMode === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 min-w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="w-4 h-4" />
                    {customDateRange?.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "d MMM", { locale: nl })} – {format(customDateRange.to, "d MMM yyyy", { locale: nl })}
                        </>
                      ) : (
                        format(customDateRange.from, "d MMM yyyy", { locale: nl })
                      )
                    ) : (
                      <span className="text-muted-foreground">Selecteer periode</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={customDateRange}
                    onSelect={setCustomDateRange}
                    numberOfMonths={2}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns3 className="w-4 h-4" />
                  Kolommen ({selectedColumns.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <p className="text-sm font-medium mb-3">Zichtbare kolommen</p>
                <div className="space-y-2">
                  {allColumnTitles.map((title) => (
                    <label key={title} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedColumns.includes(title)}
                        onCheckedChange={() => toggleColumn(title)}
                      />
                      {title === "Niet begonnen" && swapNietBegonnen ? belHeaderTitle : title}
                    </label>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={swapNietBegonnen}
                      onCheckedChange={(v) => setSwapNietBegonnen(!!v)}
                    />
                    <span className="flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3" />
                      Toon belstatistieken i.p.v. "Niet begonnen"
                    </span>
                  </label>

                  {swapNietBegonnen && (
                    <div className="mt-3 ml-5 pl-3 border-l border-border/40 space-y-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Belstatistieken bereik
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">Telefoontjes</span>
                        <ToggleGroup
                          type="single"
                          size="sm"
                          value={callsScope}
                          onValueChange={(v) => v && setCallsScope(v as BelScope)}
                          className="gap-0 rounded-md border border-border bg-muted/30 p-0.5"
                        >
                          <ToggleGroupItem
                            value="uitgaand"
                            className="h-6 px-2 text-[10px] rounded-sm data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground"
                          >
                            Uitgaand
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="totaal"
                            className="h-6 px-2 text-[10px] rounded-sm data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground"
                          >
                            Totaal
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">Gespreksduur</span>
                        <ToggleGroup
                          type="single"
                          size="sm"
                          value={durationScope}
                          onValueChange={(v) => v && setDurationScope(v as BelScope)}
                          className="gap-0 rounded-md border border-border bg-muted/30 p-0.5"
                        >
                          <ToggleGroupItem
                            value="uitgaand"
                            className="h-6 px-2 text-[10px] rounded-sm data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground"
                          >
                            Uitgaand
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="totaal"
                            className="h-6 px-2 text-[10px] rounded-sm data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground"
                          >
                            Totaal
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      <p className="text-[10px] text-muted-foreground/80 leading-snug">
                        "Totaal" telt inkomend + uitgaand op. Per metric onafhankelijk instelbaar.
                      </p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1" />

            {/* Consultant filter */}
            <Popover open={consultantPopoverOpen} onOpenChange={(open) => {
              setConsultantPopoverOpen(open);
              if (open) {
                setPendingConsultants([...selectedConsultants]);
                setConsultantSearch("");
              }
            }}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-[180px] justify-between bg-card border-border">
                  {selectedConsultants.includes("Alle consultants") ? "Alle consultants" : `${selectedConsultants.length} consultant${selectedConsultants.length > 1 ? "s" : ""}`}
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Consultants</p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setPendingConsultants(["Alle consultants"])}
                    >
                      Alles aan
                    </Button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setPendingConsultants([])}
                    >
                      Alles uit
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/40">
                  <label htmlFor="hide-inactive" className="text-xs text-muted-foreground cursor-pointer">Verberg inactieve consultants</label>
                  <Switch id="hide-inactive" checked={hideInactive} onCheckedChange={setHideInactive} className="scale-75" />
                </div>
                <Input
                  placeholder="Zoek consultant..."
                  value={consultantSearch}
                  onChange={(e) => setConsultantSearch(e.target.value)}
                  className="mb-2 h-8 text-sm"
                />
                <div className="max-h-[240px] overflow-y-auto space-y-1">
                  {availableConsultants
                    .filter(c => c.fullName.toLowerCase().includes(consultantSearch.toLowerCase()))
                    .map((c) => (
                      <label key={c.fullName} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                        <Checkbox
                          checked={pendingConsultants.includes("Alle consultants") || pendingConsultants.includes(c.fullName)}
                          onCheckedChange={() => {
                            setPendingConsultants(prev => {
                              if (prev.includes("Alle consultants")) {
                                return [c.fullName];
                              }
                              if (prev.includes(c.fullName)) {
                                const next = prev.filter(x => x !== c.fullName);
                                return next.length === 0 ? ["Alle consultants"] : next;
                              }
                              const next = [...prev, c.fullName];
                              return next.length === availableConsultants.length ? ["Alle consultants"] : next;
                            });
                          }}
                        />
                        <span className={cn("truncate", !c.isActive && "opacity-50")}>{c.fullName}</span>
                        <span className={cn("text-xs text-muted-foreground ml-auto shrink-0", !c.isActive && "opacity-50")}>{c.unit}{!c.isActive && " ·  inactief"}</span>
                      </label>
                    ))}
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    setSelectedConsultants([...pendingConsultants]);
                    setConsultantPopoverOpen(false);
                  }}
                >
                  Toepassen
                </Button>
              </PopoverContent>
            </Popover>

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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Units</p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setPendingUnits(["Alle units"])}
                    >
                      Alles aan
                    </Button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setPendingUnits([])}
                    >
                      Alles uit
                    </Button>
                  </div>
                </div>
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
            <style>{`@media (min-width: 1280px) { .ranglijsten-grid { grid-template-columns: repeat(var(--col-count), minmax(0, 1fr)) !important; } }`}</style>
            <div
              className="ranglijsten-grid grid gap-2 grid-cols-1 md:grid-cols-3"
              style={{ ['--col-count' as any]: columns.length }}
            >
              {columns.map((col) => {
                const isNegative = col.title === "Niet begonnen";
                const isPlain = col.title === "Inschrijvingen";
                const isAcquisities = col.title === "Acquisities";
                const config = COLUMN_CONFIG[col.title];
                const isDualValue = !!config;
                const showStatusIcons = STATUS_ICON_COLUMNS.has(col.title);
                const top3 = isPlain ? [] : col.entries.slice(0, 3);
                const rest = isPlain ? col.entries : col.entries.slice(3);

                const headerTitle = col.title === "Belstatistieken" ? belHeaderTitle : (config?.headerTitle ?? col.title);
                const primaryLabel = config?.primaryLabel;
                const doneLabel = config?.doneLabel;
                const isInverse = config?.isInverse ?? false;
                const colIsRatioOnly = config?.isRatioOnly ?? false;
                const colRatioLabel = config?.ratioLabel;
                const colIsTimeSecondary = config?.isTimeSecondary ?? false;
                const canSwap = col.title === "Niet begonnen" || col.title === "Belstatistieken";

                return (
                  <div key={col.title} className="min-w-0 rounded-lg border border-border p-1.5 bg-card">
                    {/* Title — fixed height for alignment */}
                    <div className="flex items-center gap-1 mb-1 min-h-[1.5rem]">
                      <h2 className="text-[clamp(8px,1.1vw,12px)] font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                        {headerTitle}
                      </h2>
                      {SORT_OPTIONS[col.title] && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="shrink-0 p-0.5 rounded hover:bg-muted/60 transition-colors">
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[140px]">
                            <DropdownMenuItem onClick={() => setSortModes(p => ({ ...p, [col.title]: col.title === "Inschrijvingen" ? "name" : "value" }))}>
                              <span className="flex-1">{SORT_OPTIONS[col.title].value}</span>
                              {sortModes[col.title] === (col.title === "Inschrijvingen" ? "name" : "value") && <Check className="w-3.5 h-3.5 ml-2 text-primary" />}
                            </DropdownMenuItem>
                            {SORT_OPTIONS[col.title].done && (
                              <DropdownMenuItem onClick={() => setSortModes(p => ({ ...p, [col.title]: "done" }))}>
                                <span className="flex-1">{SORT_OPTIONS[col.title].done}</span>
                                {sortModes[col.title] === "done" && <Check className="w-3.5 h-3.5 ml-2 text-primary" />}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {canSwap && (
                        <button
                          className="shrink-0 p-0.5 rounded hover:bg-muted/60 transition-colors"
                          onClick={() => setSwapNietBegonnen(v => !v)}
                          title={swapNietBegonnen ? "Toon 'Niet begonnen'" : "Toon belstatistieken (uitgaand)"}
                        >
                          <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    {/* Main metric — fixed height */}
                    <div className="flex items-baseline gap-1.5 min-h-[2rem]">
                      {col.title === "Belstatistieken" && (
                        <ScopeIcon scope={callsScope} size={18} className="self-center" />
                      )}
                      <p className="text-[clamp(20px,2.5vw,30px)] font-bold text-foreground tabular-nums leading-tight">
                        {col.total.toLocaleString("nl-NL")}
                      </p>
                      {isDualValue && primaryLabel && (
                        <span className="text-xs text-muted-foreground">{primaryLabel}</span>
                      )}
                    </div>
                    {/* Secondary metric — fixed height so columns align */}
                    <div className="min-h-[1.5rem]">
                      {col.totalDone != null && doneLabel && !colIsRatioOnly && colIsTimeSecondary && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {col.title === "Belstatistieken"
                            ? <ScopeIcon scope={durationScope} size={14} />
                            : <Phone className="w-3.5 h-3.5 text-emerald-500" />}
                          <span className="text-[clamp(12px,1.5vw,18px)] font-bold text-emerald-600 tabular-nums">{formatBeltijd(col.totalDone)}</span>
                          <span className="text-xs text-emerald-600">{doneLabel}</span>
                        </div>
                      )}
                      {col.totalDone != null && doneLabel && !colIsRatioOnly && !colIsTimeSecondary && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[clamp(12px,1.5vw,18px)] font-bold text-emerald-600 tabular-nums">{col.totalDone.toLocaleString("nl-NL")}</span>
                          <span className="text-xs text-emerald-600">{doneLabel}</span>
                          {isAcquisities ? (
                            <span className={cn("text-xs font-semibold ml-1", (() => {
                              const r = col.total > 0 ? col.totalDone! / col.total : 0;
                              if (r < 10) return "text-red-500";
                              if (r < 15) return "text-orange-500";
                              return "text-muted-foreground";
                            })())}>
                              ×{col.total > 0 ? (col.totalDone! / col.total).toFixed(1) : "0.0"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({isInverse
                                ? (col.totalDone! > 0 ? Math.round((col.total / col.totalDone!) * 100) : 0)
                                : (col.total > 0 ? Math.round((col.totalDone! / col.total) * 100) : 0)
                              }%)
                            </span>
                          )}
                        </div>
                      )}
                      {colIsRatioOnly && col.totalDone != null && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {(() => {
                            const pct = col.totalDone! > 0 ? Math.round((col.total / col.totalDone!) * 100) : 0;
                            return (
                              <>
                                <span className={cn("text-lg font-bold tabular-nums", pct < 80 ? "text-orange-500" : "text-emerald-600")}>
                                  {pct}%
                                </span>
                                <span className="text-xs text-muted-foreground">{colRatioLabel}</span>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <ComparisonBar current={col.total} previous={col.previousTotal} />
                    {top3.length > 0 && (
                      <div className="mt-3 space-y-0">
                        {top3.map((entry) => (
                          <EntryRow key={`${entry.rank}-${entry.name}`} entry={entry} displayName={shortName(entry.firstName, entry.lastName)} isNegative={isNegative} showStatusIcons={showStatusIcons} isAcquisities={isAcquisities} isInverseRatio={isInverse} isRatioOnly={colIsRatioOnly} ratioLabel={colRatioLabel} isTimeSecondary={colIsTimeSecondary} primaryScope={col.title === "Belstatistieken" ? callsScope : undefined} secondaryScope={col.title === "Belstatistieken" ? durationScope : undefined} />
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
                          isAcquisities={isAcquisities}
                          isInverseRatio={isInverse}
                          isRatioOnly={colIsRatioOnly}
                          ratioLabel={colRatioLabel}
                          isTimeSecondary={colIsTimeSecondary}
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
          className="grid gap-1.5 flex-1 min-h-0"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, gridTemplateRows: '1fr' }}
        >
          {columns.map((col) => {
            const isNegative = col.title === "Niet begonnen";
            const isPlain = col.title === "Inschrijvingen";
            const isAcquisities = col.title === "Acquisities";
            const config = COLUMN_CONFIG[col.title];
            const isDualValue = !!config;
            const showStatusIcons = STATUS_ICON_COLUMNS.has(col.title);
            const top3 = isPlain ? [] : col.entries.slice(0, 3);
            const rest = isPlain ? col.entries : col.entries.slice(3);

            const headerTitle = col.title === "Belstatistieken" ? belHeaderTitle : (config?.headerTitle ?? col.title);
            const primaryLabel = config?.primaryLabel;
            const doneLabel = config?.doneLabel;
            const isInverse = config?.isInverse ?? false;
            const colIsRatioOnly = config?.isRatioOnly ?? false;
            const colRatioLabel = config?.ratioLabel;
            const colIsTimeSecondary = config?.isTimeSecondary ?? false;
            const canSwap = col.title === "Niet begonnen" || col.title === "Belstatistieken";

            return (
              <div key={col.title} className="min-w-0 rounded-lg border border-border p-1.5 bg-card flex flex-col min-h-0 overflow-hidden">
                {/* Title — fixed height */}
                <div className="flex items-center gap-1 mb-1 min-h-[1.25rem]">
                  <h2 className="text-[clamp(7px,1vw,11px)] font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                    {headerTitle}
                  </h2>
                  {SORT_OPTIONS[col.title] && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="shrink-0 p-0.5 rounded hover:bg-muted/60 transition-colors">
                          <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[140px]">
                        <DropdownMenuItem onClick={() => setSortModes(p => ({ ...p, [col.title]: col.title === "Inschrijvingen" ? "name" : "value" }))}>
                          <span className="flex-1">{SORT_OPTIONS[col.title].value}</span>
                          {sortModes[col.title] === (col.title === "Inschrijvingen" ? "name" : "value") && <Check className="w-3.5 h-3.5 ml-2 text-primary" />}
                        </DropdownMenuItem>
                        {SORT_OPTIONS[col.title].done && (
                          <DropdownMenuItem onClick={() => setSortModes(p => ({ ...p, [col.title]: "done" }))}>
                            <span className="flex-1">{SORT_OPTIONS[col.title].done}</span>
                            {sortModes[col.title] === "done" && <Check className="w-3.5 h-3.5 ml-2 text-primary" />}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {canSwap && (
                    <button
                      className="shrink-0 p-0.5 rounded hover:bg-muted/60 transition-colors"
                      onClick={() => setSwapNietBegonnen(v => !v)}
                      title={swapNietBegonnen ? "Toon 'Niet begonnen'" : "Toon belstatistieken (uitgaand)"}
                    >
                      <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {/* Main metric — fixed height */}
                <div className="flex items-baseline gap-1.5 min-h-[1.75rem]">
                  {col.title === "Belstatistieken" && (
                    <ScopeIcon scope={callsScope} size={16} className="self-center" />
                  )}
                  <p className="text-[clamp(18px,2.2vw,28px)] font-bold text-foreground tabular-nums leading-tight">
                    {col.total.toLocaleString("nl-NL")}
                  </p>
                  {isDualValue && primaryLabel && (
                    <span className="text-xs text-muted-foreground">{primaryLabel}</span>
                  )}
                </div>
                {/* Secondary metric — fixed height for alignment */}
                <div className="min-h-[1.25rem]">
                  {col.totalDone != null && doneLabel && !colIsRatioOnly && colIsTimeSecondary && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {col.title === "Belstatistieken"
                        ? <ScopeIcon scope={durationScope} size={12} />
                        : <Phone className="w-3 h-3 text-emerald-500" />}
                      <span className="text-[clamp(11px,1.3vw,16px)] font-bold text-emerald-600 tabular-nums">{formatBeltijd(col.totalDone)}</span>
                      <span className="text-xs text-emerald-600">{doneLabel}</span>
                    </div>
                  )}
                  {col.totalDone != null && doneLabel && !colIsRatioOnly && !colIsTimeSecondary && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-[clamp(11px,1.3vw,16px)] font-bold text-emerald-600 tabular-nums">{col.totalDone.toLocaleString("nl-NL")}</span>
                      <span className="text-xs text-emerald-600">{doneLabel}</span>
                      {isAcquisities ? (
                        <span className={cn("text-[10px] font-semibold ml-0.5", (() => {
                          const r = col.total > 0 ? col.totalDone! / col.total : 0;
                          if (r < 10) return "text-red-500";
                          if (r < 15) return "text-orange-500";
                          return "text-muted-foreground";
                        })())}>
                          ×{col.total > 0 ? (col.totalDone! / col.total).toFixed(1) : "0.0"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground ml-0.5">
                          ({isInverse
                            ? (col.totalDone! > 0 ? Math.round((col.total / col.totalDone!) * 100) : 0)
                            : (col.total > 0 ? Math.round((col.totalDone! / col.total) * 100) : 0)
                          }%)
                        </span>
                      )}
                    </div>
                  )}
                  {colIsRatioOnly && col.totalDone != null && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {(() => {
                        const pct = col.totalDone! > 0 ? Math.round((col.total / col.totalDone!) * 100) : 0;
                        return (
                          <>
                            <span className={cn("text-base font-bold tabular-nums", pct < 80 ? "text-orange-500" : "text-emerald-600")}>
                              {pct}%
                            </span>
                            <span className="text-xs text-muted-foreground">{colRatioLabel}</span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <ComparisonBar current={col.total} previous={col.previousTotal} />
                {top3.length > 0 && (
                  <div className="mt-3 space-y-0">
                    {top3.map((entry) => (
                      <EntryRow key={`${entry.rank}-${entry.name}`} entry={entry} displayName={shortName(entry.firstName, entry.lastName)} compact isNegative={isNegative} showStatusIcons={showStatusIcons} isAcquisities={isAcquisities} isInverseRatio={isInverse} isRatioOnly={colIsRatioOnly} ratioLabel={colRatioLabel} isTimeSecondary={colIsTimeSecondary} />
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
                      isAcquisities={isAcquisities}
                      isInverseRatio={isInverse}
                      isRatioOnly={colIsRatioOnly}
                      ratioLabel={colRatioLabel}
                      isTimeSecondary={colIsTimeSecondary}
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
import { useState, useMemo } from "react";
import { WatZieIkHier } from "@/components/dashboard/WatZieIkHier";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { useNavigate } from "react-router-dom";
import { Maximize2, Minimize2, TrendingUp, TrendingDown, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

// ─── Detail toggle hook ───
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

// ─── Chart data ───
const LEGEND_GROUPS: Record<string, string[]> = {
  werkelijk: ["werkelijk"],
  geprojecteerd: ["geprojecteerd"],
  minimumNorm: ["minimumNorm"],
  fastLane: ["fastLane"],
  executiveLane: ["executiveLane"],
  bestPerformer: ["bestPerformer", "bestPerformerProj"],
};

const data = [
  { month: "mei", werkelijk: 28000, geprojecteerd: null, minimumNorm: 20000, fastLane: 34000, executiveLane: 40000, bestPerformer: 32000, bestPerformerProj: null },
  { month: "jun", werkelijk: 32000, geprojecteerd: null, minimumNorm: 20800, fastLane: 35600, executiveLane: 42000, bestPerformer: 35000, bestPerformerProj: null },
  { month: "jul", werkelijk: 29000, geprojecteerd: null, minimumNorm: 21600, fastLane: 37200, executiveLane: 44000, bestPerformer: 34000, bestPerformerProj: null },
  { month: "aug", werkelijk: 35000, geprojecteerd: null, minimumNorm: 22400, fastLane: 38800, executiveLane: 46000, bestPerformer: 38000, bestPerformerProj: null },
  { month: "sep", werkelijk: 31000, geprojecteerd: null, minimumNorm: 23200, fastLane: 40400, executiveLane: 48000, bestPerformer: 37000, bestPerformerProj: null },
  { month: "okt", werkelijk: 36000, geprojecteerd: null, minimumNorm: 24000, fastLane: 42000, executiveLane: 50000, bestPerformer: 40000, bestPerformerProj: null },
  { month: "nov", werkelijk: 33000, geprojecteerd: null, minimumNorm: 24800, fastLane: 43600, executiveLane: 52000, bestPerformer: 42000, bestPerformerProj: null },
  { month: "dec", werkelijk: 38000, geprojecteerd: null, minimumNorm: 25600, fastLane: 45200, executiveLane: 54000, bestPerformer: 44000, bestPerformerProj: null },
  { month: "jan", werkelijk: 36000, geprojecteerd: 36000, minimumNorm: 26400, fastLane: 46800, executiveLane: 56000, bestPerformer: 44000, bestPerformerProj: 46000 },
  { month: "feb", werkelijk: null, geprojecteerd: 40000, minimumNorm: 27200, fastLane: 48400, executiveLane: 58000, bestPerformer: null, bestPerformerProj: 49000 },
  { month: "mrt", werkelijk: null, geprojecteerd: 42000, minimumNorm: 27600, fastLane: 50000, executiveLane: 60000, bestPerformer: null, bestPerformerProj: 52000 },
  { month: "apr", werkelijk: null, geprojecteerd: 45000, minimumNorm: 28000, fastLane: 52000, executiveLane: 62000, bestPerformer: null, bestPerformerProj: 55000 },
];

const COLORS = {
  minimumNorm: "hsl(var(--muted-foreground))",
  fastLane: "#f59e0b",
  executiveLane: "#8b5cf6",
  bestPerformer: "#ec4899",
};

// ─── Detailed mode data ───
// ─── Multi-period candidate data ───
interface CandidateRecord {
  kandidaat: string;
  klant: string;
  soortPlaatsing: "Detavast" | "W&S" | "Marge Fac";
  potMarge: "Actief" | "Afgerond" | "Afgevallen";
  data: Record<string, number>;
}

const candidates: CandidateRecord[] = [
  { kandidaat: "Mark de Vries", klant: "TechCorp BV", soortPlaatsing: "Detavast", potMarge: "Actief", data: { W12: 6800, W13: 7200, W14: 8400, W15: 8900, P4: 28000, P5: 32000, P6: 35000 } },
  { kandidaat: "Lisa Jansen", klant: "Bouwgroep NL", soortPlaatsing: "W&S", potMarge: "Actief", data: { W12: 6200, W13: 6800, W14: 6200, W15: 6500, P4: 24000, P5: 26000, P6: 27500 } },
  { kandidaat: "Tom Bakker", klant: "FinanceFirst", soortPlaatsing: "Detavast", potMarge: "Actief", data: { W12: 4800, W13: 5100, W14: 5800, W15: 6200, P4: 18000, P5: 21000, P6: 23000 } },
  { kandidaat: "Sara Mol", klant: "LogiPlan BV", soortPlaatsing: "Marge Fac", potMarge: "Afgerond", data: { W12: 4500, W13: 4900, W14: 4900, W15: 4900, P4: 16000, P5: 18000, P6: 19500 } },
  { kandidaat: "Pieter Smit", klant: "DataDriven NL", soortPlaatsing: "W&S", potMarge: "Actief", data: { W12: 3200, W13: 3600, W14: 4200, W15: 4800, P4: 12000, P5: 15000, P6: 17000 } },
  { kandidaat: "Emma de Boer", klant: "MedTech Group", soortPlaatsing: "Detavast", potMarge: "Afgevallen", data: { W12: 3800, W13: 4100, W14: 3800, W15: 3500, P4: 14000, P5: 15500, P6: 14800 } },
  { kandidaat: "Koen van Dijk", klant: "RetailMax BV", soortPlaatsing: "Marge Fac", potMarge: "Afgerond", data: { W12: 2000, W13: 2100, W14: 2100, W15: 2100, P4: 8000, P5: 8500, P6: 8500 } },
  { kandidaat: "Julia Peters", klant: "EnergieWerk", soortPlaatsing: "W&S", potMarge: "Actief", data: { W12: 0, W13: 0, W14: 1600, W15: 2200, P4: 0, P5: 3000, P6: 5500 } },
];

const availableWeeks = ["W12", "W13", "W14", "W15"];
const availablePeriodes = ["P4", "P5", "P6"];


// ─── Chart tooltip ───
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  onNavigate: () => void;
}

function CustomTooltip({ active, payload, label, onNavigate }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const labelMap: Record<string, string> = {
    werkelijk: "Werkelijk",
    geprojecteerd: "Geprojecteerd",
    minimumNorm: "Minimum Norm",
    fastLane: "Fast Lane",
    executiveLane: "Executive Lane",
    bestPerformer: "Best Performer",
    bestPerformerProj: "Best Performer (proj.)",
  };

  const colorMap: Record<string, string> = {
    werkelijk: "hsl(var(--teal))",
    geprojecteerd: "hsl(var(--primary))",
    minimumNorm: COLORS.minimumNorm,
    fastLane: COLORS.fastLane,
    executiveLane: COLORS.executiveLane,
    bestPerformer: COLORS.bestPerformer,
    bestPerformerProj: COLORS.bestPerformer,
  };

  const hasBestPerformer = payload.some(
    (p: any) => (p.dataKey === "bestPerformer" || p.dataKey === "bestPerformerProj") && p.value != null
  );

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => {
        if (entry.value == null) return null;
        return (
          <div key={i} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[entry.dataKey] || entry.color }} />
              <span className="text-muted-foreground">{labelMap[entry.dataKey] || entry.dataKey}</span>
            </div>
            <span className="font-medium text-foreground">€{entry.value?.toLocaleString()}</span>
          </div>
        );
      })}
      {hasBestPerformer && (
        <button
          onClick={onNavigate}
          className="mt-2 w-full text-left text-[11px] font-medium text-pink-500 hover:text-pink-400 transition-colors cursor-pointer"
        >
          Sophie de Vries — Hoe kom ik op deze plek? →
        </button>
      )}
    </div>
  );
}

// ─── Overview chart view ───
function OverviewView({ delay }: { delay: number }) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });
  const navigate = useNavigate();
  const [activeLine, setActiveLine] = useState<string | null>(null);

  const getLineOpacity = (dataKey: string): number => {
    if (!activeLine) return 1;
    return LEGEND_GROUPS[activeLine]?.includes(dataKey) ? 1 : 0.3;
  };

  const legendItems: { key: string; label: string; swatch: React.ReactNode }[] = [
    { key: "werkelijk", label: "Werkelijk", swatch: <div className="w-4 h-[2.5px] rounded-full" style={{ backgroundColor: 'hsl(var(--teal))' }} /> },
    { key: "geprojecteerd", label: "Geprojecteerd", swatch: <div className="w-4 h-[2.5px] rounded-full" style={{ background: 'repeating-linear-gradient(90deg, hsl(var(--primary)) 0 4px, transparent 4px 8px)' }} /> },
    { key: "minimumNorm", label: "Minimum Norm", swatch: <div className="w-4 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.minimumNorm} 0 2px, transparent 2px 5px)` }} /> },
    { key: "fastLane", label: "Fast Lane", swatch: <div className="w-4 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.fastLane} 0 2px, transparent 2px 5px)` }} /> },
    { key: "executiveLane", label: "Executive Lane", swatch: <div className="w-4 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.executiveLane} 0 2px, transparent 2px 5px)` }} /> },
    { key: "bestPerformer", label: "Best Performer", swatch: <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: COLORS.bestPerformer }} /> },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-6">
        {legendItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-300 ease-in-out"
            style={{ opacity: !activeLine || activeLine === item.key ? 1 : 0.5 }}
            onClick={(e) => { e.stopPropagation(); setActiveLine(activeLine === item.key ? null : item.key); }}
          >
            {item.swatch}
            <span className={`text-[11px] transition-all duration-300 ${activeLine === item.key ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div ref={ref} className="h-64" onClick={() => setActiveLine(null)}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(value) => `€${value / 1000}k`} />
            <Tooltip content={<CustomTooltip onNavigate={() => navigate("/vergelijking/1")} />} />
            <Line type="monotone" dataKey="minimumNorm" stroke={COLORS.minimumNorm} strokeWidth={1.5} strokeDasharray={activeLine === "minimumNorm" ? "0" : "3 4"} dot={false} activeDot={false} strokeOpacity={getLineOpacity("minimumNorm")} style={{ transition: "stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="fastLane" stroke={COLORS.fastLane} strokeWidth={1.5} strokeDasharray={activeLine === "fastLane" ? "0" : "3 4"} dot={false} activeDot={false} strokeOpacity={getLineOpacity("fastLane")} style={{ transition: "stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="executiveLane" stroke={COLORS.executiveLane} strokeWidth={1.5} strokeDasharray={activeLine === "executiveLane" ? "0" : "3 4"} dot={false} activeDot={false} strokeOpacity={getLineOpacity("executiveLane")} style={{ transition: "stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="bestPerformer" stroke={COLORS.bestPerformer} strokeWidth={2} dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("bestPerformer") }} activeDot={{ r: 5, cursor: "pointer" }} connectNulls={false} cursor="pointer" onClick={() => navigate("/vergelijking/1")} strokeOpacity={getLineOpacity("bestPerformer")} style={{ transition: "stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="bestPerformerProj" stroke={COLORS.bestPerformer} strokeWidth={2} strokeDasharray={activeLine === "bestPerformer" ? "0" : "6 4"} dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("bestPerformerProj") }} activeDot={{ r: 5, cursor: "pointer" }} connectNulls={false} cursor="pointer" onClick={() => navigate("/vergelijking/1")} strokeOpacity={getLineOpacity("bestPerformerProj")} style={{ transition: "stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="werkelijk" stroke="hsl(var(--teal))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--teal))', strokeWidth: 0, r: 4, fillOpacity: getLineOpacity("werkelijk") }} activeDot={{ r: 6, className: "animate-pulse-subtle" }} connectNulls={false} strokeDasharray={isVisible ? "0" : "2000"} strokeDashoffset={isVisible ? "0" : "2000"} strokeOpacity={getLineOpacity("werkelijk")} style={{ transition: "stroke-dasharray 2s ease-out, stroke-dashoffset 2s ease-out, stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="geprojecteerd" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeDasharray={activeLine === "geprojecteerd" ? "0" : (isVisible ? "8 4" : "2000")} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4, fillOpacity: getLineOpacity("geprojecteerd") }} activeDot={{ r: 6, className: "animate-pulse-subtle" }} connectNulls={false} strokeOpacity={getLineOpacity("geprojecteerd")} style={{ transition: "stroke-dasharray 2s ease-out 0.5s, stroke-opacity 300ms ease" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

type FilterMode = "week" | "periode" | "custom";

function DateRangePicker({ dateRange, onDateRangeChange, label }: {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  label: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-8 text-xs font-medium gap-1.5 px-3", !dateRange?.from && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {dateRange?.from ? (
            dateRange.to ? (
              `${format(dateRange.from, "d MMM", { locale: nl })} – ${format(dateRange.to, "d MMM yyyy", { locale: nl })}`
            ) : format(dateRange.from, "d MMM yyyy", { locale: nl })
          ) : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={2}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

function DetailedView({ delay }: { delay: number }) {
  const [filterMode, setFilterMode] = useState<FilterMode>("week");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("W14");
  const [selectedPeriode, setSelectedPeriode] = useState("P5");
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: new Date(2026, 2, 1),
    to: new Date(2026, 2, 31),
  });
  const [compareWeek, setCompareWeek] = useState("W13");
  const [comparePeriode, setComparePeriode] = useState("P4");
  const [compareRange, setCompareRange] = useState<DateRange | undefined>({
    from: new Date(2026, 1, 1),
    to: new Date(2026, 1, 28),
  });

  const filterOptions: { value: FilterMode; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "periode", label: "Periode" },
    { value: "custom", label: "Aangepast" },
  ];

  const currentKey = filterMode === "week" ? selectedWeek : filterMode === "periode" ? selectedPeriode : null;

  // Comparison key: user-selectable
  const previousKey = compareEnabled
    ? (filterMode === "week" ? compareWeek : filterMode === "periode" ? comparePeriode : null)
    : null;

  // Available compare options (exclude current selection)
  const compareWeekOptions = availableWeeks.filter(w => w !== selectedWeek);
  const comparePeriodeOptions = availablePeriodes.filter(p => p !== selectedPeriode);

  const tableData = useMemo(() => {
    return candidates.map((c) => {
      const omzet = currentKey ? (c.data[currentKey] ?? 0) : c.data["W14"];
      const vorige = previousKey ? (c.data[previousKey] ?? 0) : 0;
      return { ...c, omzet, vorige };
    });
  }, [currentKey, previousKey]);

  const totalOmzet = tableData.reduce((s, c) => s + c.omzet, 0);
  const totalVorige = tableData.reduce((s, c) => s + c.vorige, 0);
  const totalDelta = totalOmzet - totalVorige;
  const totalDeltaPct = totalVorige > 0 ? ((totalDelta / totalVorige) * 100) : 0;
  const showCompare = compareEnabled && (filterMode === "custom" || previousKey);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 bg-secondary/50 rounded-lg p-0.5">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterMode(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  filterMode === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {filterMode === "week" && (
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="h-8 w-24 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableWeeks.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {filterMode === "periode" && (
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="h-8 w-24 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePeriodes.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {filterMode === "custom" && (
            <DateRangePicker
              dateRange={customRange}
              onDateRangeChange={setCustomRange}
              label="Selecteer periode"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Vergelijking</span>
          <button
            onClick={() => setCompareEnabled(!compareEnabled)}
            className={cn(
              "relative w-8 h-4.5 rounded-full transition-colors",
              compareEnabled ? "bg-primary" : "bg-secondary"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-background shadow-sm transition-transform",
              compareEnabled ? "translate-x-4" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </div>

      {/* Comparison period selector */}
      {compareEnabled && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground">Vergelijken met:</span>
          {filterMode === "week" && (
            <Select value={compareWeek} onValueChange={setCompareWeek}>
              <SelectTrigger className="h-7 w-24 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {compareWeekOptions.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {filterMode === "periode" && (
            <Select value={comparePeriode} onValueChange={setComparePeriode}>
              <SelectTrigger className="h-7 w-24 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {comparePeriodeOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {filterMode === "custom" && (
            <DateRangePicker
              dateRange={compareRange}
              onDateRangeChange={setCompareRange}
              label="Vergelijkingsperiode"
            />
          )}
        </div>
      )}

      {/* Compare label */}
      {showCompare && previousKey && (
        <p className="text-[10px] text-muted-foreground">
          Vergelijking: {currentKey} t.o.v. {previousKey}
        </p>
      )}

      {/* Summary */}
      <div className="flex items-center gap-6 bg-secondary/20 rounded-lg px-4 py-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Totaal gefactureerd</p>
          <AnimatedNumber value={totalOmzet} delay={delay + 100} className="text-2xl font-bold text-foreground" prefix="€" />
        </div>
        {showCompare && previousKey && (
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <div>
              <p className="text-[10px] text-muted-foreground">Vorige ({previousKey})</p>
              <span className="text-sm font-semibold text-muted-foreground">€{totalVorige.toLocaleString()}</span>
            </div>
            <div className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              totalDelta >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
            )}>
              {totalDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {totalDeltaPct >= 0 ? "+" : ""}{totalDeltaPct.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {showCompare && previousKey ? (
        /* Side-by-side comparison */
        <div className="flex gap-4">
          {[
            { label: currentKey || "Huidig", dataKey: "omzet" as const },
            { label: previousKey, dataKey: "vorige" as const },
          ].map((side) => (
            <div key={side.label} className="flex-1 overflow-auto rounded-lg border border-border">
              <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
                <span className="text-[11px] font-semibold text-foreground">{side.label}</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Kandidaat</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Klant</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Soort</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Gefactureerd</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Pot. marge</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => {
                    const value = side.dataKey === "omzet" ? row.omzet : row.vorige;
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-2 px-3 font-medium text-foreground">{row.kandidaat}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.klant}</td>
                        <td className="py-2 px-3">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            row.soortPlaatsing === "Detavast" ? "bg-primary/15 text-primary" :
                            row.soortPlaatsing === "W&S" ? "bg-amber-500/15 text-amber-600" :
                            "bg-violet-500/15 text-violet-600"
                          )}>
                            {row.soortPlaatsing}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-foreground tabular-nums">
                          {value > 0 ? `€${value.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            row.potMarge === "Actief" ? "bg-success/15 text-success" :
                            row.potMarge === "Afgerond" ? "bg-muted text-muted-foreground" :
                            "bg-destructive/15 text-destructive"
                          )}>
                            {row.potMarge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        /* Single table */
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Kandidaat</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Klant</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Soort</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Gefactureerd</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Pot. marge</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-2 px-3 font-medium text-foreground">{row.kandidaat}</td>
                  <td className="py-2 px-3 text-muted-foreground">{row.klant}</td>
                  <td className="py-2 px-3">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      row.soortPlaatsing === "Detavast" ? "bg-primary/15 text-primary" :
                      row.soortPlaatsing === "W&S" ? "bg-amber-500/15 text-amber-600" :
                      "bg-violet-500/15 text-violet-600"
                    )}>
                      {row.soortPlaatsing}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-foreground tabular-nums">€{row.omzet.toLocaleString()}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      row.potMarge === "Actief" ? "bg-success/15 text-success" :
                      row.potMarge === "Afgerond" ? "bg-muted text-muted-foreground" :
                      "bg-destructive/15 text-destructive"
                    )}>
                      {row.potMarge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───
interface RevenueChartProps {
  delay?: number;
}

export function RevenueChart({ delay = 0 }: RevenueChartProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <WatZieIkHier
        what="Je omzet per periode (gefactureerd) en de prognose voor de rest van het jaar, vergeleken met drie carrièrepaden: minimum-norm, fast lane en executive."
        insight="Je ziet welk pad je nu volgt en hoeveel je extra moet binnenhalen om naar het volgende niveau te groeien."
      />
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Omzet Overzicht</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Facturatie per kandidaat" : "Historisch vs. Geprojecteerd"}
            </p>
          </div>
          <Button
            variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
            title={displayMode ? "Toon overzicht" : "Toon details"}
          >
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className={cn(
          "transition-all duration-400 ease-in-out",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? <DetailedView delay={delay} /> : <OverviewView delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { CohortChart } from "@/components/groeimodel/CohortChart";
import { ConsultantTimelineRow } from "@/components/groeimodel/ConsultantTimelineRow";
import { BreakEvenHistogram } from "@/components/groeimodel/BreakEvenHistogram";
import { ActivityRevenueChart } from "@/components/groeimodel/ActivityRevenueChart";
import {
  lifecyclesWithBreakEven,
  getStartupCostByUnit,
  formatEuro,
  getAvailableCohortYears,
  monthToPeriod,
} from "@/data/groeimodelData";
import { departments } from "@/data/adminData";
import {
  Sprout,
  Clock,
  TrendingUp,
  Coins,
  Filter as FilterIcon,
  ChevronDown,
  CalendarRange,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Cell, LabelList } from "recharts";
import { DevNote } from "@/components/groeimodel/DevNote";
import { FilterSummary } from "@/components/groeimodel/FilterSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type StatusFilter = "all" | "active" | "terminated";

export default function Groeimodel() {
  const [filterUnits, setFilterUnits] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [filterPeriodRange, setFilterPeriodRange] = useState<[number, number]>([1, 13]);
  const [periodOpen, setPeriodOpen] = useState(false);

  // Sortable table state
  type SortKey = "name" | "unit" | "start" | "startup" | "be" | "profit";
  const [sortKey, setSortKey] = useState<SortKey>("startup");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allUnits = departments.map((d) => d.name);
  const allYears = useMemo(() => getAvailableCohortYears(), []);

  const filteredRows = useMemo(() => {
    return lifecyclesWithBreakEven.filter(({ lifecycle }) => {
      if (filterUnits.length > 0 && !filterUnits.includes(lifecycle.unit)) return false;
      if (statusFilter === "active" && lifecycle.endDate) return false;
      if (statusFilter === "terminated" && !lifecycle.endDate) return false;
      if (filterYears.length > 0 && !filterYears.includes(lifecycle.startDate.getFullYear())) return false;
      const p = monthToPeriod(lifecycle.startDate.getMonth());
      if (p < filterPeriodRange[0] || p > filterPeriodRange[1]) return false;
      return true;
    });
  }, [filterUnits, statusFilter, filterYears, filterPeriodRange]);

  // KPIs derived from filtered set
  const totalStartup = useMemo(
    () => filteredRows.reduce((s, x) => s + x.result.startupCost, 0),
    [filteredRows],
  );
  const avgBreakEven = useMemo(() => {
    const reached = filteredRows.filter((x) => x.result.breakEvenMonth !== null);
    if (!reached.length) return 0;
    return Math.round(reached.reduce((s, x) => s + (x.result.breakEvenMonth as number), 0) / reached.length);
  }, [filteredRows]);
  const activeStartup = useMemo(
    () => filteredRows.filter((x) => !x.lifecycle.endDate && x.result.breakEvenMonth === null).length,
    [filteredRows],
  );
  const breakEvenSpread = useMemo(() => {
    const reached = filteredRows
      .filter((x) => x.result.breakEvenMonth !== null)
      .map((x) => x.result.breakEvenMonth as number);
    if (!reached.length) return null;
    return { min: Math.min(...reached), max: Math.max(...reached) };
  }, [filteredRows]);
  const totalProfitSinceBE = useMemo(
    () => filteredRows.reduce((s, x) => s + Math.max(0, x.result.profitSinceBreakEven), 0),
    [filteredRows],
  );
  const roi = useMemo(() => {
    return totalStartup > 0 ? totalProfitSinceBE / totalStartup : 0;
  }, [totalProfitSinceBE, totalStartup]);

  const startupByUnit = getStartupCostByUnit();

  const toggleUnit = (u: string) => {
    setFilterUnits((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));
  };
  const toggleYear = (y: number) => {
    setFilterYears((prev) => (prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]));
  };

  const resetAllFilters = () => {
    setFilterUnits([]);
    setStatusFilter("all");
    setFilterYears([]);
    setFilterPeriodRange([1, 13]);
  };

  const activeFilterCount =
    (filterUnits.length > 0 ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (filterYears.length > 0 ? 1 : 0) +
    (!(filterPeriodRange[0] === 1 && filterPeriodRange[1] === 13) ? 1 : 0);

  const periodIsDefault = filterPeriodRange[0] === 1 && filterPeriodRange[1] === 13;

  // Sort the filtered rows
  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.lifecycle.name.localeCompare(b.lifecycle.name) * dir;
        case "unit":
          return a.lifecycle.unit.localeCompare(b.lifecycle.unit) * dir;
        case "start":
          return (a.lifecycle.startDate.getTime() - b.lifecycle.startDate.getTime()) * dir;
        case "startup":
          return (a.result.startupCost - b.result.startupCost) * dir;
        case "be": {
          const av = a.result.breakEvenMonth ?? Number.POSITIVE_INFINITY;
          const bv = b.result.breakEvenMonth ?? Number.POSITIVE_INFINITY;
          return (av - bv) * dir;
        }
        case "profit":
          return (a.result.profitSinceBreakEven - b.result.profitSinceBreakEven) * dir;
      }
    });
    return arr;
  }, [filteredRows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "unit" ? "asc" : "desc");
    }
  };

  const SortHeader = ({ label, k, align = "left" }: { label: string; k: SortKey; align?: "left" | "right" }) => (
    <button
      type="button"
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 font-medium uppercase tracking-wider hover:text-foreground transition-colors ${
        align === "right" ? "ml-auto" : ""
      }`}
    >
      {label}
      {sortKey === k ? (
        sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      )}
    </button>
  );

  const filterProps = {
    years: filterYears,
    periodRange: filterPeriodRange,
    units: filterUnits,
    status: statusFilter,
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Synsel Groeimodel</h1>
            <Badge variant="outline" className="text-xs">C-Level</Badge>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            Financiële levenscyclus van het sales consultant personeelsbestand: startdatum, opstartkosten, break-even en winstgevende fase.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={unitsOpen} onOpenChange={setUnitsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FilterIcon className="w-4 h-4" />
                Unit{filterUnits.length > 0 ? ` (${filterUnits.length})` : ""}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Units</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setFilterUnits(allUnits)}>Alles aan</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setFilterUnits([])}>Uit</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                {allUnits.map((u) => (
                  <label key={u} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={filterUnits.includes(u)} onCheckedChange={() => toggleUnit(u)} />
                    {u}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Combined Period (Year + P-range) filter */}
          <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarRange className="w-4 h-4" />
                {(() => {
                  const hasYears = filterYears.length > 0;
                  const hasRange = !(filterPeriodRange[0] === 1 && filterPeriodRange[1] === 13);
                  if (!hasYears && !hasRange) return "Periode";
                  const sortedYears = [...filterYears].sort((a, b) => a - b);
                  const yearLabel = hasYears
                    ? sortedYears.length <= 2
                      ? sortedYears.join(", ")
                      : `${sortedYears.slice(0, 2).join(", ")} +${sortedYears.length - 2}`
                    : "";
                  const rangeLabel = hasRange ? `P${filterPeriodRange[0]}–P${filterPeriodRange[1]}` : "";
                  if (hasYears && hasRange) return `${yearLabel} · ${rangeLabel}`;
                  return yearLabel || rangeLabel;
                })()}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              {/* Section 1 — Years */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Jaar</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setFilterYears(allYears)}>Alles aan</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setFilterYears([])}>Uit</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {allYears.map((y) => (
                  <label key={y} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={filterYears.includes(y)} onCheckedChange={() => toggleYear(y)} />
                    {y}
                  </label>
                ))}
              </div>

              <div className="my-3 h-px bg-border" />

              {/* Section 2 — Period range */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Periode (P1–P13)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  disabled={periodIsDefault}
                  onClick={() => setFilterPeriodRange([1, 13])}
                >
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-muted-foreground mb-1">Van</div>
                  <Select
                    value={String(filterPeriodRange[0])}
                    onValueChange={(v) =>
                      setFilterPeriodRange(([_, hi]) => {
                        const lo = Number(v);
                        return [lo, Math.max(lo, hi)];
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 1).map((p) => (
                        <SelectItem key={p} value={String(p)}>P{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-muted-foreground mb-1">Tot</div>
                  <Select
                    value={String(filterPeriodRange[1])}
                    onValueChange={(v) =>
                      setFilterPeriodRange(([lo, _]) => {
                        const hi = Number(v);
                        return [Math.min(lo, hi), hi];
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 1).map((p) => (
                        <SelectItem key={p} value={String(p)}>P{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
                Filtert consultants die in deze periode binnen de gekozen jaren zijn gestart.
              </p>
            </PopoverContent>
          </Popover>

          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["all", "active", "terminated"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  statusFilter === s ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "all" ? "Alles" : s === "active" ? "Actief" : "Uit dienst"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard delay={0}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Totaal geïnvesteerd in opstart</CardDescription>
                <Coins className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatEuro(totalStartup)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cumulatieve verliezen tot break-even
              </p>
              <FilterSummary {...filterProps} className="mt-2" />
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to see the total cumulative loss generated by all consultants before they reached break-even, <strong>so that</strong> I can quantify how much capital the company invests in ramping up new sales hires.</>}
                logic={`Cost basis per consultant per month:

   Monthly cost  =  Gross salary  ×  Employer load
                 =  €3.276,49     ×  1,30   ≈  €4.260

For every consultant, take the deepest dip below zero of their
running balance — that is the money the company had to front
before that person became profitable.

   Startup cost (per consultant)  =  | lowest point of balance |

Then sum it across the filtered cohort:

                                 ┌──────────────────────────────┐
   Total startup investment  =  │  Σ  Startup cost              │
                                 │     (filtered consultants)    │
                                 └──────────────────────────────┘

Filter scope: Year + Period (P1–P13) on start date, Unit, Status.`}
              />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={80}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Gem. tijd tot break-even</CardDescription>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgBreakEven} <span className="text-base font-normal text-muted-foreground">periodes</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {breakEvenSpread
                  ? `Spreiding P${breakEvenSpread.min} – P${breakEvenSpread.max}`
                  : "Nog geen consultants in deze selectie hebben break-even bereikt"}
              </p>
              <FilterSummary {...filterProps} className="mt-2" />
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to see the average number of months a consultant needs to become profitable, <strong>so that</strong> I can set realistic ramp-up expectations and benchmark recruitment & onboarding effectiveness over time.</>}
                logic={`Margin model: each consultant follows an S-curve ramp-up
with seeded noise (±25%) and occasional dips (−40%) — by design
the average consultant reaches ~€150k cumulative margin in
12–18 months ("met horten en stoten").

Only look at consultants who have ALREADY crossed break-even.
For each of them, count the months between their start date
and the month their running balance first hit zero.

                       Sum of months-to-break-even
   Average  =  ─────────────────────────────────────────
                Number of consultants who broke even

Consultants still in startup, or who left the company before
breaking even, are NOT included in this average.`}
              />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={160}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>In opstartfase</CardDescription>
                <Sprout className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">{activeStartup}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Actieve consultants nog vóór break-even
              </p>
              <FilterSummary {...filterProps} className="mt-2" />
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to see how many active consultants have not yet reached break-even, <strong>so that</strong> I understand the size of the open investment position and how much margin pressure exists from non-profitable hires.</>}
                logic={`Count a consultant if BOTH conditions are true:

   ┌─ 1. Still employed         (no end date)
   │
   └─ 2. Current balance < 0    (not yet broken even)

   In startup phase  =  COUNT( consultants where 1 AND 2 )

If either is false (already profitable, or already left the
company), the consultant is excluded.`}
              />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={240}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>ROI cohort</CardDescription>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 cursor-help">
                      <span className="text-2xl font-bold text-success">{roi.toFixed(2)}×</span>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                    <div className="font-semibold mb-1">ROI berekening</div>
                    <div>
                      {roi.toFixed(2)}× = <span className="font-medium">{formatEuro(totalProfitSinceBE)}</span> winst
                      sinds break-even / <span className="font-medium">{formatEuro(totalStartup)}</span> opstartinvestering.
                    </div>
                    <div className="mt-1.5 text-muted-foreground">
                      Let op: telt alleen niet-geamortiseerde opstartkosten van consultants in deze selectie.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground mt-1">
                Winst na break-even / opstartinvestering
              </p>
              <FilterSummary {...filterProps} className="mt-2" />
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to see the multiple of return that the consultant cohort generated relative to the capital invested in their startup phase, <strong>so that</strong> I can judge whether our hiring + ramp-up model is financially healthy at portfolio level.</>}
                logic={`Compare what the team has earned AFTER break-even against
what we invested BEFORE break-even.

                Total profit earned after break-even
   ROI  =  ───────────────────────────────────────────
                Total money invested during startup

Reading the result:

   ROI = 1.00×   →   we just made our money back
   ROI = 2.00×   →   every €1 invested earned €2 of profit
   ROI < 1.00×   →   the cohort hasn't paid itself back yet`}
              />
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Cohort chart */}
      <AnimatedCard delay={320}>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Tijd tot Break-Even</CardTitle>
                <CardDescription>
                  Cumulatieve marge minus kosten per consultant. Onder de nullijn = opstartfase, boven = winstgevend.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-destructive/20" /> Opstart
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-primary/20" /> Winstgevend
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CohortChart
              filterUnits={filterUnits}
              filterStatus={statusFilter}
              filterYears={filterYears}
              filterPeriodRange={filterPeriodRange}
            />
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Timeline table */}
      <AnimatedCard delay={400}>
        <Card>
          <CardHeader>
            <CardTitle>Per consultant</CardTitle>
            <CardDescription>
              {filteredRows.length} consultant{filteredRows.length === 1 ? "" : "s"} — gesorteerd op{" "}
              {{
                name: "naam",
                unit: "unit",
                start: "startdatum",
                startup: "opstartkosten",
                be: "break-even periode",
                profit: "winst sindsdien",
              }[sortKey]}{" "}
              ({sortDir === "asc" ? "oplopend" : "aflopend"})
            </CardDescription>
            <FilterSummary {...filterProps} className="mt-1" />
          </CardHeader>
          <CardContent className="p-0">
            {sortedRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <FilterIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium mb-1">Geen consultants in deze selectie</div>
                <div className="text-xs text-muted-foreground mb-3">
                  Pas de filters aan of zet ze terug naar de standaardwaarden.
                </div>
                {activeFilterCount > 0 && (
                  <Button variant="link" size="sm" onClick={resetAllFilters} className="h-auto p-0 text-primary">
                    Reset filters ({activeFilterCount})
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/40 border-y border-border">
                    <tr className="text-xs text-muted-foreground">
                      <th className="px-4 py-2 text-left"><SortHeader label="Consultant" k="name" /></th>
                      <th className="px-4 py-2 text-left"><SortHeader label="Unit" k="unit" /></th>
                      <th className="px-4 py-2 text-left"><SortHeader label="Startdatum" k="start" /></th>
                      <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">Verloop</th>
                      <th className="px-4 py-2 text-left"><SortHeader label="Opstartkosten" k="startup" /></th>
                      <th className="px-4 py-2 text-left"><SortHeader label="Break-even" k="be" /></th>
                      <th className="px-4 py-2 text-left font-medium uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left"><SortHeader label="Winst sindsdien" k="profit" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map(({ lifecycle, result }) => (
                      <ConsultantTimelineRow key={lifecycle.id} lifecycle={lifecycle} result={result} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 pb-4">
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to inspect each consultant's lifecycle in a single row — start/end dates, a sparkline of their cumulative balance, total startup cost, the month they reached break-even, current status, and post break-even profit — <strong>so that</strong> I can quickly spot outliers, slow ramp-ups, and high-ROI hires worth replicating.</>}
                logic={`One row per consultant, sorted by highest startup cost first.

   Sparkline       =  running balance over time, INCLUDING the
                      post-exit residual decline for terminated
                      consultants (mirror of the rise, fades to 0)
   Startup cost    =  | lowest point of that balance |
                      (cost basis = €3.276,49 × 1,30 employer load)
   Break-even      =  the first month where balance ≥ 0
   Profit since    =  balance today  −  0   (only counted after
                      break-even was reached)

   Status traffic light:
      ● terminated   →  consultant has an end date (rode exit-marker
                        + dashed segment in cohortgrafiek)
      ● profitable   →  has reached break-even, still employed
      ● startup      →  still employed, balance still < 0`}
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Bottom detail tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedCard delay={480}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opstartkosten per unit</CardTitle>
              <CardDescription>Gemiddelde investering tot break-even</CardDescription>
              <FilterSummary {...filterProps} className="mt-1" />
            </CardHeader>
            <CardContent>
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={startupByUnit} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatEuro(v)} />
                    <RTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(v: number, _n, item: any) => {
                        const n = item?.payload?.count ?? 0;
                        return [`${formatEuro(v)} · n=${n}`, item?.payload?.name ?? "Gem. opstart"];
                      }}
                    />
                    <Bar dataKey="avgStartup" radius={[4, 4, 0, 0]}>
                      {startupByUnit.map((u, i) => (
                        <Cell key={i} fill={u.color} />
                      ))}
                      <LabelList
                        dataKey="avgStartup"
                        position="top"
                        formatter={(v: number) => formatEuro(v)}
                        style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to compare the average startup investment per business unit, <strong>so that</strong> I can see which units are most expensive to scale and where ramp-up improvements have the largest financial impact.</>}
                logic={`Group every consultant by their unit, then take the average
startup cost within that group:

                                  Sum of startup costs in unit
   Avg. startup (per unit)  =  ──────────────────────────────────
                                  Number of consultants in unit

Each bar = one unit. Bar height = the average above.
Bar color follows the unit's brand color, so units stay
visually consistent across the dashboard.`}
              />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={560}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Break-even verdeling</CardTitle>
              <CardDescription>Aantal consultants per break-even venster</CardDescription>
            </CardHeader>
            <CardContent>
              <BreakEvenHistogram
                filterUnits={filterUnits}
                filterStatus={statusFilter}
                filterYears={filterYears}
                filterPeriodRange={filterPeriodRange}
              />
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Activity & Revenue per Period — full width */}
      <AnimatedCard delay={640}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actieve consultants &amp; Omzet per periode</CardTitle>
            <CardDescription>
              Per periode in de geselecteerde tijdspanne — links aantal actieve consultants, rechts totale gerealiseerde omzet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityRevenueChart
              filterUnits={filterUnits}
              statusFilter={statusFilter}
              filterYears={filterYears}
              filterPeriodRange={filterPeriodRange}
            />
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  );
}

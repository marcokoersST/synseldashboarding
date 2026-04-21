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
import {
  lifecyclesWithBreakEven,
  getStartupCostByUnit,
  formatEuro,
  getAvailableCohortYears,
  monthToPeriod,
} from "@/data/groeimodelData";
import { departments } from "@/data/adminData";
import { Sprout, Clock, TrendingUp, Coins, Filter as FilterIcon, ChevronDown, CalendarRange } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { DevNote } from "@/components/groeimodel/DevNote";
import { FilterSummary } from "@/components/groeimodel/FilterSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StatusFilter = "all" | "active" | "terminated";

export default function Groeimodel() {
  const [filterUnits, setFilterUnits] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [yearsOpen, setYearsOpen] = useState(false);
  const [filterPeriodRange, setFilterPeriodRange] = useState<[number, number]>([1, 13]);
  const [periodOpen, setPeriodOpen] = useState(false);

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
  const roi = useMemo(() => {
    const totalProfit = filteredRows.reduce((s, x) => s + Math.max(0, x.result.profitSinceBreakEven), 0);
    return totalStartup > 0 ? totalProfit / totalStartup : 0;
  }, [filteredRows, totalStartup]);

  const startupByUnit = getStartupCostByUnit();

  const toggleUnit = (u: string) => {
    setFilterUnits((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));
  };
  const toggleYear = (y: number) => {
    setFilterYears((prev) => (prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]));
  };

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
        <div className="flex items-center gap-2">
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

          {/* Year filter */}
          <Popover open={yearsOpen} onOpenChange={setYearsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarRange className="w-4 h-4" />
                Jaar{filterYears.length > 0 ? ` (${filterYears.length})` : ""}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44" align="end">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Cohort jaar</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setFilterYears(allYears)}>Alles aan</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setFilterYears([])}>Uit</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                {allYears.map((y) => (
                  <label key={y} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={filterYears.includes(y)} onCheckedChange={() => toggleYear(y)} />
                    {y}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Period range */}
          <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarRange className="w-4 h-4" />
                {filterPeriodRange[0] === 1 && filterPeriodRange[1] === 13
                  ? "Periode"
                  : `P${filterPeriodRange[0]}–P${filterPeriodRange[1]}`}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Periode-range (P1–P13)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
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
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to see the total cumulative loss generated by all consultants before they reached break-even, <strong>so that</strong> I can quantify how much capital the company invests in ramping up new sales hires.</>}
                logic={`For every consultant, take the deepest dip below zero of their
running balance — that is the money the company had to front
before that person became profitable.

   Startup cost (per consultant)  =  | lowest point of balance |

Then sum it across the whole sales team:

                                ┌──────────────────────────────┐
   Total startup investment  =  │  Σ  Startup cost              │
                                │     (all consultants)         │
                                └──────────────────────────────┘`}
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
              <div className="text-2xl font-bold">{avgBreakEven} <span className="text-base font-normal text-muted-foreground">maanden</span></div>
              <p className="text-xs text-muted-foreground mt-1">
                Over alle consultants die break-even hebben bereikt
              </p>
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to see the average number of months a consultant needs to become profitable, <strong>so that</strong> I can set realistic ramp-up expectations and benchmark recruitment & onboarding effectiveness over time.</>}
                logic={`Only look at consultants who have ALREADY crossed break-even.
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
              <div className="text-2xl font-bold text-success">{roi.toFixed(2)}×</div>
              <p className="text-xs text-muted-foreground mt-1">
                Winst na break-even / opstartinvestering
              </p>
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
            <CardDescription>{filteredRows.length} consultants — gesorteerd op opstartkosten</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 border-y border-border">
                  <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-2 text-left font-medium">Consultant</th>
                    <th className="px-4 py-2 text-left font-medium">Unit</th>
                    <th className="px-4 py-2 text-left font-medium">Periode</th>
                    <th className="px-4 py-2 text-left font-medium">Verloop</th>
                    <th className="px-4 py-2 text-left font-medium">Opstartkosten</th>
                    <th className="px-4 py-2 text-left font-medium">Break-even</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Winst sindsdien</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredRows]
                    .sort((a, b) => b.result.startupCost - a.result.startupCost)
                    .map(({ lifecycle, result }) => (
                      <ConsultantTimelineRow key={lifecycle.id} lifecycle={lifecycle} result={result} />
                    ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <DevNote
                story={<><strong>As a user (C-level)</strong>, I want to inspect each consultant's lifecycle in a single row — start/end dates, a sparkline of their cumulative balance, total startup cost, the month they reached break-even, current status, and post break-even profit — <strong>so that</strong> I can quickly spot outliers, slow ramp-ups, and high-ROI hires worth replicating.</>}
                logic={`One row per consultant, sorted by highest startup cost first.

   Sparkline       =  the consultant's running balance over time
   Startup cost    =  | lowest point of that balance |
   Break-even      =  the first month where balance ≥ 0
   Profit since    =  balance today  −  0   (only counted after
                      break-even was reached)

   Status traffic light:
      ● terminated   →  consultant has an end date
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
            </CardHeader>
            <CardContent>
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={startupByUnit} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatEuro(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(v: number) => [formatEuro(v), "Gem. opstart"]}
                    />
                    <Bar dataKey="avgStartup" radius={[4, 4, 0, 0]}>
                      {startupByUnit.map((u, i) => (
                        <Cell key={i} fill={u.color} />
                      ))}
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
    </div>
  );
}

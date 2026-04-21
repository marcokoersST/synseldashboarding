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
  getTotalStartupInvestment,
  getAverageBreakEvenMonths,
  getActiveStartupCount,
  getCohortROI,
  getStartupCostByUnit,
  formatEuro,
} from "@/data/groeimodelData";
import { departments } from "@/data/adminData";
import { Sprout, Clock, TrendingUp, Coins, Filter as FilterIcon, ChevronDown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { DevNote } from "@/components/groeimodel/DevNote";

type StatusFilter = "all" | "active" | "terminated";

export default function Groeimodel() {
  const [filterUnits, setFilterUnits] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [unitsOpen, setUnitsOpen] = useState(false);

  const allUnits = departments.map((d) => d.name);

  const totalStartup = getTotalStartupInvestment();
  const avgBreakEven = getAverageBreakEvenMonths();
  const activeStartup = getActiveStartupCount();
  const roi = getCohortROI();

  const filteredRows = useMemo(() => {
    return lifecyclesWithBreakEven.filter(({ lifecycle }) => {
      if (filterUnits.length > 0 && !filterUnits.includes(lifecycle.unit)) return false;
      if (statusFilter === "active" && lifecycle.endDate) return false;
      if (statusFilter === "terminated" && !lifecycle.endDate) return false;
      return true;
    });
  }, [filterUnits, statusFilter]);

  const startupByUnit = getStartupCostByUnit();

  const toggleUnit = (u: string) => {
    setFilterUnits((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));
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
            <CohortChart filterUnits={filterUnits} filterStatus={statusFilter} />
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
              <BreakEvenHistogram />
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}

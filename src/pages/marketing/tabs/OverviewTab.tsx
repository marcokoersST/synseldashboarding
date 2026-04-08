import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, ArrowRight, Filter, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import {
  paidChannelData,
  jobboardData,
  paidSocialData,
  adLevelData,
  reverseMatchingSteps,
  totals,
  formatCurrency,
  previousPeriodValue,
  deltaPercent,
  aggregatePaidChannels,
} from "@/data/marketingHubData";
import {
  inflowSourceData,
  inflowConsultantData,
  inflowHeractiveringen,
  aggregateByUnit,
} from "@/data/marketingInflowData";
import type { DateRange } from "react-day-picker";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  onTabChange: (tab: any) => void;
}

function DeltaBadge({ current, previous, invert }: { current: number; previous: number; invert?: boolean }) {
  const d = deltaPercent(current, previous);
  if (d === null) return null;
  const isPositive = invert ? d < 0 : d > 0;
  return (
    <div className={cn("flex items-center gap-1 mt-1 text-xs", isPositive ? "text-emerald-600" : "text-red-500")}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{d > 0 ? "+" : ""}{d.toFixed(1)}%</span>
      <span className="text-muted-foreground ml-1">vs vorige periode</span>
    </div>
  );
}

const OverviewTab = ({ dateRange, compareRange, onTabChange }: Props) => {
  // KPIs
  const kpis = useMemo(() => {
    const pc = totals(paidChannelData);
    const jb = totals(jobboardData);
    const ps = totals(paidSocialData);
    const totalConversions = pc.conversions + jb.conversions + ps.conversions;
    const totalRegistrations = pc.registrations + jb.registrations + ps.registrations;
    const totalSpend = pc.spend + jb.spend + ps.spend;
    const cpr = totalRegistrations > 0 ? totalSpend / totalRegistrations : 0;
    const rmVolume = reverseMatchingSteps[0]?.volume ?? 0;
    return [
      { label: "Conversions", value: totalConversions, previous: previousPeriodValue(totalConversions), tab: "paid-channels" },
      { label: "Registrations", value: totalRegistrations, previous: previousPeriodValue(totalRegistrations), tab: "paid-channels" },
      { label: "Cost per Registration", value: cpr, previous: previousPeriodValue(Math.round(cpr)), format: "currency" as const, tab: "paid-channels", invertDelta: true },
      { label: "Reverse Matching", value: rmVolume, previous: previousPeriodValue(rmVolume), tab: "reverse-matching" },
    ];
  }, []);

  // Fastest rising CPR
  const fastestRisingCPR = useMemo(() => {
    const agg = aggregatePaidChannels(paidChannelData);
    let worst = { source: "-", currentCpr: 0, previousCpr: 0, rise: 0 };
    for (const row of agg) {
      const currentCpr = row.registrations > 0 ? row.spend / row.registrations : 0;
      const previousCpr = previousPeriodValue(Math.round(currentCpr));
      const rise = previousCpr > 0 ? ((currentCpr - previousCpr) / previousCpr) * 100 : 0;
      if (rise > worst.rise) worst = { source: row.source, currentCpr, previousCpr, rise };
    }
    return worst;
  }, []);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const pc = totals(paidChannelData);
    const jb = totals(jobboardData);
    const ps = totals(paidSocialData);
    const inflowTotals = inflowSourceData.reduce((acc, s) => ({
      inschrijvingen: acc.inschrijvingen + s.inschrijvingen,
      acquisitie: acc.acquisitie + s.acquisitie,
    }), { inschrijvingen: 0, acquisitie: 0 });
    return [
      { label: "Inflow", registrations: inflowTotals.inschrijvingen, conversions: inflowTotals.acquisitie, spend: 0, tab: "inflow" },
      { label: "Paid Channels", registrations: pc.registrations, conversions: pc.conversions, spend: pc.spend, tab: "paid-channels" },
      { label: "Jobboards", registrations: jb.registrations, conversions: jb.conversions, spend: jb.spend, tab: "jobboards" },
      { label: "Paid Social", registrations: ps.registrations, conversions: ps.conversions, spend: ps.spend, tab: "paid-social" },
    ];
  }, []);

  // Inflow data for inline display
  const allUnits = useMemo(() => {
    const set = new Set(inflowConsultantData.map((c) => c.unit));
    return Array.from(set).sort();
  }, []);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set(allUnits));

  const filteredConsultants = useMemo(
    () => inflowConsultantData.filter((c) => selectedUnits.has(c.unit)),
    [selectedUnits]
  );
  const consultantTotals = useMemo(() => filteredConsultants.reduce(
    (acc, c) => ({ inschrijvingen: acc.inschrijvingen + c.inschrijvingen, acquisitie: acc.acquisitie + c.acquisitie, prevInschrijvingen: acc.prevInschrijvingen + c.prevInschrijvingen, prevAcquisitie: acc.prevAcquisitie + c.prevAcquisitie }),
    { inschrijvingen: 0, acquisitie: 0, prevInschrijvingen: 0, prevAcquisitie: 0 }
  ), [filteredConsultants]);
  const sourceTotals = useMemo(() => inflowSourceData.reduce((acc, s) => ({ inschrijvingen: acc.inschrijvingen + s.inschrijvingen, acquisitie: acc.acquisitie + s.acquisitie }), { inschrijvingen: 0, acquisitie: 0 }), []);
  const unitChartData = useMemo(() => aggregateByUnit(filteredConsultants), [filteredConsultants]);

  // Unit distribution
  const unitDistribution = useMemo(() => {
    const allData = [...paidChannelData, ...jobboardData, ...paidSocialData];
    const units = new Map<string, { registrations: number; conversions: number }>();
    for (const row of allData) {
      const existing = units.get(row.unit) || { registrations: 0, conversions: 0 };
      existing.registrations += row.registrations;
      existing.conversions += row.conversions;
      units.set(row.unit, existing);
    }
    return Array.from(units.entries()).map(([unit, vals]) => ({ unit, ...vals }));
  }, []);

  const highlights = useMemo(() => {
    const sources = new Map<string, number>();
    for (const row of paidChannelData) {
      sources.set(row.source, (sources.get(row.source) || 0) + row.registrations);
    }
    const sorted = Array.from(sources.entries()).sort((a, b) => b[1] - a[1]);
    return {
      bestSource: sorted[0]?.[0] ?? "-",
      bestSourceVolume: sorted[0]?.[1] ?? 0,
      lowestCPR: "Indeed",
    };
  }, []);

  const unitFilterLabel = selectedUnits.size === allUnits.length
    ? "Alle units"
    : selectedUnits.size === 0
      ? "Geen units"
      : `${selectedUnits.size} unit${selectedUnits.size > 1 ? "s" : ""}`;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange(kpi.tab)}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {kpi.format === "currency" ? formatCurrency(Math.round(kpi.value)) : kpi.value.toLocaleString("nl-NL")}
              </p>
              <DeltaBadge current={kpi.value} previous={kpi.previous} invert={kpi.invertDelta} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inflow section with unit filter */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">Inflow</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <Filter className="mr-1.5 h-3 w-3" />{unitFilterLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Units</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedUnits(new Set(allUnits))}>Alles aan</Button>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedUnits(new Set())}>Alles uit</Button>
              </div>
            </div>
            <div className="space-y-2">
              {allUnits.map((unit) => (
                <label key={unit} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox checked={selectedUnits.has(unit)} onCheckedChange={() => {
                    setSelectedUnits(prev => { const n = new Set(prev); n.has(unit) ? n.delete(unit) : n.add(unit); return n; });
                  }} />
                  {unit}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Inflow scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Inschrijvingen</p>
            <p className="text-2xl font-bold">{consultantTotals.inschrijvingen}</p>
            <DeltaBadge current={consultantTotals.inschrijvingen} previous={consultantTotals.prevInschrijvingen} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Heractiveringen</p>
            <p className="text-2xl font-bold">{inflowHeractiveringen.current}</p>
            <DeltaBadge current={inflowHeractiveringen.current} previous={inflowHeractiveringen.previous} />
          </CardContent>
        </Card>
      </div>

      {/* Inflow tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="pb-3"><CardTitle className="text-base">Per Bron</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[300px] overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-left font-medium text-muted-foreground">Bron</th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28">Inschrijvingen</th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28">Acquisitie</th>
                  </tr>
                </thead>
                <tbody>
                  {inflowSourceData.map((s) => (
                    <tr key={s.bron} className="border-b hover:bg-muted/50">
                      <td className="font-medium py-2 px-3">{s.bron}</td>
                      <td className="text-right tabular-nums py-2 px-3">{s.inschrijvingen}</td>
                      <td className="text-right tabular-nums py-2 px-3">{s.acquisitie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-muted/50 px-3 py-2 flex font-semibold text-sm">
              <span className="flex-1">Totaal</span>
              <span className="w-28 text-right tabular-nums">{sourceTotals.inschrijvingen}</span>
              <span className="w-28 text-right tabular-nums">{sourceTotals.acquisitie}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3"><CardTitle className="text-base">Per Consultant</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[300px] overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-left font-medium text-muted-foreground">Consultant</th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28">Inschrijvingen</th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28">Acquisitie</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsultants.map((c) => (
                    <tr key={c.consultant} className="border-b hover:bg-muted/50">
                      <td className="font-medium py-2 px-3">{c.consultant}</td>
                      <td className="text-right tabular-nums py-2 px-3">{c.inschrijvingen}</td>
                      <td className="text-right tabular-nums py-2 px-3">{c.acquisitie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-muted/50 px-3 py-2 flex font-semibold text-sm">
              <span className="flex-1">Totaal</span>
              <span className="w-28 text-right tabular-nums">{consultantTotals.inschrijvingen}</span>
              <span className="w-28 text-right tabular-nums">{consultantTotals.acquisitie}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inflow unit chart */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Inflow per Unit</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={unitChartData} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="unit" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="inschrijvingen" name="Inschrijvingen" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList dataKey="inschrijvingen" position="top" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </Bar>
              <Bar dataKey="acquisitie" name="Acquisitie" fill="hsl(var(--primary) / 0.5)" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList dataKey="acquisitie" position="top" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category breakdown + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Kanaal Overzicht</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => onTabChange(cat.tab)}>
                  <span className="font-medium text-sm">{cat.label}</span>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <span className="text-muted-foreground text-xs">Reg.</span>
                      <p className="font-semibold">{cat.registrations.toLocaleString("nl-NL")}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-xs">Conv.</span>
                      <p className="font-semibold">{cat.conversions.toLocaleString("nl-NL")}</p>
                    </div>
                    {cat.spend > 0 && (
                      <div className="text-right">
                        <span className="text-muted-foreground text-xs">Spend</span>
                        <p className="font-semibold">{formatCurrency(cat.spend)}</p>
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Highlights</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 rounded bg-emerald-500/10">
                <span className="text-muted-foreground">Best performing source</span>
                <span className="font-semibold text-emerald-700">{highlights.bestSource} ({highlights.bestSourceVolume})</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-blue-500/10">
                <span className="text-muted-foreground">Laagste CPR</span>
                <span className="font-semibold text-blue-700">{highlights.lowestCPR}</span>
              </div>
              <div
                className="flex justify-between items-center p-2 rounded bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors"
                onClick={() => onTabChange("paid-channels")}
              >
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  Snelst stijgende CPR
                </span>
                <span className="font-semibold text-red-700">
                  {fastestRisingCPR.source} (+{fastestRisingCPR.rise.toFixed(1)}%)
                  <ArrowRight className="inline h-3 w-3 ml-1" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit distribution */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Unit Verdeling (Marketing)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unitDistribution.map((u) => {
              const totalReg = unitDistribution.reduce((s, x) => s + x.registrations, 0);
              const pct = totalReg > 0 ? (u.registrations / totalReg) * 100 : 0;
              return (
                <div key={u.unit}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{u.unit}</span>
                    <span className="text-muted-foreground">{u.registrations} reg. / {u.conversions} conv.</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;

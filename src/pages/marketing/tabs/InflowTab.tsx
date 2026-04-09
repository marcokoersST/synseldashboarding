import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Filter, ArrowUpDown } from "lucide-react";
import { differenceInDays, subDays, format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatDateRangeLabel, getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
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
  deltaMode?: string;
}

interface ScorecardProps { title: string; current: number; previous: number; compareText: string; }

function Scorecard({ title, current, previous, compareText }: ScorecardProps) {
  const max = Math.max(current, previous, 1);
  const progressValue = (current / max) * 100;
  const delta = current - previous;
  const deltaPercent = previous > 0 ? ((delta / previous) * 100).toFixed(1) : "–";
  const isPositive = delta > 0;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{current}</div>
        <div className="mt-3 space-y-2">
          <Progress value={progressValue} className="h-2" />
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : delta < 0 ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn("font-medium", delta > 0 && "text-primary", delta < 0 && "text-destructive", delta === 0 && "text-muted-foreground")}>
              {delta > 0 ? "+" : ""}{delta} ({deltaPercent}%)
            </span>
            <span className="text-muted-foreground">{compareText} ({previous})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalFooter({ label, values }: { label: string; values: number[] }) {
  return (
    <div className="border-t bg-muted/50 px-3 py-2 flex font-semibold text-sm">
      <span className="flex-1">{label}</span>
      {values.map((v, i) => (
        <span key={i} className="w-28 text-right tabular-nums">{v}</span>
      ))}
    </div>
  );
}

type SortKey = "name" | "inschrijvingen" | "acquisitie";

const InflowTab = ({ dateRange, compareRange }: Props) => {
  const previousPeriod = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return null;
    const dayCount = differenceInDays(dateRange.to, dateRange.from) + 1;
    return { from: subDays(dateRange.from, dayCount), to: subDays(dateRange.from, 1) };
  }, [dateRange]);
  const compareText = getCompareDisplayText(compareRange);
  const activeCompareRange = compareRange ?? previousPeriod;

  const allUnits = useMemo(() => {
    const set = new Set(inflowConsultantData.map((c) => c.unit));
    return Array.from(set).sort();
  }, []);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set(allUnits));
  const [sourceSortKey, setSourceSortKey] = useState<SortKey>("inschrijvingen");
  const [sourceSortDir, setSourceSortDir] = useState<"asc" | "desc">("desc");
  const [consultantSortKey, setConsultantSortKey] = useState<SortKey>("inschrijvingen");
  const [consultantSortDir, setConsultantSortDir] = useState<"asc" | "desc">("desc");

  const toggleUnit = (unit: string) => {
    setSelectedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unit)) next.delete(unit); else next.add(unit);
      return next;
    });
  };

  const filteredConsultants = useMemo(
    () => inflowConsultantData.filter((c) => selectedUnits.has(c.unit)),
    [selectedUnits]
  );

  const sortedSources = useMemo(() => {
    const data = [...inflowSourceData];
    return data.sort((a, b) => {
      if (sourceSortKey === "name") return sourceSortDir === "asc" ? a.bron.localeCompare(b.bron) : b.bron.localeCompare(a.bron);
      return sourceSortDir === "asc" ? a[sourceSortKey] - b[sourceSortKey] : b[sourceSortKey] - a[sourceSortKey];
    });
  }, [sourceSortKey, sourceSortDir]);

  const sortedConsultants = useMemo(() => {
    const data = [...filteredConsultants];
    return data.sort((a, b) => {
      if (consultantSortKey === "name") return consultantSortDir === "asc" ? a.consultant.localeCompare(b.consultant) : b.consultant.localeCompare(a.consultant);
      return consultantSortDir === "asc" ? a[consultantSortKey] - b[consultantSortKey] : b[consultantSortKey] - a[consultantSortKey];
    });
  }, [filteredConsultants, consultantSortKey, consultantSortDir]);

  const consultantTotals = useMemo(() => {
    return filteredConsultants.reduce(
      (acc, c) => ({
        inschrijvingen: acc.inschrijvingen + c.inschrijvingen,
        acquisitie: acc.acquisitie + c.acquisitie,
        prevInschrijvingen: acc.prevInschrijvingen + c.prevInschrijvingen,
        prevAcquisitie: acc.prevAcquisitie + c.prevAcquisitie,
      }),
      { inschrijvingen: 0, acquisitie: 0, prevInschrijvingen: 0, prevAcquisitie: 0 }
    );
  }, [filteredConsultants]);

  const sourceTotals = useMemo(() => {
    return inflowSourceData.reduce(
      (acc, s) => ({ inschrijvingen: acc.inschrijvingen + s.inschrijvingen, acquisitie: acc.acquisitie + s.acquisitie }),
      { inschrijvingen: 0, acquisitie: 0 }
    );
  }, []);

  const unitChartData = useMemo(() => aggregateByUnit(filteredConsultants), [filteredConsultants]);
  const previousInschrijvingen = useMemo(
    () => getComparisonValue(consultantTotals.inschrijvingen, { dateRange, compareRange, seed: "inflow-registrations" }),
    [consultantTotals.inschrijvingen, dateRange, compareRange],
  );
  const previousHeractiveringen = useMemo(
    () => getComparisonValue(inflowHeractiveringen.current, { dateRange, compareRange, seed: "inflow-heractiveringen" }),
    [dateRange, compareRange],
  );

  const unitFilterLabel = selectedUnits.size === allUnits.length ? "Alle units" : selectedUnits.size === 0 ? "Geen units" : `${selectedUnits.size} unit${selectedUnits.size > 1 ? "s" : ""}`;

  const toggleSourceSort = (key: SortKey) => {
    if (sourceSortKey === key) setSourceSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSourceSortKey(key); setSourceSortDir("desc"); }
  };
  const toggleConsultantSort = (key: SortKey) => {
    if (consultantSortKey === key) setConsultantSortDir(d => d === "asc" ? "desc" : "asc");
    else { setConsultantSortKey(key); setConsultantSortDir("desc"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <Filter className="mr-2 h-4 w-4" />
              {unitFilterLabel}
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
                  <Checkbox checked={selectedUnits.has(unit)} onCheckedChange={() => toggleUnit(unit)} />
                  {unit}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {activeCompareRange && (
          <Badge variant="secondary" className="text-xs">
            vs {formatDateRangeLabel(activeCompareRange)}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Scorecard title="Inschrijvingen" current={consultantTotals.inschrijvingen} previous={previousInschrijvingen} compareText={compareText} />
        <Scorecard title="Heractiveringen" current={inflowHeractiveringen.current} previous={previousHeractiveringen} compareText={compareText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border flex flex-col">
          <CardHeader className="pb-3"><CardTitle className="text-base">Per Bron</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[400px] overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-left font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSourceSort("name")}>
                      <div className="flex items-center gap-1">Bron <ArrowUpDown className={`h-3 w-3 ${sourceSortKey === "name" ? "text-primary" : "text-muted-foreground"}`} /></div>
                    </th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28 cursor-pointer" onClick={() => toggleSourceSort("inschrijvingen")}>
                      <div className="flex items-center justify-end gap-1">Inschrijvingen <ArrowUpDown className={`h-3 w-3 ${sourceSortKey === "inschrijvingen" ? "text-primary" : "text-muted-foreground"}`} /></div>
                    </th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28 cursor-pointer" onClick={() => toggleSourceSort("acquisitie")}>
                      <div className="flex items-center justify-end gap-1">Acquisitie <ArrowUpDown className={`h-3 w-3 ${sourceSortKey === "acquisitie" ? "text-primary" : "text-muted-foreground"}`} /></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSources.map((s) => (
                    <tr key={s.bron} className="border-b hover:bg-muted/50">
                      <td className="font-medium py-2 px-3">{s.bron}</td>
                      <td className="text-right tabular-nums py-2 px-3 w-28">{s.inschrijvingen}</td>
                      <td className="text-right tabular-nums py-2 px-3 w-28">{s.acquisitie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TotalFooter label="Totaal" values={[sourceTotals.inschrijvingen, sourceTotals.acquisitie]} />
          </CardContent>
        </Card>

        <Card className="border border-border flex flex-col">
          <CardHeader className="pb-3"><CardTitle className="text-base">Per Consultant</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[400px] overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-left font-medium text-muted-foreground cursor-pointer" onClick={() => toggleConsultantSort("name")}>
                      <div className="flex items-center gap-1">Consultant <ArrowUpDown className={`h-3 w-3 ${consultantSortKey === "name" ? "text-primary" : "text-muted-foreground"}`} /></div>
                    </th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28 cursor-pointer" onClick={() => toggleConsultantSort("inschrijvingen")}>
                      <div className="flex items-center justify-end gap-1">Inschrijvingen <ArrowUpDown className={`h-3 w-3 ${consultantSortKey === "inschrijvingen" ? "text-primary" : "text-muted-foreground"}`} /></div>
                    </th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28 cursor-pointer" onClick={() => toggleConsultantSort("acquisitie")}>
                      <div className="flex items-center justify-end gap-1">Acquisitie <ArrowUpDown className={`h-3 w-3 ${consultantSortKey === "acquisitie" ? "text-primary" : "text-muted-foreground"}`} /></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedConsultants.map((c) => (
                    <tr key={c.consultant} className="border-b hover:bg-muted/50">
                      <td className="font-medium py-2 px-3">{c.consultant}</td>
                      <td className="text-right tabular-nums py-2 px-3 w-28">{c.inschrijvingen}</td>
                      <td className="text-right tabular-nums py-2 px-3 w-28">{c.acquisitie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TotalFooter label="Totaal" values={[consultantTotals.inschrijvingen, consultantTotals.acquisitie]} />
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3"><CardTitle className="text-base">Per Unit</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unitChartData} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="gradInschrijvingen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(175, 60%, 45%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(175, 60%, 55%)" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="gradAcquisitie" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(35, 80%, 55%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(35, 80%, 65%)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="unit" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--foreground))", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="inschrijvingen" name="Inschrijvingen" fill="url(#gradInschrijvingen)" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList dataKey="inschrijvingen" position="top" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </Bar>
              <Bar dataKey="acquisitie" name="Acquisitie" fill="url(#gradAcquisitie)" radius={[6, 6, 0, 0]} barSize={28}>
                <LabelList dataKey="acquisitie" position="top" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default InflowTab;

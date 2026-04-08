import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";
import { differenceInDays, subDays, format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import {
  inflowSourceData,
  inflowConsultantData,
  inflowHeractiveringen,
  aggregateByUnit,
} from "@/data/marketingInflowData";
import type { DateRange } from "react-day-picker";

interface Props { dateRange: DateRange; }

function getPreviousPeriod(range: DateRange): { from: Date; to: Date } | null {
  if (!range.from || !range.to) return null;
  const dayCount = differenceInDays(range.to, range.from) + 1;
  return { from: subDays(range.from, dayCount), to: subDays(range.from, 1) };
}

interface ScorecardProps { title: string; current: number; previous: number; }

function Scorecard({ title, current, previous }: ScorecardProps) {
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
            <span className="text-muted-foreground">vs vorige periode ({previous})</span>
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

const InflowTab = ({ dateRange }: Props) => {
  const previousPeriod = useMemo(() => getPreviousPeriod(dateRange), [dateRange]);

  const allUnits = useMemo(() => {
    const set = new Set(inflowConsultantData.map((c) => c.unit));
    return Array.from(set).sort();
  }, []);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set(allUnits));

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

  const unitFilterLabel = selectedUnits.size === allUnits.length
    ? "Alle units"
    : selectedUnits.size === 0
      ? "Geen units"
      : `${selectedUnits.size} unit${selectedUnits.size > 1 ? "s" : ""}`;

  return (
    <div className="space-y-6">
      {/* Filter */}
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

        {previousPeriod && (
          <Badge variant="secondary" className="text-xs">
            vs {format(previousPeriod.from, "d MMM", { locale: nl })} – {format(previousPeriod.to, "d MMM", { locale: nl })}
          </Badge>
        )}
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Scorecard title="Inschrijvingen" current={consultantTotals.inschrijvingen} previous={consultantTotals.prevInschrijvingen} />
        <Scorecard title="Heractiveringen" current={inflowHeractiveringen.current} previous={inflowHeractiveringen.previous} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border flex flex-col">
          <CardHeader className="pb-3"><CardTitle className="text-base">Per Bron</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[400px] overflow-auto flex-1">
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
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-left font-medium text-muted-foreground">Consultant</th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28">Inschrijvingen</th>
                    <th className="sticky top-0 bg-background z-10 py-2 px-3 text-right font-medium text-muted-foreground w-28">Acquisitie</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsultants.map((c) => (
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

      {/* Unit chart */}
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

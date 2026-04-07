import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";
import { format, startOfWeek, differenceInDays, subDays } from "date-fns";
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

function getDefaultRange(): DateRange {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  return { from: monday, to: today };
}

function formatPeriod(range: DateRange): string {
  if (!range.from) return "Selecteer periode";
  const from = format(range.from, "EEE d MMM", { locale: nl });
  const to = range.to ? format(range.to, "EEE d MMM yyyy", { locale: nl }) : "";
  return `${from} – ${to}`;
}

function getPreviousPeriod(range: DateRange): { from: Date; to: Date } | null {
  if (!range.from || !range.to) return null;
  const dayCount = differenceInDays(range.to, range.from) + 1;
  return {
    from: subDays(range.from, dayCount),
    to: subDays(range.from, 1),
  };
}

// ─── Scorecard ───

interface ScorecardProps {
  title: string;
  current: number;
  previous: number;
}

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
            <span className={cn(
              "font-medium",
              delta > 0 && "text-primary",
              delta < 0 && "text-destructive",
              delta === 0 && "text-muted-foreground"
            )}>
              {delta > 0 ? "+" : ""}{delta} ({deltaPercent}%)
            </span>
            <span className="text-muted-foreground">vs vorige periode ({previous})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Fixed total footer ───

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

export default function InflowDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);
  const previousPeriod = useMemo(() => getPreviousPeriod(dateRange), [dateRange]);

  // Unit filter
  const allUnits = useMemo(() => {
    const set = new Set(inflowConsultantData.map((c) => c.unit));
    return Array.from(set).sort();
  }, []);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set(allUnits));

  const toggleUnit = (unit: string) => {
    setSelectedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unit)) next.delete(unit);
      else next.add(unit);
      return next;
    });
  };

  // Filtered data
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
      (acc, s) => ({
        inschrijvingen: acc.inschrijvingen + s.inschrijvingen,
        acquisitie: acc.acquisitie + s.acquisitie,
      }),
      { inschrijvingen: 0, acquisitie: 0 }
    );
  }, []);

  const unitChartData = useMemo(() => aggregateByUnit(filteredConsultants), [filteredConsultants]);

  const totalInschrijvingen = consultantTotals.inschrijvingen;
  const prevTotalInschrijvingen = consultantTotals.prevInschrijvingen;

  const unitFilterLabel = selectedUnits.size === allUnits.length
    ? "Alle units"
    : selectedUnits.size === 0
      ? "Geen units"
      : `${selectedUnits.size} unit${selectedUnits.size > 1 ? "s" : ""}`;

  return (
    <ConsultantLayout title="Inflow Dashboard" subtitle="Marketing overzicht van inschrijvingen en acquisities">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatPeriod(dateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => range && setDateRange(range)}
              initialFocus
              className="p-3 pointer-events-auto"
              locale={nl}
              modifiers={{ today: new Date() }}
              modifiersClassNames={{ today: "ring-2 ring-primary rounded-md" }}
            />
          </PopoverContent>
        </Popover>

        {/* Unit filter */}
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
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedUnits(new Set(allUnits))}>
                  Alles aan
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedUnits(new Set())}>
                  Alles uit
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {allUnits.map((unit) => (
                <label key={unit} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={selectedUnits.has(unit)}
                    onCheckedChange={() => toggleUnit(unit)}
                  />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Scorecard
          title="Inschrijvingen"
          current={totalInschrijvingen}
          previous={prevTotalInschrijvingen}
        />
        <Scorecard
          title="Heractiveringen"
          current={inflowHeractiveringen.current}
          previous={inflowHeractiveringen.previous}
        />
      </div>

      {/* Tables side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Source table */}
        <Card className="border border-border flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inschrijvingen & Acquisitie per Bron</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[400px] overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background z-10 py-2 px-3">Bron</TableHead>
                    <TableHead className="sticky top-0 bg-background z-10 py-2 px-3 text-right w-28">Inschrijvingen</TableHead>
                    <TableHead className="sticky top-0 bg-background z-10 py-2 px-3 text-right w-28">Acquisitie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inflowSourceData.map((s) => (
                    <TableRow key={s.bron}>
                      <TableCell className="font-medium py-2 px-3">{s.bron}</TableCell>
                      <TableCell className="text-right tabular-nums py-2 px-3 w-28">{s.inschrijvingen}</TableCell>
                      <TableCell className="text-right tabular-nums py-2 px-3 w-28">{s.acquisitie}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TotalFooter label="Totaal" values={[sourceTotals.inschrijvingen, sourceTotals.acquisitie]} />
          </CardContent>
        </Card>

        {/* Consultant table */}
        <Card className="border border-border flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inschrijvingen & Acquisitie per Consultant</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[400px] overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background z-10 py-2 px-3">Consultant</TableHead>
                    <TableHead className="sticky top-0 bg-background z-10 py-2 px-3 text-right w-28">Inschrijvingen</TableHead>
                    <TableHead className="sticky top-0 bg-background z-10 py-2 px-3 text-right w-28">Acquisitie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultants.map((c) => (
                    <TableRow key={c.consultant}>
                      <TableCell className="font-medium py-2 px-3">{c.consultant}</TableCell>
                      <TableCell className="text-right tabular-nums py-2 px-3 w-28">{c.inschrijvingen}</TableCell>
                      <TableCell className="text-right tabular-nums py-2 px-3 w-28">{c.acquisitie}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TotalFooter label="Totaal" values={[consultantTotals.inschrijvingen, consultantTotals.acquisitie]} />
          </CardContent>
        </Card>
      </div>

      {/* Unit bar chart — full width */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inschrijvingen & Acquisitie per Unit</CardTitle>
        </CardHeader>
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
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--foreground))",
                  fontSize: "12px",
                }}
              />
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
    </ConsultantLayout>
  );
}

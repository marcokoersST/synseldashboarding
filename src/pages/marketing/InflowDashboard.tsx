import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, startOfWeek, differenceInDays, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";
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

// ─── Scorecard (always comparing) ───

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

export default function InflowDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);
  const previousPeriod = useMemo(() => getPreviousPeriod(dateRange), [dateRange]);

  const sourceTotals = useMemo(() => {
    return inflowSourceData.reduce(
      (acc, s) => ({
        inschrijvingen: acc.inschrijvingen + s.inschrijvingen,
        acquisitie: acc.acquisitie + s.acquisitie,
      }),
      { inschrijvingen: 0, acquisitie: 0 }
    );
  }, []);

  const consultantTotals = useMemo(() => {
    return inflowConsultantData.reduce(
      (acc, c) => ({
        inschrijvingen: acc.inschrijvingen + c.inschrijvingen,
        acquisitie: acc.acquisitie + c.acquisitie,
      }),
      { inschrijvingen: 0, acquisitie: 0 }
    );
  }, []);

  const unitChartData = useMemo(() => aggregateByUnit(inflowConsultantData), []);

  const totalInschrijvingen = sourceTotals.inschrijvingen;
  const prevTotalInschrijvingen = inflowSourceData.reduce((a, s) => a + s.prevInschrijvingen, 0);

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

        {previousPeriod && (
          <Badge variant="secondary" className="text-xs">
            vs {format(previousPeriod.from, "d MMM", { locale: nl })} – {format(previousPeriod.to, "d MMM", { locale: nl })}
          </Badge>
        )}
      </div>

      {/* Scorecards — always show comparison */}
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

      {/* Tables + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source table */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inschrijvingen & Acquisitie per Bron</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bron</TableHead>
                  <TableHead className="text-right">Inschrijvingen</TableHead>
                  <TableHead className="text-right">Acquisitie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inflowSourceData.map((s) => (
                  <TableRow key={s.bron}>
                    <TableCell className="font-medium">{s.bron}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.inschrijvingen}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.acquisitie}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Totaal</TableCell>
                  <TableCell className="text-right tabular-nums">{sourceTotals.inschrijvingen}</TableCell>
                  <TableCell className="text-right tabular-nums">{sourceTotals.acquisitie}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Consultant table */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inschrijvingen & Acquisitie per Consultant</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead className="text-right">Inschrijvingen</TableHead>
                  <TableHead className="text-right">Acquisitie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inflowConsultantData.map((c) => (
                  <TableRow key={c.consultant}>
                    <TableCell className="font-medium">{c.consultant}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.inschrijvingen}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.acquisitie}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Totaal</TableCell>
                  <TableCell className="text-right tabular-nums">{consultantTotals.inschrijvingen}</TableCell>
                  <TableCell className="text-right tabular-nums">{consultantTotals.acquisitie}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Unit bar chart — redesigned */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inschrijvingen & Acquisitie per Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={unitChartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradInschrijvingen" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(175, 60%, 45%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(175, 60%, 55%)" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="gradAcquisitie" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(35, 80%, 55%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(35, 80%, 65%)" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="unit" type="category" width={110} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Bar dataKey="inschrijvingen" name="Inschrijvingen" fill="url(#gradInschrijvingen)" radius={[0, 6, 6, 0]} barSize={16}>
                  <LabelList dataKey="inschrijvingen" position="right" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                </Bar>
                <Bar dataKey="acquisitie" name="Acquisitie" fill="url(#gradAcquisitie)" radius={[0, 6, 6, 0]} barSize={16}>
                  <LabelList dataKey="acquisitie" position="right" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </ConsultantLayout>
  );
}

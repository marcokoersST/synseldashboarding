import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, startOfWeek, differenceInDays, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

interface ScorecardProps {
  title: string;
  current: number;
  previous: number;
  comparing: boolean;
}

function Scorecard({ title, current, previous, comparing }: ScorecardProps) {
  const max = Math.max(current, previous, 1);
  const progressValue = (current / max) * 100;
  const delta = current - previous;
  const deltaPercent = previous > 0 ? ((delta / previous) * 100).toFixed(1) : "–";
  const isPositive = delta > 0;
  

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{current}</div>
        {comparing && (
          <div className="mt-2 space-y-2">
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
        )}
        {!comparing && (
          <div className="mt-2">
            <Progress value={progressValue} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function InflowDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);
  const [comparing, setComparing] = useState(false);

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
      <div className="flex flex-wrap items-center gap-4 mb-6">
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
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Switch checked={comparing} onCheckedChange={setComparing} />
          <span className="text-sm text-muted-foreground">Vergelijken</span>
        </div>

        {comparing && previousPeriod && (
          <Badge variant="secondary" className="text-xs">
            vs {format(previousPeriod.from, "d MMM", { locale: nl })} – {format(previousPeriod.to, "d MMM", { locale: nl })}
          </Badge>
        )}
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Scorecard
          title="Inschrijvingen"
          current={totalInschrijvingen}
          previous={prevTotalInschrijvingen}
          comparing={comparing}
        />
        <Scorecard
          title="Heractiveringen"
          current={inflowHeractiveringen.current}
          previous={inflowHeractiveringen.previous}
          comparing={comparing}
        />
      </div>

      {/* Tables + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Source table */}
        <Card>
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
                    <TableCell className="text-right">{s.inschrijvingen}</TableCell>
                    <TableCell className="text-right">{s.acquisitie}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Totaal</TableCell>
                  <TableCell className="text-right">{sourceTotals.inschrijvingen}</TableCell>
                  <TableCell className="text-right">{sourceTotals.acquisitie}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Consultant table */}
        <Card>
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
                    <TableCell className="text-right">{c.inschrijvingen}</TableCell>
                    <TableCell className="text-right">{c.acquisitie}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Totaal</TableCell>
                  <TableCell className="text-right">{consultantTotals.inschrijvingen}</TableCell>
                  <TableCell className="text-right">{consultantTotals.acquisitie}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Unit bar chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inschrijvingen & Acquisitie per Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unitChartData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs fill-muted-foreground" />
                <YAxis dataKey="unit" type="category" width={100} className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                <Bar dataKey="inschrijvingen" name="Inschrijvingen" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="acquisitie" name="Acquisitie" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </ConsultantLayout>
  );
}

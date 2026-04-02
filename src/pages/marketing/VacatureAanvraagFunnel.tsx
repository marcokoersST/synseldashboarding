import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import { format, startOfWeek, startOfMonth, startOfQuarter, differenceInDays, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import {
  filterByDateRange,
  aggregateFunnel,
  stepConversion,
  type FunnelTotals,
} from "@/data/vacatureAanvraagFunnelData";

type QuickRange = "week" | "maand" | "kwartaal" | "custom";

function getQuickRange(mode: QuickRange): DateRange {
  const today = new Date();
  switch (mode) {
    case "week":
      return { from: startOfWeek(today, { weekStartsOn: 1 }), to: today };
    case "maand":
      return { from: startOfMonth(today), to: today };
    case "kwartaal":
      return { from: startOfQuarter(today), to: today };
    default:
      return { from: startOfWeek(today, { weekStartsOn: 1 }), to: today };
  }
}

function formatPeriod(range: DateRange): string {
  if (!range.from) return "Selecteer periode";
  const from = format(range.from, "d MMM", { locale: nl });
  const to = range.to ? format(range.to, "d MMM yyyy", { locale: nl }) : "";
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

function conversionColor(pct: number | null): string {
  if (pct === null) return "text-muted-foreground";
  if (pct >= 60) return "text-primary";
  if (pct >= 30) return "text-orange-500";
  return "text-destructive";
}

function DeltaIndicator({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  const pct = previous > 0 ? ((delta / previous) * 100).toFixed(0) : "–";
  if (delta === 0) return <span className="text-xs text-muted-foreground flex items-center justify-center gap-0.5"><Minus className="h-3 w-3" />0</span>;
  const isUp = delta > 0;
  return (
    <span className={cn("text-xs flex items-center justify-center gap-0.5 font-medium", isUp ? "text-primary" : "text-destructive")}>
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? "+" : ""}{delta} ({pct}%)
    </span>
  );
}

export default function VacatureAanvraagFunnel() {
  const [quickRange, setQuickRange] = useState<QuickRange>("kwartaal");
  const [dateRange, setDateRange] = useState<DateRange>(getQuickRange("kwartaal"));
  const [comparing, setComparing] = useState(false);

  const handleQuickRange = (mode: QuickRange) => {
    setQuickRange(mode);
    if (mode !== "custom") {
      setDateRange(getQuickRange(mode));
    }
  };

  const totals = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return null;
    return aggregateFunnel(filterByDateRange(dateRange.from, dateRange.to));
  }, [dateRange]);

  const prevRange = useMemo(() => getPreviousPeriod(dateRange), [dateRange]);
  const prevTotals = useMemo(() => {
    if (!comparing || !prevRange) return null;
    return aggregateFunnel(filterByDateRange(prevRange.from, prevRange.to));
  }, [comparing, prevRange]);

  const conversions = useMemo(() => {
    if (!totals) return null;
    return {
      voorgesteld: stepConversion(totals.voorgesteld, totals.vacatureAanvraag),
      opGesprek: stepConversion(totals.opGesprek, totals.voorgesteld),
      tweedeGesprek: stepConversion(totals.tweedeGesprek, totals.opGesprek),
      geplaatst: stepConversion(totals.geplaatst, totals.tweedeGesprek),
    };
  }, [totals]);

  const prevConversions = useMemo(() => {
    if (!prevTotals) return null;
    return {
      voorgesteld: stepConversion(prevTotals.voorgesteld, prevTotals.vacatureAanvraag),
      opGesprek: stepConversion(prevTotals.opGesprek, prevTotals.voorgesteld),
      tweedeGesprek: stepConversion(prevTotals.tweedeGesprek, prevTotals.opGesprek),
      geplaatst: stepConversion(prevTotals.geplaatst, prevTotals.tweedeGesprek),
    };
  }, [prevTotals]);

  const fmtPct = (v: number | null) => (v === null ? "–" : `${v.toFixed(0)}%`);

  const quickButtons: { label: string; value: QuickRange }[] = [
    { label: "Deze week", value: "week" },
    { label: "Deze maand", value: "maand" },
    { label: "Dit kwartaal", value: "kwartaal" },
    { label: "Custom", value: "custom" },
  ];

  const funnelKeys: (keyof FunnelTotals)[] = ["vacatureAanvraag", "voorgesteld", "opGesprek", "tweedeGesprek", "geplaatst"];
  const convKeys = ["voorgesteld", "opGesprek", "tweedeGesprek", "geplaatst"] as const;

  return (
    <ConsultantLayout
      title="Reverse Matching"
      subtitle="Kandidaten die de status 'Vacature aanvraag' bereikten — funnelprogressie per cohort"
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {quickButtons.map((btn) => (
          <Button
            key={btn.value}
            size="sm"
            variant={quickRange === btn.value ? "default" : "outline"}
            onClick={() => handleQuickRange(btn.value)}
          >
            {btn.label}
          </Button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2 gap-2">
              <CalendarIcon className="h-4 w-4" />
              {formatPeriod(dateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range) {
                  setDateRange(range);
                  setQuickRange("custom");
                }
              }}
              numberOfMonths={2}
              locale={nl}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Button
          size="sm"
          variant={comparing ? "default" : "outline"}
          onClick={() => setComparing(!comparing)}
          className="ml-auto gap-2"
        >
          <GitCompare className="h-4 w-4" />
          Vergelijken
        </Button>
      </div>

      {/* Funnel Table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[160px] font-semibold">Periode</TableHead>
                <TableHead className="text-center font-semibold">Vacature aanvraag</TableHead>
                <TableHead className="text-center font-semibold">Voorgesteld</TableHead>
                <TableHead className="text-center font-semibold">Op gesprek</TableHead>
                <TableHead className="text-center font-semibold">2e gesprek</TableHead>
                <TableHead className="text-center font-semibold">Geplaatst</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Current period - absolute values */}
              <TableRow>
                <TableCell className="font-medium text-sm text-foreground">
                  {formatPeriod(dateRange)}
                </TableCell>
                {funnelKeys.map((key) => (
                  <TableCell key={key} className="text-center text-2xl font-bold text-foreground">
                    {totals?.[key] ?? 0}
                  </TableCell>
                ))}
              </TableRow>

              {/* Current period - conversion */}
              <TableRow className="border-t-2 border-border">
                <TableCell className="font-medium text-muted-foreground text-sm">Conv. %</TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">–</TableCell>
                {convKeys.map((key) => (
                  <TableCell key={key} className={cn("text-center text-sm font-semibold", conversionColor(conversions?.[key] ?? null))}>
                    {fmtPct(conversions?.[key] ?? null)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Comparison rows */}
              {comparing && prevTotals && prevRange && (
                <>
                  {/* Previous period - absolute values */}
                  <TableRow className="bg-muted/20 border-t-4 border-border">
                    <TableCell className="font-medium text-sm text-muted-foreground">
                      {formatPeriod({ from: prevRange.from, to: prevRange.to })}
                    </TableCell>
                    {funnelKeys.map((key) => (
                      <TableCell key={key} className="text-center text-xl font-semibold text-muted-foreground">
                        {prevTotals[key]}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Previous period - conversion */}
                  <TableRow className="bg-muted/20">
                    <TableCell className="font-medium text-muted-foreground text-sm">Conv. %</TableCell>
                    <TableCell className="text-center text-muted-foreground text-sm">–</TableCell>
                    {convKeys.map((key) => (
                      <TableCell key={key} className={cn("text-center text-sm font-medium", conversionColor(prevConversions?.[key] ?? null))}>
                        {fmtPct(prevConversions?.[key] ?? null)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Delta row */}
                  <TableRow className="border-t-2 border-dashed border-border">
                    <TableCell className="font-medium text-muted-foreground text-sm">Verschil</TableCell>
                    {funnelKeys.map((key) => (
                      <TableCell key={key} className="text-center">
                        <DeltaIndicator current={totals?.[key] ?? 0} previous={prevTotals[key]} />
                      </TableCell>
                    ))}
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ConsultantLayout>
  );
}

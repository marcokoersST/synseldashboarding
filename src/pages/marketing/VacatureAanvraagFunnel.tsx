import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfWeek, startOfMonth, startOfQuarter, endOfQuarter } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import {
  filterByDateRange,
  aggregateFunnel,
  stepConversion,
} from "@/data/vacatureAanvraagFunnelData";

type QuickRange = "week" | "maand" | "kwartaal" | "custom";

function getDefaultRange(): DateRange {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  return { from: monday, to: today };
}

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
      return getDefaultRange();
  }
}

function formatPeriod(range: DateRange): string {
  if (!range.from) return "Selecteer periode";
  const from = format(range.from, "d MMM", { locale: nl });
  const to = range.to ? format(range.to, "d MMM yyyy", { locale: nl }) : "";
  return `${from} – ${to}`;
}

function conversionColor(pct: number | null): string {
  if (pct === null) return "text-muted-foreground";
  if (pct >= 60) return "text-primary";
  if (pct >= 30) return "text-orange-500";
  return "text-destructive";
}

export default function VacatureAanvraagFunnel() {
  const [quickRange, setQuickRange] = useState<QuickRange>("kwartaal");
  const [dateRange, setDateRange] = useState<DateRange>(getQuickRange("kwartaal"));

  const handleQuickRange = (mode: QuickRange) => {
    setQuickRange(mode);
    if (mode !== "custom") {
      setDateRange(getQuickRange(mode));
    }
  };

  const totals = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return null;
    const filtered = filterByDateRange(dateRange.from, dateRange.to);
    return aggregateFunnel(filtered);
  }, [dateRange]);

  const conversions = useMemo(() => {
    if (!totals) return null;
    return {
      voorgesteld: stepConversion(totals.voorgesteld, totals.vacatureAanvraag),
      opGesprek: stepConversion(totals.opGesprek, totals.voorgesteld),
      tweedeGesprek: stepConversion(totals.tweedeGesprek, totals.opGesprek),
      geplaatst: stepConversion(totals.geplaatst, totals.tweedeGesprek),
    };
  }, [totals]);

  const fmtPct = (v: number | null) => (v === null ? "–" : `${v.toFixed(0)}%`);

  const quickButtons: { label: string; value: QuickRange }[] = [
    { label: "Deze week", value: "week" },
    { label: "Deze maand", value: "maand" },
    { label: "Dit kwartaal", value: "kwartaal" },
    { label: "Custom", value: "custom" },
  ];

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
              {/* Absolute values row */}
              <TableRow>
                <TableCell className="font-medium text-muted-foreground text-sm">
                  {formatPeriod(dateRange)}
                </TableCell>
                <TableCell className="text-center text-2xl font-bold text-foreground">
                  {totals?.vacatureAanvraag ?? 0}
                </TableCell>
                <TableCell className="text-center text-2xl font-bold text-foreground">
                  {totals?.voorgesteld ?? 0}
                </TableCell>
                <TableCell className="text-center text-2xl font-bold text-foreground">
                  {totals?.opGesprek ?? 0}
                </TableCell>
                <TableCell className="text-center text-2xl font-bold text-foreground">
                  {totals?.tweedeGesprek ?? 0}
                </TableCell>
                <TableCell className="text-center text-2xl font-bold text-foreground">
                  {totals?.geplaatst ?? 0}
                </TableCell>
              </TableRow>

              {/* Conversion percentage row */}
              <TableRow className="border-t-2 border-border">
                <TableCell className="font-medium text-muted-foreground text-sm">
                  Conv. %
                </TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">–</TableCell>
                <TableCell className={cn("text-center text-sm font-semibold", conversionColor(conversions?.voorgesteld ?? null))}>
                  {fmtPct(conversions?.voorgesteld ?? null)}
                </TableCell>
                <TableCell className={cn("text-center text-sm font-semibold", conversionColor(conversions?.opGesprek ?? null))}>
                  {fmtPct(conversions?.opGesprek ?? null)}
                </TableCell>
                <TableCell className={cn("text-center text-sm font-semibold", conversionColor(conversions?.tweedeGesprek ?? null))}>
                  {fmtPct(conversions?.tweedeGesprek ?? null)}
                </TableCell>
                <TableCell className={cn("text-center text-sm font-semibold", conversionColor(conversions?.geplaatst ?? null))}>
                  {fmtPct(conversions?.geplaatst ?? null)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ConsultantLayout>
  );
}

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, ArrowUp, ArrowDown, GitCompareArrows } from "lucide-react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  vacatureFunnelData,
  vacatureFunnelBusinessUnits,
  vacatureFunnelConsultants,
  filterVacatureFunnel,
  aggregateByTitle,
  type AggregatedTitle,
} from "@/data/vacatureFunnelData";

/* ── Delta helpers (same pattern as Inschrijvingen) ── */

function DeltaIndicator({ current, previous, invertColor = false }: { current: number; previous: number; invertColor?: boolean }) {
  const delta = current - previous;
  if (delta === 0) return null;
  const isPositive = delta > 0;
  const isGood = invertColor ? !isPositive : isPositive;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isGood ? "text-emerald-600" : "text-red-500")}>
      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {Math.abs(delta)}
    </span>
  );
}

function DeltaPP({ current, previous, invertColor = false }: { current: number; previous: number; invertColor?: boolean }) {
  const delta = current - previous;
  if (Math.abs(delta) < 0.05) return null;
  const isPositive = delta > 0;
  const isGood = invertColor ? !isPositive : isPositive;
  return (
    <span className={cn("text-[10px] font-medium", isGood ? "text-emerald-600" : "text-red-500")}>
      {isPositive ? "+" : ""}{delta.toFixed(1)}pp
    </span>
  );
}

/* ── Color helpers ── */

function conversionColor(pct: number) {
  if (pct >= 50) return "text-emerald-600";
  if (pct >= 30) return "text-yellow-600";
  return "text-red-500";
}

/* ── Main component ── */

export default function VacatureFunnelMonitor() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: sevenDaysAgo, to: today });
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparePeriod, setComparePeriod] = useState<"previous" | "custom">("previous");
  const [customCompareRange, setCustomCompareRange] = useState<DateRange | undefined>();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterVacatureFunnel(vacatureFunnelData, selectedUnit, selectedConsultant),
    [selectedUnit, selectedConsultant]
  );

  const titles = useMemo(() => aggregateByTitle(filtered), [filtered]);

  const totals = useMemo(() => {
    const t = { current: { inschrijven: 0, acquisitie: 0, geplaatst: 0 }, previous: { inschrijven: 0, acquisitie: 0, geplaatst: 0 } };
    for (const row of titles) {
      t.current.inschrijven += row.current.inschrijven;
      t.current.acquisitie += row.current.acquisitie;
      t.current.geplaatst += row.current.geplaatst;
      t.previous.inschrijven += row.previous.inschrijven;
      t.previous.acquisitie += row.previous.acquisitie;
      t.previous.geplaatst += row.previous.geplaatst;
    }
    return t;
  }, [titles]);

  return (
    <ConsultantLayout title="Vacaturetitel Funnel Monitor">
      {/* ── Filters ── */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
                      : format(dateRange.from, "dd MMM yyyy")
                    : "Selecteer periode"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <Switch id="compare" checked={compareEnabled} onCheckedChange={setCompareEnabled} />
              <Label htmlFor="compare" className="flex items-center gap-1.5 cursor-pointer">
                <GitCompareArrows className="w-4 h-4" /> Vergelijken
              </Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedUnit ?? "all"} onValueChange={(v) => setSelectedUnit(v === "all" ? null : v)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Alle units" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle units</SelectItem>
                {vacatureFunnelBusinessUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedConsultant ?? "all"} onValueChange={(v) => setSelectedConsultant(v === "all" ? null : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Alle consultants" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle consultants</SelectItem>
                {vacatureFunnelConsultants.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {compareEnabled && (
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="comparePeriod" checked={comparePeriod === "previous"} onChange={() => setComparePeriod("previous")} className="accent-primary" />
                  <span className="text-sm">Vorige periode</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="comparePeriod" checked={comparePeriod === "custom"} onChange={() => setComparePeriod("custom")} className="accent-primary" />
                  <span className="text-sm">Aangepaste periode</span>
                </label>
              </div>
              {comparePeriod === "custom" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {customCompareRange?.from
                        ? `${format(customCompareRange.from, "dd MMM")} – ${customCompareRange.to ? format(customCompareRange.to, "dd MMM") : "..."}`
                        : "Kies periode"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={customCompareRange} onSelect={setCustomCompareRange} numberOfMonths={2} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Tabs: View 1 & View 2 ── */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Funnel per titel</TabsTrigger>
          <TabsTrigger value="share">Aandeel in totaal</TabsTrigger>
        </TabsList>

        {/* View 1 — Funnel per title (conversion relative to inschrijven) */}
        <TabsContent value="funnel">
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Genormaliseerde titel</TableHead>
                    <TableHead className="text-right">1 | Inschrijven</TableHead>
                    <TableHead className="text-right">2 | Acquisitie</TableHead>
                    <TableHead className="text-right">Geplaatst</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {titles.map((row) => (
                    <FunnelRow key={row.title} row={row} compareEnabled={compareEnabled} />
                  ))}
                  <TotaalFunnelRow totals={totals} compareEnabled={compareEnabled} />
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* View 2 — Share in total */}
        <TabsContent value="share">
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Genormaliseerde titel</TableHead>
                    <TableHead className="text-right">1 | Inschrijven</TableHead>
                    <TableHead className="text-right">2 | Acquisitie</TableHead>
                    <TableHead className="text-right">Geplaatst</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {titles.map((row) => (
                    <ShareRow key={row.title} row={row} totals={totals} compareEnabled={compareEnabled} />
                  ))}
                  <TotaalShareRow totals={totals} compareEnabled={compareEnabled} />
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ConsultantLayout>
  );
}

/* ── View 1: Funnel Row ── */

function FunnelRow({ row, compareEnabled }: { row: AggregatedTitle; compareEnabled: boolean }) {
  const acqPct = row.current.inschrijven ? (row.current.acquisitie / row.current.inschrijven) * 100 : 0;
  const plcPct = row.current.inschrijven ? (row.current.geplaatst / row.current.inschrijven) * 100 : 0;
  const prevAcqPct = row.previous.inschrijven ? (row.previous.acquisitie / row.previous.inschrijven) * 100 : 0;
  const prevPlcPct = row.previous.inschrijven ? (row.previous.geplaatst / row.previous.inschrijven) * 100 : 0;

  const isUnclassified = row.title === "Niet geclassificeerd";

  return (
    <TableRow className={cn(isUnclassified && "bg-muted/30 italic")}>
      <TableCell className="font-medium">{row.title}</TableCell>
      <TableCell className="text-right">
        {row.current.inschrijven}
        {compareEnabled && <div><DeltaIndicator current={row.current.inschrijven} previous={row.previous.inschrijven} /></div>}
      </TableCell>
      <TableCell className="text-right">
        <span>{row.current.acquisitie}</span>
        <span className={cn("ml-1.5 text-xs", conversionColor(acqPct))}>({acqPct.toFixed(0)}%)</span>
        {compareEnabled && (
          <div className="mt-0.5">
            <DeltaIndicator current={row.current.acquisitie} previous={row.previous.acquisitie} />
            {" "}
            <DeltaPP current={acqPct} previous={prevAcqPct} />
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <span>{row.current.geplaatst}</span>
        <span className={cn("ml-1.5 text-xs", conversionColor(plcPct))}>({plcPct.toFixed(0)}%)</span>
        {compareEnabled && (
          <div className="mt-0.5">
            <DeltaIndicator current={row.current.geplaatst} previous={row.previous.geplaatst} />
            {" "}
            <DeltaPP current={plcPct} previous={prevPlcPct} />
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

/* ── View 1: Totaal row ── */

function TotaalFunnelRow({ totals, compareEnabled }: { totals: { current: { inschrijven: number; acquisitie: number; geplaatst: number }; previous: { inschrijven: number; acquisitie: number; geplaatst: number } }; compareEnabled: boolean }) {
  const acqPct = totals.current.inschrijven ? (totals.current.acquisitie / totals.current.inschrijven) * 100 : 0;
  const plcPct = totals.current.inschrijven ? (totals.current.geplaatst / totals.current.inschrijven) * 100 : 0;
  const prevAcqPct = totals.previous.inschrijven ? (totals.previous.acquisitie / totals.previous.inschrijven) * 100 : 0;
  const prevPlcPct = totals.previous.inschrijven ? (totals.previous.geplaatst / totals.previous.inschrijven) * 100 : 0;

  return (
    <TableRow className="font-semibold bg-muted/50">
      <TableCell>Totaal</TableCell>
      <TableCell className="text-right">
        {totals.current.inschrijven}
        {compareEnabled && <div><DeltaIndicator current={totals.current.inschrijven} previous={totals.previous.inschrijven} /></div>}
      </TableCell>
      <TableCell className="text-right">
        {totals.current.acquisitie} <span className={cn("text-xs", conversionColor(acqPct))}>({acqPct.toFixed(0)}%)</span>
        {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={totals.current.acquisitie} previous={totals.previous.acquisitie} /> <DeltaPP current={acqPct} previous={prevAcqPct} /></div>}
      </TableCell>
      <TableCell className="text-right">
        {totals.current.geplaatst} <span className={cn("text-xs", conversionColor(plcPct))}>({plcPct.toFixed(0)}%)</span>
        {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={totals.current.geplaatst} previous={totals.previous.geplaatst} /> <DeltaPP current={plcPct} previous={prevPlcPct} /></div>}
      </TableCell>
    </TableRow>
  );
}

/* ── View 2: Share Row ── */

function ShareRow({ row, totals, compareEnabled }: { row: AggregatedTitle; totals: { current: { inschrijven: number; acquisitie: number; geplaatst: number }; previous: { inschrijven: number; acquisitie: number; geplaatst: number } }; compareEnabled: boolean }) {
  const shareInschr = totals.current.inschrijven ? (row.current.inschrijven / totals.current.inschrijven) * 100 : 0;
  const shareAcq = totals.current.acquisitie ? (row.current.acquisitie / totals.current.acquisitie) * 100 : 0;
  const sharePlc = totals.current.geplaatst ? (row.current.geplaatst / totals.current.geplaatst) * 100 : 0;
  const prevShareInschr = totals.previous.inschrijven ? (row.previous.inschrijven / totals.previous.inschrijven) * 100 : 0;
  const prevShareAcq = totals.previous.acquisitie ? (row.previous.acquisitie / totals.previous.acquisitie) * 100 : 0;
  const prevSharePlc = totals.previous.geplaatst ? (row.previous.geplaatst / totals.previous.geplaatst) * 100 : 0;

  const isUnclassified = row.title === "Niet geclassificeerd";

  return (
    <TableRow className={cn(isUnclassified && "bg-muted/30 italic")}>
      <TableCell className="font-medium">{row.title}</TableCell>
      <TableCell className="text-right">
        {row.current.inschrijven} <span className="text-xs text-muted-foreground">({shareInschr.toFixed(1)}%)</span>
        {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={row.current.inschrijven} previous={row.previous.inschrijven} /> <DeltaPP current={shareInschr} previous={prevShareInschr} /></div>}
      </TableCell>
      <TableCell className="text-right">
        {row.current.acquisitie} <span className="text-xs text-muted-foreground">({shareAcq.toFixed(1)}%)</span>
        {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={row.current.acquisitie} previous={row.previous.acquisitie} /> <DeltaPP current={shareAcq} previous={prevShareAcq} /></div>}
      </TableCell>
      <TableCell className="text-right">
        {row.current.geplaatst} <span className="text-xs text-muted-foreground">({sharePlc.toFixed(1)}%)</span>
        {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={row.current.geplaatst} previous={row.previous.geplaatst} /> <DeltaPP current={sharePlc} previous={prevSharePlc} /></div>}
      </TableCell>
    </TableRow>
  );
}

/* ── View 2: Totaal row ── */

function TotaalShareRow({ totals, compareEnabled }: { totals: { current: { inschrijven: number; acquisitie: number; geplaatst: number }; previous: { inschrijven: number; acquisitie: number; geplaatst: number } }; compareEnabled: boolean }) {
  return (
    <TableRow className="font-semibold bg-muted/50">
      <TableCell>Totaal</TableCell>
      <TableCell className="text-right">
        {totals.current.inschrijven} <span className="text-xs text-muted-foreground">(100%)</span>
        {compareEnabled && <div><DeltaIndicator current={totals.current.inschrijven} previous={totals.previous.inschrijven} /></div>}
      </TableCell>
      <TableCell className="text-right">
        {totals.current.acquisitie} <span className="text-xs text-muted-foreground">(100%)</span>
        {compareEnabled && <div><DeltaIndicator current={totals.current.acquisitie} previous={totals.previous.acquisitie} /></div>}
      </TableCell>
      <TableCell className="text-right">
        {totals.current.geplaatst} <span className="text-xs text-muted-foreground">(100%)</span>
        {compareEnabled && <div><DeltaIndicator current={totals.current.geplaatst} previous={totals.previous.geplaatst} /></div>}
      </TableCell>
    </TableRow>
  );
}

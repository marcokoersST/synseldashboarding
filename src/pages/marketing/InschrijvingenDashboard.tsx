import { useState, useMemo } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, ArrowUp, ArrowDown, GitCompareArrows } from "lucide-react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  consultantData,
  businessUnits,
  consultantNames,
  aggregateData,
  filterConsultants,
  type AggregatedData,
} from "@/data/marketingInschrijvingenData";

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

function getBadgeVariant(type: "nietGebeld" | "doorgezet" | "afgewezen", pct: number) {
  if (type === "doorgezet") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (type === "afgewezen") return "bg-orange-100 text-orange-700 border-orange-200";
  // nietGebeld
  if (pct > 30) return "bg-red-100 text-red-700 border-red-200";
  if (pct < 10) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-yellow-100 text-yellow-700 border-yellow-200";
}

export default function InschrijvingenDashboard() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: sevenDaysAgo, to: today });
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparePeriod, setComparePeriod] = useState<"previous" | "custom">("previous");
  const [customCompareRange, setCustomCompareRange] = useState<DateRange | undefined>();
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterConsultants(consultantData, selectedConsultant, selectedUnit),
    [selectedConsultant, selectedUnit]
  );

  const current = useMemo(() => aggregateData(filtered, "current"), [filtered]);
  const previous = useMemo(() => aggregateData(filtered, "previous"), [filtered]);

  const pctNietGebeld = current.totaalVerwerkt ? (current.nietGebeld / current.totaalVerwerkt) * 100 : 0;
  const prevPctNietGebeld = previous.totaalVerwerkt ? (previous.nietGebeld / previous.totaalVerwerkt) * 100 : 0;

  const gebeld = current.doorgezet + current.afgewezen;
  const pctDoorgezet = gebeld ? (current.doorgezet / gebeld) * 100 : 0;
  const pctAfgewezen = gebeld ? (current.afgewezen / gebeld) * 100 : 0;
  const prevGebeld = previous.doorgezet + previous.afgewezen;
  const prevPctDoorgezet = prevGebeld ? (previous.doorgezet / prevGebeld) * 100 : 0;
  const prevPctAfgewezen = prevGebeld ? (previous.afgewezen / prevGebeld) * 100 : 0;

  return (
    <ConsultantLayout title="Inschrijvingen Dashboard" subtitle={`Welkom terug — ${format(today, "EEEE d MMMM yyyy", { locale: nl })}`}>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}` : format(dateRange.from, "dd MMM yyyy")
                  ) : "Selecteer periode"}
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

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedConsultant ?? "all"} onValueChange={(v) => setSelectedConsultant(v === "all" ? null : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Alle consultants" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle consultants</SelectItem>
                {consultantNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedUnit ?? "all"} onValueChange={(v) => setSelectedUnit(v === "all" ? null : v)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Alle units" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle units</SelectItem>
                {businessUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Compare options */}
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

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Totaal Verwerkt */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Totaal Verwerkt</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{current.totaalVerwerkt}</span>
              {compareEnabled && <DeltaIndicator current={current.totaalVerwerkt} previous={previous.totaalVerwerkt} />}
            </div>
          </CardContent>
        </Card>

        {/* % Niet Gebeld */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">% Niet Gebeld</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{pctNietGebeld.toFixed(1)}%</span>
              {compareEnabled && <DeltaPP current={pctNietGebeld} previous={prevPctNietGebeld} invertColor />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Niet gebeld: {current.nietGebeld}</p>
          </CardContent>
        </Card>

        {/* Doorgezet vs Afgewezen */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Doorgezet vs Afgewezen</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-emerald-600">{pctDoorgezet.toFixed(1)}%</span>
              {compareEnabled && <DeltaPP current={pctDoorgezet} previous={prevPctDoorgezet} />}
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-semibold text-orange-500">{pctAfgewezen.toFixed(1)}%</span>
              {compareEnabled && <DeltaPP current={pctAfgewezen} previous={prevPctAfgewezen} invertColor />}
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-emerald-500 transition-all" style={{ width: `${pctDoorgezet}%` }} />
              <div className="bg-orange-400 transition-all" style={{ width: `${pctAfgewezen}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Doorgezet ({current.doorgezet})</span>
              <span>Afgewezen ({current.afgewezen})</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultant Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sales Consultant Overzicht</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consultant</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Totaal</TableHead>
                <TableHead className="text-right">Niet gebeld</TableHead>
                <TableHead className="text-right">Doorgezet</TableHead>
                <TableHead className="text-right">Afgewezen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const cur = c.current;
                const prev = c.previous;
                const curGebeld = cur.doorgezet + cur.afgewezen;
                const prevGebeld = prev.doorgezet + prev.afgewezen;
                const nietPct = cur.totaalVerwerkt ? (cur.nietGebeld / cur.totaalVerwerkt) * 100 : 0;
                const doorPct = curGebeld ? (cur.doorgezet / curGebeld) * 100 : 0;
                const afwPct = curGebeld ? (cur.afgewezen / curGebeld) * 100 : 0;
                const prevNietPct = prev.totaalVerwerkt ? (prev.nietGebeld / prev.totaalVerwerkt) * 100 : 0;
                const prevDoorPct = prevGebeld ? (prev.doorgezet / prevGebeld) * 100 : 0;
                const prevAfwPct = prevGebeld ? (prev.afgewezen / prevGebeld) * 100 : 0;

                return (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.unit}</TableCell>
                    <TableCell className="text-right">
                      {cur.totaalVerwerkt}
                      {compareEnabled && <div><DeltaIndicator current={cur.totaalVerwerkt} previous={prev.totaalVerwerkt} /></div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={cn("text-xs", getBadgeVariant("nietGebeld", nietPct))}>{cur.nietGebeld} ({nietPct.toFixed(0)}%)</Badge>
                      {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={cur.nietGebeld} previous={prev.nietGebeld} invertColor /> <DeltaPP current={nietPct} previous={prevNietPct} invertColor /></div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={cn("text-xs", getBadgeVariant("doorgezet", doorPct))}>{cur.doorgezet} ({doorPct.toFixed(0)}%)</Badge>
                      {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={cur.doorgezet} previous={prev.doorgezet} /> <DeltaPP current={doorPct} previous={prevDoorPct} /></div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={cn("text-xs", getBadgeVariant("afgewezen", afwPct))}>{cur.afgewezen} ({afwPct.toFixed(0)}%)</Badge>
                      {compareEnabled && <div className="mt-0.5"><DeltaIndicator current={cur.afgewezen} previous={prev.afgewezen} invertColor /> <DeltaPP current={afwPct} previous={prevAfwPct} invertColor /></div>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totaal row */}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>Totaal</TableCell>
                <TableCell />
                <TableCell className="text-right">{current.totaalVerwerkt}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={cn("text-xs", getBadgeVariant("nietGebeld", pctNietGebeld))}>{current.nietGebeld} ({pctNietGebeld.toFixed(0)}%)</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={cn("text-xs", getBadgeVariant("doorgezet", pctDoorgezet))}>{current.doorgezet} ({pctDoorgezet.toFixed(0)}%)</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={cn("text-xs", getBadgeVariant("afgewezen", pctAfgewezen))}>{current.afgewezen} ({pctAfgewezen.toFixed(0)}%)</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ConsultantLayout>
  );
}

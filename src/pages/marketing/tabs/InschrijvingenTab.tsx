import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, PhoneOff, CheckCircle2, ArrowUp, ArrowDown, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import {
  consultantData,
  businessUnits,
  consultantNames,
  aggregateData,
  filterConsultants,
} from "@/data/marketingInschrijvingenData";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: string;
}

function DeltaPill({ current, previous, invert = false, suffix = "" }: { current: number; previous: number; invert?: boolean; suffix?: string }) {
  if (previous === 0 && current === 0) return null;
  const delta = current - previous;
  const pct = previous ? (delta / previous) * 100 : 0;
  const isPositive = delta > 0;
  const isGood = invert ? !isPositive : isPositive;
  if (Math.abs(delta) < 0.05 && !suffix) return null;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isGood ? "text-emerald-600" : "text-red-500")}>
      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {suffix === "pp" ? `${Math.abs(delta).toFixed(1)}pp` : `${Math.abs(pct).toFixed(0)}%`}
    </span>
  );
}

function badgeClass(type: "nietGebeld" | "doorgezet" | "afgewezen", pct: number) {
  if (type === "doorgezet") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (type === "afgewezen") return "bg-orange-50 text-orange-700 border-orange-200";
  if (pct > 25) return "bg-red-50 text-red-700 border-red-200";
  if (pct < 10) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function InschrijvingenTab({ compareRange }: Props) {
  const compareEnabled = !!compareRange;
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
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Inschrijving Quality Monitor</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Realtime kwaliteit van de inschrijving-funnel per consultant en business unit.
        </p>
      </div>

      {/* Sub-filters: consultant + unit */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedConsultant ?? "all"} onValueChange={(v) => setSelectedConsultant(v === "all" ? null : v)}>
          <SelectTrigger className="w-[220px] h-9 bg-card"><SelectValue placeholder="Alle consultants" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Sales Consultants</SelectItem>
            {consultantNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedUnit ?? "all"} onValueChange={(v) => setSelectedUnit(v === "all" ? null : v)}>
          <SelectTrigger className="w-[200px] h-9 bg-card"><SelectValue placeholder="Alle units" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Business Units</SelectItem>
            {businessUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Totaal Verwerkt */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Totaal Verwerkt</span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground tracking-tight">{current.totaalVerwerkt}</div>
            {compareEnabled && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <DeltaPill current={current.totaalVerwerkt} previous={previous.totaalVerwerkt} />
                <span className="text-muted-foreground">t.o.v. vorige periode</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* % Niet Gebeld */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">% Niet Gebeld</span>
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <PhoneOff className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground tracking-tight">{pctNietGebeld.toFixed(0)}%</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
              <TrendingDown className="w-3 h-3" />
              <span>{current.nietGebeld} van {current.totaalVerwerkt} niet gebeld</span>
            </div>
            {compareEnabled && (
              <div className="mt-1">
                <DeltaPill current={pctNietGebeld} previous={prevPctNietGebeld} invert suffix="pp" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doorgezet vs Afgewezen */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Doorgezet vs Afgewezen</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-emerald-600 tracking-tight">{pctDoorgezet.toFixed(0)}%</span>
              <span className="text-2xl font-bold text-red-500 tracking-tight">{pctAfgewezen.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-emerald-500 transition-all" style={{ width: `${pctDoorgezet}%` }} />
              <div className="bg-red-400 transition-all" style={{ width: `${pctAfgewezen}%` }} />
            </div>
            {compareEnabled && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Doorgezet</span>
                <DeltaPill current={pctDoorgezet} previous={prevPctDoorgezet} suffix="pp" />
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">Afgewezen</span>
                <DeltaPill current={pctAfgewezen} previous={prevPctAfgewezen} invert suffix="pp" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consultant table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Sales Consultant Overzicht</CardTitle>
          <p className="text-xs text-muted-foreground">Prestaties per sales consultant voor de geselecteerde periode</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sales Consultant</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business Unit</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">Totaal</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">Niet Gebeld</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">Doorgezet</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">Afgewezen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const cur = c.current;
                const prev = c.previous;
                const curGebeld = cur.doorgezet + cur.afgewezen;
                const nietPct = cur.totaalVerwerkt ? (cur.nietGebeld / cur.totaalVerwerkt) * 100 : 0;
                const doorPct = curGebeld ? (cur.doorgezet / curGebeld) * 100 : 0;
                const afwPct = curGebeld ? (cur.afgewezen / curGebeld) * 100 : 0;
                return (
                  <TableRow key={c.name} className="hover:bg-muted/40">
                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.unit}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {cur.totaalVerwerkt}
                      {compareEnabled && <div className="mt-0.5"><DeltaPill current={cur.totaalVerwerkt} previous={prev.totaalVerwerkt} /></div>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("text-xs font-medium", badgeClass("nietGebeld", nietPct))}>
                        {cur.nietGebeld} ({nietPct.toFixed(0)}%)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("text-xs font-medium", badgeClass("doorgezet", doorPct))}>
                        {cur.doorgezet} ({doorPct.toFixed(0)}%)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("text-xs font-medium", badgeClass("afgewezen", afwPct))}>
                        {cur.afgewezen} ({afwPct.toFixed(0)}%)
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-semibold bg-muted/40 hover:bg-muted/40">
                <TableCell>Totaal</TableCell>
                <TableCell />
                <TableCell className="text-center">{current.totaalVerwerkt}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn("text-xs", badgeClass("nietGebeld", pctNietGebeld))}>
                    {current.nietGebeld} ({pctNietGebeld.toFixed(0)}%)
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn("text-xs", badgeClass("doorgezet", pctDoorgezet))}>
                    {current.doorgezet} ({pctDoorgezet.toFixed(0)}%)
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn("text-xs", badgeClass("afgewezen", pctAfgewezen))}>
                    {current.afgewezen} ({pctAfgewezen.toFixed(0)}%)
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

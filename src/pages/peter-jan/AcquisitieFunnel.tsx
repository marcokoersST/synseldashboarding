import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { acquisitionFunnelData, AcquisitionFunnelEntry } from "@/data/acquisitionFunnelData";
import { ChevronRight, ChevronDown, CalendarIcon, Filter, SlidersHorizontal } from "lucide-react";
import { format, startOfWeek, differenceInDays, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// ─── Date helpers ───

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

// ─── Conversion helpers ───

function conversionColor(pct: number) {
  if (pct >= 50) return "text-emerald-500";
  if (pct >= 25) return "text-amber-500";
  return "text-red-500";
}

function pct(num: number, denom: number) {
  if (denom === 0) return 0;
  return (num / denom) * 100;
}

function fmtPct(num: number, denom: number) {
  return pct(num, denom).toFixed(2) + "%";
}

// ─── Data grouping ───

type UnitGroup = { unit: string; entries: AcquisitionFunnelEntry[]; totals: AcquisitionFunnelEntry };

function useGroupedData(selectedUnits: string[]) {
  return useMemo(() => {
    const filtered = selectedUnits.length === 0
      ? acquisitionFunnelData
      : acquisitionFunnelData.filter(e => selectedUnits.includes(e.unit));

    const map = new Map<string, AcquisitionFunnelEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.unit)) map.set(e.unit, []);
      map.get(e.unit)!.push(e);
    }
    const groups: UnitGroup[] = [];
    for (const [unit, entries] of map) {
      const totals = entries.reduce<AcquisitionFunnelEntry>(
        (acc, r) => ({
          ...acc,
          toegewezen: acc.toegewezen + r.toegewezen,
          ingeschreven: acc.ingeschreven + r.ingeschreven,
          acquisitie: acc.acquisitie + r.acquisitie,
          voorstellen: acc.voorstellen + r.voorstellen,
          geenGesprek: acc.geenGesprek + r.geenGesprek,
          eersteGesprek: acc.eersteGesprek + r.eersteGesprek,
          totaleGesprekken: acc.totaleGesprekken + r.totaleGesprekken,
          gesprekken: acc.gesprekken + r.gesprekken,
          tweedeGesprekken: acc.tweedeGesprekken + r.tweedeGesprekken,
          dealsluiters: acc.dealsluiters + r.dealsluiters,
          plaatsingen: acc.plaatsingen + r.plaatsingen,
        }),
        { name: unit, unit, toegewezen: 0, ingeschreven: 0, acquisitie: 0, voorstellen: 0, geenGesprek: 0, eersteGesprek: 0, totaleGesprekken: 0, gesprekken: 0, tweedeGesprekken: 0, dealsluiters: 0, plaatsingen: 0 }
      );
      groups.push({ unit, entries, totals });
    }
    return groups;
  }, [selectedUnits]);
}

function grandTotals(groups: UnitGroup[]): AcquisitionFunnelEntry {
  return groups.reduce<AcquisitionFunnelEntry>(
    (acc, g) => ({
      ...acc,
      toegewezen: acc.toegewezen + g.totals.toegewezen,
      ingeschreven: acc.ingeschreven + g.totals.ingeschreven,
      acquisitie: acc.acquisitie + g.totals.acquisitie,
      voorstellen: acc.voorstellen + g.totals.voorstellen,
      geenGesprek: acc.geenGesprek + g.totals.geenGesprek,
      eersteGesprek: acc.eersteGesprek + g.totals.eersteGesprek,
      totaleGesprekken: acc.totaleGesprekken + g.totals.totaleGesprekken,
      gesprekken: acc.gesprekken + g.totals.gesprekken,
      tweedeGesprekken: acc.tweedeGesprekken + g.totals.tweedeGesprekken,
      dealsluiters: acc.dealsluiters + g.totals.dealsluiters,
      plaatsingen: acc.plaatsingen + g.totals.plaatsingen,
    }),
    { name: "Totaal", unit: "", toegewezen: 0, ingeschreven: 0, acquisitie: 0, voorstellen: 0, geenGesprek: 0, eersteGesprek: 0, totaleGesprekken: 0, gesprekken: 0, tweedeGesprekken: 0, dealsluiters: 0, plaatsingen: 0 }
  );
}

const ExpandIcon = ({ open }: { open: boolean }) =>
  open ? <ChevronDown className="h-4 w-4 inline mr-1" /> : <ChevronRight className="h-4 w-4 inline mr-1" />;

// ─── Custom Ratio Builder ───

const RATIO_FIELDS: { key: keyof AcquisitionFunnelEntry; label: string }[] = [
  { key: "toegewezen", label: "Toegewezen" },
  { key: "ingeschreven", label: "Ingeschreven" },
  { key: "acquisitie", label: "Acquisitie" },
  { key: "voorstellen", label: "Voorstellen" },
  { key: "geenGesprek", label: "Geen gesprek" },
  { key: "eersteGesprek", label: "Eerste gesprek" },
  { key: "totaleGesprekken", label: "Totale gesprekken" },
  { key: "gesprekken", label: "Gesprekken" },
  { key: "tweedeGesprekken", label: "Tweede gesprekken" },
  { key: "dealsluiters", label: "Dealsluiters" },
  { key: "plaatsingen", label: "Plaatsingen" },
];

interface CustomRatio {
  numerator: keyof AcquisitionFunnelEntry;
  denominator: keyof AcquisitionFunnelEntry;
  label: string;
}

function CustomRatioTable({ groups, totals, ratio }: { groups: UnitGroup[]; totals: AcquisitionFunnelEntry; ratio: CustomRatio }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (unit: string) => {
    const next = new Set(expanded);
    next.has(unit) ? next.delete(unit) : next.add(unit);
    setExpanded(next);
  };

  const numLabel = RATIO_FIELDS.find(f => f.key === ratio.numerator)?.label ?? ratio.numerator;
  const denLabel = RATIO_FIELDS.find(f => f.key === ratio.denominator)?.label ?? ratio.denominator;

  return (
    <section>
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Aangepaste ratio: {numLabel} / {denLabel}
      </h3>
      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Unit / Consultant</TableHead>
                <TableHead className="text-right font-semibold">{denLabel}</TableHead>
                <TableHead className="text-right font-semibold">{numLabel}</TableHead>
                <TableHead className="text-right font-semibold">Ratio %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((g) => {
                const open = expanded.has(g.unit);
                const t = g.totals;
                const denomVal = t[ratio.denominator] as number;
                const numVal = t[ratio.numerator] as number;
                return (
                  <>
                    <TableRow key={g.unit} className="bg-muted/20 cursor-pointer hover:bg-muted/40" onClick={() => toggle(g.unit)}>
                      <TableCell className="font-semibold"><ExpandIcon open={open} />{g.unit}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{denomVal}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{numVal}</TableCell>
                      <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(numVal, denomVal))}`}>{fmtPct(numVal, denomVal)}</TableCell>
                    </TableRow>
                    {open && g.entries.map((r) => {
                      const dv = r[ratio.denominator] as number;
                      const nv = r[ratio.numerator] as number;
                      return (
                        <TableRow key={r.name}>
                          <TableCell className="pl-10 font-medium">{r.name}</TableCell>
                          <TableCell className="text-right tabular-nums">{dv}</TableCell>
                          <TableCell className="text-right tabular-nums">{nv}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(nv, dv))}`}>{fmtPct(nv, dv)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                );
              })}
              <TableRow className="bg-muted/40 border-t-2 border-border font-bold">
                <TableCell className="font-bold">Totaal</TableCell>
                <TableCell className="text-right tabular-nums font-bold">{totals[ratio.denominator] as number}</TableCell>
                <TableCell className="text-right tabular-nums font-bold">{totals[ratio.numerator] as number}</TableCell>
                <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals[ratio.numerator] as number, totals[ratio.denominator] as number))}`}>
                  {fmtPct(totals[ratio.numerator] as number, totals[ratio.denominator] as number)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

// ─── Main Component ───

const ALL_UNITS = [...new Set(acquisitionFunnelData.map(e => e.unit))];

const AcquisitieFunnel = () => {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [customRatios, setCustomRatios] = useState<CustomRatio[]>([]);
  const [newNumerator, setNewNumerator] = useState<string>("plaatsingen");
  const [newDenominator, setNewDenominator] = useState<string>("toegewezen");

  const previousPeriod = useMemo(() => getPreviousPeriod(dateRange), [dateRange]);
  const groups = useGroupedData(selectedUnits);
  const totals = useMemo(() => grandTotals(groups), [groups]);

  const [expanded1, setExpanded1] = useState<Set<string>>(new Set());
  const [expanded2, setExpanded2] = useState<Set<string>>(new Set());
  const [expanded3, setExpanded3] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, unit: string) => {
    const next = new Set(set);
    next.has(unit) ? next.delete(unit) : next.add(unit);
    setFn(next);
  };

  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev =>
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const addCustomRatio = () => {
    const numKey = newNumerator as keyof AcquisitionFunnelEntry;
    const denKey = newDenominator as keyof AcquisitionFunnelEntry;
    if (numKey === denKey) return;
    const numLabel = RATIO_FIELDS.find(f => f.key === numKey)?.label ?? numKey;
    const denLabel = RATIO_FIELDS.find(f => f.key === denKey)?.label ?? denKey;
    setCustomRatios(prev => [...prev, { numerator: numKey, denominator: denKey, label: `${numLabel} / ${denLabel}` }]);
  };

  return (
    <ConsultantLayout
      title="Acquisitie Funnel"
      subtitle="Conversie van toegewezen kandidaten door de volledige funnel"
    >
      {/* ─── Filter Bar ─── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Date range picker */}
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

        {/* Always-on comparison badge */}
        {previousPeriod && (
          <Badge variant="secondary" className="text-xs">
            vs {format(previousPeriod.from, "d MMM", { locale: nl })} – {format(previousPeriod.to, "d MMM", { locale: nl })}
          </Badge>
        )}

        {/* Multi-select unit filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              {selectedUnits.length === 0 ? "Alle units" : `${selectedUnits.length} unit${selectedUnits.length > 1 ? "s" : ""}`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3" align="start">
            <p className="text-xs font-medium text-muted-foreground mb-2">Filter op unit</p>
            <div className="space-y-2">
              {ALL_UNITS.map(unit => (
                <label key={unit} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={selectedUnits.includes(unit)}
                    onCheckedChange={() => toggleUnit(unit)}
                  />
                  {unit}
                </label>
              ))}
            </div>
            {selectedUnits.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setSelectedUnits([])}>
                Reset
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Custom ratio builder */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Aangepaste ratio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Aangepaste conversieratio samenstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Teller (numerator)</label>
                  <Select value={newNumerator} onValueChange={setNewNumerator}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RATIO_FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Noemer (denominator)</label>
                  <Select value={newDenominator} onValueChange={setNewDenominator}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RATIO_FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addCustomRatio} disabled={newNumerator === newDenominator} className="w-full">
                Ratio toevoegen
              </Button>
              {customRatios.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Actieve ratio's:</p>
                  {customRatios.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                      <span>{r.label}</span>
                      <Button variant="ghost" size="sm" className="h-5 px-1 text-destructive text-[10px]"
                        onClick={() => setCustomRatios(prev => prev.filter((_, j) => j !== i))}>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {/* === FASE 1 === */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Fase 1</h3>
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Unit / Consultant</TableHead>
                    <TableHead className="text-right font-semibold">Toegewezen</TableHead>
                    <TableHead className="text-right font-semibold">Ingeschreven</TableHead>
                    <TableHead className="text-right font-semibold">Conversie %</TableHead>
                    <TableHead className="text-right font-semibold">Acquisitie</TableHead>
                    <TableHead className="text-right font-semibold">Conversie %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => {
                    const open = expanded1.has(g.unit);
                    const t = g.totals;
                    return (
                      <>
                        <TableRow
                          key={g.unit}
                          className="bg-muted/20 cursor-pointer hover:bg-muted/40"
                          onClick={() => toggle(expanded1, setExpanded1, g.unit)}
                        >
                          <TableCell className="font-semibold"><ExpandIcon open={open} />{g.unit}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.toegewezen}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.ingeschreven}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.ingeschreven, t.toegewezen))}`}>{fmtPct(t.ingeschreven, t.toegewezen)}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.acquisitie}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.acquisitie, t.ingeschreven))}`}>{fmtPct(t.acquisitie, t.ingeschreven)}</TableCell>
                        </TableRow>
                        {open && g.entries.map((r) => (
                          <TableRow key={r.name}>
                            <TableCell className="pl-10 font-medium">{r.name}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.toegewezen}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.ingeschreven}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.ingeschreven, r.toegewezen))}`}>{fmtPct(r.ingeschreven, r.toegewezen)}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.acquisitie}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.acquisitie, r.ingeschreven))}`}>{fmtPct(r.acquisitie, r.ingeschreven)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                  <TableRow className="bg-muted/40 border-t-2 border-border font-bold">
                    <TableCell className="font-bold">Totaal</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.toegewezen}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.ingeschreven}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.ingeschreven, totals.toegewezen))}`}>{fmtPct(totals.ingeschreven, totals.toegewezen)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.acquisitie}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.acquisitie, totals.ingeschreven))}`}>{fmtPct(totals.acquisitie, totals.ingeschreven)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* === COMPLEET === */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Compleet</h3>
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead rowSpan={2} className="font-semibold align-bottom border-r border-border">Unit / Consultant</TableHead>
                    <TableHead rowSpan={2} className="text-right font-semibold align-bottom">Acquisitie</TableHead>
                    <TableHead rowSpan={2} className="text-right font-semibold align-bottom">Voorstellen</TableHead>
                    <TableHead rowSpan={2} className="text-right font-semibold align-bottom">Per kandidaat</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-l border-border">Geen gesprek</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-l border-border">Eerste gesprek</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-l border-border">Totale gesprekken</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-right font-medium text-xs border-l border-border">#</TableHead>
                    <TableHead className="text-right font-medium text-xs">%</TableHead>
                    <TableHead className="text-right font-medium text-xs border-l border-border">#</TableHead>
                    <TableHead className="text-right font-medium text-xs">%</TableHead>
                    <TableHead className="text-right font-medium text-xs border-l border-border">#</TableHead>
                    <TableHead className="text-right font-medium text-xs">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => {
                    const open = expanded2.has(g.unit);
                    const t = g.totals;
                    return (
                      <>
                        <TableRow key={g.unit} className="bg-muted/20 cursor-pointer hover:bg-muted/40" onClick={() => toggle(expanded2, setExpanded2, g.unit)}>
                          <TableCell className="font-semibold border-r border-border"><ExpandIcon open={open} />{g.unit}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.acquisitie}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.voorstellen}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.voorstellen, t.acquisitie))}`}>{fmtPct(t.voorstellen, t.acquisitie)}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold border-l border-border">{t.geenGesprek}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.geenGesprek, t.acquisitie))}`}>{fmtPct(t.geenGesprek, t.acquisitie)}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold border-l border-border">{t.eersteGesprek}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.eersteGesprek, t.acquisitie))}`}>{fmtPct(t.eersteGesprek, t.acquisitie)}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold border-l border-border">{t.totaleGesprekken}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.totaleGesprekken, t.acquisitie))}`}>{fmtPct(t.totaleGesprekken, t.acquisitie)}</TableCell>
                        </TableRow>
                        {open && g.entries.map((r) => (
                          <TableRow key={r.name}>
                            <TableCell className="pl-10 font-medium border-r border-border">{r.name}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.acquisitie}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.voorstellen}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.voorstellen, r.acquisitie))}`}>{fmtPct(r.voorstellen, r.acquisitie)}</TableCell>
                            <TableCell className="text-right tabular-nums border-l border-border">{r.geenGesprek}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.geenGesprek, r.acquisitie))}`}>{fmtPct(r.geenGesprek, r.acquisitie)}</TableCell>
                            <TableCell className="text-right tabular-nums border-l border-border">{r.eersteGesprek}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.eersteGesprek, r.acquisitie))}`}>{fmtPct(r.eersteGesprek, r.acquisitie)}</TableCell>
                            <TableCell className="text-right tabular-nums border-l border-border">{r.totaleGesprekken}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.totaleGesprekken, r.acquisitie))}`}>{fmtPct(r.totaleGesprekken, r.acquisitie)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                  <TableRow className="bg-muted/40 border-t-2 border-border font-bold">
                    <TableCell className="font-bold border-r border-border">Totaal</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.acquisitie}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.voorstellen}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.voorstellen, totals.acquisitie))}`}>{fmtPct(totals.voorstellen, totals.acquisitie)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold border-l border-border">{totals.geenGesprek}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.geenGesprek, totals.acquisitie))}`}>{fmtPct(totals.geenGesprek, totals.acquisitie)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold border-l border-border">{totals.eersteGesprek}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.eersteGesprek, totals.acquisitie))}`}>{fmtPct(totals.eersteGesprek, totals.acquisitie)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold border-l border-border">{totals.totaleGesprekken}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.totaleGesprekken, totals.acquisitie))}`}>{fmtPct(totals.totaleGesprekken, totals.acquisitie)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* === FASE 2 === */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-foreground">Fase 2</h3>
          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Unit / Consultant</TableHead>
                    <TableHead className="text-right font-semibold">Gesprekken</TableHead>
                    <TableHead className="text-right font-semibold">Tweede gesprekken</TableHead>
                    <TableHead className="text-right font-semibold">% Tweede gesprek</TableHead>
                    <TableHead className="text-right font-semibold">Dealsluiters</TableHead>
                    <TableHead className="text-right font-semibold">Plaatsingen</TableHead>
                    <TableHead className="text-right font-semibold">% Plaatsing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => {
                    const open = expanded3.has(g.unit);
                    const t = g.totals;
                    return (
                      <>
                        <TableRow key={g.unit} className="bg-muted/20 cursor-pointer hover:bg-muted/40" onClick={() => toggle(expanded3, setExpanded3, g.unit)}>
                          <TableCell className="font-semibold"><ExpandIcon open={open} />{g.unit}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.gesprekken}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.tweedeGesprekken}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.tweedeGesprekken, t.gesprekken))}`}>{fmtPct(t.tweedeGesprekken, t.gesprekken)}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.dealsluiters}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{t.plaatsingen}</TableCell>
                          <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(t.plaatsingen, t.dealsluiters))}`}>{fmtPct(t.plaatsingen, t.dealsluiters)}</TableCell>
                        </TableRow>
                        {open && g.entries.map((r) => (
                          <TableRow key={r.name}>
                            <TableCell className="pl-10 font-medium">{r.name}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.gesprekken}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.tweedeGesprekken}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.tweedeGesprekken, r.gesprekken))}`}>{fmtPct(r.tweedeGesprekken, r.gesprekken)}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.dealsluiters}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.plaatsingen}</TableCell>
                            <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(pct(r.plaatsingen, r.dealsluiters))}`}>{fmtPct(r.plaatsingen, r.dealsluiters)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                  <TableRow className="bg-muted/40 border-t-2 border-border font-bold">
                    <TableCell className="font-bold">Totaal</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.gesprekken}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.tweedeGesprekken}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.tweedeGesprekken, totals.gesprekken))}`}>{fmtPct(totals.tweedeGesprekken, totals.gesprekken)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.dealsluiters}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{totals.plaatsingen}</TableCell>
                    <TableCell className={`text-right tabular-nums font-bold ${conversionColor(pct(totals.plaatsingen, totals.dealsluiters))}`}>{fmtPct(totals.plaatsingen, totals.dealsluiters)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* === CUSTOM RATIOS === */}
        {customRatios.map((ratio, i) => (
          <CustomRatioTable key={i} groups={groups} totals={totals} ratio={ratio} />
        ))}
      </div>
    </ConsultantLayout>
  );
};

export default AcquisitieFunnel;

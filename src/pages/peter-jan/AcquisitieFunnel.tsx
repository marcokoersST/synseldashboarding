import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { acquisitionFunnelData, AcquisitionFunnelEntry } from "@/data/acquisitionFunnelData";
import { ChevronRight, ChevronDown } from "lucide-react";

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

type UnitGroup = { unit: string; entries: AcquisitionFunnelEntry[]; totals: AcquisitionFunnelEntry };

function useGroupedData() {
  return useMemo(() => {
    const map = new Map<string, AcquisitionFunnelEntry[]>();
    for (const e of acquisitionFunnelData) {
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
  }, []);
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

const AcquisitieFunnel = () => {
  const groups = useGroupedData();
  const totals = useMemo(() => grandTotals(groups), [groups]);

  const [expanded1, setExpanded1] = useState<Set<string>>(new Set());
  const [expanded2, setExpanded2] = useState<Set<string>>(new Set());
  const [expanded3, setExpanded3] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, unit: string) => {
    const next = new Set(set);
    next.has(unit) ? next.delete(unit) : next.add(unit);
    setFn(next);
  };

  return (
    <ConsultantLayout
      title="Acquisitie Funnel"
      subtitle="Conversie van toegewezen kandidaten door de volledige funnel"
    >
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
                        <TableRow
                          key={g.unit}
                          className="bg-muted/20 cursor-pointer hover:bg-muted/40"
                          onClick={() => toggle(expanded2, setExpanded2, g.unit)}
                        >
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
                        <TableRow
                          key={g.unit}
                          className="bg-muted/20 cursor-pointer hover:bg-muted/40"
                          onClick={() => toggle(expanded3, setExpanded3, g.unit)}
                        >
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
      </div>
    </ConsultantLayout>
  );
};

export default AcquisitieFunnel;

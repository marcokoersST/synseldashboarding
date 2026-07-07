import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight, Minus, Eye, EyeOff } from "lucide-react";
import {
  ComposedChart, Bar, Line, LineChart, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend, Cell, BarChart,
} from "recharts";
import { PROVINCIES, applyFilterAllStatuses, type Kandidaat, type FilterState } from "@/data/inkoopYieldData";

const fmt = (n: number) => n.toLocaleString("nl-NL");
const pct = (n: number, d = 0) => `${(n * 100).toFixed(d)}%`;

type Granularity = "week" | "month";

interface Props {
  titel: string | null;
  allRows: Kandidaat[]; // all kandidaten (unfiltered) — for full titel dataset
  filter: FilterState;
  onClose: () => void;
  filterBar?: React.ReactNode;
}

function periodKey(dateISO: string, g: Granularity): string {
  const d = new Date(dateISO);
  if (g === "month") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  // ISO-ish week
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7;
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const firstThu = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const wk = 1 + Math.round(((tmp.getTime() - firstThu.getTime()) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return `${tmp.getUTCFullYear()}-W${String(wk).padStart(2, "0")}`;
}

function DeltaBadge({ v, suffix = "" }: { v: number; suffix?: string }) {
  if (Math.abs(v) < 0.0005) return <span className="inline-flex items-center gap-0.5 text-muted-foreground text-[11px]"><Minus className="h-3 w-3" />—</span>;
  const up = v > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
      <Icon className="h-3 w-3" />
      {up ? "+" : ""}{v.toFixed(1)}{suffix}
    </span>
  );
}

export function TitelDrilldownDialog({ titel, allRows, filter, onClose, filterBar }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("week");
  const [showTable, setShowTable] = useState(false);
  const [locSort, setLocSort] = useState<{ k: string; dir: "asc" | "desc" }>({ k: "plaatsingspct", dir: "desc" });

  // Toggle visibility per metric in charts
  const [topChartSeries, setTopChartSeries] = useState({
    volume: true,
    gesprekken: true,
    plaatsingen: true,
  });
  const [ratioSeries, setRatioSeries] = useState({
    bemPct: true,
    gespPct: true,
    procPct: true,
    plPct: true,
  });

  const topSeriesMeta = [
    { key: "volume" as const, label: "Instroom", color: "hsl(210,70%,55%)" },
    { key: "gesprekken" as const, label: "Gesprekken", color: "hsl(35,85%,55%)" },
    { key: "plaatsingen" as const, label: "Plaatsingen", color: "hsl(150,65%,45%)" },
  ];

  const ratioSeriesMeta = [
    { key: "bemPct" as const, label: "Bemiddelbaar %", color: "hsl(200,60%,50%)" },
    { key: "gespPct" as const, label: "Gesprek %", color: "hsl(35,85%,55%)" },
    { key: "procPct" as const, label: "Procedure %", color: "hsl(260,60%,55%)" },
    { key: "plPct" as const, label: "Plaatsings %", color: "hsl(150,65%,45%)" },
  ];

  function toggleTop(key: keyof typeof topChartSeries) {
    setTopChartSeries(prev => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleRatio(key: keyof typeof ratioSeries) {
    setRatioSeries(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // Base subset: alle dashboard-filters toegepast + hard gepinned op deze titel.
  // applyFilterAllStatuses geeft ook niet-bemiddelbare kandidaten mee zodat we instroom zien.
  const titelRows = useMemo(() => {
    if (!titel) return [] as Kandidaat[];
    return applyFilterAllStatuses(allRows, { ...filter, titel: [titel] });
  }, [allRows, titel, filter]);

  // Actieve filter-chips voor de header
  const activeFilterChips = useMemo(() => {
    const chips: string[] = [];
    if (filter.provincie.length) chips.push(`Provincie: ${filter.provincie.length === 1 ? filter.provincie[0] : `${filter.provincie.length} gekozen`}`);
    if (filter.consultant.length) chips.push(`Consultant: ${filter.consultant.length === 1 ? filter.consultant[0] : `${filter.consultant.length} gekozen`}`);
    if (filter.businessUnit.length) chips.push(`Unit: ${filter.businessUnit.length === 1 ? filter.businessUnit[0] : `${filter.businessUnit.length} gekozen`}`);
    if (filter.kandidaatType.length) chips.push(`Type: ${filter.kandidaatType.join(", ")}`);
    if (filter.geplaatst.length) chips.push(`Geplaatst: ${filter.geplaatst.join(", ")}`);
    return chips;
  }, [filter]);


  // ─── KPI-strip ───
  const kpis = useMemo(() => {
    const volume = titelRows.length;
    const bem = titelRows.filter(r => r.bemiddelbaar).length;
    const gesp = titelRows.filter(r => r.inGesprek).length;
    const proc = titelRows.filter(r => r.inProcedure).length;
    const pl = titelRows.filter(r => r.geplaatst);
    const tijden = pl.filter(r => r.plaatsingsdatum).map(r =>
      (new Date(r.plaatsingsdatum!).getTime() - new Date(r.datumBinnenkomst).getTime()) / 86400000);
    return {
      volume, bem, gesp, proc, plaatsingen: pl.length,
      bemPct: volume ? bem / volume : 0,
      gespPct: bem ? gesp / bem : 0,
      procPct: bem ? proc / bem : 0,
      plPct: bem ? pl.length / bem : 0,
      gemTijd: tijden.length ? tijden.reduce((a, b) => a + b, 0) / tijden.length : 0,
    };
  }, [titelRows]);

  // ─── Time series ───
  const timeSeries = useMemo(() => {
    const map = new Map<string, { periode: string; volume: number; bemiddelbaar: number; gesprekken: number; procedures: number; plaatsingen: number }>();
    for (const r of titelRows) {
      const key = periodKey(r.datumBinnenkomst, granularity);
      const cell = map.get(key) ?? { periode: key, volume: 0, bemiddelbaar: 0, gesprekken: 0, procedures: 0, plaatsingen: 0 };
      cell.volume++;
      if (r.bemiddelbaar) cell.bemiddelbaar++;
      if (r.inGesprek) cell.gesprekken++;
      if (r.inProcedure) cell.procedures++;
      if (r.geplaatst) cell.plaatsingen++;
      map.set(key, cell);
    }
    return Array.from(map.values())
      .sort((a, b) => a.periode.localeCompare(b.periode))
      .map(c => ({
        ...c,
        bemPct: c.volume ? (c.bemiddelbaar / c.volume) * 100 : 0,
        gespPct: c.bemiddelbaar ? (c.gesprekken / c.bemiddelbaar) * 100 : 0,
        procPct: c.bemiddelbaar ? (c.procedures / c.bemiddelbaar) * 100 : 0,
        plPct: c.bemiddelbaar ? (c.plaatsingen / c.bemiddelbaar) * 100 : 0,
      }));
  }, [titelRows, granularity]);

  // ─── Locatie: provincie-stats + H1/H2 delta ───
  const provStats = useMemo(() => {
    const from = new Date(filter.dateFrom).getTime();
    const to = new Date(filter.dateTo).getTime();
    const mid = from + (to - from) / 2;

    return PROVINCIES.map(provincie => {
      const list = titelRows.filter(r => r.provincie === provincie);
      const h1 = list.filter(r => new Date(r.datumBinnenkomst).getTime() < mid);
      const h2 = list.filter(r => new Date(r.datumBinnenkomst).getTime() >= mid);
      const calc = (arr: typeof list) => {
        const vol = arr.length;
        const bem = arr.filter(r => r.bemiddelbaar).length;
        const gesp = arr.filter(r => r.inGesprek).length;
        const proc = arr.filter(r => r.inProcedure).length;
        const pl = arr.filter(r => r.geplaatst).length;
        return {
          volume: vol, bemiddelbaar: bem, gesprekken: gesp, procedures: proc, plaatsingen: pl,
          gesprekspct: bem ? gesp / bem : 0,
          plaatsingspct: bem ? pl / bem : 0,
        };
      };
      const total = calc(list);
      const h1s = calc(h1);
      const h2s = calc(h2);
      return {
        provincie,
        ...total,
        h1: h1s, h2: h2s,
        deltaVolume: h2s.volume - h1s.volume,
        deltaPlPct: (h2s.plaatsingspct - h1s.plaatsingspct) * 100, // procentpunten
      };
    }).filter(p => p.volume > 0);
  }, [titelRows, filter.dateFrom, filter.dateTo]);

  const sortedProv = useMemo(() => {
    const { k, dir } = locSort;
    return [...provStats].sort((a: any, b: any) => {
      const av = a[k], bv = b[k];
      if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return dir === "asc" ? av - bv : bv - av;
    });
  }, [provStats, locSort]);

  const stijgers = useMemo(() => [...provStats].filter(p => p.h1.bemiddelbaar >= 2 && p.h2.bemiddelbaar >= 2).sort((a, b) => b.deltaPlPct - a.deltaPlPct).slice(0, 3), [provStats]);
  const dalers = useMemo(() => [...provStats].filter(p => p.h1.bemiddelbaar >= 2 && p.h2.bemiddelbaar >= 2).sort((a, b) => a.deltaPlPct - b.deltaPlPct).slice(0, 3), [provStats]);

  const toggleLocSort = (k: string) => {
    setLocSort(s => s.k === k ? { k, dir: s.dir === "asc" ? "desc" : "asc" } : { k, dir: k === "provincie" ? "asc" : "desc" });
  };

  const ProvTh = ({ k, label, align }: { k: string; label: string; align?: "right" }) => (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleLocSort(k)}>
        {label}
        {locSort.k === k && (locSort.dir === "asc" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      </button>
    </TableHead>
  );

  return (
    <Dialog open={!!titel} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <span>{titel}</span>
            <Badge variant="outline" className="text-[10px]">Diepgaande titel-analyse</Badge>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Periode {filter.dateFrom} → {filter.dateTo} · alle statussen, gefilterd op titel.
          </p>
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground pt-0.5">Actieve filters:</span>
              {activeFilterChips.map(c => (
                <Badge key={c} variant="secondary" className="text-[10px] font-normal">{c}</Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {filterBar && (
          <div className="border rounded-md bg-muted/30 px-3 py-2 mt-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Filters aanpassen</div>
            {filterBar}
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-1">
          {[
            { label: "Instroom", value: fmt(kpis.volume) },
            { label: "Bemiddelbaar", value: fmt(kpis.bem), sub: pct(kpis.bemPct, 0) },
            { label: "Gesprekken", value: fmt(kpis.gesp), sub: pct(kpis.gespPct, 0) + " van bem." },
            { label: "Procedures", value: fmt(kpis.proc), sub: pct(kpis.procPct, 0) + " van bem." },
            { label: "Plaatsingen", value: fmt(kpis.plaatsingen), sub: pct(kpis.plPct, 1) + " van bem." },
            { label: "Ø tijd tot plaatsing", value: `${Math.round(kpis.gemTijd)} d` },
          ].map(k => (
            <div key={k.label} className="border border-border rounded-md px-2.5 py-2 bg-card">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{k.label}</div>
              <div className="text-sm font-semibold tabular-nums">{k.value}</div>
              {k.sub && <div className="text-[10px] text-muted-foreground">{k.sub}</div>}
            </div>
          ))}
        </div>

        <Tabs defaultValue="tijd" className="mt-3">
          <TabsList>
            <TabsTrigger value="tijd">Tijdsverloop</TabsTrigger>
            <TabsTrigger value="locatie">Locatie</TabsTrigger>
          </TabsList>

          {/* ═══ TIJDSVERLOOP ═══ */}
          <TabsContent value="tijd" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Volume, gesprekken en plaatsingen over tijd + onderliggende ratio's.</div>
              <div className="flex gap-0.5 rounded-md border border-border p-0.5 bg-background">
                {(["week", "month"] as const).map(g => (
                  <button key={g} onClick={() => setGranularity(g)}
                    className={`text-xs px-2.5 py-1 rounded transition ${granularity === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {g === "week" ? "Week" : "Maand"}
                  </button>
                ))}
              </div>
            </div>

            {timeSeries.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded">
                Geen data in gekozen periode.
              </div>
            ) : (
              <>
                <div className="border border-border rounded-md p-3">
                  <div className="text-xs font-semibold mb-2">Instroom · Gesprekken · Plaatsingen</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={timeSeries} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="periode" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="left" dataKey="volume" name="Instroom" fill="hsl(210,70%,55%)" opacity={0.7} />
                      <Line yAxisId="right" type="monotone" dataKey="gesprekken" name="Gesprekken" stroke="hsl(35,85%,55%)" strokeWidth={2.5} dot={{ r: 2 }} />
                      <Line yAxisId="right" type="monotone" dataKey="plaatsingen" name="Plaatsingen" stroke="hsl(150,65%,45%)" strokeWidth={2.5} dot={{ r: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-border rounded-md p-3">
                  <div className="text-xs font-semibold mb-2">Ratio's over tijd (%)</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={timeSeries} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="periode" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                        formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="bemPct" name="Bemiddelbaar %" stroke="hsl(200,60%,50%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="gespPct" name="Gesprek %" stroke="hsl(35,85%,55%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="procPct" name="Procedure %" stroke="hsl(260,60%,55%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="plPct" name="Plaatsings %" stroke="hsl(150,65%,45%)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-border rounded-md">
                  <button type="button" onClick={() => setShowTable(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/50 transition">
                    <span className="flex items-center gap-2">
                      {showTable ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      Onderliggende cijfers per {granularity === "week" ? "week" : "maand"}
                    </span>
                    <span className="text-muted-foreground">{timeSeries.length} perioden</span>
                  </button>
                  {showTable && (
                    <div className="border-t border-border overflow-x-auto max-h-80 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                          <TableRow>
                            <TableHead>Periode</TableHead>
                            <TableHead className="text-right">Instroom</TableHead>
                            <TableHead className="text-right">Bem.</TableHead>
                            <TableHead className="text-right">Gespr.</TableHead>
                            <TableHead className="text-right">Proc.</TableHead>
                            <TableHead className="text-right">Plaats.</TableHead>
                            <TableHead className="text-right">Bem %</TableHead>
                            <TableHead className="text-right">Gespr %</TableHead>
                            <TableHead className="text-right">Proc %</TableHead>
                            <TableHead className="text-right">Plaats %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timeSeries.map(r => (
                            <TableRow key={r.periode}>
                              <TableCell className="text-xs font-medium py-1.5">{r.periode}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.volume}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.bemiddelbaar}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.gesprekken}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.procedures}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5 font-semibold">{r.plaatsingen}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.bemPct.toFixed(0)}%</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.gespPct.toFixed(0)}%</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.procPct.toFixed(0)}%</TableCell>
                              <TableCell className="text-xs text-right tabular-nums py-1.5">{r.plPct.toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* ═══ LOCATIE ═══ */}
          <TabsContent value="locatie" className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Provincie-vergelijking op alle metrics. H1 = eerste helft van de filterperiode, H2 = tweede helft.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-md p-3">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Sterkste stijgers (Δ plaatsings-%)</div>
                <div className="space-y-1.5">
                  {stijgers.length === 0 && <div className="text-[11px] text-muted-foreground">Te weinig data voor betrouwbare vergelijking.</div>}
                  {stijgers.map(p => (
                    <div key={p.provincie} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{p.provincie}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {pct(p.h1.plaatsingspct, 0)} → {pct(p.h2.plaatsingspct, 0)}
                        <span className="ml-2"><DeltaBadge v={p.deltaPlPct} suffix="pp" /></span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-red-500/30 bg-red-500/5 rounded-md p-3">
                <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">Sterkste dalers (Δ plaatsings-%)</div>
                <div className="space-y-1.5">
                  {dalers.length === 0 && <div className="text-[11px] text-muted-foreground">Te weinig data voor betrouwbare vergelijking.</div>}
                  {dalers.map(p => (
                    <div key={p.provincie} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{p.provincie}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {pct(p.h1.plaatsingspct, 0)} → {pct(p.h2.plaatsingspct, 0)}
                        <span className="ml-2"><DeltaBadge v={p.deltaPlPct} suffix="pp" /></span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-border rounded-md p-3">
              <div className="text-xs font-semibold mb-2">Plaatsingskans per provincie</div>
              <ResponsiveContainer width="100%" height={Math.max(180, sortedProv.length * 22)}>
                <BarChart data={[...sortedProv].sort((a, b) => b.plaatsingspct - a.plaatsingspct)} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="provincie" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={90} />
                  <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                    formatter={(v: any) => `${(Number(v) * 100).toFixed(1)}%`} />
                  <Bar dataKey="plaatsingspct" name="Plaatsings %" fill="hsl(150,65%,45%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <ProvTh k="provincie" label="Provincie" />
                      <ProvTh k="volume" label="Instroom" align="right" />
                      <ProvTh k="bemiddelbaar" label="Bem." align="right" />
                      <ProvTh k="gesprekken" label="Gespr." align="right" />
                      <ProvTh k="gesprekspct" label="Gespr. %" align="right" />
                      <ProvTh k="procedures" label="Proc." align="right" />
                      <ProvTh k="plaatsingen" label="Plaats." align="right" />
                      <ProvTh k="plaatsingspct" label="Plaatsings %" align="right" />
                      <ProvTh k="deltaVolume" label="Δ Volume H2-H1" align="right" />
                      <ProvTh k="deltaPlPct" label="Δ Plaats.% (pp)" align="right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProv.map(p => (
                      <TableRow key={p.provincie}>
                        <TableCell className="text-xs font-medium py-1.5">{p.provincie}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">{p.volume}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">{p.bemiddelbaar}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">{p.gesprekken}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">{pct(p.gesprekspct, 0)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">{p.procedures}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5 font-semibold">{p.plaatsingen}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">{pct(p.plaatsingspct, 1)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">
                          <DeltaBadge v={p.deltaVolume} />
                        </TableCell>
                        <TableCell className="text-xs text-right tabular-nums py-1.5">
                          <DeltaBadge v={p.deltaPlPct} suffix="pp" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedProv.length === 0 && (
                      <TableRow><TableCell colSpan={10} className="text-xs text-center text-muted-foreground py-6">Geen provincies met data</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default TitelDrilldownDialog;

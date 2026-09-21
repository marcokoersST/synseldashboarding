import { Fragment, useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarClock, ChevronDown, ChevronRight, CircleDollarSign, Handshake, Medal, Percent, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { plaatsingenRankingData, type PlaatsingCategorie, type PlaatsingRankingRecord } from "@/data/plaatsingenRankingData";

type Scope = "week" | "periode" | "jaar";

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const euroExact = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const number = new Intl.NumberFormat("nl-NL");
const decimal = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
const longDate = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" });

const allCategories: PlaatsingCategorie[] = ["Detavast", "W&S", "Marge Fac"];

const categoryStyles: Record<PlaatsingCategorie, string> = {
  Detavast: "border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 text-ranking-plaatsingen",
  "W&S": "border-ranking-vacatures/30 bg-ranking-vacatures/10 text-ranking-vacatures",
  "Marge Fac": "border-ranking-intakes/30 bg-ranking-intakes/10 text-ranking-intakes",
};

const categoryBars: Record<PlaatsingCategorie, string> = {
  Detavast: "bg-ranking-plaatsingen",
  "W&S": "bg-ranking-vacatures",
  "Marge Fac": "bg-ranking-intakes",
};

export default function PlaatsingenRanglijst() {
  const [scope, setScope] = useState<Scope>("week");
  const [week, setWeek] = useState("42");
  const [periode, setPeriode] = useState("11");
  const [jaar, setJaar] = useState("2026");
  const [expanded, setExpanded] = useState<string | null>("Robin van Bruggen");

  const filtered = useMemo(() => plaatsingenRankingData.filter((record) => {
    if (scope === "week") return record.week === Number(week) && record.jaar === Number(jaar);
    if (scope === "periode") return record.periode === Number(periode) && record.jaar === Number(jaar);
    return record.jaar === Number(jaar);
  }), [scope, week, periode, jaar]);

  const ranking = useMemo(() => {
    const grouped = new Map<string, { consultant: string; unit: string; dealwaarde: number; records: PlaatsingRankingRecord[] }>();
    filtered.forEach((record) => {
      const current = grouped.get(record.consultant) ?? { consultant: record.consultant, unit: record.unit, dealwaarde: 0, records: [] };
      current.dealwaarde += record.dealwaarde;
      current.records.push(record);
      grouped.set(record.consultant, current);
    });
    return [...grouped.values()]
      .map((entry) => {
        const sorted = [...entry.records].sort((a, b) => b.dealwaarde - a.dealwaarde);
        const detacheringen = sorted.filter((record) => record.factor !== null);
        const wsRecords = sorted.filter((record) => record.wsPercentage !== null);
        return {
          ...entry,
          records: sorted,
          mix: allCategories.map((category) => ({ category, count: sorted.filter((record) => record.categorie === category).length })).filter((item) => item.count > 0),
          gemiddeldeFactor: detacheringen.length ? detacheringen.reduce((sum, record) => sum + (record.factor ?? 0), 0) / detacheringen.length : null,
          totaalUren: sorted.reduce((sum, record) => sum + record.looptijdUren, 0),
          gemiddeldWsPercentage: wsRecords.length ? wsRecords.reduce((sum, record) => sum + (record.wsPercentage ?? 0), 0) / wsRecords.length : null,
        };
      })
      .sort((a, b) => b.dealwaarde - a.dealwaarde);
  }, [filtered]);

  const totalValue = filtered.reduce((sum, record) => sum + record.dealwaarde, 0);
  const averageValue = filtered.length ? totalValue / filtered.length : 0;
  const unitTotals = filtered.reduce<Record<string, number>>((totals, record) => {
    totals[record.unit] = (totals[record.unit] ?? 0) + record.dealwaarde;
    return totals;
  }, {});
  const bestUnit = Object.entries(unitTotals).sort((a, b) => b[1] - a[1])[0];
  const categoryTotals = allCategories.map((category) => {
    const rows = filtered.filter((record) => record.categorie === category);
    return {
      category,
      count: rows.length,
      value: rows.reduce((sum, record) => sum + record.dealwaarde, 0),
      share: filtered.length ? (rows.length / filtered.length) * 100 : 0,
    };
  });

  const selectedLabel = scope === "week" ? `Week ${week}` : scope === "periode" ? `Periode ${periode}` : jaar;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-ranking-plaatsingen">
            <Handshake className="h-4 w-4" /> Commerciële prestaties
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Plaatsingen ranglijst</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerangschikt op totale dealwaarde · {selectedLabel}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs value={scope} onValueChange={(value) => setScope(value as Scope)}>
            <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
              <TabsTrigger value="week"><span className="sm:hidden">W</span><span className="hidden sm:inline">Week</span></TabsTrigger>
              <TabsTrigger value="periode"><span className="sm:hidden">P</span><span className="hidden sm:inline">Periode</span></TabsTrigger>
              <TabsTrigger value="jaar"><span className="sm:hidden">J</span><span className="hidden sm:inline">Jaar</span></TabsTrigger>
            </TabsList>
          </Tabs>
          {scope === "week" && (
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="w-full bg-card sm:w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{[39, 40, 41, 42, 43, 44].map((value) => <SelectItem key={value} value={String(value)}>Week {value}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {scope === "periode" && (
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-full bg-card sm:w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: 13 }, (_, index) => index + 1).map((value) => <SelectItem key={value} value={String(value)}>Periode {value}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Select value={jaar} onValueChange={setJaar}>
            <SelectTrigger className="w-full bg-card sm:w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="2026">2026</SelectItem></SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryMetric icon={Handshake} label="Plaatsingen" value={number.format(filtered.length)} />
          <SummaryMetric icon={CircleDollarSign} label="Totale dealwaarde" value={euro.format(totalValue)} />
          <SummaryMetric icon={BriefcaseBusiness} label="Gemiddelde dealwaarde" value={euro.format(averageValue)} />
          <SummaryMetric icon={Users} label="Beste unit" value={bestUnit?.[0] ?? "—"} sub={bestUnit ? euro.format(bestUnit[1]) : undefined} compact />
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Verdeling plaatsingstype · {selectedLabel}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {categoryTotals.map((item) => (
              <div key={item.category}>
                <Badge variant="outline" className={cn("mb-2", categoryStyles[item.category])}>{item.category}</Badge>
                <div className="text-lg font-bold tabular-nums text-foreground">{euro.format(item.value)}</div>
                <div className="mb-2 text-xs text-muted-foreground">{item.count} plaatsingen · {Math.round(item.share)}%</div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-all duration-500", categoryBars[item.category])} style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-foreground">Beste plaatsingen · {selectedLabel}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Type plaatsing en voorwaarden direct in de lijst · klik voor kandidaat, klant en exacte datums</p>
          </div>
          <Badge variant="outline" className="border-ranking-plaatsingen/30 bg-card text-ranking-plaatsingen">{ranking.length} consultants</Badge>
        </div>
        {ranking.length ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead className="min-w-[180px]">Consultant</TableHead>
                  <TableHead className="min-w-[140px]">Unit</TableHead>
                  <TableHead className="min-w-[220px]">Type plaatsingen</TableHead>
                  <TableHead className="text-right">Gem. factor</TableHead>
                  <TableHead className="text-right">Looptijd</TableHead>
                  <TableHead className="text-right">Gem. W&amp;S %</TableHead>
                  <TableHead className="text-right">Plaatsingen</TableHead>
                  <TableHead className="text-right">Dealwaarde</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Details</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((entry, index) => {
                  const rank = index + 1;
                  const isOpen = expanded === entry.consultant;
                  return (
                    <Fragment key={entry.consultant}>
                      <TableRow className={cn("cursor-pointer", rank <= 3 && "bg-ranking-plaatsingen/[0.035]")} onClick={() => setExpanded(isOpen ? null : entry.consultant)}>
                        <TableCell className="font-bold tabular-nums">
                          <span className="flex items-center gap-2">
                            {rank === 1 ? <Trophy className="h-5 w-5 text-primary" /> : rank <= 3 ? <Medal className="h-5 w-5 text-muted-foreground" /> : <span className="w-5 text-center text-muted-foreground">{rank}</span>}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{entry.consultant}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.unit}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.mix.map((item) => (
                              <Badge key={item.category} variant="outline" className={cn("text-[11px]", categoryStyles[item.category])}>
                                {item.category} · {item.count}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{entry.gemiddeldeFactor ? decimal.format(entry.gemiddeldeFactor) : "—"}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{entry.totaalUren ? `${number.format(entry.totaalUren)}h` : "—"}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{entry.gemiddeldWsPercentage ? `${decimal.format(entry.gemiddeldWsPercentage)}%` : "—"}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{entry.records.length}</TableCell>
                        <TableCell className="text-right text-base font-bold tabular-nums text-ranking-plaatsingen">{euro.format(entry.dealwaarde)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => { event.stopPropagation(); setExpanded(isOpen ? null : entry.consultant); }} aria-label={`${isOpen ? "Sluit" : "Open"} plaatsingen van ${entry.consultant}`}>
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell colSpan={10} className="px-4 py-3 sm:px-8">
                            <div className="overflow-x-auto rounded-md border border-border bg-card">
                              <table className="w-full min-w-[1000px] text-xs">
                                <thead>
                                  <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="p-3 font-medium">Kandidaat</th>
                                    <th className="p-3 font-medium">Klant</th>
                                    <th className="p-3 font-medium">Type</th>
                                    <th className="p-3 font-medium">Voorwaarden</th>
                                    <th className="p-3 font-medium">Plaatsingsdatum</th>
                                    <th className="p-3 font-medium">Startdatum</th>
                                    <th className="p-3 font-medium">Einddatum</th>
                                    <th className="p-3 text-right font-medium">Dealwaarde</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entry.records.map((record) => (
                                    <tr key={record.id} className="border-b border-border/50 last:border-0">
                                      <td className="p-3 font-medium text-foreground">{record.kandidaat}</td>
                                      <td className="p-3 text-muted-foreground">{record.klant}</td>
                                      <td className="p-3"><Badge variant="outline" className={categoryStyles[record.categorie]}>{record.categorie}</Badge></td>
                                      <td className="p-3">
                                        {record.wsPercentage !== null ? (
                                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                                            <span className="inline-flex items-center gap-1 font-medium text-foreground"><Percent className="h-3 w-3" />{decimal.format(record.wsPercentage)}% fee</span>
                                            <span>over jaarsalaris {euro.format(record.jaarsalaris ?? 0)}</span>
                                          </span>
                                        ) : (
                                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                                            <span className="font-medium text-foreground">Factor {decimal.format(record.factor ?? 0)}</span>
                                            <span>· tarief {euroExact.format(record.uurtarief ?? 0)}/uur</span>
                                            <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" />{number.format(record.looptijdUren)}h</span>
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3 text-muted-foreground">{longDate.format(new Date(record.plaatsingsdatum))}</td>
                                      <td className="p-3 text-muted-foreground">{longDate.format(new Date(record.startdatum))}</td>
                                      <td className="p-3 tabular-nums text-muted-foreground">{record.einddatum ? shortDate.format(new Date(record.einddatum)) : "—"}</td>
                                      <td className="p-3 text-right font-semibold tabular-nums">{euro.format(record.dealwaarde)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : <div className="px-6 py-16 text-center text-sm text-muted-foreground">Geen plaatsingen in deze selectie.</div>}
      </section>
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, value, sub, compact = false }: { icon: typeof Handshake; label: string; value: string; sub?: string; compact?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <Icon className="mb-3 h-4 w-4 text-ranking-plaatsingen" />
      <div className={cn("font-bold text-foreground", compact ? "text-base leading-tight" : "text-xl tabular-nums")}>{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}{sub ? ` · ${sub}` : ""}</div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Award, BriefcaseBusiness, ChevronDown, ChevronRight, CircleDollarSign, Handshake, Medal, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { plaatsingenRankingData, type PlaatsingCategorie } from "@/data/plaatsingenRankingData";

type Scope = "week" | "periode" | "jaar";

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("nl-NL");
const date = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" });

const categoryStyles: Record<PlaatsingCategorie, string> = {
  Detavast: "border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 text-ranking-plaatsingen",
  "W&S": "border-ranking-vacatures/30 bg-ranking-vacatures/10 text-ranking-vacatures",
  "Marge Fac": "border-ranking-intakes/30 bg-ranking-intakes/10 text-ranking-intakes",
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
    const grouped = new Map<string, { consultant: string; unit: string; dealwaarde: number; records: typeof filtered }>();
    filtered.forEach((record) => {
      const current = grouped.get(record.consultant) ?? { consultant: record.consultant, unit: record.unit, dealwaarde: 0, records: [] };
      current.dealwaarde += record.dealwaarde;
      current.records.push(record);
      grouped.set(record.consultant, current);
    });
    return [...grouped.values()].sort((a, b) => b.dealwaarde - a.dealwaarde);
  }, [filtered]);

  const totalValue = filtered.reduce((sum, record) => sum + record.dealwaarde, 0);
  const averageValue = filtered.length ? totalValue / filtered.length : 0;
  const unitTotals = filtered.reduce<Record<string, number>>((totals, record) => {
    totals[record.unit] = (totals[record.unit] ?? 0) + record.dealwaarde;
    return totals;
  }, {});
  const bestUnit = Object.entries(unitTotals).sort((a, b) => b[1] - a[1])[0];
  const categoryTotals = (["Detavast", "W&S", "Marge Fac"] as PlaatsingCategorie[]).map((category) => ({
    category,
    count: filtered.filter((record) => record.categorie === category).length,
    value: filtered.filter((record) => record.categorie === category).reduce((sum, record) => sum + record.dealwaarde, 0),
  }));

  const selectedLabel = scope === "week" ? `Week ${week}` : scope === "periode" ? `Periode ${periode}` : jaar;

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
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
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="periode">Periode</TabsTrigger>
              <TabsTrigger value="jaar">Jaar</TabsTrigger>
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

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 px-5 py-4">
            <div>
              <h2 className="font-semibold text-foreground">Beste plaatsingen · {selectedLabel}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Klik op een consultant voor alle onderliggende plaatsingen</p>
            </div>
            <Badge variant="outline" className="border-ranking-plaatsingen/30 bg-card text-ranking-plaatsingen">{ranking.length} consultants</Badge>
          </div>
          {ranking.length ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead className="hidden md:table-cell">Unit</TableHead>
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
                    <>
                      <TableRow key={entry.consultant} className={cn("group", rank <= 3 && "bg-ranking-plaatsingen/[0.035]")}>
                        <TableCell className="font-bold tabular-nums">
                          <span className="flex items-center gap-2">
                            {rank === 1 ? <Trophy className="h-5 w-5 text-primary" /> : rank <= 3 ? <Medal className="h-5 w-5 text-muted-foreground" /> : <span className="w-5 text-center text-muted-foreground">{rank}</span>}
                          </span>
                        </TableCell>
                        <TableCell><div className="font-semibold text-foreground">{entry.consultant}</div><div className="mt-0.5 text-xs text-muted-foreground md:hidden">{entry.unit}</div></TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">{entry.unit}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{entry.records.length}</TableCell>
                        <TableCell className="text-right text-base font-bold tabular-nums text-ranking-plaatsingen">{euro.format(entry.dealwaarde)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(isOpen ? null : entry.consultant)} aria-label={`${isOpen ? "Sluit" : "Open"} plaatsingen van ${entry.consultant}`}>
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow key={`${entry.consultant}-details`} className="bg-muted/20 hover:bg-muted/20">
                          <TableCell colSpan={6} className="px-4 py-3 sm:px-8">
                            <div className="overflow-x-auto rounded-md border border-border bg-card">
                              <table className="w-full min-w-[720px] text-xs">
                                <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="p-3 font-medium">Kandidaat</th><th className="p-3 font-medium">Klant</th><th className="p-3 font-medium">Categorie</th><th className="p-3 font-medium">Datum</th><th className="p-3 text-right font-medium">Looptijd</th><th className="p-3 text-right font-medium">Dealwaarde</th></tr></thead>
                                <tbody>{entry.records.map((record) => <tr key={record.id} className="border-b border-border/50 last:border-0"><td className="p-3 font-medium text-foreground">{record.kandidaat}</td><td className="p-3 text-muted-foreground">{record.klant}</td><td className="p-3"><Badge variant="outline" className={categoryStyles[record.categorie]}>{record.categorie}</Badge></td><td className="p-3 text-muted-foreground">{date.format(new Date(record.plaatsingsdatum))}</td><td className="p-3 text-right tabular-nums text-muted-foreground">{record.looptijdUren ? `${number.format(record.looptijdUren)}h` : "—"}</td><td className="p-3 text-right font-semibold tabular-nums">{euro.format(record.dealwaarde)}</td></tr>)}</tbody>
                              </table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          ) : <div className="px-6 py-16 text-center text-sm text-muted-foreground">Geen plaatsingen in deze selectie.</div>}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-0">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Award className="h-4 w-4 text-primary" /><h2 className="font-semibold text-foreground">Overzicht</h2></div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
              <SummaryMetric icon={Handshake} label="Plaatsingen" value={number.format(filtered.length)} />
              <SummaryMetric icon={CircleDollarSign} label="Dealwaarde" value={euro.format(totalValue)} />
              <SummaryMetric icon={BriefcaseBusiness} label="Gemiddeld" value={euro.format(averageValue)} />
              <SummaryMetric icon={Users} label="Beste unit" value={bestUnit?.[0] ?? "—"} compact />
            </div>
            {bestUnit && <p className="mt-3 text-xs text-muted-foreground">{bestUnit[0]} realiseert {euro.format(bestUnit[1])} in deze selectie.</p>}
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Verdeling plaatsingstype</h2>
            <div className="space-y-4">
              {categoryTotals.map((item) => {
                const percentage = filtered.length ? (item.count / filtered.length) * 100 : 0;
                return <div key={item.category}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-foreground">{item.category}</span><span className="tabular-nums text-muted-foreground">{item.count} · {euro.format(item.value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-ranking-plaatsingen transition-all duration-500" style={{ width: `${percentage}%` }} /></div></div>;
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, value, compact = false }: { icon: typeof Handshake; label: string; value: string; compact?: boolean }) {
  return <div className="min-h-[112px] bg-card p-4"><Icon className="mb-3 h-4 w-4 text-ranking-plaatsingen" /><div className={cn("font-bold text-foreground", compact ? "text-sm leading-tight" : "text-xl tabular-nums")}>{value}</div><div className="mt-1 text-[11px] text-muted-foreground">{label}</div></div>;
}
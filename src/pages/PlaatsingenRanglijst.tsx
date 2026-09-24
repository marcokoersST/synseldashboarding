import { Fragment, useMemo, useState } from "react";
import { BriefcaseBusiness, CircleDollarSign, Handshake, Medal, Monitor, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { RankingDevInfo } from "@/components/dashboard/RankingDevInfo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { plaatsingenRankingData, type PlaatsingCategorie, type PlaatsingRankingRecord } from "@/data/plaatsingenRankingData";
import { useLanguage } from "@/contexts/LanguageContext";
import { localeFor } from "@/lib/translations";

type Scope = "week" | "periode" | "jaar";

const allCategories: PlaatsingCategorie[] = ["Detavast", "W&S", "Marge Fac"];

const categoryStyles: Record<PlaatsingCategorie, string> = {
  Detavast: "border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 text-ranking-plaatsingen",
  "W&S": "border-ranking-vacatures/30 bg-ranking-vacatures/10 text-ranking-vacatures",
  "Marge Fac": "border-ranking-intakes/30 bg-ranking-intakes/10 text-ranking-intakes",
};

export default function PlaatsingenRanglijst() {
  const { language } = useLanguage();
  const locale = localeFor(language);
  const euro = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }), [locale]);
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const decimal = useMemo(() => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const [scope, setScope] = useState<Scope>("week");
  const [week, setWeek] = useState("42");
  const [periode, setPeriode] = useState("11");
  const [jaar, setJaar] = useState("2026");

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
        return {
          ...entry,
          records: sorted,
        };
      })
      .sort((a, b) => b.dealwaarde - a.dealwaarde);
  }, [filtered]);

  const totalValue = filtered.reduce((sum, record) => sum + record.dealwaarde, 0);
  const averageValue = filtered.length ? totalValue / filtered.length : 0;
  const bestPlacement = filtered.length ? filtered.reduce((best, record) => (record.dealwaarde > best.dealwaarde ? record : best), filtered[0]) : null;
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
  const devSelectedLabel = scope === "week" ? `Week ${week}` : scope === "periode" ? `Period ${periode}` : jaar;

  return (
    <div className="space-y-3">
      <section className="flex flex-col gap-3 border-b border-border pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase text-ranking-plaatsingen">
            <Handshake className="h-4 w-4" /> Commerciële prestaties
          </div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Plaatsingen ranglijst</h1>
          <p className="text-xs text-muted-foreground">Gerangschikt op totale dealwaarde · {selectedLabel}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <RankingDevInfo
            source="plaatsingenRankingData: static placements for active consultants from the central consultant list."
            filters={`Scope: ${scope === "periode" ? "period" : scope === "jaar" ? "year" : scope}; selection: ${devSelectedLabel}; year: ${jaar}. Week filters by week and year, period by period and year, and year includes all records from that year.`}
            ranking="Placements are grouped by consultant. Consultant groups are sorted by total deal value in descending order; placements within a group are sorted by individual deal value in descending order."
            calculations={[
              "Total deal value = sum of all visible placements.",
              "Average deal value = total deal value / number of visible placements.",
              "Best placement = visible placement with the highest individual deal value.",
              "Temp-to-perm/Margin invoicing: deal value is derived from rate, cost price, duration and weighting. Permanent recruitment: annual salary × percentage.",
            ]}
            rowCount={filtered.length}
          />
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
          <Link
            to="/tv/plaatsingen-ranglijst"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/50"
          >
            <Monitor className="h-3.5 w-3.5" />
            TV Modus
          </Link>
        </div>
      </section>

      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <SummaryMetric icon={Handshake} label="Plaatsingen" value={number.format(filtered.length)} />
          <SummaryMetric icon={CircleDollarSign} label="Totale dealwaarde" value={euro.format(totalValue)} />
          <SummaryMetric icon={BriefcaseBusiness} label="Gemiddelde dealwaarde" value={euro.format(averageValue)} />
          <SummaryMetric
            icon={Trophy}
            label="Beste plaatsing"
            value={bestPlacement ? bestPlacement.kandidaat : "—"}
            sub={bestPlacement ? `${bestPlacement.consultant} · ${euro.format(bestPlacement.dealwaarde)}` : undefined}
            compact
          />
        </div>

        <div className="rounded-md border border-border bg-card px-3 py-2.5 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold text-foreground">Verdeling plaatsingstype · {selectedLabel}</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {categoryTotals.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", categoryStyles[item.category])}>{item.category}</Badge>
                  <span className="text-xs font-bold tabular-nums text-foreground">{euro.format(item.value)}</span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{item.count} plaatsingen · {Math.round(item.share)}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 px-3 py-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Beste plaatsingen · {selectedLabel}</h2>
            <p className="text-[10px] text-muted-foreground">Alle plaatsingen en voorwaarden direct zichtbaar</p>
          </div>
          <Badge variant="outline" className="border-ranking-plaatsingen/30 bg-card text-ranking-plaatsingen">{ranking.length} consultants</Badge>
        </div>
        {ranking.length ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[960px] text-xs">
              <TableHeader>
                <TableRow className="h-9 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-9 w-10 px-2 text-[10px]">Pos.</TableHead>
                  <TableHead className="h-9 min-w-[145px] px-2 text-[10px]">Consultant</TableHead>
                  <TableHead className="h-9 min-w-[120px] px-2 text-[10px]">KDD</TableHead>
                  <TableHead className="h-9 min-w-[110px] px-2 text-[10px]">Klant</TableHead>
                  <TableHead className="h-9 px-2 text-[10px]">Type</TableHead>
                  <TableHead className="h-9 px-2 text-right text-[10px]">Factor</TableHead>
                  <TableHead className="h-9 px-2 text-right text-[10px]">Looptijd</TableHead>
                  <TableHead className="h-9 px-2 text-right text-[10px]">W&amp;S</TableHead>
                  <TableHead className="h-9 px-2 text-right text-[10px]">Dealwaarde</TableHead>
                  <TableHead className="h-9 min-w-[125px] px-2 text-right text-[10px]">Totaal dealwaarde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <Fragment key={entry.consultant}>
                      {entry.records.map((record, recordIndex) => (
                        <TableRow key={record.id} className={cn("h-9 hover:bg-muted/30", recordIndex === 0 && "border-t-2 border-t-border", rank <= 3 && "bg-ranking-plaatsingen/[0.025]")}>
                          {recordIndex === 0 && <TableCell rowSpan={entry.records.length} className="px-2 py-1.5 align-top font-bold tabular-nums">
                            {rank === 1 ? <Trophy className="h-3.5 w-3.5 text-primary" /> : rank <= 3 ? <Medal className="h-3.5 w-3.5 text-muted-foreground" /> : rank}
                          </TableCell>}
                          {recordIndex === 0 && <TableCell rowSpan={entry.records.length} className="px-2 py-1.5 align-top font-semibold text-foreground">{entry.consultant}</TableCell>}
                          <TableCell className="px-2 py-1.5 font-medium text-foreground">
                            {entry.records.length > 1 && (
                              <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-semibold tabular-nums text-muted-foreground">
                                {recordIndex + 1}
                              </span>
                            )}
                            {record.kandidaat}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-muted-foreground">{record.klant}</TableCell>
                          <TableCell className="px-2 py-1.5"><Badge variant="outline" className={cn("h-5 whitespace-nowrap px-1.5 text-[9px]", categoryStyles[record.categorie])}>{record.categorie}</Badge></TableCell>
                          <TableCell className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{record.factor !== null ? decimal.format(record.factor) : "—"}</TableCell>
                          <TableCell className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{record.looptijdUren ? `${number.format(record.looptijdUren)}h` : "—"}</TableCell>
                          <TableCell className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{record.wsPercentage !== null ? `${decimal.format(record.wsPercentage)}%` : "—"}</TableCell>
                          <TableCell className="px-2 py-1.5 text-right font-medium tabular-nums">{euro.format(record.dealwaarde)}</TableCell>
                          {recordIndex === 0 && <TableCell rowSpan={entry.records.length} className="px-2 py-1.5 text-right align-top font-bold tabular-nums text-ranking-plaatsingen">{euro.format(entry.dealwaarde)}</TableCell>}
                        </TableRow>
                      ))}
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
    <div className="rounded-md border border-border bg-card px-3 py-2.5 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-ranking-plaatsingen" /><span className="text-[10px] text-muted-foreground">{label}</span></div>
      <div className={cn("font-bold text-foreground", compact ? "text-sm leading-tight" : "text-base tabular-nums")}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

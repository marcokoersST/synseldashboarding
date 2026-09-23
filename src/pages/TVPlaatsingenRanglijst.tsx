import { Fragment, useMemo, useState } from "react";
import { CircleDollarSign, Handshake, Medal, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { cn } from "@/lib/utils";
import { plaatsingenRankingData, type PlaatsingCategorie, type PlaatsingRankingRecord } from "@/data/plaatsingenRankingData";

type Scope = "week" | "periode" | "jaar";

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("nl-NL");
const decimal = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const allCategories: PlaatsingCategorie[] = ["Detavast", "W&S", "Marge Fac"];

const categoryStyles: Record<PlaatsingCategorie, string> = {
  Detavast: "border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 text-ranking-plaatsingen",
  "W&S": "border-ranking-vacatures/30 bg-ranking-vacatures/10 text-ranking-vacatures",
  "Marge Fac": "border-ranking-intakes/30 bg-ranking-intakes/10 text-ranking-intakes",
};

function Content() {
  const compact = useTVCompact();
  const [scope, setScope] = useState<Scope>("week");
  const [week, setWeek] = useState("42");
  const [periode, setPeriode] = useState("11");
  const jaar = "2026";

  const filtered = useMemo(() => plaatsingenRankingData.filter((record) => {
    if (scope === "week") return record.week === Number(week) && record.jaar === Number(jaar);
    if (scope === "periode") return record.periode === Number(periode) && record.jaar === Number(jaar);
    return record.jaar === Number(jaar);
  }), [scope, week, periode]);

  const ranking = useMemo(() => {
    const grouped = new Map<string, { consultant: string; dealwaarde: number; records: PlaatsingRankingRecord[] }>();
    filtered.forEach((record) => {
      const current = grouped.get(record.consultant) ?? { consultant: record.consultant, dealwaarde: 0, records: [] };
      current.dealwaarde += record.dealwaarde;
      current.records.push(record);
      grouped.set(record.consultant, current);
    });
    return [...grouped.values()]
      .map((entry) => ({ ...entry, records: [...entry.records].sort((a, b) => b.dealwaarde - a.dealwaarde) }))
      .sort((a, b) => b.dealwaarde - a.dealwaarde);
  }, [filtered]);

  const totalValue = filtered.reduce((sum, record) => sum + record.dealwaarde, 0);
  const averageValue = filtered.length ? totalValue / filtered.length : 0;
  const categoryTotals = allCategories.map((category) => {
    const rows = filtered.filter((record) => record.categorie === category);
    return { category, count: rows.length, value: rows.reduce((sum, r) => sum + r.dealwaarde, 0) };
  });

  const selectedLabel = scope === "week" ? `Week ${week}` : scope === "periode" ? `Periode ${periode}` : jaar;

  return (
    <div className={cn("flex flex-col gap-2", compact ? "h-full min-h-0" : "")}>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[0.75em] font-semibold uppercase text-ranking-plaatsingen">
            <Handshake className="h-[1em] w-[1em]" /> Commerciële prestaties
          </div>
          <h2 className={cn("font-bold text-foreground", compact ? "text-[1.6em] leading-tight" : "text-xl")}>
            Beste plaatsingen · {selectedLabel}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={scope} onValueChange={(value) => setScope(value as Scope)}>
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
              <TabsTrigger value="periode" className="text-xs">Periode</TabsTrigger>
              <TabsTrigger value="jaar" className="text-xs">Jaar</TabsTrigger>
            </TabsList>
          </Tabs>
          {scope === "week" && (
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="h-8 w-[120px] bg-card text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{[39, 40, 41, 42, 43, 44].map((v) => <SelectItem key={v} value={String(v)}>Week {v}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {scope === "periode" && (
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="h-8 w-[130px] bg-card text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: 13 }, (_, i) => i + 1).map((v) => <SelectItem key={v} value={String(v)}>Periode {v}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-6">
        <Metric icon={Handshake} label="Plaatsingen" value={number.format(filtered.length)} />
        <Metric icon={CircleDollarSign} label="Totale dealwaarde" value={euro.format(totalValue)} />
        <Metric icon={Users} label="Gem. dealwaarde" value={euro.format(averageValue)} />
        {categoryTotals.map((item) => (
          <div key={item.category} className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className={cn("h-5 px-1.5 text-[0.7em]", categoryStyles[item.category])}>{item.category}</Badge>
              <span className="text-[0.7em] text-muted-foreground">{item.count}x</span>
            </div>
            <div className="mt-1 text-[1.05em] font-bold tabular-nums text-foreground">{euro.format(item.value)}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={cn("overflow-hidden rounded-md border border-border bg-card shadow-sm", compact ? "flex min-h-0 flex-1 flex-col" : "")}>
        <div className={cn("overflow-auto", compact && "min-h-0 flex-1")}>
          <Table className={cn(compact ? "text-[0.95em]" : "text-xs")}>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="h-9 bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-9 w-10 px-2 text-[0.75em]">Pos.</TableHead>
                <TableHead className="h-9 px-2 text-[0.75em]">Consultant</TableHead>
                <TableHead className="h-9 px-2 text-[0.75em]">KDD</TableHead>
                <TableHead className="h-9 px-2 text-[0.75em]">Klant</TableHead>
                <TableHead className="h-9 px-2 text-[0.75em]">Type</TableHead>
                <TableHead className="h-9 px-2 text-right text-[0.75em]">Factor</TableHead>
                <TableHead className="h-9 px-2 text-right text-[0.75em]">Looptijd</TableHead>
                <TableHead className="h-9 px-2 text-right text-[0.75em]">W&amp;S</TableHead>
                <TableHead className="h-9 px-2 text-right text-[0.75em]">Dealwaarde</TableHead>
                <TableHead className="h-9 px-2 text-right text-[0.75em]">Totaal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((entry, index) => {
                const rank = index + 1;
                return (
                  <Fragment key={entry.consultant}>
                    {entry.records.map((record, recordIndex) => (
                      <TableRow key={record.id} className={cn("h-9 hover:bg-muted/30", recordIndex === 0 && "border-t-2 border-t-border", rank <= 3 && "bg-ranking-plaatsingen/[0.04]")}>
                        {recordIndex === 0 && (
                          <TableCell rowSpan={entry.records.length} className="px-2 py-1.5 align-top font-bold tabular-nums">
                            {rank === 1 ? <Trophy className="h-4 w-4 text-primary" /> : rank <= 3 ? <Medal className="h-4 w-4 text-muted-foreground" /> : rank}
                          </TableCell>
                        )}
                        {recordIndex === 0 && (
                          <TableCell rowSpan={entry.records.length} className="whitespace-nowrap px-2 py-1.5 align-top font-semibold text-foreground">{entry.consultant}</TableCell>
                        )}
                        <TableCell className="px-2 py-1.5 font-medium text-foreground">
                          {entry.records.length > 1 && (
                            <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[0.7em] font-semibold tabular-nums text-muted-foreground">
                              {recordIndex + 1}
                            </span>
                          )}
                          {record.kandidaat}
                        </TableCell>
                        <TableCell className="px-2 py-1.5 text-muted-foreground">{record.klant}</TableCell>
                        <TableCell className="px-2 py-1.5">
                          <Badge variant="outline" className={cn("h-5 whitespace-nowrap px-1.5 text-[0.7em]", categoryStyles[record.categorie])}>{record.categorie}</Badge>
                        </TableCell>
                        <TableCell className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{record.factor !== null ? decimal.format(record.factor) : "—"}</TableCell>
                        <TableCell className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{record.looptijdUren ? `${number.format(record.looptijdUren)}h` : "—"}</TableCell>
                        <TableCell className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{record.wsPercentage !== null ? `${decimal.format(record.wsPercentage)}%` : "—"}</TableCell>
                        <TableCell className="px-2 py-1.5 text-right font-medium tabular-nums">{euro.format(record.dealwaarde)}</TableCell>
                        {recordIndex === 0 && (
                          <TableCell rowSpan={entry.records.length} className="px-2 py-1.5 text-right align-top font-bold tabular-nums text-ranking-plaatsingen">{euro.format(entry.dealwaarde)}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Handshake; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
      <div className="mb-0.5 flex items-center gap-1.5">
        <Icon className="h-[1em] w-[1em] text-ranking-plaatsingen" />
        <span className="text-[0.7em] text-muted-foreground">{label}</span>
      </div>
      <div className="text-[1.05em] font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

export default function TVPlaatsingenRanglijst() {
  return (
    <TVDashboardLayout title="Plaatsingen ranglijst (TV)">
      <Content />
    </TVDashboardLayout>
  );
}

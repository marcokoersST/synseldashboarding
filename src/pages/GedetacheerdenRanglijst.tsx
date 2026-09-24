import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Clock3, Medal, Trophy, UserMinus, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RankingDevInfo } from "@/components/dashboard/RankingDevInfo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getGedetacheerdenRankingData, type GedetacheerdenScope } from "@/data/gedetacheerdenRankingData";
import { useLanguage } from "@/contexts/LanguageContext";
import { localeFor } from "@/lib/translations";

export default function GedetacheerdenRanglijst() {
  const { language } = useLanguage();
  const locale = localeFor(language);
  const euro = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }), [locale]);
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [scope, setScope] = useState<GedetacheerdenScope>("week");
  const [week, setWeek] = useState("42");
  const [periode, setPeriode] = useState("11");
  const [jaar, setJaar] = useState("2026");
  const selection = scope === "week" ? Number(week) : scope === "periode" ? Number(periode) : Number(jaar);

  const ranking = useMemo(
    () => getGedetacheerdenRankingData(scope, selection).sort((a, b) => b.momenteelGedetacheerd - a.momenteelGedetacheerd || b.brutoMargeLaatstePeriode - a.brutoMargeLaatstePeriode),
    [scope, selection],
  );

  const totals = useMemo(() => ranking.reduce((result, record) => ({
    active: result.active + record.momenteelGedetacheerd,
    starts: result.starts + record.nogTeStarten,
    exits: result.exits + record.afTeVallen,
    margin: result.margin + record.brutoMargeLaatstePeriode,
  }), { active: 0, starts: 0, exits: 0, margin: 0 }), [ranking]);

  const averageMargin = totals.active ? totals.margin / totals.active : 0;
  const selectedLabel = scope === "week" ? `Week ${week}` : scope === "periode" ? `Periode ${periode}` : jaar;
  const devSelectedLabel = scope === "week" ? `Week ${week}` : scope === "periode" ? `Period ${periode}` : jaar;

  return (
    <div className="space-y-3">
      <section className="flex flex-col gap-3 border-b border-border pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase text-ranking-plaatsingen">
            <Users className="h-4 w-4" /> Portefeuille prestaties
          </div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Gedetacheerden ranglijst</h1>
          <p className="text-xs text-muted-foreground">Gerangschikt op huidig aantal gedetacheerden · {selectedLabel}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <RankingDevInfo
            source="gedetacheerdenRankingData: deterministic mock portfolios for every active consultant in the central consultant list."
            filters={`Scope: ${scope === "periode" ? "period" : scope === "jaar" ? "year" : scope}; selection: ${devSelectedLabel}; year: ${jaar}. The selected week, period or year determines the simulated snapshot.`}
            ranking="Consultants are sorted by current contractor count in descending order; gross margin from the latest period breaks a tie."
            calculations={[
              "Current contractors, starters and departures are totals across all visible consultants.",
              "Gross margin latest period = sum of consultant margins in the selected snapshot.",
              "Average margin per contractor = total gross margin / total current contractors.",
              "The arrow compares gross margin from the latest period with the previous period.",
            ]}
            rowCount={ranking.length}
          />
          <Tabs value={scope} onValueChange={(value) => setScope(value as GedetacheerdenScope)}>
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

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <SummaryMetric icon={Users} label="Huidige gedetacheerden" value={number.format(totals.active)} />
        <SummaryMetric icon={Clock3} label="Nog te starten" value={number.format(totals.starts)} />
        <SummaryMetric icon={UserMinus} label="Afvallers" value={number.format(totals.exits)} />
        <SummaryMetric icon={CircleDollarSign} label="Brutomarge laatste periode" value={euro.format(totals.margin)} />
        <SummaryMetric icon={Trophy} label="Gem. marge per gedetacheerde" value={euro.format(averageMargin)} />
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-ranking-plaatsingen/30 bg-ranking-plaatsingen/10 px-3 py-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Beste portefeuilles · {selectedLabel}</h2>
            <p className="text-[10px] text-muted-foreground">Actieve inzet, mutaties en brutomarge per consultant</p>
          </div>
          <span className="text-xs font-semibold text-ranking-plaatsingen">{ranking.length} consultants</span>
        </div>
        {ranking.length ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[1120px] text-xs">
              <TableHeader>
                <TableRow className="h-9 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-9 w-12 px-2 text-[10px]">Pos.</TableHead>
                  <TableHead className="h-9 min-w-[160px] px-2 text-[10px]">Consultant</TableHead>
                  <TableHead className="h-9 px-2 text-right text-[10px]">Momenteel gedetacheerd</TableHead>
                  <TableHead className="h-9 px-2 text-right text-[10px]">Nog te starten</TableHead>
                  <TableHead className="h-9 px-2 text-right text-[10px]">Af te vallen</TableHead>
                  <TableHead className="h-9 min-w-[140px] px-2 text-right text-[10px]">Brutomarge laatste periode</TableHead>
                  <TableHead className="h-9 min-w-[150px] px-2 text-right text-[10px]">Brutomarge periode daarvoor</TableHead>
                  <TableHead className="h-9 min-w-[140px] px-2 text-right text-[10px]">Marge per gedetacheerde</TableHead>
                  <TableHead className="h-9 min-w-[150px] px-2 text-right text-[10px]">Marge afgelopen 13 periodes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((record, index) => {
                  const rank = index + 1;
                  const difference = record.brutoMargeLaatstePeriode - record.brutoMargeVorigePeriode;
                  return (
                    <TableRow key={record.id} className={cn("h-9 hover:bg-muted/30", rank <= 3 && "bg-ranking-plaatsingen/[0.025]")}> 
                      <TableCell className="px-2 py-1.5 font-bold tabular-nums">
                        {rank === 1 ? <Trophy className="h-3.5 w-3.5 text-primary" /> : rank <= 3 ? <Medal className="h-3.5 w-3.5 text-muted-foreground" /> : rank}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-2 py-1.5 font-semibold text-foreground">{record.consultant}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right text-sm font-bold tabular-nums text-ranking-plaatsingen">{record.momenteelGedetacheerd}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-medium tabular-nums">{record.nogTeStarten}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-medium tabular-nums">{record.afTeVallen}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-semibold tabular-nums">
                        <span className="inline-flex items-center justify-end gap-1">
                          {difference >= 0 ? <ArrowUpRight className="h-3 w-3 text-success" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                          {euro.format(record.brutoMargeLaatstePeriode)}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{euro.format(record.brutoMargeVorigePeriode)}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-medium tabular-nums">{euro.format(record.margePerGedetacheerde)}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-bold tabular-nums text-ranking-plaatsingen">{euro.format(record.margeAfgelopen13Periodes)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : <div className="px-6 py-16 text-center text-sm text-muted-foreground">Geen gedetacheerden in deze selectie.</div>}
      </section>
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2.5 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-ranking-plaatsingen" /><span className="text-[10px] text-muted-foreground">{label}</span></div>
      <div className="text-base font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
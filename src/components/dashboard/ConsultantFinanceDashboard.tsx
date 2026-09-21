import { useMemo, useState } from "react";
import { Award, Banknote, CalendarDays, ChevronDown, ChevronRight, CircleDollarSign, Medal, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  bonusTotalForPeriod,
  consultantBonusEntries,
  consultantFinancePeriods,
  consultantFinanceRows,
  periodTotal,
  type CandidateFinanceRow,
  type ConsultantBonusEntry,
  type FinanceCategory,
} from "@/data/consultantFinanceData";
import { cn } from "@/lib/utils";

type ViewMode = "week" | "periode" | "aangepast";

const currency = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });

const categoryLabel: Record<FinanceCategory, string> = {
  detachering: "Detachering",
  margeFacturatie: "Marge facturatie",
  vervroegdeOvername: "Vervroegde overname",
  wervingSelectie: "W&S",
};

const categoryTone: Record<FinanceCategory, string> = {
  detachering: "bg-primary/10 text-primary border-primary/25",
  margeFacturatie: "bg-accent text-accent-foreground border-accent",
  vervroegdeOvername: "bg-secondary text-secondary-foreground border-secondary",
  wervingSelectie: "bg-muted text-muted-foreground border-border",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function SummaryTile({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Banknote }) {
  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function BonusButton({ entry, active, onClick }: { entry: ConsultantBonusEntry; active: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      className={cn("h-auto w-full justify-between gap-3 px-3 py-3 text-left", !active && "bg-card")}
      onClick={onClick}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{entry.label}</span>
        <span className={cn("block text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>{entry.maand} · P{entry.period} · {entry.status}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold">{currency.format(entry.amount)}</span>
    </Button>
  );
}

function CandidateDetail({ row }: { row: CandidateFinanceRow }) {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-muted/25 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-muted-foreground">Kandidaat</p>
        <p className="font-semibold text-foreground">{row.kandidaat}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Klant</p>
        <p className="font-semibold text-foreground">{row.klant}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Exacte datums</p>
        <p className="font-semibold text-foreground">{formatDate(row.startdatum)} — {formatDate(row.einddatum)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Voorwaarden</p>
        <p className="font-semibold text-foreground">{row.voorwaarden}</p>
      </div>
    </div>
  );
}

export function ConsultantFinanceDashboard({ delay = 0 }: { delay?: number }) {
  const [viewMode, setViewMode] = useState<ViewMode>("periode");
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [activeBonusId, setActiveBonusId] = useState("bonus-p7-omzet");
  const [expandedRowId, setExpandedRowId] = useState("P7-001");

  const activeBonus = consultantBonusEntries.find((entry) => entry.id === activeBonusId) ?? consultantBonusEntries[0];
  if (!activeBonus) return null;

  const selectedPeriodNumber = Number(selectedPeriod);
  const selectedPeriodData = consultantFinancePeriods.find((period) => period.period === selectedPeriodNumber) ?? consultantFinancePeriods.find((period) => period.period === activeBonus.period);
  if (!selectedPeriodData) return null;

  const activePeriodData = consultantFinancePeriods.find((period) => period.period === activeBonus.period) ?? selectedPeriodData;
  const currentRows = consultantFinanceRows.filter((row) => row.period === selectedPeriodData.period);
  const activePeriodRows = consultantFinanceRows.filter((row) => row.period === activeBonus.period);
  const selectedTotal = periodTotal(selectedPeriodData);
  const selectedBonusTotal = bonusTotalForPeriod(selectedPeriodData.period);
  const rollingBase = consultantFinancePeriods
    .filter((period) => [5, 6, 7].includes(period.period))
    .reduce((sum, period) => sum + period.detachering + period.margeFacturatie + period.vervroegdeOvername, 0) / 3;

  const categoryTotals = useMemo(() => ([
    { label: "Detachering", value: selectedPeriodData.detachering, basis: `${selectedPeriodData.gedetacheerden} gedetacheerden` },
    { label: "Marge facturatie", value: selectedPeriodData.margeFacturatie, basis: "Nacalculaties en losse marge" },
    { label: "Vervroegde overname", value: selectedPeriodData.vervroegdeOvername, basis: "Overnamefees" },
    { label: "W&S", value: selectedPeriodData.opgelegdeWS, basis: "Uitgesloten bij RF/HPC" },
  ]), [selectedPeriodData]);

  const viewLabel = viewMode === "week" ? "Weekselectie" : viewMode === "aangepast" ? "Aangepaste selectie" : "Periode";

  return (
    <section className="mb-6 animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-sidebar px-3 py-1 text-xs font-semibold text-sidebar-foreground">
            <CircleDollarSign className="h-3.5 w-3.5" />
            Omzet & Bonus
          </div>
          <h2 className="text-xl font-semibold text-foreground">Dashboard Consultant</h2>
          <p className="text-sm text-muted-foreground">Omzet per periode gekoppeld aan bonusregels en kandidaatdetails.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["week", "periode", "aangepast"] as ViewMode[]).map((mode) => (
            <Button key={mode} type="button" size="sm" variant={viewMode === mode ? "default" : "outline"} onClick={() => setViewMode(mode)}>
              {mode === "aangepast" ? "Aangepast" : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-9 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {consultantFinancePeriods.map((period) => (
                <SelectItem key={period.period} value={String(period.period)}>{period.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SummaryTile label="Totaal gefactureerd" value={currency.format(selectedTotal)} sub={`${viewLabel} ${selectedPeriodData.label}`} icon={Banknote} />
        <SummaryTile label="Bonus gekoppeld" value={currency.format(selectedBonusTotal)} sub="Klik rechts voor herkomst" icon={Award} />
        <SummaryTile label="Gedetacheerden" value={String(selectedPeriodData.gedetacheerden)} sub={`${selectedPeriodData.starts} starts · ${selectedPeriodData.gesprekken} gesprekken`} icon={CalendarDays} />
        <SummaryTile label="RF gemiddelde" value={currency.format(rollingBase)} sub="Laatste 3 niet-vakantieperiodes" icon={TrendingUp} />
        <SummaryTile label="Actieve bonus" value={currency.format(activeBonus.amount)} sub={`${activeBonus.label} · ${activeBonus.maand}`} icon={Sparkles} />
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-4">
        {categoryTotals.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{currency.format(item.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.basis}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
        <div className="space-y-4">
          <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">Gekoppelde omzetbasis</CardTitle>
                  <p className="text-sm text-muted-foreground">{activeBonus.label} is gekoppeld aan {activePeriodData.label}: {activePeriodData.dateRange}</p>
                </div>
                <Badge variant="outline" className="w-fit border-primary/25 bg-primary/10 text-primary">{currency.format(activeBonus.basisAmount)} basis</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activeBonus.explanation}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{activeBonus.rule}</p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-xs uppercase text-muted-foreground">Uitbetaling</p>
                    <p className="text-2xl font-semibold text-foreground">{currency.format(activeBonus.amount)}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Telt mee</p>
                    <p className="text-xs text-muted-foreground">{activeBonus.includes.join(" · ")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Uitgesloten</p>
                    <p className="text-xs text-muted-foreground">{activeBonus.excludes.join(" · ")}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead className="text-right">Gedet.</TableHead>
                      <TableHead className="text-right">Detachering</TableHead>
                      <TableHead className="text-right">Marge</TableHead>
                      <TableHead className="text-right">Overname</TableHead>
                      <TableHead className="text-right">W&S</TableHead>
                      <TableHead className="text-right">Totaal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultantFinancePeriods.map((period) => {
                      const highlighted = period.period === activeBonus.period;
                      return (
                        <TableRow key={period.period} className={cn(highlighted && "bg-primary/5")}> 
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{period.label}</span>
                              {highlighted && <Badge variant="outline" className="border-primary/25 text-primary">bonusbasis</Badge>}
                              {period.isVakantieperiode && <Badge variant="secondary">vakantie</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{period.dateRange}</p>
                          </TableCell>
                          <TableCell className="text-right font-mono">{period.gedetacheerden}</TableCell>
                          <TableCell className="text-right font-mono">{compactCurrency.format(period.detachering)}</TableCell>
                          <TableCell className="text-right font-mono">{compactCurrency.format(period.margeFacturatie)}</TableCell>
                          <TableCell className="text-right font-mono">{period.vervroegdeOvername ? compactCurrency.format(period.vervroegdeOvername) : "—"}</TableCell>
                          <TableCell className="text-right font-mono">{period.opgelegdeWS ? compactCurrency.format(period.opgelegdeWS) : "—"}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">{compactCurrency.format(periodTotal(period))}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">Facturatie per kandidaat</CardTitle>
                  <p className="text-sm text-muted-foreground">Openklappen toont kandidaat, klant, exacte datums en voorwaarden.</p>
                </div>
                <Badge variant="outline" className="w-fit">{selectedPeriodData.label} · {currentRows.length} regels</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-56">Kandidaat</TableHead>
                      <TableHead className="min-w-64">Klant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Looptijd</TableHead>
                      <TableHead className="text-right">Factor/%</TableHead>
                      <TableHead className="text-right">Omzet</TableHead>
                      <TableHead className="text-right">Pot. marge</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRows.map((row) => {
                      const expanded = expandedRowId === row.id;
                      return (
                        <FragmentRow
                          key={row.id}
                          row={row}
                          expanded={expanded}
                          onToggle={() => setExpandedRowId(expanded ? "" : row.id)}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card shadow-sm xl:sticky xl:top-4 xl:self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bonusdashboard</CardTitle>
            <p className="text-sm text-muted-foreground">Klik op een bonus om de gekoppelde omzetperiode links te tonen.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {consultantBonusEntries.map((entry) => (
              <BonusButton
                key={entry.id}
                entry={entry}
                active={entry.id === activeBonus.id}
                onClick={() => {
                  setActiveBonusId(entry.id);
                  setSelectedPeriod(String(entry.period));
                  const firstRow = consultantFinanceRows.find((row) => row.period === entry.period);
                  setExpandedRowId(firstRow?.id ?? "");
                }}
              />
            ))}

            <div className="rounded-md border border-border bg-muted/25 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Medal className="h-4 w-4 text-primary" />
                Periode {activeBonus.period} onderbouwing
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3"><span>Omzetbasis</span><span className="font-semibold text-foreground">{currency.format(activeBonus.basisAmount)}</span></div>
                <div className="flex justify-between gap-3"><span>Bonus</span><span className="font-semibold text-foreground">{currency.format(activeBonus.amount)}</span></div>
                <div className="flex justify-between gap-3"><span>Detailregels</span><span className="font-semibold text-foreground">{activePeriodRows.length}</span></div>
                <div className="flex justify-between gap-3"><span>Periode totaal</span><span className="font-semibold text-foreground">{currency.format(periodTotal(activePeriodData))}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FragmentRow({ row, expanded, onToggle }: { row: CandidateFinanceRow; expanded: boolean; onToggle: () => void }) {
  const factorLabel = row.salarisPercentage === null ? "—" : row.salarisPercentage < 1 ? `${Math.round(row.salarisPercentage * 100)}%` : `${row.salarisPercentage.toFixed(2)}x`;

  return (
    <>
      <TableRow className={cn(expanded && "bg-muted/30")}>
        <TableCell>
          <Button type="button" variant="ghost" size="sm" className="h-auto justify-start px-0 py-1 text-left font-semibold" onClick={onToggle}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {row.kandidaat}
          </Button>
        </TableCell>
        <TableCell className="text-muted-foreground">{row.klant}</TableCell>
        <TableCell><Badge variant="outline" className={categoryTone[row.categorie]}>{categoryLabel[row.categorie]}</Badge></TableCell>
        <TableCell className="text-xs text-muted-foreground">{row.status}</TableCell>
        <TableCell className="text-right font-mono">{row.looptijdUren ? `${row.looptijdUren}h` : "—"}</TableCell>
        <TableCell className="text-right font-mono">{factorLabel}</TableCell>
        <TableCell className="text-right font-mono font-semibold">{currency.format(row.omzet)}</TableCell>
        <TableCell className="text-right font-mono font-semibold">{currency.format(row.potentieleMarge)}</TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/15 p-3">
            <CandidateDetail row={row} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
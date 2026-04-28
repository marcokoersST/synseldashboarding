import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Sparkles, UserPlus, MessageSquare, FileText, GitMerge, Building2, Mail, Phone, Users,
  Trophy, Medal, ArrowUpDown, ChevronDown, AlertTriangle, TrendingDown, ChevronRight,
  Lightbulb, Filter as FilterIcon,
} from "lucide-react";
import { getAIKpiData, getZorgelijkeConsultants, getConsultantTrend, type AIKpiRow, type RiskProfile } from "@/data/aiKpiData";
import { ranglijstenFilters, getCurrentPeriodNumber, getCurrentWeekNumber } from "@/data/ranglijstenData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip } from "recharts";

const STEP_DEFS = [
  { num: 1, key: "inschrijvingen", label: "Inschrijvingen", icon: UserPlus, primaryKey: "inschrijvingenStarted", secondaryKey: "inschrijvingenApproved", primaryLabel: "gestart", secondaryLabel: "goedgekeurd" },
  { num: 2, key: "transcripts", label: "Transcripts", icon: MessageSquare, primaryKey: "transcriptsGenerated", secondaryKey: "transcriptsApproved", primaryLabel: "gegenereerd", secondaryLabel: "goedgekeurd" },
  { num: 3, key: "cvs", label: "CV's", icon: FileText, primaryKey: "cvsGenerated", secondaryKey: "cvsApproved", primaryLabel: "gegenereerd", secondaryLabel: "goedgekeurd" },
  { num: 4, key: "aiMatches", label: "AI matches (vac.)", icon: Sparkles, primaryKey: "aiMatchesProposed", secondaryKey: "aiMatchesApproved", primaryLabel: "voorgesteld", secondaryLabel: "goedgekeurd" },
  { num: 5, key: "manualVac", label: "Handm. match — vac.", icon: GitMerge, primaryKey: "manualVacancyMatches", secondaryKey: null, primaryLabel: "aangemaakt", secondaryLabel: "" },
  { num: 6, key: "manualComp", label: "Handm. match — bedrijf", icon: Building2, primaryKey: "manualCompanyMatches", secondaryKey: null, primaryLabel: "aangemaakt", secondaryLabel: "" },
  { num: 7, key: "contacts", label: "Contactpersonen", icon: Users, primaryKey: "contactsSelected", secondaryKey: "contactsApproved", primaryLabel: "geselecteerd", secondaryLabel: "goedgekeurd" },
  { num: 8, key: "emails", label: "Voorstel emails", icon: Mail, primaryKey: "emailsPrepared", secondaryKey: "emailsSent", primaryLabel: "klaargezet", secondaryLabel: "verstuurd" },
  { num: 9, key: "calls", label: "Bellijst", icon: Phone, primaryKey: "callListItems", secondaryKey: "callsMade", primaryLabel: "items", secondaryLabel: "gebeld" },
] as const;

type StepDef = typeof STEP_DEFS[number];

const ALLE_UNITS = "Alle units";

function ratio(a: number, b: number): string {
  if (b <= 0) return "—";
  return `${Math.round((a / b) * 100)}%`;
}

function StepStripTile({ step, total, totalSecondary, delta }: { step: StepDef; total: number; totalSecondary: number | null; delta: number }) {
  const Icon = step.icon;
  const deltaPositive = delta >= 0;
  return (
    <div className="relative flex-1 min-w-[140px] rounded-xl border border-border/60 bg-card/80 backdrop-blur p-3 hover:shadow-md transition-shadow">
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center text-[11px] font-semibold">
        {step.num}
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-medium text-foreground truncate">{step.label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-foreground tabular-nums">{total.toLocaleString()}</span>
        {totalSecondary != null && (
          <span className="text-xs text-emerald-600 font-semibold tabular-nums">
            ✓ {totalSecondary.toLocaleString()}
            <span className="text-[10px] text-muted-foreground font-normal ml-0.5">({ratio(totalSecondary, total)})</span>
          </span>
        )}
      </div>
      <div className={cn("text-[10px] font-medium mt-0.5", deltaPositive ? "text-emerald-600" : "text-rose-500")}>
        {deltaPositive ? "+" : ""}{delta}% vs vorige
      </div>
    </div>
  );
}

function CallsCell({ row }: { row: AIKpiRow }) {
  return (
    <div className="text-right">
      <div className="flex items-baseline justify-end gap-1.5">
        <span className="font-semibold tabular-nums">{row.callListItems}</span>
        <span className="text-emerald-600 text-xs font-semibold tabular-nums">✓ {row.callsMade}</span>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground mt-0.5">
        <span title="Doorgekomen">{row.callsConnectedPct}%</span>
        <span>·</span>
        <span title="Vervolg ingepland">FU {row.followUpsScheduled}</span>
      </div>
    </div>
  );
}

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-3.5 h-3.5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-3.5 h-3.5 text-orange-400" />;
  return null;
}

function rankRowStyle(rank: number) {
  if (rank === 1) return "border-l-[3px] border-l-amber-400 bg-amber-50/40";
  if (rank === 2) return "border-l-[3px] border-l-slate-400 bg-amber-50/30";
  if (rank === 3) return "border-l-[3px] border-l-orange-400 bg-amber-50/20";
  return "border-l-[3px] border-l-transparent";
}

function RiskFunnel({ row }: { row: AIKpiRow }) {
  const steps = [
    { label: "Inschrijvingen", value: row.inschrijvingenApproved, base: row.inschrijvingenStarted },
    { label: "Transcripts", value: row.transcriptsApproved, base: row.transcriptsGenerated },
    { label: "CV's", value: row.cvsApproved, base: row.cvsGenerated },
    { label: "AI matches", value: row.aiMatchesApproved, base: row.aiMatchesProposed },
    { label: "Contactp.", value: row.contactsApproved, base: row.contactsSelected },
    { label: "Emails verz.", value: row.emailsSent, base: row.emailsPrepared },
    { label: "Gebeld", value: row.callsMade, base: row.callListItems },
  ];
  const max = Math.max(...steps.map(s => s.base), 1);
  return (
    <div className="space-y-1.5">
      {steps.map((s, i) => {
        const conv = s.base > 0 ? Math.round((s.value / s.base) * 100) : 0;
        const widthBase = (s.base / max) * 100;
        const bad = conv < 60 && s.base > 2;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-muted-foreground shrink-0 truncate">{s.label}</span>
            <div className="flex-1 h-5 bg-muted/40 rounded relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary/20 transition-all"
                style={{ width: `${widthBase}%` }}
              />
              <div
                className={cn("absolute inset-y-0 left-0 transition-all", bad ? "bg-rose-500/70" : "bg-primary/70")}
                style={{ width: `${(s.value / max) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-foreground/80">
                {s.value}/{s.base}
              </div>
            </div>
            <span className={cn("w-10 text-right tabular-nums font-semibold", bad ? "text-rose-500" : "text-emerald-600")}>
              {conv}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AIKpiDashboard() {
  const currentYear = new Date().getFullYear();
  const currentWeek = getCurrentWeekNumber();
  const currentPeriod = getCurrentPeriodNumber();

  const [year, setYear] = useState(String(currentYear));
  const [mode, setMode] = useState<"week" | "periode">("week");
  const [periodNum, setPeriodNum] = useState(`P${currentPeriod}`);
  const [weekNum, setWeekNum] = useState(`W${currentWeek}`);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([ALLE_UNITS]);
  const [pendingUnits, setPendingUnits] = useState<string[]>([ALLE_UNITS]);
  const [unitOpen, setUnitOpen] = useState(false);
  const [hideInactive, setHideInactive] = useState(true);
  const [sortKey, setSortKey] = useState<string>("inschrijvingenStarted");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  const num = mode === "week" ? parseInt(weekNum.slice(1)) : parseInt(periodNum.slice(1));
  const allRows = useMemo(() => getAIKpiData(parseInt(year), mode, num), [year, mode, num]);

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (hideInactive) rows = rows.filter(r => r.consultant.isActive);
    if (!selectedUnits.includes(ALLE_UNITS)) {
      rows = rows.filter(r => selectedUnits.includes(r.consultant.unit));
    }
    const sorted = [...rows].sort((a, b) => {
      const av = (a as any)[sortKey] ?? 0;
      const bv = (b as any)[sortKey] ?? 0;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "desc" ? bv - av : av - bv;
      }
      return 0;
    });
    return sorted;
  }, [allRows, selectedUnits, hideInactive, sortKey, sortDir]);

  const risks = useMemo(() => getZorgelijkeConsultants(filteredRows, 6), [filteredRows]);

  const stripData = useMemo(() => {
    return STEP_DEFS.map(step => {
      const total = filteredRows.reduce((s, r) => s + ((r as any)[step.primaryKey] || 0), 0);
      const secondary = step.secondaryKey ? filteredRows.reduce((s, r) => s + ((r as any)[step.secondaryKey!] || 0), 0) : null;
      // Fake delta deterministic
      const delta = ((total % 17) - 8);
      return { step, total, secondary, delta };
    });
  }, [filteredRows]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const toggleUnit = (unit: string) => {
    if (unit === ALLE_UNITS) {
      setPendingUnits([ALLE_UNITS]);
    } else {
      setPendingUnits(prev => {
        const without = prev.filter(u => u !== ALLE_UNITS);
        if (without.includes(unit)) {
          const next = without.filter(u => u !== unit);
          return next.length === 0 ? [ALLE_UNITS] : next;
        }
        return [...without, unit];
      });
    }
  };

  const applyUnits = () => {
    setSelectedUnits(pendingUnits);
    setUnitOpen(false);
  };

  const expandedRisk_obj = risks.find(r => r.consultant.fullName === expandedRisk);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI KPI Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hoe consultants de AI-workflow benutten en goedkeuren
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-9 w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ranglijstenFilters.jaren.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={mode} onValueChange={(v) => setMode(v as "week" | "periode")}>
            <SelectTrigger className="h-9 w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="periode">Periode</SelectItem>
            </SelectContent>
          </Select>

          {mode === "week" ? (
            <Select value={weekNum} onValueChange={setWeekNum}>
              <SelectTrigger className="h-9 w-[90px]"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {ranglijstenFilters.weeknummers.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Select value={periodNum} onValueChange={setPeriodNum}>
              <SelectTrigger className="h-9 w-[90px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ranglijstenFilters.periodenummers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <Popover open={unitOpen} onOpenChange={(o) => { setUnitOpen(o); if (o) setPendingUnits(selectedUnits); }}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <FilterIcon className="w-3.5 h-3.5" />
                {selectedUnits.includes(ALLE_UNITS) ? "Alle units" : `${selectedUnits.length} units`}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <div className="flex items-center justify-between p-2 border-b">
                <span className="text-xs font-semibold">Units</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs"
                    onClick={() => setPendingUnits(ranglijstenFilters.units.filter(u => u !== ALLE_UNITS))}>
                    Alles aan
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs"
                    onClick={() => setPendingUnits([ALLE_UNITS])}>
                    Alles uit
                  </Button>
                </div>
              </div>
              <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                {ranglijstenFilters.units.map(u => (
                  <label key={u} className="flex items-center gap-2 text-sm py-1 px-2 hover:bg-muted/50 rounded cursor-pointer">
                    <Checkbox
                      checked={pendingUnits.includes(u) || (u !== ALLE_UNITS && pendingUnits.includes(ALLE_UNITS))}
                      onCheckedChange={() => toggleUnit(u)}
                    />
                    <span>{u}</span>
                  </label>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button size="sm" className="w-full h-8" onClick={applyUnits}>Toepassen</Button>
              </div>
            </PopoverContent>
          </Popover>

          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <Checkbox checked={hideInactive} onCheckedChange={(v) => setHideInactive(!!v)} />
            Verberg inactieve
          </label>
        </div>
      </div>

      {/* Workflow strip */}
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
          Workflow — totale benutting (filter toegepast)
        </div>
        <div className="flex flex-wrap gap-3">
          {stripData.map(d => (
            <StepStripTile key={d.step.key} step={d.step} total={d.total} totalSecondary={d.secondary} delta={d.delta} />
          ))}
        </div>
      </Card>

      {/* Ranking table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gradient-to-r from-muted/40 to-transparent backdrop-blur">
          <h2 className="text-sm font-semibold text-foreground">Ranglijst — AI-acties per consultant</h2>
          <p className="text-[11px] text-muted-foreground">{filteredRows.length} consultants · klik kolomtitel om te sorteren</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b">
                <th className="sticky left-0 z-50 bg-muted/30 backdrop-blur px-3 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[180px]">
                  Consultant
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-medium text-muted-foreground min-w-[110px]">Unit</th>
                {STEP_DEFS.map(step => (
                  <th key={step.key} className="px-2 py-2 text-right text-[11px] font-semibold text-muted-foreground min-w-[110px]">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => handleSort(step.primaryKey)}
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-[9px] font-bold mr-1">{step.num}</span>
                      {step.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <div className="text-[9px] font-normal text-muted-foreground/70 mt-0.5">
                      {step.primaryLabel}{step.secondaryLabel ? ` / ${step.secondaryLabel}` : ""}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={row.consultant.fullName}
                    className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", rankRowStyle(rank))}>
                    <td className="sticky left-0 z-40 bg-card hover:bg-muted/20 px-3 py-2 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 text-xs text-muted-foreground tabular-nums">{rank > 3 ? `${rank}.` : ""}</span>
                        {rankIcon(rank)}
                        <span className="truncate">{row.consultant.fullName}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{row.consultant.unit}</td>
                    {STEP_DEFS.map(step => {
                      if (step.key === "calls") {
                        return <td key={step.key} className="px-2 py-2"><CallsCell row={row} /></td>;
                      }
                      const primary = (row as any)[step.primaryKey] as number;
                      const secondary = step.secondaryKey ? (row as any)[step.secondaryKey] as number : null;
                      return (
                        <td key={step.key} className="px-2 py-2 text-right">
                          <div className="flex items-baseline justify-end gap-1.5">
                            <span className="font-semibold tabular-nums">{primary}</span>
                            {secondary != null && (
                              <span className="text-emerald-600 text-xs font-semibold tabular-nums">
                                ✓ {secondary}
                                <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                                  ({ratio(secondary, primary)})
                                </span>
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Zorgelijke consultants */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gradient-to-r from-rose-50/60 via-amber-50/30 to-transparent">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Zorgelijke profielen — afwijkende AI-benutting
          </h2>
          <p className="text-[11px] text-muted-foreground">Top {risks.length} consultants met de meest opvallende afwijkingen. Klik om de funnel te openen.</p>
        </div>
        <div className="divide-y">
          {risks.map(risk => {
            const isOpen = expandedRisk === risk.consultant.fullName;
            const sevColor = risk.score >= 50 ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
              : risk.score >= 30 ? "bg-orange-500/10 text-orange-600 border-orange-500/30"
              : "bg-amber-500/10 text-amber-700 border-amber-500/30";
            return (
              <button
                key={risk.consultant.fullName}
                onClick={() => setExpandedRisk(isOpen ? null : risk.consultant.fullName)}
                className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left", isOpen && "bg-muted/30")}
              >
                <ChevronRight className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-90")} />
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {risk.consultant.firstName[0]}{risk.consultant.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{risk.consultant.fullName}</span>
                    <span className="text-[11px] text-muted-foreground">{risk.consultant.unit}</span>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold", sevColor)}>
                      Risk {risk.score}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {risk.flags.slice(0, 3).map((f, i) => (
                      <span key={i} className={cn("text-[11px] flex items-center gap-1",
                        f.severity === "high" ? "text-rose-600" : f.severity === "medium" ? "text-orange-600" : "text-muted-foreground"
                      )}>
                        <TrendingDown className="w-3 h-3 shrink-0" />
                        {f.text}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Drill-down panel below the entire list */}
        {expandedRisk_obj && (
          <div className="border-t bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Funnel-analyse: {expandedRisk_obj.consultant.fullName}</h3>
                <p className="text-[11px] text-muted-foreground">Drop-off per stap. Rood = goedkeuringsratio &lt; 60%.</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setExpandedRisk(null)}>Sluiten</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-3 rounded-lg bg-card border">
                <RiskFunnel row={expandedRisk_obj.row} />
              </div>

              <div className="p-3 rounded-lg bg-card border">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Trend laatste 6 weken</div>
                {(() => {
                  const trends = getConsultantTrend(expandedRisk_obj.consultant.fullName, parseInt(year));
                  const data = trends[0].map((d, i) => ({ week: d.week, transcript: d.value, calls: trends[1][i].value }));
                  return (
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={data} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RTooltip />
                        <Line type="monotone" dataKey="transcript" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Transcript-goedkeur %" />
                        <Line type="monotone" dataKey="calls" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Bellijst afgewerkt %" />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-foreground leading-relaxed">
                <strong>AI-observatie: </strong>
                {expandedRisk_obj.flags[0]?.text}. Aanbevolen actie: bespreek in 1-op-1 of de AI-output structureel afwijkt of dat de consultant extra training nodig heeft op deze stap.
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

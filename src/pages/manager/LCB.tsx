import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { myTeamConsultants } from "@/data/managerData";
import { generateAlerts, type DashboardAlert } from "@/data/managerOperationalDataV2";
import {
  lcbMarketRows, lcbFunnelSteps, lcbTeam, LCB_UNITS,
  getCandidatesForStep, getDealsForStep,
  type LcbStepKey, type CandidateRow, type DealRow,
} from "@/data/lcbMarketData";
import { revenueChartDataV2 } from "@/data/managerPerformanceDataV2";
import { consultantSkillData } from "@/data/managerPerformanceData";
import { dealStageBadgeClass } from "@/data/lcbDealStages";

import { LCB_STATUS_COLOR, LCB_STATUS_LABEL, statusFromScore } from "@/lib/lcbStatus";
import { LCBTopBar } from "@/components/manager/lcb/LCBTopBar";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { CandidateMarketTab } from "@/components/manager/lcb/CandidateMarketTab";
import { ConsultantDevelopmentTab } from "@/components/manager/lcb/ConsultantDevelopmentTab";
import { FinanceForecastTab } from "@/components/manager/lcb/FinanceForecastTab";
import { initialLcbDateState, type LcbDateState } from "@/components/manager/lcb/LcbDateFilter";
import { LcbSplitOverlay } from "@/components/manager/lcb/LcbSplitOverlay";
import { CandidateDetailPane } from "@/components/manager/lcb/CandidateDetailPane";
import { DealDetailPane } from "@/components/manager/lcb/DealDetailPane";
import {
  ConsultantOverviewOverlay,
  DevelopmentOverlay, StopperOverlay, ActivePlacementsOverlay,
  RevenueDetailOverlay, SoonToStartOverlay, NetImpactOverlay,
  YtdRealisedOverlay, ForecastYearOverlay,
} from "@/components/manager/lcb/Overlays";
import { CallConversionsOverlay } from "@/components/manager/lcb/CallConversionsOverlay";
import { Button } from "@/components/ui/button";

const UNITS = [...LCB_UNITS];
type TabId = "market" | "development" | "finance" | "signals";
const TABS: { id: TabId; label: string; subtitle: string }[] = [
  { id: "market", label: "Candidate Market Approach", subtitle: "Acquisitie & funnel" },
  { id: "development", label: "Consultant Development & Steering", subtitle: "Coaching & ontwikkeling" },
  { id: "finance", label: "Finance & Forecast", subtitle: "Omzet, marge & risico" },
  { id: "signals", label: "Signalen", subtitle: "Acties & alerts" },
];

function overall(c: typeof consultantSkillData[0]): number {
  const m = [
    (c.relatieScoreKlant / 10) * 100, (c.relatieScoreKandidaat / 10) * 100,
    c.pitchingPower, c.responsiveness, c.networking, c.bezwaarverlegging,
    c.procedureInschrijving, c.procedureAcquisities, c.systeemHygieneScore,
    c.npsKlant, c.npsKandidaat,
  ];
  return Math.round(m.reduce((a, b) => a + b, 0) / m.length);
}

export default function LCB() {
  const [date, setDate] = useState<LcbDateState>(initialLcbDateState);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedConsultants, setSelectedConsultants] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const [tab, setTab] = useState<TabId>("market");

  // Split-overlay state for candidate market drill-down
  const [stepCtx, setStepCtx] = useState<{ consultantId: number; step: LcbStepKey } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealRow | null>(null);

  const [consultantOverlay, setConsultantOverlay] = useState<number | null>(null);
  const [devOverlay, setDevOverlay] = useState<number | null>(null);
  const [stopperOverlay, setStopperOverlay] = useState<number | null>(null);
  const [placementOverlay, setPlacementOverlay] = useState<number | null>(null);
  const [revenueOverlay, setRevenueOverlay] = useState<number | null>(null);
  const [soonOverlay, setSoonOverlay] = useState<number | null>(null);
  const [netImpactOverlay, setNetImpactOverlay] = useState<number | null>(null);
  const [ytdOpen, setYtdOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [callConvOverlay, setCallConvOverlay] = useState<{ consultantId: number; initial?: string } | null>(null);

  const alerts = useMemo(() => generateAlerts(), []);

  const avgSkillScore = useMemo(
    () => Math.round(consultantSkillData.reduce((s, c) => s + overall(c), 0) / consultantSkillData.length),
    [],
  );
  const realisedSeries = revenueChartDataV2.filter((d) => d.realised > 0);
  const ytdRealised = realisedSeries.reduce((s, d) => s + d.realised, 0);
  const ytdTarget = revenueChartDataV2.slice(0, realisedSeries.length).reduce((s, d) => s + d.target, 0);
  const totalPlaatsingen = lcbMarketRows.reduce((s, r) => s + r.plaatsingen, 0);
  const totalIntakes = lcbMarketRows.reduce((s, r) => s + r.intakes, 0);
  const operationeelScore = Math.min(100, Math.round((totalPlaatsingen / Math.max(totalIntakes, 1)) * 100));
  const omzetScore = Math.min(100, Math.round((ytdRealised / Math.max(ytdTarget, 1)) * 100));
  const globalScore = Math.round((avgSkillScore + operationeelScore + omzetScore) / 3);
  const globalStatus = statusFromScore(globalScore);
  const globalColor = LCB_STATUS_COLOR[globalStatus];
  const refreshLabel = useMemo(() => new Date().toLocaleString("nl-NL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }), []);

  const onResetFilters = () => {
    setSelectedUnits([]); setSelectedConsultants([]); setSearch("");
    setDate(initialLcbDateState);
  };

  const closeAllOverlays = () => {
    setStepCtx(null); setSelectedCandidate(null); setSelectedDeal(null);
  };

  const handleSignalClick = (a: DashboardAlert) => {
    const c = myTeamConsultants.find((x) => x.name === a.consultantName);
    if (!c) return;
    const m = a.metric?.toLowerCase() ?? "";
    if (m.includes("plaatsing")) { setTab("market"); setStepCtx({ consultantId: c.id, step: "plaatsingen" }); }
    else if (m.includes("intake")) { setTab("market"); setStepCtx({ consultantId: c.id, step: "intakes" }); }
    else if (m.includes("gesprek") || m.includes("uitnodiging")) { setTab("market"); setStepCtx({ consultantId: c.id, step: "gesprekken" }); }
    else if (m.includes("outreach") || m.includes("kwaliteit")) { setTab("development"); setDevOverlay(c.id); }
    else { setTab("market"); setConsultantOverlay(c.id); }
  };

  // Compose split overlay
  const stepConsultant = stepCtx ? myTeamConsultants.find((c) => c.id === stepCtx.consultantId) : null;
  const stepDef = stepCtx ? lcbFunnelSteps.find((s) => s.key === stepCtx.step) : null;
  const stepEntity = stepDef?.entity;
  const stepCandidates: CandidateRow[] = stepCtx && stepEntity === "candidate" ? getCandidatesForStep(stepCtx.consultantId, stepCtx.step) : [];
  const stepDeals: DealRow[] = stepCtx && stepEntity === "deal" ? getDealsForStep(stepCtx.consultantId, stepCtx.step) : [];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card/60">
        <div className="flex h-12 items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold leading-tight">Manager Dashboard — LC-B</h1>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] cursor-help">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: globalColor }} />
                    <span className="font-medium" style={{ color: globalColor }}>{LCB_STATUS_LABEL[globalStatus]}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-[240px]">
                  Overall status — gewogen gemiddelde van operationeel ({operationeelScore}%), performance ({avgSkillScore}%) en omzet ({omzetScore}%).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
            <RefreshCw className="h-3 w-3" /> <span>{refreshLabel}</span>
          </div>
        </div>
      </header>

      <LCBTopBar
        date={date} onDate={setDate}
        units={UNITS}
        selectedUnits={selectedUnits} onSelectedUnits={setSelectedUnits}
        consultants={myTeamConsultants.map((c) => ({ id: c.id, name: c.name }))}
        selectedConsultants={selectedConsultants} onSelectedConsultants={setSelectedConsultants}
        search={search} onSearch={setSearch}
        onReset={onResetFilters}
      />



      <div className="flex shrink-0 border-b border-border bg-card/30 overflow-x-auto">
        {TABS.map((t) => {
          const isSignals = t.id === "signals";
          const count = isSignals ? alerts.length : 0;
          const critCount = isSignals ? alerts.filter((a) => a.severity === "critical").length : 0;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors text-left",
                tab === t.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="inline-flex items-center gap-1.5">
                <span>{t.label}</span>
                {isSignals && count > 0 && (
                  <span className={cn(
                    "inline-flex items-center justify-center rounded-full px-1.5 py-0 text-[10px] font-semibold tabular-nums min-w-[18px]",
                    critCount > 0
                      ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                  )}>{count}</span>
                )}
              </div>
              <div className="text-[10px] font-normal text-muted-foreground">{t.subtitle}</div>
            </button>
          );
        })}
      </div>

      <main className="flex-1 overflow-hidden p-3 min-h-0">
        {tab === "market" && (
          <CandidateMarketTab
            selectedUnits={selectedUnits}
            selectedConsultants={selectedConsultants}
            search={search}
            onOpenStep={(consultantId, step) => { setSelectedCandidate(null); setSelectedDeal(null); setStepCtx({ consultantId, step }); }}
            onOpenConsultant={(id) => setConsultantOverlay(id)}
          />
        )}
        {tab === "development" && (
          <ConsultantDevelopmentTab
            selectedUnits={selectedUnits}
            selectedConsultants={selectedConsultants}
            search={search}
            onOpenConsultant={(id) => setDevOverlay(id)}
          />
        )}
        {tab === "finance" && (
          <FinanceForecastTab
            selectedUnits={selectedUnits}
            selectedConsultants={selectedConsultants}
            search={search}
            onOpenStoppers={(id) => setStopperOverlay(id)}
            onOpenPlacements={(id) => setPlacementOverlay(id)}
            onOpenRevenue={(id) => setRevenueOverlay(id)}
            onOpenYtd={() => setYtdOpen(true)}
            onOpenForecast={() => setForecastOpen(true)}
            onOpenSoonToStart={(id) => setSoonOverlay(id)}
            onOpenNetImpact={(id) => setNetImpactOverlay(id)}
          />
        )}
        {tab === "signals" && (
          <SignalsTab alerts={alerts} onSelect={handleSignalClick} />
        )}
      </main>

      {/* Split-pane overlay for candidate market drill-down */}
      <LcbSplitOverlay
        open={!!stepCtx}
        onClose={closeAllOverlays}
        onCloseRight={() => { setSelectedCandidate(null); setSelectedDeal(null); }}
        left={stepCtx && stepConsultant && stepDef ? {
          breadcrumbs: ["Candidate Market", stepConsultant.name, stepDef.label],
          title: `${stepDef.label} — ${stepConsultant.name}`,
          subtitle: stepEntity === "candidate"
            ? `${stepCandidates.length} kandidaten in deze stap. Klik een rij voor details.`
            : `${stepDeals.length} deals in deze stap. Klik een rij voor details.`,
          
          content: stepEntity === "candidate"
            ? <StepCandidateList rows={stepCandidates} selected={selectedCandidate} onSelect={(c) => { setSelectedDeal(null); setSelectedCandidate(c); }} />
            : <StepDealList rows={stepDeals} selected={selectedDeal} onSelect={(d) => { setSelectedCandidate(null); setSelectedDeal(d); }} />,
        } : null}
        right={
          selectedCandidate
            ? { breadcrumbs: ["Candidate Market", stepConsultant?.name ?? "", stepDef?.label ?? "", selectedCandidate.name], title: selectedCandidate.name, subtitle: "Kandidaatdetail", content: <CandidateDetailPane candidate={selectedCandidate} /> }
            : selectedDeal
              ? { breadcrumbs: ["Candidate Market", stepConsultant?.name ?? "", stepDef?.label ?? "", selectedDeal.dealName], title: selectedDeal.dealName, subtitle: "Dealdetail", content: <DealDetailPane deal={selectedDeal} /> }
              : null
        }
      />

      <ConsultantOverviewOverlay
        open={!!consultantOverlay}
        consultantId={consultantOverlay}
        onClose={() => setConsultantOverlay(null)}
        onOpenStep={(consultantId, step) => { setConsultantOverlay(null); setStepCtx({ consultantId, step }); }}
        onOpenCallConversions={(consultantId, initial) => { setConsultantOverlay(null); setCallConvOverlay({ consultantId, initial }); }}
      />
      <CallConversionsOverlay
        open={!!callConvOverlay}
        consultantId={callConvOverlay?.consultantId ?? null}
        initialConversion={callConvOverlay?.initial ?? null}
        onClose={() => setCallConvOverlay(null)}
      />
      <DevelopmentOverlay open={!!devOverlay} consultantId={devOverlay} onClose={() => setDevOverlay(null)} />
      <StopperOverlay open={!!stopperOverlay} consultantId={stopperOverlay} onClose={() => setStopperOverlay(null)} />
      <ActivePlacementsOverlay open={!!placementOverlay} consultantId={placementOverlay} onClose={() => setPlacementOverlay(null)} />
      <RevenueDetailOverlay open={!!revenueOverlay} consultantId={revenueOverlay} onClose={() => setRevenueOverlay(null)} />
      <SoonToStartOverlay open={!!soonOverlay} consultantId={soonOverlay} onClose={() => setSoonOverlay(null)} />
      <NetImpactOverlay open={!!netImpactOverlay} consultantId={netImpactOverlay} onClose={() => setNetImpactOverlay(null)} />
      <YtdRealisedOverlay open={ytdOpen} onClose={() => setYtdOpen(false)} />
      <ForecastYearOverlay open={forecastOpen} onClose={() => setForecastOpen(false)} />
    </div>
  );
}

// ─── Inline left-pane lists ───────────────────────────────────────────
function StepCandidateList({ rows, selected, onSelect }: { rows: CandidateRow[]; selected: CandidateRow | null; onSelect: (c: CandidateRow) => void }) {
  const compact = selected != null;
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3">
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/60 sticky top-0">
            <tr className="text-left">
              <Th>Naam</Th><Th>ID</Th><Th>Cat.</Th><Th>Status</Th>
              {!compact && (
                <>
                  <Th className="text-right">Deals</Th><Th className="text-right">Voorstellen</Th>
                  <Th className="text-right">Mails</Th><Th className="text-right">Calls</Th>
                  <Th>Datum</Th><Th>Tijd</Th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const sel = selected?.id === r.id;
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={cn(
                    "border-t border-border cursor-pointer transition-colors",
                    sel ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30",
                  )}
                >
                  <td className="px-2 py-1.5 font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-2 py-1.5 text-muted-foreground text-[10px]">{r.id}</td>
                  <td className="px-2 py-1.5"><span className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0 text-[10px] font-medium">{r.category}</span></td>
                  <td className="px-2 py-1.5 text-muted-foreground">{r.status}</td>
                  {!compact && (
                    <>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.deals}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.proposals}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.emails}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.calls}</td>
                      <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedDate}</td>
                      <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedTime}</td>
                    </>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={compact ? 4 : 10} className="px-2 py-6 text-center text-muted-foreground">Geen records.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StepDealList({ rows, selected, onSelect }: { rows: DealRow[]; selected: DealRow | null; onSelect: (d: DealRow) => void }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3">
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/60 sticky top-0">
            <tr className="text-left">
              <Th>Deal</Th><Th>Status</Th><Th>Kandidaat</Th><Th>Opdrachtgever</Th><Th>Datum</Th><Th>Tijd</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const sel = selected?.dealId === r.dealId;
              return (
                <tr
                  key={r.dealId}
                  onClick={() => onSelect(r)}
                  className={cn(
                    "border-t border-border cursor-pointer transition-colors",
                    sel ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30",
                  )}
                >
                  <td className="px-2 py-1.5 font-medium whitespace-nowrap">
                    <div>{r.dealName}</div>
                    <div className="text-[10px] text-muted-foreground">{r.dealId}</div>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium max-w-[180px] truncate", dealStageBadgeClass(r.dealStatus))}>{r.dealStatus}</span>
                  </td>
                  <td className="px-2 py-1.5">{r.candidateName}</td>
                  <td className="px-2 py-1.5">{r.opdrachtgeverName}</td>
                  <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedDate}</td>
                  <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedTime}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-muted-foreground">Geen deals.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-2 py-1.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-left", className)}>{children}</th>;
}

// ─── Signals tab ───────────────────────────────────────────
const SEVERITY_META: Record<DashboardAlert["severity"], { label: string; dot: string; row: string; pill: string }> = {
  critical: {
    label: "Kritiek",
    dot: "bg-red-500",
    row: "border-red-500/30 hover:bg-red-500/5",
    pill: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
  warning: {
    label: "Aandacht",
    dot: "bg-amber-500",
    row: "border-amber-500/30 hover:bg-amber-500/5",
    pill: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  info: {
    label: "Info",
    dot: "bg-blue-500",
    row: "border-blue-500/30 hover:bg-blue-500/5",
    pill: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
};

function SignalsTab({ alerts, onSelect }: { alerts: DashboardAlert[]; onSelect: (a: DashboardAlert) => void }) {
  const groups = useMemo(() => {
    const order: DashboardAlert["severity"][] = ["critical", "warning", "info"];
    return order
      .map((sev) => ({ severity: sev, items: alerts.filter((a) => a.severity === sev) }))
      .filter((g) => g.items.length > 0);
  }, [alerts]);

  if (alerts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
        <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div className="text-sm font-medium text-foreground">Alle signalen op groen</div>
        <div className="text-xs">Geen openstaande alerts voor dit team.</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">Signalen</h2>
        <p className="text-[11px] text-muted-foreground">
          Klik een signaal om direct naar de bijbehorende consultant of funnelstap te navigeren.
        </p>
      </div>
      <div className="space-y-4">
        {groups.map((g) => {
          const meta = SEVERITY_META[g.severity];
          return (
            <section key={g.severity}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {meta.label}
                </h3>
                <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold tabular-nums", meta.pill)}>
                  {g.items.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {g.items.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(a)}
                      className={cn(
                        "w-full text-left rounded-md border bg-card px-3 py-2 flex items-start gap-3 transition-colors group",
                        meta.row,
                      )}
                    >
                      <AlertTriangle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", g.severity === "critical" ? "text-red-500" : g.severity === "warning" ? "text-amber-500" : "text-blue-500")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{a.title}</span>
                          {a.consultantName && (
                            <span className="text-[10px] text-muted-foreground">· {a.consultantName}</span>
                          )}
                          {a.metric && (
                            <span className="text-[10px] text-muted-foreground">· {a.metric}</span>
                          )}
                          {a.value && (
                            <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold tabular-nums", meta.pill)}>
                              {a.value}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{a.message}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground shrink-0 mt-0.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}


import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { myTeamConsultants } from "@/data/managerData";
import { generateAlerts, type DashboardAlert } from "@/data/managerOperationalDataV2";
import {
  lcbMarketRows, lcbFunnelSteps,
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
import { Button } from "@/components/ui/button";

const UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"];
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
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors text-left",
              tab === t.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <div>{t.label}</div>
            <div className="text-[10px] font-normal text-muted-foreground">{t.subtitle}</div>
          </button>
        ))}
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
          width: (selectedCandidate || selectedDeal) ? 560 : 980,
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
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3">
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/60 sticky top-0">
            <tr className="text-left">
              <Th>Naam</Th><Th>ID</Th><Th>Cat.</Th><Th>Status</Th>
              <Th className="text-right">Deals</Th><Th className="text-right">Voorstellen</Th>
              <Th className="text-right">Mails</Th><Th className="text-right">Calls</Th>
              <Th>Datum</Th><Th>Tijd</Th>
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
                  <td className="px-2 py-1.5 text-right tabular-nums">{r.deals}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{r.proposals}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{r.emails}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{r.calls}</td>
                  <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedDate}</td>
                  <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedTime}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={10} className="px-2 py-6 text-center text-muted-foreground">Geen records.</td></tr>}
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

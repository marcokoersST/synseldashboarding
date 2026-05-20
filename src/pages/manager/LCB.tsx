import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { myTeamConsultants } from "@/data/managerData";
import { generateAlerts, type DashboardAlert } from "@/data/managerOperationalDataV2";
import { lcbMarketRows, type LcbStepKey, type CandidateRow } from "@/data/lcbMarketData";
import { revenueChartDataV2 } from "@/data/managerPerformanceDataV2";
import { consultantSkillData } from "@/data/managerPerformanceData";

import { LCB_STATUS_COLOR, LCB_STATUS_LABEL, statusFromScore } from "@/lib/lcbStatus";
import { LCBTopBar } from "@/components/manager/lcb/LCBTopBar";
import { LCBSignalRow } from "@/components/manager/lcb/LCBSignalRow";
import { CandidateMarketTab } from "@/components/manager/lcb/CandidateMarketTab";
import { ConsultantDevelopmentTab } from "@/components/manager/lcb/ConsultantDevelopmentTab";
import { FinanceForecastTab } from "@/components/manager/lcb/FinanceForecastTab";
import {
  StepDetailOverlay, ConsultantOverviewOverlay, CandidateDetailOverlay,
  DevelopmentOverlay, StopperOverlay, ActivePlacementsOverlay,
  RevenueDetailOverlay, SoonToStartOverlay, NetImpactOverlay,
  YtdRealisedOverlay, ForecastYearOverlay,
} from "@/components/manager/lcb/Overlays";

const UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"];
type TabId = "market" | "development" | "finance";
const TABS: { id: TabId; label: string; subtitle: string }[] = [
  { id: "market", label: "Candidate Market Approach", subtitle: "Acquisitie & funnel" },
  { id: "development", label: "Consultant Development & Steering", subtitle: "Coaching & ontwikkeling" },
  { id: "finance", label: "Finance & Forecast", subtitle: "Omzet, marge & risico" },
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
  const [datePreset, setDatePreset] = useState("Huidige periode");
  const [comparison, setComparison] = useState("Vorige vergelijkbare periode");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedConsultants, setSelectedConsultants] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const [tab, setTab] = useState<TabId>("market");

  const [stepOverlay, setStepOverlay] = useState<{ consultantId: number; step: LcbStepKey } | null>(null);
  const [consultantOverlay, setConsultantOverlay] = useState<number | null>(null);
  const [candidateOverlay, setCandidateOverlay] = useState<{ cand: CandidateRow; consultantId: number } | null>(null);
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
  };

  const handleSignalClick = (a: DashboardAlert) => {
    const c = myTeamConsultants.find((x) => x.name === a.consultantName);
    if (!c) return;
    const m = a.metric?.toLowerCase() ?? "";
    if (m.includes("plaatsing")) { setTab("market"); setStepOverlay({ consultantId: c.id, step: "plaatsingen" }); }
    else if (m.includes("intake")) { setTab("market"); setStepOverlay({ consultantId: c.id, step: "intakes" }); }
    else if (m.includes("gesprek") || m.includes("uitnodiging")) { setTab("market"); setStepOverlay({ consultantId: c.id, step: "gesprekken" }); }
    else if (m.includes("outreach") || m.includes("kwaliteit")) { setTab("development"); setDevOverlay(c.id); }
    else { setTab("market"); setConsultantOverlay(c.id); }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background overflow-hidden">
      {/* Header: compact, no ring */}
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
        datePreset={datePreset} onDatePreset={setDatePreset}
        comparison={comparison} onComparison={setComparison}
        units={UNITS}
        selectedUnits={selectedUnits} onSelectedUnits={setSelectedUnits}
        consultants={myTeamConsultants.map((c) => ({ id: c.id, name: c.name }))}
        selectedConsultants={selectedConsultants} onSelectedConsultants={setSelectedConsultants}
        search={search} onSearch={setSearch}
        onReset={onResetFilters}
      />

      <LCBSignalRow alerts={alerts} onSelect={handleSignalClick} />

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

      <main className="flex-1 overflow-hidden p-3">
        {tab === "market" && (
          <CandidateMarketTab
            selectedUnits={selectedUnits}
            selectedConsultants={selectedConsultants}
            search={search}
            onOpenStep={(consultantId, step) => setStepOverlay({ consultantId, step })}
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

      {/* Overlays */}
      <StepDetailOverlay
        open={!!stepOverlay}
        consultantId={stepOverlay?.consultantId ?? null}
        step={stepOverlay?.step ?? null}
        period={datePreset}
        onClose={() => setStepOverlay(null)}
        onOpenCandidate={(cand, consultantId) => setCandidateOverlay({ cand, consultantId })}
        onOpenConsultant={(id) => { setStepOverlay(null); setConsultantOverlay(id); }}
      />
      <ConsultantOverviewOverlay
        open={!!consultantOverlay}
        consultantId={consultantOverlay}
        onClose={() => setConsultantOverlay(null)}
        onOpenStep={(consultantId, step) => { setConsultantOverlay(null); setStepOverlay({ consultantId, step }); }}
      />
      <CandidateDetailOverlay
        open={!!candidateOverlay}
        candidate={candidateOverlay?.cand ?? null}
        consultantId={candidateOverlay?.consultantId ?? null}
        onClose={() => setCandidateOverlay(null)}
        onBack={() => setCandidateOverlay(null)}
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

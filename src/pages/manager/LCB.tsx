import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { LCBDetailPanel } from "@/components/manager/lcb/LCBDetailPanel";
import { BottleneckBand } from "@/components/manager/lcb/BottleneckBand";
import { TileSparkline } from "@/components/manager/lcb/TileSparkline";
import { cn } from "@/lib/utils";
import { SalesFunnelV2 } from "@/components/manager/v2/SalesFunnelV2";
import { AlertsPanelV2 } from "@/components/manager/v2/AlertsPanelV2";
import { OutreachCardV2 } from "@/components/manager/v2/OutreachCardV2";
import { PerformanceCardV2 } from "@/components/manager/v2/PerformanceCardV2";
import { RevenueChartV2 } from "@/components/manager/v2/RevenueChartV2";
import { PlacementAttritionCard } from "@/components/manager/v2/PlacementAttritionCard";
import { ActiveSecondmentsCard } from "@/components/manager/v2/ActiveSecondmentsCard";
import { OpvolgingCard } from "@/components/manager/OpvolgingCard";
import { ManagerGoalsCard } from "@/components/manager/ManagerGoalsCard";
import { unitFunnelTotalsV2, unitOutreachTotals, generateAlerts, getConversionV2 } from "@/data/managerOperationalDataV2";
import { consultantSkillData } from "@/data/managerPerformanceData";
import { revenueChartDataV2, placementAttritionData } from "@/data/managerPerformanceDataV2";

const UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"];
const DATE_PRESETS = ["Vandaag", "Gisteren", "Laatste 7 dagen", "Laatste 14 dagen", "Laatste 30 dagen", "Huidige week", "Vorige week", "Huidige periode", "Vorige periode", "Huidig jaar"];

type Status = "clean" | "attention" | "critical";
const STATUS_COLOR: Record<Status, string> = {
  clean: "hsl(142 71% 45%)",
  attention: "hsl(38 92% 50%)",
  critical: "hsl(0 84% 60%)",
};
const STATUS_LABEL: Record<Status, string> = { clean: "Op koers", attention: "Aandacht", critical: "Kritiek" };

function overallScore(c: typeof consultantSkillData[0]): number {
  const m = [
    (c.relatieScoreKlant / 10) * 100, (c.relatieScoreKandidaat / 10) * 100,
    c.pitchingPower, c.responsiveness, c.networking, c.bezwaarverlegging,
    c.procedureInschrijving, c.procedureAcquisities, c.systeemHygieneScore,
    c.npsKlant, c.npsKandidaat,
  ];
  return Math.round(m.reduce((a, b) => a + b, 0) / m.length);
}

interface Stat { label: string; value: string; trend?: number }

interface TileDef {
  key: string;
  title: string;
  subtitle: string;
  status: Status;
  score: number;
  metricLabel: string;
  metricValue: string;
  detail: ReactNode;
  trend?: number[];
  stats?: Stat[];
}

export default function LCB() {
  const [datePreset, setDatePreset] = useState("Huidige periode");
  const [comparison, setComparison] = useState("Vorige vergelijkbare periode");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [openTile, setOpenTile] = useState<string | null>(null);

  const selectedUnit = selectedUnits.length === 1 ? selectedUnits[0] : "all";

  const avgSkillScore = useMemo(() => Math.round(
    consultantSkillData.reduce((s, c) => s + overallScore(c), 0) / consultantSkillData.length
  ), []);
  const belowNorm = useMemo(() => consultantSkillData.filter(c => overallScore(c) < 55).length, []);

  const realisedSeries = revenueChartDataV2.filter(d => d.realised > 0);
  const lastRevenue = realisedSeries[realisedSeries.length - 1];
  const ytdRealised = realisedSeries.reduce((s, d) => s + d.realised, 0);
  const ytdTarget = revenueChartDataV2.slice(0, realisedSeries.length).reduce((s, d) => s + d.target, 0);
  const fullYearTarget = revenueChartDataV2.reduce((s, d) => s + d.target, 0);
  const fullYearProgose = revenueChartDataV2.reduce((s, d) => s + (d.realised > 0 ? d.realised : d.prognose), 0);
  const prognoseWarning = revenueChartDataV2.some(d => d.belowTarget);
  // Derived margin (mock): 28% avg, slightly variable
  const margePct = 28.4;
  const margeEur = Math.round(ytdRealised * margePct / 100);

  const operationeelScore = Math.min(100, Math.round((unitFunnelTotalsV2.plaatsingen / Math.max(unitFunnelTotalsV2.intakes, 1)) * 100));
  const omzetScore = Math.min(100, Math.round((ytdRealised / Math.max(ytdTarget, 1)) * 100));
  const globalScore = Math.round((avgSkillScore + operationeelScore + omzetScore) / 3);
  const globalStatus: Status = globalScore >= 75 ? "clean" : globalScore >= 55 ? "attention" : "critical";
  const globalColor = STATUS_COLOR[globalStatus];

  const refreshLabel = useMemo(() => {
    return new Date().toLocaleString("nl-NL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  }, []);

  const alerts = useMemo(() => generateAlerts(), []);
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;
  const warningAlerts = alerts.filter(a => a.severity === "warning").length;
  const infoAlerts = alerts.filter(a => a.severity === "info").length;
  const alertScore = Math.max(0, Math.min(100, 100 - criticalAlerts * 20 - warningAlerts * 8));
  const alertStatus: Status = criticalAlerts > 0 ? "critical" : warningAlerts > 0 ? "attention" : "clean";

  const totalStoppers = placementAttritionData.reduce((s, p) => s + p.stoppersCount, 0);
  const attritionImpact = placementAttritionData.reduce((s, p) => s + p.revenueImpact, 0);
  const retention = Math.max(0, 100 - Math.round((totalStoppers / Math.max(unitFunnelTotalsV2.plaatsingen, 1)) * 100));

  const funnelConv = getConversionV2(unitFunnelTotalsV2.plaatsingen, unitFunnelTotalsV2.intakes);
  const intakeConv = getConversionV2(unitFunnelTotalsV2.intakes, unitFunnelTotalsV2.voorstellen);

  // Goals (mock) — 12 goals total, 8 on track, 3 aandacht, 1 risk
  const goalsTotal = 12, goalsOnTrack = 8, goalsAttention = 3;
  const goalsPct = Math.round((goalsOnTrack / goalsTotal) * 100);

  // Active secondments mock count
  const activeSecondments = 18;

  // Opvolging mock counts
  const opvolgingOpen = 7, opvolgingOverdue = 2;

  const tiles: TileDef[] = [
    {
      key: "signalering",
      title: "Signalering",
      subtitle: "Actuele alerts & risico's",
      status: alertStatus,
      score: alertScore,
      metricLabel: "Open signalen",
      metricValue: `${alerts.length}`,
      stats: [
        { label: "Kritiek", value: `${criticalAlerts}` },
        { label: "Aandacht", value: `${warningAlerts}` },
        { label: "Info", value: `${infoAlerts}` },
      ],
      detail: <AlertsPanelV2 variant="embedded" />,
    },
    {
      key: "salesfunnel",
      title: "Sales Funnel",
      subtitle: "Conversie van lead tot plaatsing",
      status: operationeelScore >= 75 ? "clean" : operationeelScore >= 55 ? "attention" : "critical",
      score: operationeelScore,
      metricLabel: "Plaatsingen",
      metricValue: `${unitFunnelTotalsV2.plaatsingen}`,
      trend: [12, 14, 13, 16, 18, 17, 19, unitFunnelTotalsV2.plaatsingen],
      stats: [
        { label: "Intakes", value: `${unitFunnelTotalsV2.intakes}` },
        { label: "Conversie", value: `${funnelConv}%` },
        { label: "Vrstl→Int", value: `${intakeConv}%` },
      ],
      detail: <SalesFunnelV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "outreach",
      title: "Outreach",
      subtitle: "Telefonie & e-mail activiteit",
      status: unitOutreachTotals.totalOutreach > 200 ? "clean" : "attention",
      score: Math.min(100, Math.round((unitOutreachTotals.totalOutreach / 400) * 100)),
      metricLabel: "Contactmomenten",
      metricValue: `${unitOutreachTotals.totalOutreach}`,
      trend: [820, 905, 870, 940, 980, 1020, 1080, unitOutreachTotals.totalOutreach],
      stats: [
        { label: "Calls", value: `${unitOutreachTotals.callsIn + unitOutreachTotals.callsOut}` },
        { label: "E-mails", value: `${unitOutreachTotals.emailsSent}` },
        { label: "Kwaliteit", value: `${unitOutreachTotals.qualityScore}` },
      ],
      detail: <OutreachCardV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "omzet",
      title: "Omzet & Marge",
      subtitle: "Realisatie en brutomarge",
      status: prognoseWarning ? "critical" : omzetScore >= 90 ? "clean" : "attention",
      score: omzetScore,
      metricLabel: "YTD Realised",
      metricValue: `€${ytdRealised}k`,
      trend: realisedSeries.map(d => d.realised).slice(-8),
      stats: [
        { label: "Target", value: `€${ytdTarget}k` },
        { label: "Marge", value: `${margePct}%` },
        { label: "Prognose YR", value: `€${fullYearProgose}k` },
      ],
      detail: <RevenueChartV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "performance",
      title: "Performance & Skills",
      subtitle: "Kwaliteit en groei van het team",
      status: avgSkillScore >= 75 ? "clean" : avgSkillScore >= 55 ? "attention" : "critical",
      score: avgSkillScore,
      metricLabel: "Gem. score",
      metricValue: `${avgSkillScore}`,
      stats: [
        { label: "Onder norm", value: `${belowNorm}` },
        { label: "Top performer", value: `${consultantSkillData.filter(c => overallScore(c) >= 80).length}` },
        { label: "Consultants", value: `${consultantSkillData.length}` },
      ],
      detail: <PerformanceCardV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "goals",
      title: "Doelen & Groei",
      subtitle: "Voortgang teamdoelstellingen",
      status: goalsPct >= 75 ? "clean" : goalsPct >= 55 ? "attention" : "critical",
      score: goalsPct,
      metricLabel: "Op koers",
      metricValue: `${goalsOnTrack}/${goalsTotal}`,
      stats: [
        { label: "Aandacht", value: `${goalsAttention}` },
        { label: "Risico", value: `${goalsTotal - goalsOnTrack - goalsAttention}` },
        { label: "Voortgang", value: `${goalsPct}%` },
      ],
      detail: <ManagerGoalsCard delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "attrition",
      title: "Plaatsing & Attritie",
      subtitle: "Retentie van actieve plaatsingen",
      status: retention >= 90 ? "clean" : retention >= 80 ? "attention" : "critical",
      score: retention,
      metricLabel: "Retentie",
      metricValue: `${retention}%`,
      stats: [
        { label: "Stoppers", value: `${totalStoppers}` },
        { label: "Impact", value: `€${attritionImpact.toFixed(0)}k` },
        { label: "Risico", value: "3" },
      ],
      detail: <PlacementAttritionCard delay={0} />,
    },
    {
      key: "secondments",
      title: "Actieve kandidaten",
      subtitle: "Lopende detacheringen & contracten",
      status: "clean",
      score: 85,
      metricLabel: "Actief",
      metricValue: `${activeSecondments}`,
      stats: [
        { label: "Detavast", value: "11" },
        { label: "W&S", value: "5" },
        { label: "Marge Fac", value: "2" },
      ],
      detail: <ActiveSecondmentsCard delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "opvolging",
      title: "Opvolging",
      subtitle: "Open acties & SLA",
      status: opvolgingOverdue > 0 ? "attention" : "clean",
      score: 65,
      metricLabel: "Open acties",
      metricValue: `${opvolgingOpen}`,
      stats: [
        { label: "Te laat", value: `${opvolgingOverdue}` },
        { label: "Vandaag", value: "3" },
        { label: "Deze week", value: "2" },
      ],
      detail: <OpvolgingCard delay={0} selectedUnit={selectedUnit} />,
    },
  ];

  const openDef = tiles.find(t => t.key === openTile);

  // Header KPI strip
  const headerKpis: { label: string; value: string; sub?: string; tone?: Status }[] = [
    { label: "YTD Omzet", value: `€${ytdRealised}k`, sub: `${omzetScore}% v target`, tone: omzetScore >= 90 ? "clean" : "attention" },
    { label: "Brutomarge", value: `${margePct}%`, sub: `€${margeEur}k`, tone: "clean" },
    { label: "Plaatsingen", value: `${unitFunnelTotalsV2.plaatsingen}`, sub: `${funnelConv}% conv` },
    { label: "Actieve kand.", value: `${activeSecondments}`, sub: `${retention}% retentie`, tone: retention >= 90 ? "clean" : "attention" },
    { label: "Doelen", value: `${goalsOnTrack}/${goalsTotal}`, sub: `${goalsPct}% op koers`, tone: goalsPct >= 75 ? "clean" : "attention" },
    { label: "Signalen", value: `${alerts.length}`, sub: `${criticalAlerts} kritiek`, tone: alertStatus },
  ];

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <AnimatedRing value={globalScore} size={40} strokeWidth={4} strokeColor={globalColor} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold tabular-nums" style={{ color: globalColor }}>
                  <AnimatedNumber value={globalScore} />
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground leading-tight">Manager Dashboard — LC-B</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                <span className="font-medium" style={{ color: globalColor }}>{STATUS_LABEL[globalStatus]}</span>
                {" · "}Operationeel {operationeelScore}% · Performance {avgSkillScore}% · Omzet {omzetScore}%
              </p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 shrink-0">
            <SelectFilter label="Periode" value={datePreset} options={DATE_PRESETS} onSelect={setDatePreset} triggerClassName="w-[180px]" />
            <SelectFilter label="Vergelijk" value={comparison} options={["Vorige vergelijkbare periode", "Vorig jaar", "Geen"]} onSelect={setComparison} triggerClassName="w-[200px]" />
            <MultiSelectFilter label="Units" placeholder="Alle units" values={selectedUnits} options={UNITS.map(u => ({ value: u, label: u }))} onChange={setSelectedUnits} triggerClassName="w-[150px]" />
            <div className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>{refreshLabel}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-6 border-t border-border/60 divide-x divide-border/60 bg-card/40">
          {headerKpis.map(k => {
            const c = k.tone ? STATUS_COLOR[k.tone] : undefined;
            return (
              <div key={k.label} className="px-4 py-2 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">{k.label}</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-bold tabular-nums leading-none" style={c ? { color: c } : undefined}>{k.value}</span>
                  {k.sub && <span className="text-[10px] text-muted-foreground truncate">{k.sub}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {tiles.map(t => (
            <DenseTile key={t.key} tile={t} onOpen={() => setOpenTile(t.key)} />
          ))}
        </div>

        <BottleneckBand
          selectedUnits={selectedUnits}
          bottleneckRows={tiles.map(t => ({
            key: t.key,
            label: t.title,
            score: t.score,
            status: t.status,
            metric: `${t.metricValue}`,
          }))}
          onSelectTile={(key) => setOpenTile(key)}
          onSelectTileWithUnit={(key, unit) => { setSelectedUnits([unit]); setOpenTile(key); }}
        />
      </main>

      <LCBDetailPanel tile={openDef ?? null} onClose={() => setOpenTile(null)} />
    </div>
  );
}

function DenseTile({ tile, onOpen }: { tile: TileDef; onOpen: () => void }) {
  const color = STATUS_COLOR[tile.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col rounded-xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex items-start gap-2 px-3 pt-2.5 pb-1.5">
        <span
          className="inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider shrink-0"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {STATUS_LABEL[tile.status]}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-semibold text-foreground leading-tight">{tile.title}</h3>
          <p className="truncate text-[10px] text-muted-foreground leading-tight">{tile.subtitle}</p>
        </div>
        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-3 px-3 pb-2.5">
        <div className="relative shrink-0">
          <AnimatedRing value={tile.score} size={64} strokeWidth={6} strokeColor={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold tabular-nums" style={{ color }}>
              <AnimatedNumber value={tile.score} />
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{tile.metricLabel}</div>
          <div className="text-xl font-bold leading-none tabular-nums text-foreground">{tile.metricValue}</div>
          {tile.trend && tile.trend.length > 1 && (
            <div className="mt-1.5">
              <TileSparkline data={tile.trend} color={color} />
            </div>
          )}
        </div>
      </div>
      {tile.stats && tile.stats.length > 0 && (
        <div className="grid grid-cols-3 border-t border-border/60 divide-x divide-border/60">
          {tile.stats.map(s => (
            <div key={s.label} className="px-2 py-1.5 min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground truncate">{s.label}</div>
              <div className="text-[13px] font-semibold tabular-nums text-foreground truncate">{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

function SelectFilter({ label, value, options, onSelect, triggerClassName }: { label: string; value: string; options: string[]; onSelect: (v: string) => void; triggerClassName?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs justify-between", triggerClassName)}>
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground shrink-0">{label}:</span>
            <span className="font-medium truncate">{value}</span>
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        {options.map(o => (
          <button key={o} type="button" onClick={() => onSelect(o)} className={cn("w-full text-left rounded-md px-2 py-1.5 text-xs hover:bg-accent", value === o && "bg-accent text-accent-foreground")}>
            {o}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function MultiSelectFilter({ label, placeholder, values, options, onChange, triggerClassName }: { label: string; placeholder: string; values: string[]; options: { value: string; label: string }[]; onChange: (v: string[]) => void; triggerClassName?: string }) {
  const allValues = options.map(o => o.value);
  const display = values.length === 0 ? placeholder : `${values.length} geselecteerd`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs justify-between", triggerClassName)}>
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground shrink-0">{label}:</span>
            <span className="font-medium truncate">{display}</span>
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onChange(allValues)}>Alles aan</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onChange([])}>Alles uit</Button>
          </div>
        </div>
        <div className="max-h-[260px] overflow-y-auto space-y-0.5">
          {options.map(o => {
            const checked = values.includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent cursor-pointer">
                <Checkbox checked={checked} onCheckedChange={c => { if (c) onChange([...values, o.value]); else onChange(values.filter(v => v !== o.value)); }} />
                <span className="truncate">{o.label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
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
import { InterventionHeatmap } from "@/components/manager/v2/InterventionHeatmap";
import { ActiveSecondmentsCard } from "@/components/manager/v2/ActiveSecondmentsCard";
import { OpvolgingCard } from "@/components/manager/OpvolgingCard";
import { ManagerGoalsCard } from "@/components/manager/ManagerGoalsCard";
import { unitFunnelTotalsV2, unitOutreachTotals, generateAlerts } from "@/data/managerOperationalDataV2";
import { consultantSkillData } from "@/data/managerPerformanceData";
import { revenueChartDataV2 } from "@/data/managerPerformanceDataV2";

const UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"];
const DATE_PRESETS = ["Vandaag", "Gisteren", "Laatste 7 dagen", "Laatste 14 dagen", "Laatste 30 dagen", "Huidige week", "Vorige week", "Huidige periode", "Vorige periode", "Huidig jaar"];
const DIMENSIES = ["All", "Operationeel", "Performance", "Omzet"];

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

interface TileDef {
  key: string;
  title: string;
  subtitle: string;
  status: Status;
  score: number;
  metricLabel: string;
  metricValue: string;
  detail: ReactNode;
  size: "major" | "minor";
  trend?: number[];
}

export default function LCB() {
  const [datePreset, setDatePreset] = useState("Huidige periode");
  const [comparison, setComparison] = useState("Vorige vergelijkbare periode");
  const [dimension, setDimension] = useState("All");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [openTile, setOpenTile] = useState<string | null>(null);

  const selectedUnit = selectedUnits.length === 1 ? selectedUnits[0] : "all";

  const avgSkillScore = useMemo(() => Math.round(
    consultantSkillData.reduce((s, c) => s + overallScore(c), 0) / consultantSkillData.length
  ), []);
  const belowNorm = useMemo(() => consultantSkillData.filter(c => overallScore(c) < 55).length, []);
  const lastRevenue = revenueChartDataV2.filter(d => d.realised > 0).pop();
  const prognoseWarning = revenueChartDataV2.some(d => d.belowTarget);

  const operationeelScore = Math.min(100, Math.round((unitFunnelTotalsV2.plaatsingen / Math.max(unitFunnelTotalsV2.intakes, 1)) * 100));
  const omzetScore = lastRevenue ? Math.min(100, Math.round((lastRevenue.realised / Math.max(lastRevenue.target, 1)) * 100)) : 0;
  const globalScore = Math.round((avgSkillScore + operationeelScore + omzetScore) / 3);
  const globalStatus: Status = globalScore >= 75 ? "clean" : globalScore >= 55 ? "attention" : "critical";
  const globalColor = STATUS_COLOR[globalStatus];

  const refreshLabel = useMemo(() => {
    return new Date().toLocaleString("nl-NL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  }, []);

  const alerts = useMemo(() => generateAlerts(), []);
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;
  const warningAlerts = alerts.filter(a => a.severity === "warning").length;
  const alertScore = Math.max(0, Math.min(100, 100 - criticalAlerts * 20 - warningAlerts * 8));
  const alertStatus: Status = criticalAlerts > 0 ? "critical" : warningAlerts > 0 ? "attention" : "clean";

  const tiles: TileDef[] = [
    {
      key: "signalering",
      title: "Signalering",
      subtitle: "Actuele alerts & risico's",
      status: alertStatus,
      score: alertScore,
      metricLabel: "Open signalen",
      metricValue: `${alerts.length}`,
      size: "major",
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
      size: "major",
      trend: [12, 14, 13, 16, 18, 17, 19, unitFunnelTotalsV2.plaatsingen],
      detail: <SalesFunnelV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "outreach",
      title: "Outreach & Contactmomenten",
      subtitle: "Activiteit van het team",
      status: unitOutreachTotals.totalOutreach > 200 ? "clean" : "attention",
      score: Math.min(100, Math.round((unitOutreachTotals.totalOutreach / 400) * 100)),
      metricLabel: "Contactmomenten",
      metricValue: `${unitOutreachTotals.totalOutreach}`,
      size: "major",
      trend: [820, 905, 870, 940, 980, 1020, 1080, unitOutreachTotals.totalOutreach],
      detail: <OutreachCardV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "omzet",
      title: "Omzet & Prognose",
      subtitle: "Realisatie versus target",
      status: prognoseWarning ? "critical" : omzetScore >= 75 ? "clean" : "attention",
      score: omzetScore,
      metricLabel: "Gerealiseerd",
      metricValue: lastRevenue ? `€${lastRevenue.realised}k` : "—",
      size: "major",
      trend: revenueChartDataV2.filter(d => d.realised > 0).map(d => d.realised).slice(-8),
      detail: <RevenueChartV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "performance",
      title: "Performance",
      subtitle: "Skills & kwaliteit",
      status: avgSkillScore >= 75 ? "clean" : avgSkillScore >= 55 ? "attention" : "critical",
      score: avgSkillScore,
      metricLabel: belowNorm > 0 ? "Onder norm" : "Gem. score",
      metricValue: belowNorm > 0 ? `${belowNorm}` : `${avgSkillScore}%`,
      size: "minor",
      detail: <PerformanceCardV2 delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "goals",
      title: "Doelen",
      subtitle: "Voortgang team",
      status: "clean",
      score: 80,
      metricLabel: "Doelen",
      metricValue: "Actief",
      size: "minor",
      detail: <ManagerGoalsCard delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "opvolging",
      title: "Opvolging",
      subtitle: "Open acties & SLA",
      status: "attention",
      score: 65,
      metricLabel: "Status",
      metricValue: "Live",
      size: "minor",
      detail: <OpvolgingCard delay={0} selectedUnit={selectedUnit} />,
    },
    {
      key: "attrition",
      title: "Plaatsing & Attritie",
      subtitle: "Retentie van geplaatsten",
      status: "clean",
      score: 78,
      metricLabel: "Live",
      metricValue: "Actief",
      size: "minor",
      detail: <PlacementAttritionCard delay={0} />,
    },
    {
      key: "secondments",
      title: "Actieve detacheringen",
      subtitle: "Lopende contracten",
      status: "clean",
      score: 85,
      metricLabel: "Live",
      metricValue: "Actief",
      size: "minor",
      detail: <ActiveSecondmentsCard delay={0} selectedUnit={selectedUnit} />,
    },
  ];

  const dimensionMatch = (key: string) => {
    if (dimension === "All") return true;
    if (dimension === "Operationeel") return ["signalering", "salesfunnel", "outreach", "opvolging"].includes(key);
    if (dimension === "Performance") return ["performance", "goals"].includes(key);
    if (dimension === "Omzet") return ["omzet", "attrition", "secondments"].includes(key);
    return true;
  };

  const major = tiles.filter(t => t.size === "major" && dimensionMatch(t.key));
  const minor = tiles.filter(t => t.size === "minor" && dimensionMatch(t.key));
  const openDef = tiles.find(t => t.key === openTile);

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 overflow-hidden">
        <div className="flex h-20 items-center gap-4 px-6">
          <div className="relative shrink-0">
            <AnimatedRing value={globalScore} size={64} strokeWidth={6} strokeColor={globalColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold tabular-nums" style={{ color: globalColor }}>
                <AnimatedNumber value={globalScore} />
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-foreground">Manager Dashboard — LC-B</h1>
            <p className="text-xs text-muted-foreground truncate">
              Manager health score:{" "}
              <span className="font-medium" style={{ color: globalColor }}>{STATUS_LABEL[globalStatus]}</span>
              {" · "}Operationeel {operationeelScore}% · Performance {avgSkillScore}% · Omzet {omzetScore}%
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[10px] text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>Updated {refreshLabel}</span>
          </div>
        </div>
        <div className="h-12 border-t border-border/60 px-6 flex items-center overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <SelectFilter label="Datum" value={datePreset} options={DATE_PRESETS} onSelect={setDatePreset} triggerClassName="w-[200px]" />
            <SelectFilter label="Compare" value={comparison} options={["Vorige vergelijkbare periode", "Vorig jaar", "Geen"]} onSelect={setComparison} triggerClassName="w-[260px]" />
            <MultiSelectFilter label="Units" placeholder="Alle units" values={selectedUnits} options={UNITS.map(u => ({ value: u, label: u }))} onChange={setSelectedUnits} triggerClassName="w-[170px]" />
            <SelectFilter label="Dimensie" value={dimension} options={DIMENSIES} onSelect={setDimension} triggerClassName="w-[200px]" />
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        <AlertsPanelV2 />

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_320px]">
          {major.map(t => (
            <MajorTile key={t.key} tile={t} onOpen={() => setOpenTile(t.key)} />
          ))}
          <div className="grid grid-rows-5 gap-3">
            {minor.map(t => (
              <MinorTile key={t.key} tile={t} onOpen={() => setOpenTile(t.key)} />
            ))}
          </div>
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

function MajorTile({ tile, onOpen }: { tile: TileDef; onOpen: () => void }) {
  const color = STATUS_COLOR[tile.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full min-h-[240px] w-full flex-col rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-6 pb-4 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-foreground">{tile.title}</h3>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ backgroundColor: `${color}22`, color }}>
              {STATUS_LABEL[tile.status]}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{tile.subtitle}</p>
        </div>
        <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-6 px-6 py-5 flex-1">
        <div className="relative shrink-0">
          <AnimatedRing value={tile.score} size={104} strokeWidth={9} strokeColor={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Score</span>
            <span className="mt-0.5 text-2xl font-bold leading-none tabular-nums" style={{ color }}>
              <AnimatedNumber value={tile.score} />
            </span>
            <span className="mt-0.5 text-[9px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{tile.metricLabel}</div>
          <div className="text-3xl font-bold leading-tight tabular-nums text-foreground">{tile.metricValue}</div>
          {tile.trend && tile.trend.length > 1 && (
            <div className="mt-2 flex items-center gap-2">
              <TileSparkline data={tile.trend} color={color} />
              <span className="text-[10px] text-muted-foreground">8w trend</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function MinorTile({ tile, onOpen }: { tile: TileDef; onOpen: () => void }) {
  const color = STATUS_COLOR[tile.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="relative shrink-0">
        <AnimatedRing value={tile.score} size={48} strokeWidth={5} strokeColor={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold tabular-nums" style={{ color }}>{tile.score}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="truncate text-sm font-semibold text-foreground">{tile.title}</h4>
        </div>
        <p className="truncate text-[10px] text-muted-foreground">{tile.subtitle}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] text-muted-foreground">{STATUS_LABEL[tile.status]}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
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

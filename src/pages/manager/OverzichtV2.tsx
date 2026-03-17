import { useState, useCallback, useEffect, DragEvent, ReactNode } from "react";
import { ChevronUp, ChevronDown, GripVertical, ArrowUpDown, Filter, CalendarIcon } from "lucide-react";
import { SalesFunnelV2 } from "@/components/manager/v2/SalesFunnelV2";
import { AlertsPanelV2 } from "@/components/manager/v2/AlertsPanelV2";
import { OutreachCardV2 } from "@/components/manager/v2/OutreachCardV2";
import { PerformanceCardV2 } from "@/components/manager/v2/PerformanceCardV2";
import { RevenueChartV2 } from "@/components/manager/v2/RevenueChartV2";
import { PlacementAttritionCard } from "@/components/manager/v2/PlacementAttritionCard";
import { OpvolgingCard } from "@/components/manager/OpvolgingCard";
import { ManagerGoalsCard } from "@/components/manager/ManagerGoalsCard";
import { ManagerPlacementsCard } from "@/components/manager/ManagerPlacementsCard";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { unitFunnelTotalsV2, unitOutreachTotals } from "@/data/managerOperationalDataV2";
import { consultantSkillData } from "@/data/managerPerformanceData";
import { revenueChartDataV2 } from "@/data/managerPerformanceDataV2";
import { format, startOfWeek, differenceInDays, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"];

interface SectionConfig {
  id: string;
  label: string;
  summaryBadges: () => ReactNode;
  content: () => ReactNode;
}

const STORAGE_KEY_ORDER = "mgr-dash-v2-section-order";
const STORAGE_KEY_COLLAPSED = "mgr-dash-v2-collapsed";

function loadOrder(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 3) return parsed;
    }
  } catch { /* empty */ }
  return ["operationeel", "performance", "omzet"];
}

function loadCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COLLAPSED);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return {};
}

function getDefaultRange(): DateRange {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  return { from: monday, to: today };
}

function formatPeriod(range: DateRange): string {
  if (!range.from) return "Selecteer periode";
  const from = format(range.from, "EEE d MMM", { locale: nl });
  const to = range.to ? format(range.to, "EEE d MMM yyyy", { locale: nl }) : "";
  return `${from} – ${to}`;
}

function getPreviousPeriod(range: DateRange): { from: Date; to: Date } | null {
  if (!range.from || !range.to) return null;
  const dayCount = differenceInDays(range.to, range.from) + 1;
  return { from: subDays(range.from, dayCount), to: subDays(range.from, 1) };
}

function overallScore(c: typeof consultantSkillData[0]): number {
  const metrics = [
    (c.relatieScoreKlant / 10) * 100, (c.relatieScoreKandidaat / 10) * 100,
    c.pitchingPower, c.responsiveness, c.networking, c.bezwaarverlegging,
    c.procedureInschrijving, c.procedureAcquisities, c.systeemHygieneScore,
    c.npsKlant, c.npsKandidaat,
  ];
  return Math.round(metrics.reduce((a, b) => a + b, 0) / metrics.length);
}

export default function OverzichtV2() {
  const [sectionOrder, setSectionOrder] = useState<string[]>(loadOrder);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(loadCollapsed);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);

  const previousPeriod = getPreviousPeriod(dateRange);

  // Derive selectedUnit for components that expect a single string
  const selectedUnit = selectedUnits.length === 0 ? "all" :
    selectedUnits.length === 1 ? selectedUnits[0] : "all";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(collapsed));
  }, [collapsed]);

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev =>
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const handleDragStart = (e: DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (e: DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragOverIdx(null);
      return;
    }
    setSectionOrder((prev) => {
      const next = [...prev];
      const [removed] = next.splice(dragIdx, 1);
      next.splice(dropIdx, 0, removed);
      return next;
    });
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };
  const handleDragLeave = () => { setDragOverIdx(null); };

  const avgSkillScore = Math.round(
    consultantSkillData.reduce((s, c) => s + overallScore(c), 0) / consultantSkillData.length
  );
  const belowNorm = consultantSkillData.filter(c => overallScore(c) < 55).length;
  const lastRevenue = revenueChartDataV2.filter(d => d.realised > 0).pop();
  const prognoseWarning = revenueChartDataV2.some(d => d.belowTarget);

  const sections: SectionConfig[] = [
    {
      id: "operationeel",
      label: "Operationeel",
      summaryBadges: () => (
        <>
          <Badge variant="secondary" className="text-[11px] font-normal">{unitFunnelTotalsV2.plaatsingen} plaatsingen</Badge>
          <Badge variant="secondary" className="text-[11px] font-normal">{unitOutreachTotals.totalOutreach} contactmomenten</Badge>
        </>
      ),
      content: () => (
        <>
          <SalesFunnelV2 delay={100} selectedUnit={selectedUnit} />
          <div className="mt-5">
            <OpvolgingCard delay={150} selectedUnit={selectedUnit} />
          </div>
          <div className="mt-5">
            <OutreachCardV2 delay={200} selectedUnit={selectedUnit} />
          </div>
        </>
      ),
    },
    {
      id: "performance",
      label: "Performance & Kwaliteit",
      summaryBadges: () => (
        <>
          <Badge variant="secondary" className="text-[11px] font-normal">Gem. score: {avgSkillScore}%</Badge>
          {belowNorm > 0 && (
            <Badge variant="destructive" className="text-[11px] font-normal">{belowNorm} onder norm</Badge>
          )}
        </>
      ),
      content: () => (
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <PerformanceCardV2 delay={250} selectedUnit={selectedUnit} />
          </div>
          <div className="col-span-1">
            <ManagerGoalsCard delay={300} selectedUnit={selectedUnit} />
          </div>
        </div>
      ),
    },
    {
      id: "omzet",
      label: "Omzet & Prognose",
      summaryBadges: () => (
        <>
          {lastRevenue && <Badge variant="secondary" className="text-[11px] font-normal">€{lastRevenue.realised}k gerealiseerd</Badge>}
          {prognoseWarning && (
            <Badge variant="destructive" className="text-[11px] font-normal">Prognose onder target</Badge>
          )}
        </>
      ),
      content: () => (
        <>
          <div className="mb-5">
            <RevenueChartV2 delay={350} selectedUnit={selectedUnit} />
          </div>
          <div className="mb-5">
            <PlacementAttritionCard delay={375} />
          </div>
          {/* Plaatsingen full width — leaderboard removed */}
          <div>
            <ManagerPlacementsCard delay={400} selectedUnit={selectedUnit} />
          </div>
        </>
      ),
    },
  ];

  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s]));

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap min-w-0 max-w-full">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard V2</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Signalering, sturing & coaching — focus op afwijkingen
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end min-w-0 max-w-full">
          {/* Period selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatPeriod(dateRange)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => range && setDateRange(range)}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={nl}
                modifiers={{ today: new Date() }}
                modifiersClassNames={{ today: "ring-2 ring-primary rounded-md" }}
              />
            </PopoverContent>
          </Popover>

          {previousPeriod && (
            <Badge variant="secondary" className="text-[10px]">
              vs {format(previousPeriod.from, "d MMM", { locale: nl })} – {format(previousPeriod.to, "d MMM", { locale: nl })}
            </Badge>
          )}

          {/* Multi-select unit filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Filter className="h-3.5 w-3.5" />
                {selectedUnits.length === 0 ? "Alle units" : `${selectedUnits.length} unit${selectedUnits.length > 1 ? "s" : ""}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-3" align="end">
              <p className="text-xs font-medium text-muted-foreground mb-2">Filter op unit</p>
              <div className="space-y-2">
                {UNITS.map(unit => (
                  <label key={unit} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedUnits.includes(unit)}
                      onCheckedChange={() => toggleUnit(unit)}
                    />
                    {unit}
                  </label>
                ))}
              </div>
              {selectedUnits.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setSelectedUnits([])}>
                  Reset
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <ArrowUpDown size={14} />
                Volgorde
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Sleep om te herordenen</p>
              {sectionOrder.map((id, idx) => (
                <div
                  key={id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragLeave={handleDragLeave}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-grab active:cursor-grabbing select-none transition-all duration-200 ease-out ${
                    dragIdx === idx ? "opacity-50 scale-[1.02] shadow-md" :
                    dragOverIdx === idx ? "bg-accent translate-y-0.5" : "hover:bg-muted/50"
                  }`}
                >
                  <GripVertical size={14} className="text-muted-foreground/60 flex-shrink-0" />
                  <span>{sectionMap[id]?.label}</span>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Alerts panel — always at top */}
      <AlertsPanelV2 />

      {sectionOrder.map((id) => {
        const section = sectionMap[id];
        if (!section) return null;
        const isCollapsed = !!collapsed[id];

        if (isCollapsed) {
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="mb-4 w-full flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-2.5 text-left transition-colors hover:bg-accent/40 group"
            >
              <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">{section.label}</h2>
              <div className="flex items-center gap-2 flex-1 justify-center">
                {section.summaryBadges()}
              </div>
              <ChevronDown size={16} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </button>
          );
        }

        return (
          <section key={id} className="mb-8 min-w-0 max-w-full overflow-x-hidden">
            <button
              onClick={() => toggle(id)}
              className="flex items-center gap-3 mb-4 w-full text-left group cursor-pointer"
            >
              <h2 className="text-lg font-semibold text-foreground">{section.label}</h2>
              <div className="flex-1 h-px bg-border" />
              <ChevronUp size={16} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </button>
            {section.content()}
          </section>
        );
      })}
    </div>
  );
}

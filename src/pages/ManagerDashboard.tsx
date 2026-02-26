import { useState, useCallback, useEffect, DragEvent, ReactNode } from "react";
import { ChevronUp, ChevronDown, GripVertical, ArrowUpDown } from "lucide-react";
import { ManagerSalesFunnel } from "@/components/manager/ManagerSalesFunnel";
import { OpvolgingCard } from "@/components/manager/OpvolgingCard";
import { ManagerCallsCard } from "@/components/manager/ManagerCallsCard";
import { ProcesKernvaardighedenCard } from "@/components/manager/ProcesKernvaardighedenCard";
import { ManagerGoalsCard } from "@/components/manager/ManagerGoalsCard";
import { ManagerRevenueChart } from "@/components/manager/ManagerRevenueChart";
import { ManagerPlacementsCard } from "@/components/manager/ManagerPlacementsCard";
import { ManagerRevenueLeaderboard } from "@/components/manager/ManagerRevenueLeaderboard";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { unitFunnelTotals, dealRecords, unitCallTotals } from "@/data/managerOperationalData";
import { consultantSkillData, managerGoalsData, managerRevenueChartData } from "@/data/managerPerformanceData";
import { unitFunnelTotals as funnelTotals } from "@/data/managerOperationalData";
import { InsightsPanel } from "@/components/manager/InsightsPanel";

const UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"];

// ── Section config ──

interface SectionConfig {
  id: string;
  label: string;
  summaryBadges: () => ReactNode;
  content: () => ReactNode;
}

const STORAGE_KEY_ORDER = "mgr-dash-section-order";
const STORAGE_KEY_COLLAPSED = "mgr-dash-collapsed";

function loadOrder(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 3) return parsed;
    }
  } catch {}
  return ["operationeel", "performance", "omzet"];
}

function loadCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COLLAPSED);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export default function ManagerDashboard() {
  const [sectionOrder, setSectionOrder] = useState<string[]>(loadOrder);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(loadCollapsed);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(collapsed));
  }, [collapsed]);

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Drag helpers (popover reorder) ──
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
  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  // ── Summary data ──
  const avgSkillScore = +(
    consultantSkillData.reduce(
      (s, c) => s + (c.pitchingPower + c.responsiveness + c.networking) / 3,
      0
    ) / consultantSkillData.length
  ).toFixed(0);
  const activeGoals = managerGoalsData.filter((g) => !g.completed).length;
  const lastRevenue = managerRevenueChartData[managerRevenueChartData.length - 1];

  const sections: SectionConfig[] = [
    {
      id: "operationeel",
      label: "Operationeel",
      summaryBadges: () => (
        <>
          <Badge variant="secondary" className="text-[11px] font-normal">{funnelTotals.plaatsingen} plaatsingen</Badge>
          <Badge variant="secondary" className="text-[11px] font-normal">{dealRecords.length} deals</Badge>
          <Badge variant="secondary" className="text-[11px] font-normal">{unitCallTotals.inbound + unitCallTotals.outbound} calls</Badge>
        </>
      ),
      content: () => (
        <>
          <ManagerSalesFunnel delay={100} selectedUnit={selectedUnit} />
          <div className="mt-5">
            <OpvolgingCard delay={150} selectedUnit={selectedUnit} />
          </div>
          <div className="mt-5">
            <ManagerCallsCard delay={200} selectedUnit={selectedUnit} />
          </div>
        </>
      ),
    },
    {
      id: "performance",
      label: "Performance",
      summaryBadges: () => (
        <>
          <Badge variant="secondary" className="text-[11px] font-normal">Gem. score: {avgSkillScore}%</Badge>
          <Badge variant="secondary" className="text-[11px] font-normal">{activeGoals} doelen actief</Badge>
        </>
      ),
      content: () => (
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <ProcesKernvaardighedenCard delay={250} selectedUnit={selectedUnit} />
          </div>
          <div className="col-span-1">
            <ManagerGoalsCard delay={300} selectedUnit={selectedUnit} />
          </div>
        </div>
      ),
    },
    {
      id: "omzet",
      label: "Omzet",
      summaryBadges: () => (
        <>
          <Badge variant="secondary" className="text-[11px] font-normal">€{lastRevenue.realised}k gerealiseerd</Badge>
          <Badge variant="secondary" className="text-[11px] font-normal">{funnelTotals.plaatsingen} plaatsingen</Badge>
        </>
      ),
      content: () => (
        <>
          <div className="mb-5">
            <ManagerRevenueChart delay={350} selectedUnit={selectedUnit} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1">
              <ManagerPlacementsCard delay={400} selectedUnit={selectedUnit} />
            </div>
            <div className="col-span-2">
              <ManagerRevenueLeaderboard delay={450} selectedUnit={selectedUnit} />
            </div>
          </div>
        </>
      ),
    },
  ];

  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s]));

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap min-w-0 max-w-full">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overzicht van team en bedrijfsprestaties
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end min-w-0 max-w-full">
          {/* Unit selector */}
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Alle units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle units</SelectItem>
              {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Reorder popover */}
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

      {/* Sections */}
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

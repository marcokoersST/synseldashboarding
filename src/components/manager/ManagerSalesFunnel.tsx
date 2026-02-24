import React, { useState, useMemo, useEffect } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff, Phone, Mail, Clock, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { columnGroups, rateColor, getCellValue, getTotalValue, type SubCol, type ColumnGroup } from "@/components/tv/UnitFunnelBreakdown";
import { weekUnitBreakdown, consultantFunnelData, type UnitFunnelRow, type ConsultantFunnelRow } from "@/data/tvData";
import { unitFunnelTotals, consultantCallData, consultantFunnelData as mgrConsultantFunnel } from "@/data/managerOperationalData";
import { Badge } from "@/components/ui/badge";

function useDetailToggle() {
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(false);
  const toggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newMode = !isDetailMode;
      setIsDetailMode(newMode);
      setDisplayMode(newMode);
      setTimeout(() => setIsTransitioning(false), 120);
    }, 300);
  };
  return { isDetailMode, isTransitioning, displayMode, toggle };
}

// ─── Funnel Visualization (trapezoid) ───

const funnelSteps = [
  { key: "toegewezen", label: "Toegewezen" },
  { key: "inschrijvingen", label: "Inschrijvingen" },
  { key: "acquisities", label: "Acquisities" },
  { key: "uitnodiging", label: "Uitnodiging" },
  { key: "gesprekken", label: "Gesprekken" },
  { key: "plaatsingen", label: "Plaatsingen" },
];

const funnelColors = [
  "hsl(175, 50%, 75%)", "hsl(175, 50%, 67%)", "hsl(175, 55%, 59%)",
  "hsl(175, 55%, 51%)", "hsl(175, 60%, 43%)", "hsl(175, 65%, 27%)",
];

function FunnelVisualization({ delay, compact = false, selectedUnit }: { delay: number; compact?: boolean; selectedUnit?: string }) {
  const totals = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return unitFunnelTotals;
    const filtered = mgrConsultantFunnel.filter(c => c.unit === selectedUnit);
    if (filtered.length === 0) return unitFunnelTotals;
    const keys = Object.keys(unitFunnelTotals) as (keyof typeof unitFunnelTotals)[];
    const result = {} as Record<keyof typeof unitFunnelTotals, number>;
    keys.forEach(key => {
      result[key] = filtered.reduce((s, c) => s + ((c as any)[key] as number || 0), 0);
    });
    return result;
  }, [selectedUnit]);

  const data = funnelSteps.map(s => ({
    ...s,
    value: totals[s.key as keyof typeof totals] || 0,
  }));
  const max = Math.max(data[0].value, 1);

  return (
    <div className={cn("flex flex-col items-center", compact ? "gap-0" : "gap-0")}>
      {data.map((step, i) => {
        const widthPct = Math.max(((step.value / max) * 100), 12);
        const convPct = i > 0 && data[i - 1].value > 0 ? Math.round((step.value / data[i - 1].value) * 100) : null;
        return (
          <div key={step.key} className="w-full flex flex-col items-center">
            {convPct !== null && (
              <div className={cn("flex items-center justify-center text-muted-foreground", compact ? "h-3" : "h-5")}>
                <span className={cn("font-medium", compact ? "text-[9px]" : "text-[10px]")}>{convPct}% ↓</span>
              </div>
            )}
            <div
              className={cn(
                "relative flex items-center justify-center rounded-md transition-all duration-700 ease-out",
                compact ? "h-7" : "h-9"
              )}
              style={{
                width: `${widthPct}%`,
                backgroundColor: funnelColors[i],
                clipPath: i < data.length - 1
                  ? `polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)`
                  : undefined,
              }}
            >
              <div className={cn("flex items-center gap-2 text-white", compact ? "text-[10px]" : "text-xs")}>
                <span className="font-medium opacity-90">{step.label}</span>
                <span className="font-bold">
                  <AnimatedNumber value={step.value} delay={delay + i * 60} />
                </span>
              </div>
            </div>
          </div>
        );
      })}
      {!compact && totals.toegewezen > 0 && (
        <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 mt-3">
          <span className="text-xs font-medium text-foreground">
            Totaal: {totals.toegewezen} → {totals.plaatsingen}
          </span>
          <span className="text-sm font-bold text-primary">
            {((totals.plaatsingen / totals.toegewezen) * 100).toFixed(1)}% conversie
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Sortable value helper ───

function getSortableValue(row: UnitFunnelRow | ConsultantFunnelRow, sub: SubCol): number {
  if (sub.type === "value") return row[sub.key] as number;
  const from = row[sub.from] as number;
  const to = row[sub.to] as number;
  if (to === 0) return 0;
  return (from / to) * 100;
}

function getConsultantCellValue(row: ConsultantFunnelRow, sub: SubCol): string {
  if (sub.type === "value") {
    const v = row[sub.key as keyof ConsultantFunnelRow] as number;
    return sub.decimals !== undefined ? v.toFixed(sub.decimals) : String(v);
  }
  const from = row[sub.from as keyof ConsultantFunnelRow] as number;
  const to = row[sub.to as keyof ConsultantFunnelRow] as number;
  if (to === 0) return "0%";
  return `${((from / to) * 100).toFixed(0)}%`;
}

// ─── Detail Table ───

type SortDirection = "asc" | "desc" | null;
interface SortConfig {
  groupIdx: number;
  subIdx: number;
  direction: SortDirection;
}

function formatTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}:00`;
}

function FunnelDetailTable({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [showConversion, setShowConversion] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "periode">("week");
  const [selectedNumber, setSelectedNumber] = useState("7");

  // All consultant names for the dropdown
  const allConsultantNames = useMemo(() => {
    const names: string[] = [];
    Object.values(consultantFunnelData).forEach(list => list.forEach(c => names.push(c.name)));
    return names.sort();
  }, []);

  // Auto-expand unit when consultant is selected from dropdown
  useEffect(() => {
    if (consultantFilter !== "all") {
      const unitName = Object.entries(consultantFunnelData).find(([_, list]) =>
        list.some(c => c.name === consultantFilter)
      )?.[0];
      if (unitName && !expandedUnits.includes(unitName)) {
        setExpandedUnits(prev => [...prev, unitName]);
      }
    }
  }, [consultantFilter]);

  const filteredData = useMemo(() => {
    let data = selectedUnit && selectedUnit !== "all"
      ? weekUnitBreakdown.filter(r => r.unit === selectedUnit)
      : weekUnitBreakdown;

    if (consultantFilter !== "all") {
      // Find which unit the consultant belongs to and only show that unit
      const unitName = Object.entries(consultantFunnelData).find(([_, list]) =>
        list.some(c => c.name === consultantFilter)
      )?.[0];
      if (unitName) {
        data = data.filter(r => r.unit === unitName);
      }
    }

    if (sortConfig?.direction) {
      const sub = columnGroups[sortConfig.groupIdx].subs[sortConfig.subIdx];
      data = [...data].sort((a, b) => {
        const va = getSortableValue(a, sub);
        const vb = getSortableValue(b, sub);
        return sortConfig.direction === "asc" ? va - vb : vb - va;
      });
    }
    return data;
  }, [selectedUnit, consultantFilter, sortConfig]);

  const visibleGroups = useMemo(() => {
    if (showConversion) return columnGroups;
    return columnGroups.map(g => ({
      ...g,
      subs: g.subs.filter(s => s.type !== "conv"),
    }));
  }, [showConversion]);

  const toggleExpand = (unit: string) => {
    setExpandedUnits(prev => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]);
  };

  const handleSort = (groupIdx: number, subIdx: number) => {
    setSortConfig(prev => {
      if (prev?.groupIdx === groupIdx && prev?.subIdx === subIdx) {
        if (prev.direction === "desc") return { groupIdx, subIdx, direction: "asc" };
        if (prev.direction === "asc") return null;
      }
      return { groupIdx, subIdx, direction: "desc" };
    });
  };

  const getSortIcon = (groupIdx: number, subIdx: number) => {
    if (sortConfig?.groupIdx === groupIdx && sortConfig?.subIdx === subIdx) {
      if (sortConfig.direction === "desc") return <ArrowDown className="w-3 h-3 inline ml-0.5" />;
      if (sortConfig.direction === "asc") return <ArrowUp className="w-3 h-3 inline ml-0.5" />;
    }
    return <ArrowUpDown className="w-3 h-3 inline ml-0.5 opacity-30" />;
  };

  const numbers = viewMode === "week"
    ? Array.from({ length: 53 }, (_, i) => String(i + 1))
    : Array.from({ length: 13 }, (_, i) => String(i + 1));

  const selectedConsultantCallData = selectedConsultant
    ? consultantCallData.find(c => c.consultantName === selectedConsultant)
    : null;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Connected time filter: Week/Periode + number */}
        <div className="flex rounded-lg border border-border overflow-hidden h-7">
          <button
            onClick={() => { setViewMode("week"); setSelectedNumber("7"); }}
            className={cn("px-2.5 py-1 text-[11px] font-medium transition-colors", viewMode === "week" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
          >Week</button>
          <button
            onClick={() => { setViewMode("periode"); setSelectedNumber("1"); }}
            className={cn("px-2.5 py-1 text-[11px] font-medium transition-colors", viewMode === "periode" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
          >Periode</button>
          <div className="w-px bg-border" />
          <select
            value={selectedNumber}
            onChange={e => setSelectedNumber(e.target.value)}
            className="bg-card text-xs px-2 outline-none cursor-pointer text-foreground min-w-[52px]"
          >
            {numbers.map(n => (
              <option key={n} value={n}>{viewMode === "week" ? `W${n}` : `P${n}`}</option>
            ))}
          </select>
        </div>

        {/* Consultant selector */}
        <Select value={consultantFilter} onValueChange={setConsultantFilter}>
          <SelectTrigger className="w-[180px] h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle consultants</SelectItem>
            {allConsultantNames.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showConversion ? "secondary" : "outline"}
          size="sm"
          className="h-7 text-[11px] gap-1"
          onClick={() => setShowConversion(!showConversion)}
        >
          {showConversion ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Conversie %
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2} className="w-[160px] align-bottom text-xs sticky left-0 bg-card z-20">Unit / Consultant</TableHead>
                {visibleGroups.map((g) => (
                  <TableHead key={g.group} colSpan={g.subs.length} className="text-center border-l border-border/50 text-muted-foreground text-[10px]">
                    {g.group}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {visibleGroups.flatMap((g, gi) =>
                  g.subs.map((sub, si) => (
                    <TableHead
                      key={`${gi}-${si}`}
                      className={cn(
                        "text-center whitespace-nowrap cursor-pointer hover:bg-muted/50 select-none",
                        si === 0 && "border-l border-border/50",
                        sub.type === "conv" ? "text-muted-foreground bg-muted/30" : "",
                        "text-[10px] px-1.5"
                      )}
                      onClick={() => handleSort(gi, si)}
                    >
                      {sub.label}{getSortIcon(gi, si)}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => {
                const isExpanded = expandedUnits.includes(row.unit);
                const consultants = consultantFunnelData[row.unit] || [];
                const sortedConsultants = sortConfig?.direction && consultants.length > 0
                  ? [...consultants].sort((a, b) => {
                      const sub = visibleGroups[sortConfig.groupIdx]?.subs[sortConfig.subIdx];
                      if (!sub) return 0;
                      const va = getSortableValue(a as unknown as UnitFunnelRow, sub);
                      const vb = getSortableValue(b as unknown as UnitFunnelRow, sub);
                      return sortConfig.direction === "asc" ? va - vb : vb - va;
                    })
                  : consultants;

                return (
                  <React.Fragment key={row.unit}>
                    <TableRow className="cursor-pointer hover:bg-muted/30" onClick={() => toggleExpand(row.unit)}>
                      <TableCell className="font-medium text-xs sticky left-0 bg-card z-10">
                        <span className="flex items-center gap-2">
                          {consultants.length > 0 && (
                            isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                          {row.unit}
                        </span>
                      </TableCell>
                      {visibleGroups.flatMap((g, gi) =>
                        g.subs.map((sub, si) => {
                          const isConv = sub.type === "conv";
                          const val = getCellValue(row, sub);
                          const convRate = isConv ? parseFloat(val) : null;
                          return (
                            <TableCell key={`${gi}-${si}`} className={cn(
                              "text-center tabular-nums text-xs",
                              si === 0 && "border-l border-border/50",
                              isConv ? cn("bg-muted/30 font-bold", convRate !== null && rateColor(convRate)) : "font-semibold",
                              "px-1.5"
                            )}>
                              {val}
                            </TableCell>
                          );
                        })
                      )}
                    </TableRow>
                    {isExpanded && sortedConsultants.map((c) => {
                      const isHighlighted = consultantFilter !== "all" && c.name === consultantFilter;
                      const isFaded = consultantFilter !== "all" && c.name !== consultantFilter;
                      return (
                        <TableRow
                          key={c.name}
                          className={cn(
                            "bg-muted/10 cursor-pointer hover:bg-muted/20 transition-opacity",
                            selectedConsultant === c.name && "bg-primary/5 border-l-2 border-l-primary",
                            isHighlighted && "bg-primary/10 ring-1 ring-primary/20",
                            isFaded && "opacity-30"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConsultant(selectedConsultant === c.name ? null : c.name);
                          }}
                        >
                          <TableCell className="pl-10 text-xs text-muted-foreground sticky left-0 bg-card z-10">{c.name}</TableCell>
                          {visibleGroups.flatMap((g, gi) =>
                            g.subs.map((sub, si) => {
                              const isConv = sub.type === "conv";
                              const val = getConsultantCellValue(c, sub);
                              const convRate = isConv ? parseFloat(val) : null;
                              return (
                                <TableCell key={`${gi}-${si}`} className={cn(
                                  "text-center tabular-nums text-xs",
                                  si === 0 && "border-l border-border/50",
                                  isConv ? cn("bg-muted/20 font-semibold", convRate !== null && rateColor(convRate)) : "",
                                )}>
                                  {val}
                                </TableCell>
                              );
                            })
                          )}
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              {/* Totals */}
              <TableRow className="border-t-2 border-border">
                <TableCell className="font-bold text-xs sticky left-0 bg-card z-10">Totaal</TableCell>
                {visibleGroups.flatMap((g, gi) =>
                  g.subs.map((sub, si) => {
                    const isConv = sub.type === "conv";
                    const val = getTotalValue(sub);
                    const convRate = isConv ? parseFloat(val) : null;
                    return (
                      <TableCell key={`${gi}-${si}`} className={cn(
                        "text-center tabular-nums font-bold text-xs",
                        si === 0 && "border-l border-border/50",
                        isConv ? cn("bg-muted/30", convRate !== null && rateColor(convRate)) : "",
                        "px-1.5"
                      )}>
                        {val}
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Consultant drill-down panel */}
      {selectedConsultant && selectedConsultantCallData && (
        <div className="border border-border rounded-lg p-4 bg-secondary/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">{selectedConsultant} — Operationeel</h4>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setSelectedConsultant(null)}>Sluiten</Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border/50">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedConsultantCallData.inbound + selectedConsultantCallData.outbound}</p>
                <p className="text-[10px] text-muted-foreground">Gesprekken</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border/50">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedConsultantCallData.outbound}</p>
                <p className="text-[10px] text-muted-foreground">Uitgaand</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border/50">
              <Clock className="h-4 w-4 text-teal" />
              <div>
                <p className="text-sm font-semibold text-foreground">{formatTime(selectedConsultantCallData.totalMinutes)}</p>
                <p className="text-[10px] text-muted-foreground">Beltijd</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border/50">
              <Zap className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedConsultantCallData.qualityScore.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">Kwaliteit</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───

interface ManagerSalesFunnelProps {
  delay?: number;
  selectedUnit?: string;
}

export function ManagerSalesFunnel({ delay = 0, selectedUnit }: ManagerSalesFunnelProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Sales Funnel</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Conversies per unit & consultant" : "Unit-niveau overzicht"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80">
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className={cn(
          "flex-1 transition-all duration-400 ease-in-out min-w-0",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? (
            <>
              <FunnelVisualization delay={delay} compact selectedUnit={selectedUnit} />
              <Separator className="my-4" />
              <FunnelDetailTable delay={delay} selectedUnit={selectedUnit} />
            </>
          ) : (
            <FunnelVisualization delay={delay} selectedUnit={selectedUnit} />
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

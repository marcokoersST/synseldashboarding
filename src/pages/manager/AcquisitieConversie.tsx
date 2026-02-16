import React, { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { weekUnitBreakdown, consultantFunnelData, UnitFunnelRow, ConsultantFunnelRow } from "@/data/tvData";
import { columnGroups, rateColor, getCellValue, getTotalValue, SubCol, ColumnGroup } from "@/components/tv/UnitFunnelBreakdown";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortDirection = "asc" | "desc" | null;
interface SortConfig {
  groupIdx: number;
  subIdx: number;
  direction: SortDirection;
}

function getSortableValue(row: UnitFunnelRow | ConsultantFunnelRow, sub: SubCol): number {
  if (sub.type === "value") {
    return row[sub.key] as number;
  }
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

export default function AcquisitieConversie() {
  const [selectedYear] = useState("2026");
  const [viewMode, setViewMode] = useState<"week" | "periode">("week");
  const [selectedNumber, setSelectedNumber] = useState("7");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const units = weekUnitBreakdown.map(u => u.unit);

  const filteredData = useMemo(() => {
    let data = selectedUnit === "all" ? weekUnitBreakdown : weekUnitBreakdown.filter(r => r.unit === selectedUnit);
    if (sortConfig?.direction) {
      const sub = columnGroups[sortConfig.groupIdx].subs[sortConfig.subIdx];
      data = [...data].sort((a, b) => {
        const va = getSortableValue(a, sub);
        const vb = getSortableValue(b, sub);
        return sortConfig.direction === "asc" ? va - vb : vb - va;
      });
    }
    return data;
  }, [selectedUnit, sortConfig]);

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

  return (
    <ConsultantLayout title="Acquisitie Conversie" subtitle={`${viewMode === "week" ? "Week" : "Periode"} ${selectedNumber} - ${selectedYear}`}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={selectedYear} disabled>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="2026">2026</SelectItem></SelectContent>
        </Select>

        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => { setViewMode("week"); setSelectedNumber("7"); }}
            className={cn("px-3 py-2 text-sm font-medium transition-colors", viewMode === "week" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
          >Week</button>
          <button
            onClick={() => { setViewMode("periode"); setSelectedNumber("1"); }}
            className={cn("px-3 py-2 text-sm font-medium transition-colors", viewMode === "periode" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
          >Periode</button>
        </div>

        <Select value={selectedNumber} onValueChange={setSelectedNumber}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {numbers.map(n => (
              <SelectItem key={n} value={n}>{viewMode === "week" ? `W${n}` : `P${n}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle units</SelectItem>
            {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border p-5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="w-[180px] align-bottom">Unit / Consultant</TableHead>
              {columnGroups.map((g) => (
                <TableHead key={g.group} colSpan={g.subs.length} className="text-center border-l border-border/50 text-muted-foreground text-xs">
                  {g.group}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              {columnGroups.flatMap((g, gi) =>
                g.subs.map((sub, si) => (
                  <TableHead
                    key={`${gi}-${si}`}
                    className={cn(
                      "text-center whitespace-nowrap cursor-pointer hover:bg-muted/50 select-none",
                      si === 0 && "border-l border-border/50",
                      sub.type === "conv" ? "text-muted-foreground bg-muted/30" : "",
                      "text-[11px] px-2"
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
                    const sub = columnGroups[sortConfig.groupIdx].subs[sortConfig.subIdx];
                    const va = getSortableValue(a as unknown as UnitFunnelRow, sub);
                    const vb = getSortableValue(b as unknown as UnitFunnelRow, sub);
                    return sortConfig.direction === "asc" ? va - vb : vb - va;
                  })
                : consultants;

              return (
                <React.Fragment key={row.unit}>
                  <TableRow className="cursor-pointer hover:bg-muted/30" onClick={() => toggleExpand(row.unit)}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {consultants.length > 0 && (
                          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                        {row.unit}
                      </span>
                    </TableCell>
                    {columnGroups.flatMap((g, gi) =>
                      g.subs.map((sub, si) => {
                        const isConv = sub.type === "conv";
                        const val = getCellValue(row, sub);
                        const convRate = isConv ? parseFloat(val) : null;
                        return (
                          <TableCell
                            key={`${gi}-${si}`}
                            className={cn(
                              "text-center tabular-nums",
                              si === 0 && "border-l border-border/50",
                              isConv ? cn("bg-muted/30 font-bold", convRate !== null && rateColor(convRate)) : "font-semibold",
                              "text-xs px-2"
                            )}
                          >
                            {val}
                          </TableCell>
                        );
                      })
                    )}
                  </TableRow>
                  {/* Expanded consultant rows */}
                  {isExpanded && sortedConsultants.map((c) => (
                    <TableRow key={c.name} className="bg-muted/10">
                      <TableCell className="pl-12 text-xs text-muted-foreground">{c.name}</TableCell>
                      {columnGroups.flatMap((g, gi) =>
                        g.subs.map((sub, si) => {
                          const isConv = sub.type === "conv";
                          const val = getConsultantCellValue(c, sub);
                          const convRate = isConv ? parseFloat(val) : null;
                          return (
                            <TableCell
                              key={`${gi}-${si}`}
                              className={cn(
                                "text-center tabular-nums text-xs",
                                si === 0 && "border-l border-border/50",
                                isConv ? cn("bg-muted/20 font-semibold", convRate !== null && rateColor(convRate)) : "",
                              )}
                            >
                              {val}
                            </TableCell>
                          );
                        })
                      )}
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
            {/* Totals */}
            <TableRow className="border-t-2 border-border">
              <TableCell className="font-bold">Totaal</TableCell>
              {columnGroups.flatMap((g, gi) =>
                g.subs.map((sub, si) => {
                  const isConv = sub.type === "conv";
                  const val = getTotalValue(sub);
                  const convRate = isConv ? parseFloat(val) : null;
                  return (
                    <TableCell
                      key={`${gi}-${si}`}
                      className={cn(
                        "text-center tabular-nums font-bold",
                        si === 0 && "border-l border-border/50",
                        isConv ? cn("bg-muted/30", convRate !== null && rateColor(convRate)) : "",
                        "text-xs px-2"
                      )}
                    >
                      {val}
                    </TableCell>
                  );
                })
              )}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </ConsultantLayout>
  );
}

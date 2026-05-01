import React, { useState, useEffect, useMemo } from "react";
import { weekUnitBreakdown, weekConsultantFunnelData, periodConsultantFunnelData, periodUnitBreakdown, UnitFunnelRow, ConsultantFunnelRow } from "@/data/tvData";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { useTVCompact } from "./TVDashboardLayout";
import { ConversionLegendPopover, getConversionIcon } from "./ConversionLegend";
import { TileHeader } from "./TileHeader";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, BarChart3 } from "lucide-react";
import { useSalesFunnelFilters } from "@/contexts/SalesFunnelFiltersContext";
import { DevNote } from "@/components/groeimodel/DevNote";

const groupToneClasses: Record<string, string> = {
  "1. Inschrijvingen": "bg-primary/10 text-primary",
  "2. Acquisitie": "bg-[hsl(var(--chart-primary)/0.12)] text-[hsl(var(--chart-primary))]",
  "3. Voorstellen": "bg-accent/10 text-accent",
  "4. Uitnodigingen": "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]",
  "5. Gesprekken": "bg-primary/10 text-primary",
  "6. Vervolg": "bg-[hsl(var(--chart-primary)/0.12)] text-[hsl(var(--chart-primary))]",
  "7. Geplaatst": "bg-accent/10 text-accent",
};

type SubCol =
  | { type: "value"; key: keyof UnitFunnelRow; label: string; decimals?: number }
  | { type: "conv"; from: keyof UnitFunnelRow; to: keyof UnitFunnelRow; label: string };

interface ColumnGroup {
  group: string;
  subs: SubCol[];
}

const columnGroups: ColumnGroup[] = [
  {
    group: "1. Inschrijvingen",
    subs: [
      { type: "value", key: "toegewezen", label: "Toegewezen" },
      { type: "value", key: "ingeschreven", label: "Ingeschreven" },
      { type: "conv", from: "ingeschreven", to: "toegewezen", label: "Inschr. %" },
      { type: "value", key: "intakes", label: "Intakes" },
      { type: "conv", from: "intakes", to: "ingeschreven", label: "Intake %" },
    ],
  },
  {
    group: "2. Acquisitie",
    subs: [
      { type: "value", key: "acquisities", label: "Acquisitie" },
      { type: "conv", from: "acquisities", to: "ingeschreven", label: "Acq. %" },
      { type: "conv", from: "acquisities", to: "toegewezen", label: "Acq. ratio" },
    ],
  },
  {
    group: "3. Voorstellen",
    subs: [
      { type: "value", key: "voorstellenPerKandidaat", label: "Per kandidaat", decimals: 1 },
      { type: "value", key: "voorstellenViaEmail", label: "Via email" },
      { type: "conv", from: "voorstellenViaEmail", to: "ingeschreven", label: "Voorst. %" },
    ],
  },
  {
    group: "4. Uitnodigingen",
    subs: [
      { type: "value", key: "uitnodigingenTotaal", label: "Totaal" },
      { type: "value", key: "nietUitgenodigd", label: "Niet uitgen." },
      { type: "value", key: "welUitgenodigd", label: "Wel uitgen." },
      { type: "conv", from: "uitnodigingenTotaal", to: "acquisities", label: "Uitn. %" },
    ],
  },
  {
    group: "5. Gesprekken",
    subs: [
      { type: "value", key: "eersteGesprek", label: "1e gesprek" },
      { type: "value", key: "geenEersteGesprek", label: "Geen 1e" },
      { type: "value", key: "welEersteGesprek", label: "Wel 1e" },
      { type: "conv", from: "eersteGesprek", to: "acquisities", label: "Gespr. %" },
    ],
  },
  {
    group: "6. Vervolg",
    subs: [
      { type: "value", key: "vervolgGesprek", label: "Vervolg/meeloop" },
      { type: "value", key: "dealsluiter", label: "Dealsluiter" },
      // Fix: formula = welEersteGesprek (numerator) / vervolgGesprek (denom) per docs
      { type: "conv", from: "welEersteGesprek", to: "vervolgGesprek", label: "Verv. %" },
    ],
  },
  {
    group: "7. Geplaatst",
    subs: [
      { type: "value", key: "geplaatst", label: "Geplaatst" },
      { type: "value", key: "gemDagenTotPlaatsing", label: "Gem. dagen" },
      { type: "conv", from: "geplaatst", to: "ingeschreven", label: "Plts. %" },
      { type: "conv", from: "geplaatst", to: "toegewezen", label: "Hit rate" },
    ],
  },
];

function rateColor(rate: number) {
  if (rate >= 70) return "text-accent";
  if (rate >= 40) return "text-foreground";
  return "text-destructive";
}

function getCellValue(row: UnitFunnelRow | ConsultantFunnelRow, sub: SubCol): string {
  if (sub.type === "value") {
    const v = row[sub.key as keyof typeof row] as number;
    return sub.decimals !== undefined ? v.toFixed(sub.decimals) : String(v);
  }
  const from = row[sub.from as keyof typeof row] as number;
  const to = row[sub.to as keyof typeof row] as number;
  if (to === 0) return "0%";
  return `${((from / to) * 100).toFixed(0)}%`;
}

function getTotalValue(sub: SubCol, data: UnitFunnelRow[] = weekUnitBreakdown): string {
  if (sub.type === "conv") {
    const from = data.reduce((s, r) => s + (r[sub.from] as number), 0);
    const to = data.reduce((s, r) => s + (r[sub.to] as number), 0);
    if (to === 0) return "0%";
    return `${((from / to) * 100).toFixed(0)}%`;
  }
  const total = data.reduce((s, r) => s + (r[sub.key] as number), 0);
  if (sub.decimals !== undefined) return (total / data.length).toFixed(sub.decimals);
  return String(total);
}

export { columnGroups, rateColor, getCellValue, getTotalValue };
export type { SubCol, ColumnGroup };

interface UnitFunnelBreakdownProps {
  data?: UnitFunnelRow[];
  consultantData?: Record<string, ConsultantFunnelRow[]>;
}

export function UnitFunnelBreakdown({ data, consultantData }: UnitFunnelBreakdownProps = {}) {
  const compact = useTVCompact();
  const filters = useSalesFunnelFilters();
  const allRows = data ?? weekUnitBreakdown;
  const consultantsByUnit = consultantData ?? (data === periodUnitBreakdown ? periodConsultantFunnelData : weekConsultantFunnelData);

  // Apply unit filter
  const rows = useMemo(() => allRows.filter(r => filters.isUnitVisible(r.unit)), [allRows, filters.selectedUnits]);

  // Visible column groups
  const visibleGroups = columnGroups.filter(g => filters.visibleColumnGroups.includes(g.group));

  // Expand state per unit
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // TV mode: always show all units fully expanded — no rotation, no scroll.
  useEffect(() => {
    if (!compact) return;
    const allExpanded: Record<string, boolean> = {};
    rows.forEach(r => allExpanded[r.unit] = true);
    setExpanded(allExpanded);
  }, [compact, rows.map(r => r.unit).join(",")]);

  const toggle = (unit: string) => setExpanded(e => ({ ...e, [unit]: !e[unit] }));

  return (
    <div className={cn("bg-card rounded-xl border border-border animate-fade-in h-full flex flex-col", compact ? "p-3 overflow-hidden" : "p-5 overflow-x-auto")}>
      <TileHeader
        icons={[{ icon: BarChart3, className: "text-primary" }]}
        title="Uitsplitsing per Unit & Conversies"
        right={!compact ? <ConversionLegendPopover /> : undefined}
        compact={compact}
      />

      <Table className={compact ? "h-full" : ""}>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className={cn("align-bottom", compact ? "w-[200px] text-sm" : "w-[180px]")}>Unit / Consultant</TableHead>
            {visibleGroups.map((g) => (
              <TableHead
                key={g.group}
                colSpan={g.subs.length}
                className={cn("text-center border-l border-border/50", compact ? "px-1.5 py-1.5" : "py-1.5")}
              >
                <span
                  className={cn(
                    "inline-block rounded-full font-semibold",
                    groupToneClasses[g.group] ?? "bg-muted/40 text-muted-foreground",
                    compact ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-[10px]"
                  )}
                >
                  {g.group}
                </span>
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            {visibleGroups.flatMap((g, gi) =>
              g.subs.map((sub, si) => {
                const IconComp = sub.type === "conv" || sub.label === "Gem. dagen" ? getConversionIcon(sub.label) : undefined;
                return (
                  <TableHead
                    key={`${gi}-${si}`}
                    className={cn(
                      "text-center whitespace-nowrap",
                      si === 0 && "border-l border-border/50",
                      sub.type === "conv" ? "text-muted-foreground bg-muted/30" : "",
                      compact ? "text-xs px-1.5 py-1.5 font-semibold" : "text-[10px] px-1.5"
                    )}
                  >
                    {IconComp ? (
                      compact ? (
                        <span className="inline-flex items-center justify-center gap-1" title={sub.label}>
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{sub.label}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center" title={sub.label}>
                          <IconComp className="w-3 h-3" />
                        </span>
                      )
                    ) : sub.label}
                  </TableHead>
                );
              })
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const consultants = (consultantsByUnit[row.unit] ?? []).filter(c => filters.isConsultantVisible(c.name));
            const isOpen = !!expanded[row.unit];
            return (
              <React.Fragment key={row.unit}>
                <TableRow className="cursor-pointer hover:bg-muted/30" onClick={() => toggle(row.unit)}>
                  <TableCell className={cn("font-medium", compact ? "py-2 text-base" : "")}>
                    <span className="flex items-center gap-2">
                      {consultants.length > 0 ? (
                        isOpen ? <ChevronDown className={cn("text-muted-foreground", compact ? "w-4 h-4" : "w-3.5 h-3.5")} /> : <ChevronRight className={cn("text-muted-foreground", compact ? "w-4 h-4" : "w-3.5 h-3.5")} />
                      ) : <span className={compact ? "w-4" : "w-3.5"} />}
                      <span className={cn("rounded-full shrink-0", compact ? "w-3.5 h-3.5" : "w-3 h-3")} style={{ background: row.color }} />
                      {row.unit}
                      {consultants.length > 0 && <span className={cn("text-muted-foreground", compact ? "text-sm" : "text-xs")}>({consultants.length})</span>}
                    </span>
                  </TableCell>
                  {visibleGroups.flatMap((g, gi) =>
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
                            compact ? "py-2 text-sm px-1.5" : "text-[11px] px-1.5"
                          )}
                        >
                          {val}
                        </TableCell>
                      );
                    })
                  )}
                </TableRow>
                {isOpen && consultants.map(c => (
                  <TableRow key={`${row.unit}-${c.name}`} className="bg-muted/10">
                    <TableCell className={cn("pl-10 text-foreground/80", compact ? "py-1.5 text-sm" : "text-xs")}>
                      {c.name}
                    </TableCell>
                    {visibleGroups.flatMap((g, gi) =>
                      g.subs.map((sub, si) => {
                        const isConv = sub.type === "conv";
                        const val = getCellValue(c, sub);
                        const convRate = isConv ? parseFloat(val) : null;
                        return (
                          <TableCell
                            key={`${gi}-${si}`}
                            className={cn(
                              "text-center tabular-nums",
                              si === 0 && "border-l border-border/50",
                              isConv ? cn("bg-muted/20", convRate !== null && rateColor(convRate)) : "",
                              compact ? "py-1.5 text-sm px-1.5" : "text-[10px] px-1.5"
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
          {/* Totals row */}
          <TableRow className="border-t-2 border-border bg-primary/5">
            <TableCell className={cn("font-bold text-primary", compact ? "py-2 text-base" : "")}>Totaal</TableCell>
            {visibleGroups.flatMap((g, gi) =>
              g.subs.map((sub, si) => {
                const isConv = sub.type === "conv";
                const val = getTotalValue(sub, rows);
                const convRate = isConv ? parseFloat(val) : null;
                return (
                  <TableCell
                    key={`${gi}-${si}`}
                    className={cn(
                      "text-center tabular-nums font-bold",
                      si === 0 && "border-l border-border/50",
                      isConv ? cn("bg-muted/30", convRate !== null && rateColor(convRate)) : "",
                      compact ? "py-2 text-sm px-1.5" : "text-[11px] px-1.5"
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

      {!compact && (
        <DevNote
          story={<><strong>As a user (manager/TV viewer)</strong>, I want to see a detailed breakdown of funnel metrics per unit and per consultant, <strong>so that</strong> I can compare performance across teams and drill down into individual contributions.</>}
          logic={"Table groups + per-unit / per-consultant breakdown. See ConversionLegend for icon meanings."}
        />
      )}
    </div>
  );
}

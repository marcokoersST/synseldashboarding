import React from "react";
import { weekUnitBreakdown, UnitFunnelRow } from "@/data/tvData";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { useTVCompact } from "./TVDashboardLayout";
import { cn } from "@/lib/utils";

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
      { type: "conv", from: "ingeschreven", to: "toegewezen", label: "#" },
    ],
  },
  {
    group: "2. Acquisitie",
    subs: [
      { type: "value", key: "acquisities", label: "Acquisitie" },
      { type: "conv", from: "acquisities", to: "ingeschreven", label: "#" },
    ],
  },
  {
    group: "3. Voorstellen",
    subs: [
      { type: "value", key: "voorstellenPerKandidaat", label: "Per kandidaat", decimals: 1 },
      { type: "value", key: "voorstellenViaEmail", label: "Via email" },
      { type: "conv", from: "voorstellenViaEmail", to: "ingeschreven", label: "#" },
    ],
  },
  {
    group: "4. Uitnodigingen",
    subs: [
      { type: "value", key: "uitnodigingenTotaal", label: "Totaal" },
      { type: "value", key: "nietUitgenodigd", label: "Niet uitgen." },
      { type: "value", key: "welUitgenodigd", label: "Wel uitgen." },
      { type: "conv", from: "uitnodigingenTotaal", to: "acquisities", label: "#" },
    ],
  },
  {
    group: "5. Gesprekken",
    subs: [
      { type: "value", key: "eersteGesprek", label: "1e gesprek" },
      { type: "value", key: "geenEersteGesprek", label: "Geen 1e" },
      { type: "value", key: "welEersteGesprek", label: "Wel 1e" },
      { type: "conv", from: "eersteGesprek", to: "acquisities", label: "#" },
    ],
  },
  {
    group: "6. Vervolg",
    subs: [
      { type: "value", key: "vervolgGesprek", label: "Vervolg/meeloop" },
      { type: "value", key: "dealsluiter", label: "Dealsluiter" },
      { type: "conv", from: "welEersteGesprek", to: "vervolgGesprek", label: "#" },
    ],
  },
  {
    group: "7. Geplaatst",
    subs: [
      { type: "value", key: "geplaatst", label: "Geplaatst" },
      { type: "conv", from: "geplaatst", to: "ingeschreven", label: "#" },
    ],
  },
];

function rateColor(rate: number) {
  if (rate >= 70) return "text-accent";
  if (rate >= 40) return "text-foreground";
  return "text-destructive";
}

function getCellValue(row: UnitFunnelRow, sub: SubCol): string {
  if (sub.type === "value") {
    const v = row[sub.key] as number;
    return sub.decimals !== undefined ? v.toFixed(sub.decimals) : String(v);
  }
  const from = row[sub.from] as number;
  const to = row[sub.to] as number;
  if (to === 0) return "0%";
  return `${((from / to) * 100).toFixed(0)}%`;
}

function getTotalValue(sub: SubCol): string {
  if (sub.type === "conv") {
    const from = weekUnitBreakdown.reduce((s, r) => s + (r[sub.from] as number), 0);
    const to = weekUnitBreakdown.reduce((s, r) => s + (r[sub.to] as number), 0);
    if (to === 0) return "0%";
    return `${((from / to) * 100).toFixed(0)}%`;
  }
  const total = weekUnitBreakdown.reduce((s, r) => s + (r[sub.key] as number), 0);
  if (sub.decimals !== undefined) return (total / weekUnitBreakdown.length).toFixed(sub.decimals);
  return String(total);
}

export { columnGroups, rateColor, getCellValue, getTotalValue };
export type { SubCol, ColumnGroup };

export function UnitFunnelBreakdown() {
  const compact = useTVCompact();

  return (
    <div className={cn("bg-card rounded-xl border border-border animate-fade-in overflow-x-auto", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-xs mb-2" : "text-sm mb-4")}>Uitsplitsing per Unit & Conversies</h3>

      <Table>
        <TableHeader>
          {/* Row 1: Group headers */}
          <TableRow>
            <TableHead rowSpan={2} className="w-[120px] align-bottom">Unit</TableHead>
            {columnGroups.map((g) => (
              <TableHead
                key={g.group}
                colSpan={g.subs.length}
                className={cn("text-center border-l border-border/50 text-muted-foreground", compact ? "text-[10px] px-1" : "text-xs")}
              >
                {g.group}
              </TableHead>
            ))}
          </TableRow>
          {/* Row 2: Sub-column labels */}
          <TableRow>
            {columnGroups.flatMap((g, gi) =>
              g.subs.map((sub, si) => (
                <TableHead
                  key={`${gi}-${si}`}
                  className={cn(
                    "text-center whitespace-nowrap",
                    si === 0 && "border-l border-border/50",
                    sub.type === "conv" ? "text-muted-foreground bg-muted/30" : "",
                    compact ? "text-[9px] px-1 py-1" : "text-[11px] px-2"
                  )}
                >
                  {sub.label}
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {weekUnitBreakdown.map((row) => (
            <TableRow key={row.unit}>
              <TableCell className={cn("font-medium", compact && "py-1 text-xs")}>
                <span className="flex items-center gap-2">
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
                        compact ? "py-1 text-[10px] px-1" : "text-xs px-2"
                      )}
                    >
                      {val}
                    </TableCell>
                  );
                })
              )}
            </TableRow>
          ))}
          {/* Totals row */}
          <TableRow className="border-t-2 border-border">
            <TableCell className={cn("font-bold", compact && "py-1 text-xs")}>Totaal</TableCell>
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
                      compact ? "py-1 text-[10px] px-1" : "text-xs px-2"
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
  );
}

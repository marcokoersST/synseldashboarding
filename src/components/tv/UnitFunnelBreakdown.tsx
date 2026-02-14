import React from "react";
import { weekUnitBreakdown, weekOverallConversions, weekUnitConversions } from "@/data/tvData";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import { useTVCompact } from "./TVDashboardLayout";
import { cn } from "@/lib/utils";

const metricKeys = ["inschrijvingen", "acquisities", "voorstellen", "gesprekken", "plaatsingen"] as const;
const metricLabels: Record<string, string> = {
  inschrijvingen: "Inschrijvingen",
  acquisities: "Acquisities",
  voorstellen: "Voorstellen",
  gesprekken: "Gesprekken",
  plaatsingen: "Plaatsingen",
};

// Conversion pairs between adjacent visible columns
const conversionPairs: { from: keyof typeof metricLabels; to: keyof typeof metricLabels }[] = [
  { from: "inschrijvingen", to: "acquisities" },
  { from: "acquisities", to: "voorstellen" },
  { from: "voorstellen", to: "gesprekken" },
  { from: "gesprekken", to: "plaatsingen" },
];

function rateColor(rate: number) {
  if (rate >= 70) return "text-accent";
  if (rate >= 40) return "text-foreground";
  return "text-destructive";
}

export function UnitFunnelBreakdown() {
  const compact = useTVCompact();

  const totals = metricKeys.reduce((acc, k) => {
    acc[k] = weekUnitBreakdown.reduce((s, r) => s + r[k], 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn("bg-card rounded-xl border border-border animate-fade-in", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-xs mb-2" : "text-sm mb-4")}>Uitsplitsing per Unit & Conversies</h3>

      {/* Unit breakdown table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Unit</TableHead>
            {metricKeys.map((k, i) => (
              <React.Fragment key={k}>
                <TableHead className="text-left">{metricLabels[k]}</TableHead>
                {i < metricKeys.length - 1 && (
                  <TableHead className="text-center text-muted-foreground px-1">%</TableHead>
                )}
              </React.Fragment>
            ))}
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
              {metricKeys.map((k, i) => {
                const convRate = i < conversionPairs.length
                  ? ((row[conversionPairs[i].to] / row[conversionPairs[i].from]) * 100)
                  : null;
                return (
                  <React.Fragment key={k}>
                    <TableCell className={cn("text-left tabular-nums font-semibold", compact && "py-1 text-xs")}>{row[k]}</TableCell>
                    {i < metricKeys.length - 1 && convRate !== null && (
                      <TableCell className={cn("text-center tabular-nums px-1", compact && "py-1 text-[10px]", rateColor(convRate))}>
                        {convRate.toFixed(0)}%
                      </TableCell>
                    )}
                  </React.Fragment>
                );
              })}
            </TableRow>
          ))}
          <TableRow className="border-t-2 border-border">
            <TableCell className={cn("font-bold", compact && "py-1 text-xs")}>Totaal</TableCell>
            {metricKeys.map((k, i) => {
              const convRate = i < conversionPairs.length
                ? ((totals[conversionPairs[i].to] / totals[conversionPairs[i].from]) * 100)
                : null;
              return (
                <React.Fragment key={k}>
                  <TableCell className={cn("text-left tabular-nums font-bold", compact && "py-1 text-xs")}>{totals[k]}</TableCell>
                  {i < metricKeys.length - 1 && convRate !== null && (
                    <TableCell className={cn("text-center tabular-nums font-bold px-1", compact && "py-1 text-[10px]", rateColor(convRate))}>
                      {convRate.toFixed(0)}%
                    </TableCell>
                  )}
                </React.Fragment>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>

      {/* Separator */}
      <div className={cn("border-t border-border", compact ? "my-2" : "my-4")} />

      {/* Conversiepercentages */}
      <h4 className={cn("font-semibold text-foreground", compact ? "text-xs mb-2" : "text-sm mb-3")}>Conversiepercentages</h4>

      {/* Overall */}
      <div className={cn("flex flex-wrap mb-3", compact ? "gap-1" : "gap-2")}>
        {weekOverallConversions.map((c) => (
          <div key={c.from + c.to} className={cn("flex items-center gap-1 bg-muted/50 rounded-lg", compact ? "px-2 py-1 text-[10px]" : "px-3 py-2 text-xs")}>
            <span className="text-muted-foreground">{c.from}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{c.to}</span>
            <span className={cn("font-bold ml-1", rateColor(c.rate))}>{c.rate.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {/* Per unit */}
      <div className="overflow-x-auto">
        <table className={cn("w-full", compact ? "text-[10px]" : "text-xs")}>
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1 pr-4 text-muted-foreground font-medium">Unit</th>
              {weekOverallConversions.map((c) => (
                <th key={c.from + c.to} className="text-right py-1 px-2 text-muted-foreground font-medium whitespace-nowrap">
                  {c.from.slice(0, 5)}→{c.to.slice(0, 5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekUnitConversions.map((uc) => (
              <tr key={uc.unit} className="border-b border-border/50">
                <td className="py-1 pr-4 font-medium">{uc.unit}</td>
                {uc.conversions.map((c) => (
                  <td key={c.from + c.to} className={cn("text-right py-1 px-2 tabular-nums font-semibold", rateColor(c.rate))}>
                    {c.rate.toFixed(1)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

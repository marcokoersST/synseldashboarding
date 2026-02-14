import { weekUnitBreakdown } from "@/data/tvData";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { useTVCompact } from "./TVDashboardLayout";
import { cn } from "@/lib/utils";

const metricKeys = ["inschrijvingen", "intakes", "acquisities", "voorstellen", "gesprekken", "plaatsingen"] as const;
const metricLabels: Record<string, string> = {
  inschrijvingen: "Inschrijvingen",
  intakes: "Intakes",
  acquisities: "Acquisities",
  voorstellen: "Voorstellen",
  gesprekken: "Gesprekken",
  plaatsingen: "Plaatsingen",
};

export function UnitFunnelBreakdown() {
  const compact = useTVCompact();

  const totals = metricKeys.reduce((acc, k) => {
    acc[k] = weekUnitBreakdown.reduce((s, r) => s + r[k], 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn("bg-card rounded-xl border border-border animate-fade-in", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-xs mb-2" : "text-sm mb-4")}>Uitsplitsing per Unit</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Unit</TableHead>
            {metricKeys.map((k) => (
              <TableHead key={k} className="text-right">{metricLabels[k]}</TableHead>
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
              {metricKeys.map((k) => (
                <TableCell key={k} className={cn("text-right tabular-nums font-semibold", compact && "py-1 text-xs")}>{row[k]}</TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow className="border-t-2 border-border">
            <TableCell className={cn("font-bold", compact && "py-1 text-xs")}>Totaal</TableCell>
            {metricKeys.map((k) => (
              <TableCell key={k} className={cn("text-right tabular-nums font-bold", compact && "py-1 text-xs")}>{totals[k]}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

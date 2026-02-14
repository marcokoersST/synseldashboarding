import { weekUnitBreakdown } from "@/data/tvData";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

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
  // Separate parent rows from sub-rows
  const parentRows = weekUnitBreakdown.filter((r) => !r.subUnit);
  const subRows = weekUnitBreakdown.filter((r) => !!r.subUnit);

  // Totals
  const totals = metricKeys.reduce((acc, k) => {
    acc[k] = parentRows.reduce((s, r) => s + r[k], 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-card rounded-xl p-5 border border-border animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">Uitsplitsing per Unit</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Unit</TableHead>
            {metricKeys.map((k) => (
              <TableHead key={k} className="text-right">{metricLabels[k]}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {parentRows.map((row) => {
            const children = subRows.filter((s) => s.unit === row.unit);
            return (
              <>
                <TableRow key={row.unit}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                      {row.unit}
                    </span>
                  </TableCell>
                  {metricKeys.map((k) => (
                    <TableCell key={k} className="text-right tabular-nums font-semibold">{row[k]}</TableCell>
                  ))}
                </TableRow>
                {children.map((child) => (
                  <TableRow key={`${child.unit}-${child.subUnit}`} className="bg-muted/30">
                    <TableCell className="pl-10 text-muted-foreground text-xs font-medium">
                      w.v. {child.subUnit}
                    </TableCell>
                    {metricKeys.map((k) => (
                      <TableCell key={k} className="text-right tabular-nums text-xs text-muted-foreground">{child[k]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            );
          })}
          <TableRow className="border-t-2 border-border">
            <TableCell className="font-bold">Totaal</TableCell>
            {metricKeys.map((k) => (
              <TableCell key={k} className="text-right tabular-nums font-bold">{totals[k]}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

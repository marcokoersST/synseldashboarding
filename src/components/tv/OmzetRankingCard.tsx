import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Trophy, Medal, Flame, Rocket, TrendingUp } from "lucide-react";
import { omzetConsultants, getOmzetForPeriodeGroups, unitAbbr } from "@/data/omzetDashboardData";

const rankIcons = [
  <Trophy className="h-3.5 w-3.5 text-yellow-500" />,
  <Medal className="h-3.5 w-3.5 text-slate-400" />,
  <Medal className="h-3.5 w-3.5 text-amber-600" />,
  <Flame className="h-3.5 w-3.5 text-orange-500" />,
  <Rocket className="h-3.5 w-3.5 text-primary" />,
];

function formatK(val: number) {
  if (Math.abs(val) >= 1000) return `€${(val / 1000).toFixed(0)}K`;
  return `€${val.toLocaleString("nl-NL")}`;
}

interface Props {
  groep1?: string[];
  groep2?: string[];
  compact?: boolean;
}

export function OmzetRankingCard({
  groep1 = ["P10", "P11", "P12"],
  groep2 = ["P13", "P1", "P2"],
  compact = false,
}: Props) {
  const data = useMemo(
    () => getOmzetForPeriodeGroups(omzetConsultants, groep1, groep2),
    [groep1, groep2]
  );

  const totals = useMemo(
    () => data.reduce(
      (acc, r) => ({ p1: acc.p1 + r.periode1, p2: acc.p2 + r.periode2, verschil: acc.verschil + r.verschil }),
      { p1: 0, p2: 0, verschil: 0 }
    ),
    [data]
  );

  const g1Label = groep1.join("+");
  const g2Label = groep2.join("+");

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className={compact ? "py-3 px-4" : "pb-2"}>
        <CardTitle className={compact ? "text-sm" : "text-base"}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Omzet Stijgers
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{g1Label} → {g2Label}</p>
      </CardHeader>
      <CardContent className={`flex-1 overflow-auto ${compact ? "p-0" : "p-0"}`}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10 text-xs font-semibold">#</TableHead>
              <TableHead className="text-xs font-semibold">Naam</TableHead>
              <TableHead className="text-xs font-semibold">Unit</TableHead>
              <TableHead className="text-right text-xs font-semibold">{g1Label}</TableHead>
              <TableHead className="text-right text-xs font-semibold">{g2Label}</TableHead>
              <TableHead className="text-right text-xs font-semibold">Δ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={row.name} className={idx < 3 ? "bg-primary/5" : ""}>
                <TableCell className="py-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    {idx < 5 && rankIcons[idx]}
                    <span>{idx + 1}</span>
                  </div>
                </TableCell>
                <TableCell className="py-1.5 text-xs font-medium">{row.name}</TableCell>
                <TableCell className="py-1.5 text-xs text-muted-foreground font-mono">{unitAbbr(row.unit)}</TableCell>
                <TableCell className="py-1.5 text-xs text-right tabular-nums">{formatK(row.periode1)}</TableCell>
                <TableCell className="py-1.5 text-xs text-right tabular-nums">{formatK(row.periode2)}</TableCell>
                <TableCell className="py-1.5 text-right">
                  <Badge
                    variant="outline"
                    className={`text-[10px] tabular-nums font-semibold gap-0.5 px-1.5 py-0 ${
                      row.verschil > 0
                        ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                        : row.verschil < 0
                        ? "text-red-500 border-red-200 bg-red-50"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.verschil > 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : row.verschil < 0 ? <ArrowDownRight className="h-2.5 w-2.5" /> : null}
                    {row.verschil >= 0 ? "+" : ""}{formatK(row.verschil)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/40 border-t-2 border-border">
              <TableCell className="py-1.5" />
              <TableCell className="py-1.5 text-xs font-bold">Totaal</TableCell>
              <TableCell className="py-1.5" />
              <TableCell className="py-1.5 text-xs text-right tabular-nums font-bold">{formatK(totals.p1)}</TableCell>
              <TableCell className="py-1.5 text-xs text-right tabular-nums font-bold">{formatK(totals.p2)}</TableCell>
              <TableCell className="py-1.5 text-right">
                <Badge variant="outline" className={`text-[10px] tabular-nums font-bold gap-0.5 px-1.5 py-0 ${totals.verschil >= 0 ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-red-500 border-red-200 bg-red-50"}`}>
                  {totals.verschil >= 0 ? "+" : ""}{formatK(totals.verschil)}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

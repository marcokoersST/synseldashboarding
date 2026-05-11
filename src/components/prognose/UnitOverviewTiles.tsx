import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, AlertTriangle, AlertOctagon } from "lucide-react";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { cn } from "@/lib/utils";
import {
  type PrognoseConsultantRow,
  getTopPerformers,
  getBottomPerformers,
  getTopBottlenecks,
  getCriticalList,
} from "@/data/prognoseData";

interface Props {
  rows: PrognoseConsultantRow[];
  onSelectConsultant: (row: PrognoseConsultantRow) => void;
}

function PerfList({
  rows,
  variant,
  onSelect,
}: {
  rows: PrognoseConsultantRow[];
  variant: "top" | "bottom";
  onSelect: (r: PrognoseConsultantRow) => void;
}) {
  return (
    <ul className="space-y-1.5">
      {rows.map((r, i) => (
        <li
          key={r.id}
          onClick={() => onSelect(r)}
          className="flex items-center justify-between gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
            <div className="min-w-0">
              <div className="truncate font-medium">{r.name}</div>
              <div className="truncate text-xs text-muted-foreground">{r.unit}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="tabular-nums font-semibold">{r.prognoseScore}%</span>
            <span
              className={cn(
                "inline-flex items-center text-xs tabular-nums",
                r.deltaScore >= 0 ? "text-emerald-600" : "text-destructive",
              )}
            >
              {r.deltaScore >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(r.deltaScore)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function UnitOverviewTiles({ rows, onSelectConsultant }: Props) {
  const top = getTopPerformers(rows);
  const bottom = getBottomPerformers(rows);
  const bottlenecks = getTopBottlenecks(rows);
  const critical = getCriticalList(rows);
  const topCriticalCount = bottlenecks[0]?.count ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2 bg-gradient-to-b from-emerald-500/10 to-transparent border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Top 10 Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <PerfList rows={top} variant="top" onSelect={onSelectConsultant} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 bg-gradient-to-b from-destructive/10 to-transparent border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            Bottom 10 Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <PerfList rows={bottom} variant="bottom" onSelect={onSelectConsultant} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 bg-gradient-to-b from-amber-500/10 to-transparent border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Top 3 Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          {bottlenecks.map((b, i) => (
            <div key={b.category} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">#{i + 1}</Badge>
                <span className="text-2xl font-bold tabular-nums">
                  <AnimatedNumber value={b.count} />
                </span>
              </div>
              <div className="mt-1 font-medium text-sm">{b.category}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {b.count} consultants getroffen
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader className="pb-2 bg-gradient-to-b from-destructive/20 to-transparent border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-destructive" />
            Kritiek
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="text-center mb-3">
            <div className="text-5xl font-bold text-destructive tabular-nums">
              <AnimatedNumber value={topCriticalCount} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              meest voorkomende kritieke categorie
            </div>
          </div>
          <div className="border-t pt-2">
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">
              Directe aandacht ({critical.length})
            </div>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {critical.slice(0, 8).map((r) => (
                <li
                  key={r.id}
                  onClick={() => onSelectConsultant(r)}
                  className="text-xs cursor-pointer rounded px-2 py-1 hover:bg-muted/50"
                >
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-muted-foreground truncate">{r.criticalReason}</div>
                </li>
              ))}
              {critical.length === 0 && (
                <li className="text-xs text-muted-foreground">Geen kritieke gevallen.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

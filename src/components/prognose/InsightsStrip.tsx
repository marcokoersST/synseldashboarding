import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PrognoseConsultantRow,
  type BottleneckCategory,
  urgencyLevel,
  redMetricCount,
  getTopBottlenecks,
} from "@/data/prognoseData";

interface Props {
  rows: PrognoseConsultantRow[];
  bottleneckFilter: BottleneckCategory | null;
  onBottleneckFilter: (b: BottleneckCategory | null) => void;
  mindsetOnly: boolean;
  onMindsetToggle: () => void;
}

const URGENCY_COLOR: Record<string, string> = {
  "1.laag": "bg-emerald-500",
  "2.middel": "bg-yellow-500",
  "3.hoog": "bg-orange-500",
  "4.extreem hoog": "bg-destructive",
};

export function InsightsStrip({
  rows,
  bottleneckFilter,
  onBottleneckFilter,
  mindsetOnly,
  onMindsetToggle,
}: Props) {
  const urgencyCounts = rows.reduce(
    (acc, r) => {
      const u = urgencyLevel(r);
      acc[u] = (acc[u] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const bottlenecks = getTopBottlenecks(rows, 10);
  const totalBn = bottlenecks.reduce((a, b) => a + b.count, 0);

  const mindsetCount = rows.filter((r) => redMetricCount(r) >= 4).length;

  const avgScore = rows.length
    ? Math.round(rows.reduce((a, r) => a + r.prognoseScore, 0) / rows.length)
    : 0;
  const avgDelta = rows.length
    ? Math.round(rows.reduce((a, r) => a + r.deltaScore, 0) / rows.length)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Urgentie */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h3 className="text-sm font-semibold">Urgentie obv kwaliteit</h3>
          </div>
          <div className="space-y-1.5">
            {(["1.laag", "2.middel", "3.hoog", "4.extreem hoog"] as const).map((lvl) => {
              const c = urgencyCounts[lvl] || 0;
              const pct = rows.length ? (c / rows.length) * 100 : 0;
              return (
                <div key={lvl} className="flex items-center gap-2 text-xs">
                  <span className="w-28 text-muted-foreground capitalize">{lvl}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full transition-all", URGENCY_COLOR[lvl])} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right tabular-nums font-medium">{c}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck verdeling (clickable) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold">Bottleneck verdeling</h3>
            </div>
            {bottleneckFilter && (
              <button
                onClick={() => onBottleneckFilter(null)}
                className="text-xs underline text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {bottlenecks.length === 0 && (
              <p className="text-xs text-muted-foreground">Geen knelpunten</p>
            )}
            {bottlenecks.map((b) => {
              const pct = totalBn ? (b.count / totalBn) * 100 : 0;
              const active = bottleneckFilter === b.category;
              return (
                <button
                  key={b.category}
                  onClick={() => onBottleneckFilter(active ? null : b.category)}
                  className={cn(
                    "w-full flex items-center gap-2 text-xs rounded px-1 py-0.5 hover:bg-muted/50 transition-colors",
                    active && "bg-primary/10",
                  )}
                >
                  <span className={cn("flex-1 text-left truncate", active && "font-semibold text-primary")}>
                    {b.category}
                  </span>
                  <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right tabular-nums">{b.count}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mindset risk */}
      <Card className={cn(mindsetOnly && "border-destructive")}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold">Mindset risico</h3>
          </div>
          <div className="text-4xl font-bold text-destructive tabular-nums">{mindsetCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            consultants met 4+ rode metrics ("wil hij het echt?")
          </p>
          <button
            onClick={onMindsetToggle}
            className={cn(
              "mt-3 text-xs underline",
              mindsetOnly ? "text-destructive font-semibold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mindsetOnly ? "Filter actief — klik om te resetten" : "Filter tabel op deze groep"}
          </button>
        </CardContent>
      </Card>

      {/* Avg score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            {avgDelta >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <h3 className="text-sm font-semibold">Gemiddelde score</h3>
          </div>
          <div className="text-4xl font-bold tabular-nums">{avgScore}%</div>
          <p
            className={cn(
              "text-xs mt-1 tabular-nums",
              avgDelta >= 0 ? "text-emerald-600" : "text-destructive",
            )}
          >
            {avgDelta >= 0 ? "+" : ""}{avgDelta} pt vs vorige periode
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {rows.length} consultants in selectie
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

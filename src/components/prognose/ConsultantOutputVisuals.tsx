import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { PrognoseConsultantRow, BottleneckCategory } from "@/data/prognoseData";

interface Props {
  rows: PrognoseConsultantRow[];
  onSelectConsultant: (row: PrognoseConsultantRow) => void;
}

const ALL_BOTTLENECKS: BottleneckCategory[] = [
  "Te weinig acquisities",
  "Lage voorstel-ratio",
  "Telefonie onder norm",
  "Intake-uitval",
  "Plaatsingsachterstand",
];

function statusColor(status: PrognoseConsultantRow["status"]) {
  if (status === "kritiek") return "bg-destructive border-destructive/60";
  if (status === "risico") return "bg-amber-500 border-amber-600/60";
  return "bg-emerald-500 border-emerald-600/60";
}

export function ConsultantOutputVisuals({ rows, onSelectConsultant }: Props) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.prognoseScore - a.prognoseScore),
    [rows],
  );

  const counts = useMemo(() => {
    const c = { "op-koers": 0, risico: 0, kritiek: 0 } as Record<PrognoseConsultantRow["status"], number>;
    rows.forEach((r) => { c[r.status]++; });
    return c;
  }, [rows]);

  const radarData = useMemo(() => {
    const map = new Map<BottleneckCategory, number>();
    ALL_BOTTLENECKS.forEach((b) => map.set(b, 0));
    rows.forEach((r) => {
      if (r.bottleneck !== "Geen knelpunt") {
        map.set(r.bottleneck, (map.get(r.bottleneck) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([category, count]) => ({
      category: category.replace(" onder norm", "").replace("Te weinig ", ""),
      count,
    }));
  }, [rows]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
      <Card>
        <CardHeader className="pb-1.5 pt-3 px-4 border-b">
          <CardTitle className="text-sm">
            Prognose-score per consultant
            <span className="ml-2 text-[10px] font-normal text-muted-foreground">
              {rows.length} consultants — gesorteerd op score
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 pb-3 px-4">
          <TooltipProvider delayDuration={100}>
            <div className="flex flex-wrap gap-1">
              {sorted.map((r) => (
                <Tooltip key={r.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectConsultant(r)}
                      className={cn(
                        "h-3.5 w-3.5 rounded-sm border transition-transform hover:scale-125 hover:z-10",
                        statusColor(r.status),
                      )}
                      aria-label={`${r.name} — ${r.prognoseScore}%`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-muted-foreground">{r.unit}</div>
                    <div className="tabular-nums">Score: {r.prognoseScore}%</div>
                    <div className="text-[10px] text-muted-foreground">{r.bottleneck}</div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground border-t pt-2">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500 border border-emerald-600/60" />
              Op koers <span className="font-semibold tabular-nums text-foreground">{counts["op-koers"]}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500 border border-amber-600/60" />
              Risico <span className="font-semibold tabular-nums text-foreground">{counts.risico}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-destructive border border-destructive/60" />
              Kritiek <span className="font-semibold tabular-nums text-foreground">{counts.kritiek}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1.5 pt-3 px-4 border-b">
          <CardTitle className="text-sm">Bottleneck verdeling</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-2 px-2">
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                />
                <Radar
                  name="Aantal"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

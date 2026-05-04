import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { getCohortDetail } from "@/data/funnelQualityData";

interface Props {
  month: string | null;
  open: boolean;
  onClose: () => void;
}

const CLUSTER_COLORS = ["#10b981", "#f97316", "#8b5cf6", "#0ea5e9", "#eab308"];

export function CohortDetailPanel({ month, open, onClose }: Props) {
  const detail = month ? getCohortDetail(month) : null;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Cohort {month}</SheetTitle>
          <SheetDescription>{detail ? `${detail.n.toLocaleString("nl-NL")} kandidaten in dit cohort` : ""}</SheetDescription>
        </SheetHeader>
        {detail && (
          <div className="space-y-5 mt-4">
            {/* Mix nieuw / heractivering */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Mix</p>
              <div className="flex h-7 rounded-md overflow-hidden border border-border">
                <div className="bg-emerald-500 text-white text-xs flex items-center justify-center font-medium" style={{ width: `${detail.pctNieuw}%` }}>
                  Nieuw {detail.pctNieuw.toFixed(1)}%
                </div>
                <div className="bg-orange-500 text-white text-xs flex items-center justify-center font-medium" style={{ width: `${detail.pctHeractivering}%` }}>
                  Heract. {detail.pctHeractivering.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Cluster mix */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Verdeling per cluster</p>
              <div className="space-y-1.5">
                {detail.clusterMix.map((c, i) => (
                  <div key={c.cluster} className="flex items-center gap-2 text-xs">
                    <span className="w-32 truncate">{c.cluster}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, c.pct)}%`, background: CLUSTER_COLORS[i] }} />
                    </div>
                    <span className="tabular-nums w-10 text-right font-medium">{c.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plaatsbaarheidscore distribution */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Plaatsbaarheidscore</p>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                  <BarChart data={detail.scoreHistogram}>
                    <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {detail.scoreHistogram.map((_, i) => (
                        <Cell key={i} fill="hsl(var(--primary))" fillOpacity={0.4 + i * 0.12} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

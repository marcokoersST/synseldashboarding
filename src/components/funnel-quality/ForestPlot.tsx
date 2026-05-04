import { forestData } from "@/data/funnelQualityData";
import { cn } from "@/lib/utils";

export function ForestPlot() {
  // Domain: 0 .. 1.5 hr
  const min = 0.2, max = 1.5;
  const xPct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      {/* Axis */}
      <div className="relative h-5 ml-44 border-b border-border">
        {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((t) => (
          <span key={t} className="absolute -translate-x-1/2 text-[10px] text-muted-foreground top-0" style={{ left: `${xPct(t)}%` }}>
            {t.toFixed(2)}
          </span>
        ))}
      </div>
      {forestData.map((r) => {
        const significant = r.ciHigh < 1;
        return (
          <div key={`${r.cluster}-${r.regio}`} className="flex items-center gap-2 text-xs">
            <span className="w-44 truncate">{r.cluster} <span className="text-muted-foreground">· {r.regio}</span></span>
            <div className="relative flex-1 h-5">
              {/* HR=1 reference line */}
              <div className="absolute top-0 bottom-0 border-l border-dashed border-border" style={{ left: `${xPct(1)}%` }} />
              {/* CI bar */}
              <div
                className={cn("absolute top-1/2 -translate-y-1/2 h-1 rounded-full", significant ? "bg-emerald-500/60" : "bg-muted-foreground/40")}
                style={{ left: `${xPct(r.ciLow)}%`, width: `${xPct(r.ciHigh) - xPct(r.ciLow)}%` }}
              />
              {/* Point */}
              <div
                className={cn("absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full", significant ? "bg-emerald-600" : "bg-muted-foreground")}
                style={{ left: `${xPct(r.hr)}%` }}
              />
            </div>
            <span className="tabular-nums w-12 text-right">{r.hr.toFixed(2)}</span>
            <span className="tabular-nums w-24 text-right text-muted-foreground text-[10px]">[{r.ciLow.toFixed(2)}–{r.ciHigh.toFixed(2)}]</span>
            <span className="tabular-nums w-10 text-right text-muted-foreground text-[10px]">n={r.n}</span>
          </div>
        );
      })}
    </div>
  );
}

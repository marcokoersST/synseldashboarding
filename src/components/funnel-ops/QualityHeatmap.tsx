import { useState } from "react";
import { qualityHeatmap, FUNCTIEGROEPEN_REF } from "@/data/funnelOperationsData";

export function QualityHeatmap() {
  const [filter, setFilter] = useState<"totaal" | "nieuw" | "bestaand">("totaal");
  const data = qualityHeatmap(filter);

  const cellColor = (avg: number, n: number) => {
    if (n === 0) return "hsl(var(--muted))";
    const t = Math.min(1, Math.max(0, avg / 100));
    return `hsl(160 50% ${85 - t * 50}%)`;
  };

  return (
    <div className="border border-border rounded-md p-3 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Kwaliteit per business unit × functiegroep</div>
        <div className="flex gap-1">
          {(["totaal","nieuw","bestaand"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2 py-1 rounded ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-1.5 text-muted-foreground font-normal">Unit</th>
              {FUNCTIEGROEPEN_REF.map(fg => <th key={fg} className="p-1.5 text-muted-foreground font-normal text-center">{fg}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.unit}>
                <td className="p-1.5 font-medium whitespace-nowrap">{row.unit}</td>
                {row.cells.map(c => (
                  <td key={c.fg} className="p-0.5">
                    <div className="rounded text-center py-2 px-1 tabular-nums" style={{ background: cellColor(c.avg, c.n), color: c.avg > 60 ? "white" : "hsl(var(--foreground))" }}>
                      <div className="font-semibold">{c.n ? c.avg : "—"}</div>
                      <div className="text-[9px] opacity-75">n={c.n}</div>
                    </div>
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

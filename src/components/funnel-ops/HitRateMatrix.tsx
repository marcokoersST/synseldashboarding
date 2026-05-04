import { useState } from "react";
import { hitRateMatrix, HIT_RATE_TITLES } from "@/data/funnelOperationsData";
import { UserLink } from "./CandidateLink";

export function HitRateMatrix() {
  const [mode, setMode] = useState<"historisch" | "voortschrijdend">("historisch");
  const matrix = hitRateMatrix(mode);

  const cellColor = (hit: number | null, n: number) => {
    if (hit === null || n < 5) return "hsl(var(--muted) / 0.5)";
    const t = Math.min(1, hit / 50);
    return `hsl(160 60% ${80 - t * 45}%)`;
  };

  return (
    <div className="border border-border rounded-md bg-card">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="text-sm font-medium">Hit-rate matrix · consultant × functiegroep</div>
        <div className="flex gap-1">
          {(["historisch","voortschrijdend"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`text-xs px-2 py-1 rounded ${mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {m === "historisch" ? "Historisch totaal" : "Voortschrijdend 12w"}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr>
              <th className="text-left p-2 text-muted-foreground font-normal sticky left-0 bg-card z-20 min-w-[160px]">Consultant</th>
              {HIT_RATE_TITLES.map(t => <th key={t} className="p-2 text-muted-foreground font-normal text-center min-w-[80px]">{t}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {matrix.map(row => (
              <tr key={row.consultant.id}>
                <td className="p-2 sticky left-0 bg-card z-10">
                  <UserLink id={row.consultant.id} name={row.consultant.naam} />
                </td>
                {row.cells.map(c => (
                  <td key={c.title} className="p-1">
                    <div className="rounded text-center py-1.5 px-1 tabular-nums" style={{ background: cellColor(c.hitRate, c.n), color: (c.hitRate ?? 0) > 25 ? "white" : "hsl(var(--foreground))" }}>
                      <div className="font-semibold">{c.n < 5 ? "—" : `${c.hitRate}%`}</div>
                      <div className="text-[9px] opacity-75">n={c.n}</div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border">
        Cellen met n&lt;5 zijn grijs (onvoldoende data). Donkergroen = hogere hit-rate.
      </div>
    </div>
  );
}

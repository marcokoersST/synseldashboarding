import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { sourceTree, SOURCE_LABELS } from "@/data/funnelOperationsData";

function scoreClass(s: number) {
  if (s >= 70) return "text-success";
  if (s >= 50) return "text-orange-500";
  return "text-destructive";
}

export function SourceTreeView() {
  const [openMediums, setOpenMediums] = useState<string[]>(["paid_jobboard"]);
  const [openPlatforms, setOpenPlatforms] = useState<string[]>([]);
  const toggleMedium = (k: string) =>
    setOpenMediums(o => o.includes(k) ? o.filter(x => x !== k) : [...o, k]);
  const togglePlatform = (k: string) =>
    setOpenPlatforms(o => o.includes(k) ? o.filter(x => x !== k) : [...o, k]);

  const cols = "grid grid-cols-[minmax(0,5fr)_repeat(5,minmax(0,1fr))] gap-2";

  return (
    <div className="border border-border rounded-md divide-y divide-border bg-card">
      <div className={`${cols} px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30`}>
        <div>Bron</div>
        <div className="text-right">Totaal</div>
        <div className="text-right">% Nieuw</div>
        <div className="text-right">% Bestaand</div>
        <div className="text-right">Score</div>
        <div className="text-right">Conv.</div>
      </div>
      {sourceTree.map(node => {
        const mediumOpen = openMediums.includes(node.bron);
        const pctNew = node.total ? Math.round((node.nieuw / node.total) * 100) : 0;
        return (
          <div key={node.bron}>
            <button
              onClick={() => toggleMedium(node.bron)}
              className={`w-full ${cols} px-3 py-2 text-sm hover:bg-muted/30 text-left`}
            >
              <div className="flex items-center gap-1 font-medium">
                {mediumOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                {SOURCE_LABELS[node.bron] ?? node.bron}
              </div>
              <div className="text-right tabular-nums">{node.total}</div>
              <div className="text-right tabular-nums">{pctNew}%</div>
              <div className="text-right tabular-nums">{100 - pctNew}%</div>
              <div className={`text-right tabular-nums font-medium ${scoreClass(node.avgScore)}`}>{node.avgScore}</div>
              <div className="text-right tabular-nums text-success">{node.conversie}%</div>
            </button>
            {mediumOpen && (
              <div className="bg-muted/20">
                {node.platforms.map(p => {
                  const platKey = `${node.bron}::${p.naam}`;
                  const platOpen = openPlatforms.includes(platKey);
                  return (
                    <div key={platKey}>
                      <button
                        onClick={() => togglePlatform(platKey)}
                        className={`w-full ${cols} px-3 py-1.5 pl-7 text-xs hover:bg-muted/40 text-left border-t border-border/50`}
                      >
                        <div className="flex items-center gap-1 font-medium">
                          {platOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {p.naam}
                        </div>
                        <div className="text-right tabular-nums">{p.total}</div>
                        <div className="text-right tabular-nums text-muted-foreground">—</div>
                        <div className="text-right tabular-nums text-muted-foreground">—</div>
                        <div className={`text-right tabular-nums ${scoreClass(p.avgScore)}`}>{p.avgScore}</div>
                        <div className="text-right tabular-nums text-success">{p.conversie}%</div>
                      </button>
                      {platOpen && p.campaigns.map(c => (
                        <div key={c.naam} className={`${cols} px-3 py-1.5 pl-12 text-xs text-muted-foreground border-t border-border/50`}>
                          <div>{c.naam}</div>
                          <div className="text-right tabular-nums">{c.total}</div>
                          <div className="text-right tabular-nums">—</div>
                          <div className="text-right tabular-nums">—</div>
                          <div className={`text-right tabular-nums ${scoreClass(c.avgScore)}`}>{c.avgScore}</div>
                          <div className="text-right tabular-nums">{c.conversie}%</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { sourceTree, SOURCE_LABELS } from "@/data/funnelOperationsData";

function scoreClass(s: number) {
  if (s >= 70) return "text-success";
  if (s >= 50) return "text-orange-500";
  return "text-destructive";
}

export function SourceTreeView() {
  const [open, setOpen] = useState<string[]>(["paid_jobboard"]);
  const toggle = (k: string) => setOpen(o => o.includes(k) ? o.filter(x => x !== k) : [...o, k]);

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
        const isOpen = open.includes(node.bron);
        const pctNew = node.total ? Math.round((node.nieuw / node.total) * 100) : 0;
        return (
          <div key={node.bron}>
            <button
              onClick={() => toggle(node.bron)}
              className={`w-full ${cols} px-3 py-2 text-sm hover:bg-muted/30 text-left`}
            >
              <div className="flex items-center gap-1 font-medium">
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                {SOURCE_LABELS[node.bron] ?? node.bron}
              </div>
              <div className="text-right tabular-nums">{node.total}</div>
              <div className="text-right tabular-nums">{pctNew}%</div>
              <div className="text-right tabular-nums">{100 - pctNew}%</div>
              <div className={`text-right tabular-nums font-medium ${scoreClass(node.avgScore)}`}>{node.avgScore}</div>
              <div className="text-right tabular-nums text-success">{node.conversie}%</div>
            </button>
            {isOpen && (
              <div className="bg-muted/20">
                {node.subs.map(s => (
                  <div key={s.naam} className={`${cols} px-3 py-1.5 pl-9 text-xs text-muted-foreground border-t border-border/50`}>
                    <div>{s.naam}</div>
                    <div className="text-right tabular-nums">{s.total}</div>
                    <div className="text-right tabular-nums">—</div>
                    <div className="text-right tabular-nums">—</div>
                    <div className={`text-right tabular-nums ${scoreClass(s.avgScore)}`}>{s.avgScore}</div>
                    <div className="text-right tabular-nums">{s.conversie}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { sourceTree, SOURCE_LABELS } from "@/data/funnelOperationsData";

export function SourceTreeView() {
  const [open, setOpen] = useState<string[]>(["paid_jobboard"]);
  const toggle = (k: string) => setOpen(o => o.includes(k) ? o.filter(x => x !== k) : [...o, k]);

  return (
    <div className="border border-border rounded-md divide-y divide-border bg-card">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">
        <div className="col-span-5">Bron</div>
        <div className="col-span-2 text-right">Totaal</div>
        <div className="col-span-2 text-right">% Nieuw</div>
        <div className="col-span-2 text-right">% Bestaand</div>
        <div className="col-span-1 text-right">Conv.</div>
      </div>
      {sourceTree.map(node => {
        const isOpen = open.includes(node.bron);
        const pctNew = node.total ? Math.round((node.nieuw / node.total) * 100) : 0;
        return (
          <div key={node.bron}>
            <button
              onClick={() => toggle(node.bron)}
              className="w-full grid grid-cols-12 gap-2 px-3 py-2 text-sm hover:bg-muted/30 text-left"
            >
              <div className="col-span-5 flex items-center gap-1 font-medium">
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                {BRON_LABELS[node.bron] ?? node.bron}
              </div>
              <div className="col-span-2 text-right tabular-nums">{node.total}</div>
              <div className="col-span-2 text-right tabular-nums">{pctNew}%</div>
              <div className="col-span-2 text-right tabular-nums">{100 - pctNew}%</div>
              <div className="col-span-1 text-right tabular-nums text-success">{node.conversie}%</div>
            </button>
            {isOpen && (
              <div className="bg-muted/20">
                {node.subs.map(s => (
                  <div key={s.naam} className="grid grid-cols-12 gap-2 px-3 py-1.5 pl-9 text-xs text-muted-foreground border-t border-border/50">
                    <div className="col-span-5">{s.naam}</div>
                    <div className="col-span-2 text-right tabular-nums">{s.total}</div>
                    <div className="col-span-2 text-right tabular-nums">—</div>
                    <div className="col-span-2 text-right tabular-nums">—</div>
                    <div className="col-span-1 text-right tabular-nums">{s.conversie}%</div>
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

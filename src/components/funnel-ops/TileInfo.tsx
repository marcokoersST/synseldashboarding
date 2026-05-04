import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface TileInfoProps {
  title: string;
  what: string;
  formula?: string;
  source?: string;
  notes?: string;
}

export function TileInfo({ title, what, formula, source, notes }: TileInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Uitleg over ${title}`}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 text-xs space-y-2"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-semibold">{title}</div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Wat toont deze tegel</div>
          <div>{what}</div>
        </div>
        {formula && (
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Berekening</div>
            <pre className="bg-muted/40 rounded p-2 text-[11px] font-mono whitespace-pre-wrap">{formula}</pre>
          </div>
        )}
        {source && (
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Bron in mock-data</div>
            <code className="text-[11px] bg-muted/40 px-1.5 py-0.5 rounded">{source}</code>
          </div>
        )}
        {notes && (
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Aannames</div>
            <div className="text-muted-foreground">{notes}</div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

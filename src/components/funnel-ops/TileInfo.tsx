import { Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface TileInfoProps {
  title: string;
  /** What this tile shows — written from a business analyst perspective. */
  what: string;
  /** Calculation / formula behind the metric. */
  formula?: string;
  /** Where the data comes from in the mock layer. */
  source?: string;
  /** Assumptions, edge cases or caveats. */
  notes?: string;
}

export function TileInfo({ title, what, formula, source, notes }: TileInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="h-7 px-2.5 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white shrink-0"
        >
          <Info className="w-3.5 h-3.5" />
          Dev info
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 text-xs space-y-3"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="w-3.5 h-3.5" />
          {title} — for the development team
        </div>
        <div className="flex items-start gap-1.5 text-red-600 font-medium border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded p-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Remove this button before release.</span>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground/80">What this tile shows</div>
          <p className="leading-relaxed text-muted-foreground">{what}</p>
        </div>
        {formula && (
          <div className="space-y-1">
            <div className="font-medium text-foreground/80">Calculation</div>
            <pre className="bg-muted/60 p-3 rounded text-[11px] leading-snug font-mono whitespace-pre-wrap text-foreground/90">{formula}</pre>
          </div>
        )}
        {source && (
          <div className="space-y-1">
            <div className="font-medium text-foreground/80">Mock data source</div>
            <code className="text-[11px] bg-muted/60 px-1.5 py-0.5 rounded font-mono">{source}</code>
          </div>
        )}
        {notes && (
          <div className="space-y-1">
            <div className="font-medium text-foreground/80">Assumptions & caveats</div>
            <p className="leading-relaxed text-muted-foreground">{notes}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

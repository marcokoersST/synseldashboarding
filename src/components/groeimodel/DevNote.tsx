import { Info, AlertTriangle } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DevNoteProps {
  story: ReactNode;
  logic: ReactNode;
  id?: string | number;
  /**
   * When true, render as a floating absolute button (no layout impact).
   * Parent must be `relative`.
   */
  floating?: boolean;
  /** Optional override for the absolute-positioning classes when floating. */
  floatingClassName?: string;
}

export function DevNote({ story, logic, id, floating, floatingClassName }: DevNoteProps) {
  const trigger = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className={cn(
            floating
              ? cn(
                  "absolute z-50 h-5 px-1.5 text-[10px] gap-1 leading-none rounded shadow",
                  "bg-red-600 hover:bg-red-700 text-white",
                  floatingClassName ?? "top-1 right-1",
                )
              : "h-7 px-2.5 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Info className={floating ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Dev{id !== undefined ? ` #${id}` : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 text-xs space-y-3 z-[200]" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="w-3.5 h-3.5" />
          For the development team{id !== undefined ? ` — #${id}` : ""}
        </div>
        <div className="flex items-start gap-1.5 text-red-600 font-medium border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded p-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Delete this button after development.</span>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground/80">User story</div>
          <p className="leading-relaxed text-muted-foreground">{story}</p>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground/80">Logic</div>
          <pre className="bg-muted/60 p-3 rounded text-[11px] leading-snug font-mono whitespace-pre-wrap text-foreground/90">{logic}</pre>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (floating) return trigger;
  return <div className="mt-3 flex justify-end">{trigger}</div>;
}

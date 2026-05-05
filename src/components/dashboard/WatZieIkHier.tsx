import { ReactNode } from "react";
import { HelpCircle, Eye, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WatZieIkHierProps {
  what: ReactNode;
  insight: ReactNode;
  className?: string;
}

/**
 * Small popover button placed top-right of a dashboard tile.
 * Explains the tile in plain Dutch ("Jip-en-Janneketaal").
 */
export function WatZieIkHier({ what, insight, className }: WatZieIkHierProps) {
  return (
    <div
      className={cn(
        "absolute top-2 right-2 z-20",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1 bg-background/80 backdrop-blur-sm border-border/60 text-muted-foreground hover:text-foreground hover:bg-background"
          >
            <HelpCircle className="w-3 h-3" />
            Wat zie ik hier?
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 text-xs space-y-3" align="end">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Wat zie ik hier?
            </div>
            <p className="leading-relaxed text-muted-foreground">{what}</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Lightbulb className="w-3.5 h-3.5 text-gold" />
              Wat heb ik hier aan?
            </div>
            <p className="leading-relaxed text-muted-foreground">{insight}</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

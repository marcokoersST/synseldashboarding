import { Info } from "lucide-react";
import { ReactNode } from "react";

interface DevNoteProps {
  story: ReactNode;
  source: ReactNode;
  logic: ReactNode;
}

export function DevNote({ story, source, logic }: DevNoteProps) {
  return (
    <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1.5">
      <div className="flex items-center gap-1.5 font-semibold text-foreground/70">
        <Info className="w-3.5 h-3.5" />
        For the development team
      </div>
      <p className="leading-relaxed">{story}</p>
      <p className="leading-relaxed"><span className="font-medium text-foreground/70">Data source:</span> {source}</p>
      <p className="leading-relaxed"><span className="font-medium text-foreground/70">Logic:</span> {logic}</p>
    </div>
  );
}

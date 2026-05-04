import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { kpiDefinitions } from "@/data/funnelQualityData";

interface InfoTooltipProps {
  defKey?: keyof typeof kpiDefinitions;
  text?: string;
}

export function InfoTooltip({ defKey, text }: InfoTooltipProps) {
  const content = text ?? (defKey ? kpiDefinitions[defKey] : "");
  if (!content) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Definitie"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

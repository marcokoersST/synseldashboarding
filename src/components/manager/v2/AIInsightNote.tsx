import { Lightbulb, TrendingUp, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIInsight {
  type: "observation" | "forecast" | "warning" | "recommendation";
  text: string;
}

const iconMap = {
  observation: Lightbulb,
  forecast: TrendingUp,
  warning: AlertTriangle,
  recommendation: MessageSquare,
};

const styleMap = {
  observation: "border-primary/20 bg-primary/5",
  forecast: "border-accent/20 bg-accent/5",
  warning: "border-destructive/20 bg-destructive/5",
  recommendation: "border-teal/20 bg-teal/5",
};

const iconStyleMap = {
  observation: "text-primary",
  forecast: "text-accent",
  warning: "text-destructive",
  recommendation: "text-teal",
};

interface AIInsightNoteProps {
  insights: AIInsight[];
  className?: string;
}

export function AIInsightNote({ insights, className }: AIInsightNoteProps) {
  if (insights.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 mb-1">
        <Lightbulb className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">AI Inzichten</span>
      </div>
      {insights.map((insight, i) => {
        const Icon = iconMap[insight.type];
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed text-foreground",
              styleMap[insight.type]
            )}
          >
            <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", iconStyleMap[insight.type])} />
            <span>{insight.text}</span>
          </div>
        );
      })}
    </div>
  );
}

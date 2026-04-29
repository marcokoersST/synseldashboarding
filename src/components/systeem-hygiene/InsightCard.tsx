import { Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/data/systeemHygieneData";

const styleMap: Record<Insight["severity"], { container: string; icon: string; Icon: typeof Lightbulb }> = {
  good: { container: "border-emerald-500/20 bg-emerald-500/5", icon: "text-emerald-500", Icon: CheckCircle2 },
  warning: { container: "border-amber-500/20 bg-amber-500/5", icon: "text-amber-500", Icon: Lightbulb },
  critical: { container: "border-destructive/20 bg-destructive/5", icon: "text-destructive", Icon: AlertTriangle },
};

export function InsightCard({ insight, className }: { insight: Insight; className?: string }) {
  const s = styleMap[insight.severity];
  const Icon = s.Icon;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed text-foreground", s.container, className)}>
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", s.icon)} />
      <span>{insight.text}</span>
    </div>
  );
}

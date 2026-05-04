import type { SLAState } from "@/data/funnelOperationsData";
import { cn } from "@/lib/utils";

const STYLES = {
  binnen: "bg-success/15 text-success border-success/30",
  dreigend: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  verlopen: "bg-destructive/15 text-destructive border-destructive/30",
  "n/a": "bg-muted text-muted-foreground border-border",
} as const;

export function SLAStatusPill({ sla, className }: { sla: SLAState; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", STYLES[sla.status], className)}>
      {sla.label}
    </span>
  );
}

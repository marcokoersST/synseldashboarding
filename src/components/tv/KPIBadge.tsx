import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KPITone = "primary" | "accent" | "chart-primary" | "gold" | "destructive";

const toneMap: Record<KPITone, { bg: string; text: string; under: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", under: "bg-primary" },
  accent: { bg: "bg-accent/10", text: "text-accent", under: "bg-accent" },
  "chart-primary": {
    bg: "bg-[hsl(var(--chart-primary)/0.12)]",
    text: "text-[hsl(var(--chart-primary))]",
    under: "bg-[hsl(var(--chart-primary))]",
  },
  gold: {
    bg: "bg-[hsl(var(--gold)/0.15)]",
    text: "text-[hsl(var(--gold))]",
    under: "bg-[hsl(var(--gold))]",
  },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", under: "bg-destructive" },
};

interface KPIBadgeProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  tone: KPITone;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
}

export function KPIBadge({ icon: Icon, value, label, tone, compact, size = "md" }: KPIBadgeProps) {
  const t = toneMap[tone];
  const isLg = size === "lg";
  const isSm = size === "sm" || compact;

  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div
        className={cn(
          "rounded-full flex items-center justify-center",
          t.bg,
          isLg ? "w-11 h-11" : isSm ? "w-7 h-7" : "w-9 h-9"
        )}
      >
        <Icon className={cn(t.text, isLg ? "w-5 h-5" : isSm ? "w-3.5 h-3.5" : "w-4 h-4")} />
      </div>
      <p
        className={cn(
          "font-bold text-foreground tabular-nums leading-tight",
          isLg ? "text-3xl" : isSm ? "text-base" : "text-2xl"
        )}
      >
        {value}
      </p>
      <div className={cn("rounded-full", t.under, isSm ? "h-0.5 w-5" : "h-0.5 w-7")} />
      <p className={cn("text-muted-foreground", isSm ? "text-[10px]" : "text-xs")}>{label}</p>
    </div>
  );
}

export { toneMap as kpiToneMap };

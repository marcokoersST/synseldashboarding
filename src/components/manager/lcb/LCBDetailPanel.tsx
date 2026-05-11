import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { cn } from "@/lib/utils";
import { useForceSidebarCollapse } from "@/contexts/SidebarCollapseContext";

type Status = "clean" | "attention" | "critical";

interface Tile {
  key: string;
  title: string;
  subtitle: string;
  status: Status;
  score: number;
  metricLabel: string;
  metricValue: string;
  detail: ReactNode;
}

const STATUS_COLOR: Record<Status, string> = {
  clean: "hsl(142 71% 45%)",
  attention: "hsl(38 92% 50%)",
  critical: "hsl(0 84% 60%)",
};
const STATUS_LABEL: Record<Status, string> = {
  clean: "Op koers",
  attention: "Aandacht",
  critical: "Kritiek",
};

interface Props {
  tile: Tile | null;
  onClose: () => void;
}

export function LCBDetailPanel({ tile, onClose }: Props) {
  useForceSidebarCollapse(!!tile);

  useEffect(() => {
    if (!tile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tile, onClose]);

  if (!tile) return null;
  const color = STATUS_COLOR[tile.status];

  return createPortal(
    <div className="fixed inset-0 z-[55] pointer-events-none">
      {/* Peek strip */}
      <button
        type="button"
        aria-label="Sluit detail"
        onClick={onClose}
        className="absolute inset-y-0 left-0 w-[72px] md:w-[96px] bg-black/20 backdrop-blur-[1px] hover:bg-black/30 transition-colors pointer-events-auto"
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 left-[72px] md:left-[96px] bg-card border-l border-border",
          "shadow-[-12px_0_40px_-12px_hsl(var(--foreground)/0.25)]",
          "flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300",
        )}
      >
        {/* Header */}
        <div className="relative bg-card border-b px-6 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <AnimatedRing value={tile.score} size={64} strokeWidth={6} strokeColor={color} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold tabular-nums" style={{ color }}>
                  <AnimatedNumber value={tile.score} />
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold leading-tight">{tile.title}</h2>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  {STATUS_LABEL[tile.status]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tile.subtitle}</p>
            </div>
            <div className="text-right pr-2 shrink-0">
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {tile.metricLabel}
              </div>
              <div className="text-2xl font-bold tabular-nums text-foreground leading-none mt-1">
                {tile.metricValue}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body — strip the nested card chrome from detail components */}
        <div className="flex-1 overflow-y-auto bg-muted/10 px-6 py-5 lcb-detail-flat">{tile.detail}</div>
      </div>
    </div>,
    document.body,
  );
}

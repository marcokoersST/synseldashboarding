import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForceSidebarCollapse } from "@/contexts/SidebarCollapseContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  size?: "side" | "wide";
  children: ReactNode;
}

export function LCBOverlay({
  open,
  onClose,
  onBack,
  breadcrumbs,
  title,
  subtitle,
  size = "side",
  children,
}: Props) {
  useForceSidebarCollapse(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 top-14 z-[60] flex">
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className="flex-1 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
      <aside
        className={cn(
          "h-full flex flex-col bg-background border-l border-border shadow-2xl",
          "animate-in slide-in-from-right-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          size === "wide" ? "w-[80vw] max-w-[1400px]" : "w-[520px] max-w-[92vw]",
        )}
      >
        <header className="shrink-0 border-b border-border px-5 py-3 flex items-start gap-2">
          {onBack && (
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 mt-0.5" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">
              {breadcrumbs.join(" › ")}
            </div>
            <h2 className="text-base font-semibold text-foreground leading-tight truncate mt-0.5">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}

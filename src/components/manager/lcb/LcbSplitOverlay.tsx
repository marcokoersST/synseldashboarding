import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForceSidebarCollapse } from "@/contexts/SidebarCollapseContext";

interface LeftPane {
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  width?: number | string; // px or CSS width string
  content: ReactNode;
  onBack?: () => void;
}
interface RightPane {
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  width?: number | string;
  content: ReactNode;
}

interface Props {
  open: boolean;
  onClose: () => void;
  left: LeftPane | null;
  right?: RightPane | null;
  onCloseRight?: () => void;
}

export function LcbSplitOverlay({ open, onClose, left, right, onCloseRight }: Props) {
  useForceSidebarCollapse(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (right && onCloseRight) onCloseRight();
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, right, onCloseRight]);

  if (!open || !left) return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 top-14 z-[60] flex">
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className="flex-1 bg-background/60 backdrop-blur-sm animate-in fade-in duration-150"
      />
      <Pane
        breadcrumbs={left.breadcrumbs}
        title={left.title}
        subtitle={left.subtitle}
        widthPx={left.width ?? (right ? 560 : 980)}
        onBack={left.onBack}
        onClose={onClose}
        slideFrom="right"
        bordered
      >
        {left.content}
      </Pane>
      {right && (
        <Pane
          breadcrumbs={right.breadcrumbs}
          title={right.title}
          subtitle={right.subtitle}
          widthPx={right.width ?? 620}
          onClose={onCloseRight ?? onClose}
          slideFrom="right"
        >
          {right.content}
        </Pane>
      )}
    </div>,
    document.body,
  );
}

function Pane({
  breadcrumbs, title, subtitle, widthPx, children, onClose, onBack, slideFrom, bordered,
}: {
  breadcrumbs: string[]; title: string; subtitle?: string; widthPx: number;
  children: ReactNode; onClose: () => void; onBack?: () => void;
  slideFrom: "right"; bordered?: boolean;
}) {
  return (
    <aside
      style={{ width: widthPx, maxWidth: "92vw" }}
      className={cn(
        "h-full flex flex-col bg-background border-l border-border shadow-2xl",
        "animate-in slide-in-from-right-4 duration-200",
      )}
    >
      <header className="shrink-0 border-b border-border px-4 py-2.5 flex items-start gap-2 bg-card/40">
        {onBack && (
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 mt-0.5" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">
            {breadcrumbs.join(" › ")}
          </div>
          <h2 className="text-sm font-semibold text-foreground leading-tight truncate mt-0.5">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </header>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>
    </aside>
  );
}

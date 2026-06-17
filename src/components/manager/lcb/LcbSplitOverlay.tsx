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
interface ExtraPane {
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
  extra?: ExtraPane | null;
  onCloseRight?: () => void;
  onCloseExtra?: () => void;
}

export function LcbSplitOverlay({ open, onClose, left, right, extra, onCloseRight, onCloseExtra }: Props) {
  useForceSidebarCollapse(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (extra && onCloseExtra) onCloseExtra();
      else if (right && onCloseRight) onCloseRight();
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, right, onCloseRight, extra, onCloseExtra]);

  if (!open || !left) return null;

  const showExtra = !!extra;

  return createPortal(
    <div className="fixed inset-0 top-14 z-[60] flex">
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className="flex-1 bg-background/40 backdrop-blur-md animate-in fade-in duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
      <div className="relative h-full flex">
        <div
          className={cn(
            "relative h-full shrink-0 transition-all duration-500 ease-out",
            showExtra && right && "-mr-32 blur-[2px]",
          )}
        >
          <Pane
            breadcrumbs={left.breadcrumbs}
            title={left.title}
            subtitle={left.subtitle}
            width={left.width ?? (right ? "clamp(360px, 30vw, 520px)" : "clamp(720px, 70vw, 1100px)")}
            onBack={left.onBack}
            onClose={onClose}
            slideFrom="right"
            bordered
          >
            {left.content}
          </Pane>
          {right && (
            <button
              type="button"
              aria-label={showExtra ? "Sluit communicatie" : "Sluit detail"}
              onClick={() => (showExtra ? onCloseExtra?.() : onCloseRight?.())}
              className={cn(
                "absolute inset-0 cursor-pointer z-[1] animate-in fade-in duration-300",
                showExtra && "bg-background/40 backdrop-blur-sm",
              )}
            />
          )}
        </div>

        {right && (
          <div className={cn(
            "relative z-[1] transition-all duration-500 ease-out",
          )}>
            <Pane
              breadcrumbs={right.breadcrumbs}
              title={right.title}
              subtitle={right.subtitle}
              width={right.width ?? "clamp(720px, 62vw, 1100px)"}
              onClose={onCloseRight ?? onClose}
              slideFrom="right"
            >
              {right.content}
            </Pane>
          </div>
        )}
      </div>

      {extra && (
        <Pane
          breadcrumbs={extra.breadcrumbs}
          title={extra.title}
          subtitle={extra.subtitle}
          width={extra.width ?? "clamp(420px, 32vw, 560px)"}
          onClose={onCloseExtra ?? onClose}
          slideFrom="right"
          bordered
        >
          {extra.content}
        </Pane>
      )}
    </div>,
    document.body,
  );
}



function Pane({
  breadcrumbs, title, subtitle, width, children, onClose, onBack, slideFrom, bordered,
}: {
  breadcrumbs: string[]; title: string; subtitle?: string; width: number | string;
  children: ReactNode; onClose: () => void; onBack?: () => void;
  slideFrom: "right"; bordered?: boolean;
}) {
  return (
    <aside
      style={{ width, maxWidth: "92vw" }}
      className={cn(
        "h-full flex flex-col bg-background border-l border-border shadow-2xl",
        "animate-in slide-in-from-right-4 duration-500",
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

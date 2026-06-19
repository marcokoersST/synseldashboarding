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
  devNote?: ReactNode;
}
interface RightPane {
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  width?: number | string;
  content: ReactNode;
  devNote?: ReactNode;
}
interface ExtraPane {
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  width?: number | string;
  content: ReactNode;
  devNote?: ReactNode;
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
    <div data-lcb-portal className="lcb-skin fixed inset-0 top-14 z-[60] flex">
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className="flex-1 bg-foreground/40 backdrop-blur-md animate-in fade-in duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
      <div className="relative h-full flex">
        <div
          className={cn(
            "relative h-full shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            showExtra && right && "-mr-32 blur-[2px]",
          )}
        >
          <Pane
            breadcrumbs={left.breadcrumbs}
            title={left.title}
            subtitle={left.subtitle}
            width={left.width ?? (right ? "clamp(324px, 27vw, 468px)" : "clamp(648px, 63vw, 990px)")}
            onBack={left.onBack}
            onClose={onClose}
            slideFrom="right"
            bordered
            devNote={left.devNote}
          >
            {left.content}
          </Pane>
          {right && showExtra && (
            <button
              type="button"
              aria-label="Sluit communicatie"
              onClick={() => onCloseExtra?.()}
              className="absolute inset-0 cursor-pointer z-[1] bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          )}
        </div>

        {right && (
          <div className={cn(
            "relative z-[1] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}>
            <Pane
              breadcrumbs={right.breadcrumbs}
              title={right.title}
              subtitle={right.subtitle}
              width={right.width ?? "clamp(648px, 56vw, 990px)"}
              onClose={onCloseRight ?? onClose}
              slideFrom="right"
              devNote={right.devNote}
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
          width={extra.width ?? "clamp(378px, 29vw, 504px)"}
          onClose={onCloseExtra ?? onClose}
          slideFrom="right"
          bordered
          devNote={extra.devNote}
        >
          {extra.content}
        </Pane>
      )}
    </div>,
    document.body,
  );
}



function Pane({
  breadcrumbs, title, subtitle, width, children, onClose, onBack, slideFrom, bordered, devNote,
}: {
  breadcrumbs: string[]; title: string; subtitle?: string; width: number | string;
  children: ReactNode; onClose: () => void; onBack?: () => void;
  slideFrom: "right"; bordered?: boolean; devNote?: ReactNode;
}) {
  return (
    <aside
      style={{ width, maxWidth: "92vw" }}
      className={cn(
        "relative h-full flex flex-col bg-background border-l border-border shadow-2xl",
        "animate-in slide-in-from-right-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
      {devNote}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>
    </aside>
  );
}

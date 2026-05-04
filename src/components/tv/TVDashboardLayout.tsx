import { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { Monitor, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTopBarActions } from "@/components/layout/AppLayout";

const TVCompactContext = createContext(false);
export const useTVCompact = () => useContext(TVCompactContext);

interface TVDashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export function TVDashboardLayout({ title, children }: TVDashboardLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("fullscreen") === "true";
  });
  const { setActions } = useTopBarActions();

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        // Fullscreen API may fail in iframes — UI overlay still works
      }
      setIsFullscreen(true);
    } else {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (err) {
        // ignore
      }
      setIsFullscreen(false);
    }
  };

  // Inject TV Modus button into TopBar when not in fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setActions(
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Monitor className="w-4 h-4" />
          TV Modus
        </button>
      );
    }
    return () => setActions(null);
  }, [isFullscreen]);

  return (
    <TVCompactContext.Provider value={isFullscreen}>
      <div
        className={cn(
          isFullscreen
            ? "fixed inset-0 bg-white text-foreground overflow-hidden z-[9999] tv-mode"
            : ""
        )}
        style={
          isFullscreen
            ? ({
                ["--tv-unit" as any]: "clamp(0.55rem, 0.55vh + 0.35vw, 1.15rem)",
                fontSize: "var(--tv-unit)",
              } as React.CSSProperties)
            : undefined
        }
      >
        <div
          className={cn(isFullscreen && "h-screen flex flex-col")}
          style={isFullscreen ? { padding: "clamp(0.4rem, 0.9vh, 1rem)" } : undefined}
        >
          {isFullscreen && (
            <div className="flex items-center justify-end" style={{ marginBottom: "clamp(0.25rem, 0.5vh, 0.5rem)" }}>
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border"
              >
                <X className="w-3 h-3" />
                Sluiten
              </button>
            </div>
          )}
          {!isFullscreen && (
            <h1 className="text-2xl font-bold text-foreground mb-8">{title}</h1>
          )}
          <div className={cn(isFullscreen && "flex-1 min-h-0 overflow-hidden @container")}>
            {children}
          </div>
        </div>
      </div>
    </TVCompactContext.Provider>
  );
}

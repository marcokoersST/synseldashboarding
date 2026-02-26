import { useState, ReactNode, createContext, useContext } from "react";
import { Monitor, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <TVCompactContext.Provider value={isFullscreen}>
      <div
        className={cn(
          isFullscreen
            ? "fixed inset-0 bg-white text-foreground overflow-hidden z-[9999] tv-mode"
            : "p-2"
        )}
      >
        <div className={cn(isFullscreen && "p-4 h-screen flex flex-col")}>
          <div className={cn("flex items-center justify-between", isFullscreen ? "mb-2" : "mb-8")}>
            <h1 className={cn("font-bold text-foreground", isFullscreen ? "text-xl" : "text-2xl")}>{title}</h1>
            <button
              onClick={toggleFullscreen}
              className={cn(
                "flex items-center gap-2 rounded-lg transition-colors border border-border",
                isFullscreen
                  ? "px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-xs text-foreground"
                  : "px-4 py-2 bg-card hover:bg-secondary text-sm text-foreground"
              )}
            >
              {isFullscreen ? <X className="w-3 h-3" /> : <Monitor className="w-4 h-4" />}
              {isFullscreen ? "Sluiten" : "TV Modus"}
            </button>
          </div>
          <div className={cn(isFullscreen && "flex-1 min-h-0 overflow-hidden")}>
            {children}
          </div>
        </div>
      </div>
    </TVCompactContext.Provider>
  );
}

import { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { Monitor, X } from "lucide-react";

const TVCompactContext = createContext(false);
export const useTVCompact = () => useContext(TVCompactContext);

interface TVDashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export function TVDashboardLayout({ title, children }: TVDashboardLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  if (isFullscreen) {
    return (
      <TVCompactContext.Provider value={true}>
        <div className="fixed inset-0 bg-white text-foreground overflow-hidden z-[9999] tv-mode">
          <div className="p-4 h-screen flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold">{title}</h1>
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-xs text-foreground border border-border"
              >
                <X className="w-3 h-3" />
                Sluiten
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </TVCompactContext.Provider>
    );
  }

  return (
    <TVCompactContext.Provider value={false}>
      <div className="p-2">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-sm text-foreground"
          >
            <Monitor className="w-4 h-4" />
            TV Modus
          </button>
        </div>
        {children}
      </div>
    </TVCompactContext.Provider>
  );
}

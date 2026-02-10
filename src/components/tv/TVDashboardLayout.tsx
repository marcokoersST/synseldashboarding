import { useState, useEffect, ReactNode } from "react";
import { Monitor, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

interface TVDashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export function TVDashboardLayout({ title, children }: TVDashboardLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white text-foreground overflow-auto z-[9999]">
        <div className="p-8 min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm text-foreground border border-border"
            >
              <X className="w-4 h-4" />
              Sluiten
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
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
      </main>
    </div>
  );
}

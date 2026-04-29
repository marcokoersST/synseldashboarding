import { useEffect, useRef, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { InsightsDrawer } from "@/components/dashboard/InsightsDrawer";
import { consultantInsights } from "@/data/consultantInsightsData";
import { cn } from "@/lib/utils";

// Context for pages to inject actions into the TopBar
interface TopBarActionsContextType {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const TopBarActionsContext = createContext<TopBarActionsContextType>({
  actions: null,
  setActions: () => {},
});

export const useTopBarActions = () => useContext(TopBarActionsContext);

const STORAGE_KEY = "synsel-insights-read";

function getReadIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [topBarActions, setTopBarActions] = useState<ReactNode>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(getReadIds);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const isSysteemHygiene = pathname === "/concepts/systeem-hygiene";

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const persistRead = useCallback((ids: string[]) => {
    setReadIds(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    persistRead([...new Set([...readIds, id])]);
  }, [readIds, persistRead]);

  const handleMarkAllRead = useCallback(() => {
    persistRead(consultantInsights.map(i => i.id));
  }, [persistRead]);

  const unreadCount = consultantInsights.filter(i => !readIds.includes(i.id)).length;
  const latestUnread = consultantInsights.find(i => !readIds.includes(i.id));

  return (
    <TopBarActionsContext.Provider value={{ actions: topBarActions, setActions: setTopBarActions }}>
      <div className="h-screen bg-sidebar flex overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(prev => !prev)} />
        <div className={`${isCollapsed ? 'ml-16' : 'ml-52'} flex-1 flex flex-col h-screen min-w-0 transition-[margin-left] duration-300 ease-in-out`}>
          {!isSysteemHygiene && (
            <TopBar
              latestInsight={latestUnread?.message}
              unreadCount={unreadCount}
              onOpenInsights={() => setDrawerOpen(true)}
            >
              {topBarActions}
            </TopBar>
          )}
          <main
            ref={mainRef}
            className={cn(
              "flex-1 bg-background overflow-y-auto overflow-x-hidden scrollbar-thin overscroll-contain min-w-0",
              isSysteemHygiene ? "p-0 rounded-none" : "p-6 rounded-tl-2xl",
            )}
          >
            <Outlet />
          </main>
        </div>
      </div>

      <InsightsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        insights={consultantInsights}
        readIds={readIds}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </TopBarActionsContext.Provider>
  );
}

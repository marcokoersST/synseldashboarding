import { useEffect, useRef, useState, createContext, useContext, ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

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

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [topBarActions, setTopBarActions] = useState<ReactNode>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <TopBarActionsContext.Provider value={{ actions: topBarActions, setActions: setTopBarActions }}>
      <div className="h-screen bg-sidebar flex overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(prev => !prev)} />
        <div className={`${isCollapsed ? 'ml-16' : 'ml-52'} flex-1 flex flex-col h-screen min-w-0 transition-[margin-left] duration-300 ease-in-out`}>
          <TopBar>{topBarActions}</TopBar>
          <main ref={mainRef} className="flex-1 bg-background rounded-tl-2xl p-6 overflow-y-auto overflow-x-hidden scrollbar-thin overscroll-contain min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </TopBarActionsContext.Provider>
  );
}

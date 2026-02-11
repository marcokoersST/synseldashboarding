import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="h-screen bg-background flex">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(prev => !prev)} />
      <div className={`${isCollapsed ? 'ml-16' : 'ml-64'} flex-1 flex flex-col h-screen transition-[margin-left] duration-300 ease-in-out`}>
        <TopBar />
        <main ref={mainRef} className="flex-1 p-6 overflow-y-auto scrollbar-thin overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

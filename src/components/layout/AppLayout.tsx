import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen bg-background flex">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(prev => !prev)} />
      <div className={`${isCollapsed ? 'ml-16' : 'ml-64'} flex-1 flex flex-col h-screen transition-[margin-left] duration-300`}>
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto scrollbar-thin overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

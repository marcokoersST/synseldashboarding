import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export function AppLayout() {
  return (
    <div className="h-screen bg-background flex">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col h-screen">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto scrollbar-thin overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

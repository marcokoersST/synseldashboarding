import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

interface ConsultantLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function ConsultantLayout({ children, title, subtitle }: ConsultantLayoutProps) {
  return (
    <div className="h-screen bg-background flex">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col h-screen">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto scrollbar-thin overscroll-contain">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

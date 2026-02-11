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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <TopBar />
        <main className="p-6 overflow-auto scrollbar-thin overscroll-contain">
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

import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ManagerRevenueLeaderboard } from "@/components/manager/ManagerRevenueLeaderboard";
import { TeamPlacementsCard } from "@/components/manager/TeamPlacementsCard";
import { CompanyPlacementsCard } from "@/components/manager/CompanyPlacementsCard";

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <TopBar />
        
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overzicht van team en bedrijfsprestaties
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-3 gap-5">
            {/* Revenue Leaderboard - 2 columns */}
            <div className="col-span-2">
              <ManagerRevenueLeaderboard delay={100} />
            </div>
            
            {/* Team Placements - 1 column */}
            <div className="col-span-1">
              <TeamPlacementsCard delay={200} />
            </div>
            
            {/* Company Placements - Full width or adjust as needed */}
            <div className="col-span-1">
              <CompanyPlacementsCard delay={300} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

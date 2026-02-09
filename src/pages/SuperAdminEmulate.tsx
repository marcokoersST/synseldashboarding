import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { UserSelector } from "@/components/admin/UserSelector";
import { EmulationBanner } from "@/components/admin/EmulationBanner";
import { EmulationUser } from "@/data/adminData";
import { Eye } from "lucide-react";

// Lazy-load the dashboards to embed them
import Index from "./Index";
import ManagerDashboard from "./ManagerDashboard";

export default function SuperAdminEmulate() {
  const [selectedUser, setSelectedUser] = useState<EmulationUser | null>(null);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">User Emulatie</h1>
            <p className="text-sm text-muted-foreground mt-1">Bekijk het dashboard vanuit het perspectief van een andere gebruiker</p>
          </div>

          <UserSelector selectedUser={selectedUser} onSelectUser={setSelectedUser} />

          {selectedUser && (
            <>
              <EmulationBanner user={selectedUser} onStop={() => setSelectedUser(null)} />
              
              {/* Embedded dashboard based on user role */}
              <div className="border border-border rounded-xl overflow-hidden">
                {selectedUser.role === "consultant" ? (
                  <EmulatedConsultantDashboard userName={selectedUser.name} />
                ) : (
                  <EmulatedManagerDashboard userName={selectedUser.name} />
                )}
              </div>
            </>
          )}

          {!selectedUser && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Geen gebruiker geselecteerd</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Selecteer een consultant of manager hierboven om hun dashboard te bekijken alsof je bent ingelogd als die gebruiker.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Simplified embedded views that reuse existing dashboard content without the sidebar/topbar
function EmulatedConsultantDashboard({ userName }: { userName: string }) {
  return (
    <div className="p-6 bg-background">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-semibold text-foreground">Dashboard van {userName}</h2>
        <p className="text-xs text-muted-foreground">Consultant dashboard weergave (read-only)</p>
      </div>
      {/* We render the Index page content inline - stripped of sidebar/topbar */}
      <IndexContent />
    </div>
  );
}

function EmulatedManagerDashboard({ userName }: { userName: string }) {
  return (
    <div className="p-6 bg-background">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-semibold text-foreground">Manager Dashboard van {userName}</h2>
        <p className="text-xs text-muted-foreground">Manager dashboard weergave (read-only)</p>
      </div>
      <ManagerContent />
    </div>
  );
}

// Extracted dashboard content without layout wrappers
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { ForecastGoalsCard } from "@/components/dashboard/ForecastGoalsCard";
import { SalaryProgressCard } from "@/components/dashboard/SalaryProgressCard";
import { PlacementsCard } from "@/components/dashboard/PlacementsCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TeamLeaderboard } from "@/components/dashboard/TeamLeaderboard";
import { RevenueTargetCard } from "@/components/dashboard/RevenueTargetCard";
import { PerformanceScoreCard } from "@/components/dashboard/PerformanceScoreCard";
import { CoreActivitiesCard } from "@/components/dashboard/CoreActivitiesCard";
import { VacancyActivitiesCard } from "@/components/dashboard/VacancyActivitiesCard";
import { RecruitmentFunnel } from "@/components/dashboard/RecruitmentFunnel";
import { ChatWidget } from "@/components/dashboard/ChatWidget";
import { CommunicationStatsCard } from "@/components/dashboard/CommunicationStatsCard";
import { AINpsCard } from "@/components/dashboard/AINpsCard";
import { ForecastGoalsProvider } from "@/contexts/ForecastGoalsContext";
import { ManagerRevenueLeaderboard } from "@/components/manager/ManagerRevenueLeaderboard";
import { TeamPlacementsCard } from "@/components/manager/TeamPlacementsCard";
import { CompanyPlacementsCard } from "@/components/manager/CompanyPlacementsCard";

function IndexContent() {
  return (
    <ForecastGoalsProvider>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <SalaryProgressCard delay={100} />
        <PlacementsCard delay={200} />
        <GoalsCard delay={300} />
      </div>
      <div className="mb-4">
        <RevenueChart delay={400} />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <TeamLeaderboard delay={500} />
        </div>
        <div className="space-y-4">
          <RevenueTargetCard delay={600} />
          <PerformanceScoreCard delay={700} />
          <AINpsCard delay={800} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 h-full">
          <CommunicationStatsCard delay={750} />
        </div>
        <ChatWidget delay={850} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <CoreActivitiesCard delay={900} />
        <VacancyActivitiesCard delay={950} />
        <RecruitmentFunnel delay={1000} />
      </div>
    </ForecastGoalsProvider>
  );
}

function ManagerContent() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2">
        <ManagerRevenueLeaderboard delay={100} />
      </div>
      <div className="col-span-1">
        <TeamPlacementsCard delay={200} />
      </div>
      <div className="col-span-1">
        <CompanyPlacementsCard delay={300} />
      </div>
    </div>
  );
}

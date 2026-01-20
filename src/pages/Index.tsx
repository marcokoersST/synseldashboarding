import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { SalaryProgressCard } from "@/components/dashboard/SalaryProgressCard";
import { PlacementsCard } from "@/components/dashboard/PlacementsCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TeamLeaderboard } from "@/components/dashboard/TeamLeaderboard";
import { RevenueTargetCard } from "@/components/dashboard/RevenueTargetCard";
import { PerformanceScoreCard } from "@/components/dashboard/PerformanceScoreCard";
import { CoreActivitiesCard } from "@/components/dashboard/CoreActivitiesCard";
import { RecruitmentFunnel } from "@/components/dashboard/RecruitmentFunnel";
import { ChatWidget } from "@/components/dashboard/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <TopBar />
        
        {/* Dashboard Content */}
        <main className="p-6 overflow-auto scrollbar-thin">
          <WelcomeHeader />
          
          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Doelen & Projecties (3 maanden)</h2>
          </div>
          
          {/* Top Row - Progress Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <SalaryProgressCard />
            <PlacementsCard />
            <GoalsCard />
          </div>
          
          {/* Revenue Chart - Full Width */}
          <div className="mb-4">
            <RevenueChart />
          </div>
          
          {/* Middle Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <TeamLeaderboard />
            <RevenueTargetCard />
            <PerformanceScoreCard />
          </div>
          
          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <CoreActivitiesCard />
            <RecruitmentFunnel />
            <ChatWidget />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

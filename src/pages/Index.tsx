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
import { CommunicationStatsCard } from "@/components/dashboard/CommunicationStatsCard";

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
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold text-foreground">Doelen & Projecties (3 maanden)</h2>
          </div>
          
          {/* Top Row - Progress Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <SalaryProgressCard delay={100} />
            <PlacementsCard delay={200} />
            <GoalsCard delay={300} />
          </div>
          
          {/* Revenue Chart - Full Width */}
          <div className="mb-4">
            <RevenueChart delay={400} />
          </div>
          
          {/* Middle Row - Team Leaderboard takes 2 columns */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <TeamLeaderboard delay={500} />
            </div>
            <div className="space-y-4">
              <RevenueTargetCard delay={600} />
              <PerformanceScoreCard delay={700} />
            </div>
          </div>
          
          {/* Communication Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2 h-full">
              <CommunicationStatsCard delay={750} />
            </div>
            <ChatWidget delay={850} />
          </div>
          
          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <CoreActivitiesCard delay={900} />
            <RecruitmentFunnel delay={1000} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

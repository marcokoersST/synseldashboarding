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
import { ReverseMatchingCard } from "@/components/dashboard/ReverseMatchingCard";
import { ChatWidget } from "@/components/dashboard/ChatWidget";
import { CallsStatsCard, EmailStatsCard } from "@/components/dashboard/CommunicationStatsCard";
import { AINpsCard } from "@/components/dashboard/AINpsCard";
import { ForecastGoalsProvider } from "@/contexts/ForecastGoalsContext";

const Index = () => {
  return (
    <ForecastGoalsProvider>
      {/* Welcome Header + Forecast Goals */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <WelcomeHeader />
        <ForecastGoalsCard delay={50} />
      </div>
    
      {/* Section Title */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-lg font-semibold text-foreground">Doelen & Projecties (3 maanden)</h2>
      </div>
      
      {/* Top Row - Progress Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4" style={{ height: '480px' }}>
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
      
      {/* Reverse Matching Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <ReverseMatchingCard delay={800} />
        </div>
        <AINpsCard delay={820} />
      </div>

      {/* Communication Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <CallsStatsCard delay={850} />
        <EmailStatsCard delay={900} />
        <ChatWidget delay={950} />
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <CoreActivitiesCard delay={900} />
        <VacancyActivitiesCard delay={950} />
        <RecruitmentFunnel delay={1000} />
      </div>
    </ForecastGoalsProvider>
  );
};

export default Index;

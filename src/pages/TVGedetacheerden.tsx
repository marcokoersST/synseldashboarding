import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { DeployedOverview } from "@/components/tv/DeployedOverview";
import { RevenuePeriodsChart } from "@/components/tv/RevenuePeriodsChart";
import { BonusCard } from "@/components/tv/BonusCard";

export default function TVGedetacheerden() {
  return (
    <TVDashboardLayout title="Gedetacheerden & Financieel Overzicht">
      <DeployedOverview />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <RevenuePeriodsChart />
        <BonusCard />
      </div>
    </TVDashboardLayout>
  );
}

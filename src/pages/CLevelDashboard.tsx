import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { RevenueTile } from "@/components/clevel/RevenueTile";
import { MarginTile } from "@/components/clevel/MarginTile";
import { PlacementsTile } from "@/components/clevel/PlacementsTile";
import { ForecastTile } from "@/components/clevel/ForecastTile";
import { SalesFunnelTile } from "@/components/clevel/SalesFunnelTile";
import { ProductivityTile } from "@/components/clevel/ProductivityTile";
import { UnitPerformanceTile } from "@/components/clevel/UnitPerformanceTile";
import { FunnelQualityTile } from "@/components/clevel/FunnelQualityTile";
import { WorkforceHealthTile } from "@/components/clevel/WorkforceHealthTile";
import { RiskAlertsTile } from "@/components/clevel/RiskAlertsTile";
import { StrategicInitiativesTile } from "@/components/clevel/StrategicInitiativesTile";
import { ExecutiveSummaryTile } from "@/components/clevel/ExecutiveSummaryTile";

export default function CLevelDashboard() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">C-Level Dashboard</h1>
        <p className="text-muted-foreground text-sm">Executive overzicht van Synsel Techniek</p>
      </div>

      {/* Top row — Executive Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard delay={0}><RevenueTile /></AnimatedCard>
        <AnimatedCard delay={50}><MarginTile /></AnimatedCard>
        <AnimatedCard delay={100}><PlacementsTile /></AnimatedCard>
        <AnimatedCard delay={150}><ForecastTile /></AnimatedCard>
      </div>

      {/* Middle row — Business Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard delay={200}><SalesFunnelTile /></AnimatedCard>
        <AnimatedCard delay={250}><ProductivityTile /></AnimatedCard>
        <AnimatedCard delay={300}><UnitPerformanceTile /></AnimatedCard>
        <AnimatedCard delay={350}><FunnelQualityTile /></AnimatedCard>
      </div>

      {/* Bottom row — Control & Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard delay={400}><WorkforceHealthTile /></AnimatedCard>
        <AnimatedCard delay={450}><RiskAlertsTile /></AnimatedCard>
        <AnimatedCard delay={500}><StrategicInitiativesTile /></AnimatedCard>
        <AnimatedCard delay={550}><ExecutiveSummaryTile /></AnimatedCard>
      </div>
    </div>
  );
}

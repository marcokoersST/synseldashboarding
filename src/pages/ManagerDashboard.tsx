import { ManagerRevenueLeaderboard } from "@/components/manager/ManagerRevenueLeaderboard";
import { TeamPlacementsCard } from "@/components/manager/TeamPlacementsCard";
import { CompanyPlacementsCard } from "@/components/manager/CompanyPlacementsCard";
import { ProjectionCard } from "@/components/dashboard/ProjectionCard";
import { teamProjections } from "@/data/projectionData";

export default function ManagerDashboard() {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overzicht van team en bedrijfsprestaties
        </p>
      </div>

      {/* Dashboard Grid */}
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

      {/* Projection Cards */}
      <div className="grid grid-cols-2 gap-5 mt-5">
        <ProjectionCard
          title="Projectie Plaatsingen"
          description="Gebaseerd op het aantal gesprekken"
          data={teamProjections.plaatsingen}
          inputMetrics={teamProjections.plaatsingenMetrics}
          delay={400}
        />
        <ProjectionCard
          title="Projectie Gesprekken"
          description="Gebaseerd op acquisities, telefoonduur en e-mails"
          data={teamProjections.gesprekken}
          inputMetrics={teamProjections.gesprekkenMetrics}
          delay={450}
        />
      </div>
    </>
  );
}

import { ManagerSalesFunnel } from "@/components/manager/ManagerSalesFunnel";
import { OpvolgingCard } from "@/components/manager/OpvolgingCard";
import { ManagerCallsCard } from "@/components/manager/ManagerCallsCard";
import { ProcesKernvaardighedenCard } from "@/components/manager/ProcesKernvaardighedenCard";
import { ManagerGoalsCard } from "@/components/manager/ManagerGoalsCard";
import { ManagerRevenueChart } from "@/components/manager/ManagerRevenueChart";
import { ManagerPlacementsCard } from "@/components/manager/ManagerPlacementsCard";
import { ManagerRevenueLeaderboard } from "@/components/manager/ManagerRevenueLeaderboard";

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

      {/* ═══ SECTIE 1: OPERATIONEEL ═══ */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Operationeel</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        <ManagerSalesFunnel delay={100} />
        <div className="mt-5">
          <OpvolgingCard delay={150} />
        </div>
        <div className="mt-5">
          <ManagerCallsCard delay={200} />
        </div>
      </section>

      {/* ═══ SECTIE 2: PERFORMANCE ═══ */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Performance</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <ProcesKernvaardighedenCard delay={250} />
          </div>
          <div className="col-span-1">
            <ManagerGoalsCard delay={300} />
          </div>
        </div>
      </section>

      {/* ═══ SECTIE 3: OMZET ═══ */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Omzet</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="mb-5">
          <ManagerRevenueChart delay={350} />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1">
            <ManagerPlacementsCard delay={400} />
          </div>
          <div className="col-span-2">
            <ManagerRevenueLeaderboard delay={450} />
          </div>
        </div>
      </section>
    </>
  );
}

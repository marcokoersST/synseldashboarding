import { DepartmentKPICard } from "@/components/admin/DepartmentKPICard";
import { CompanyLeaderboard } from "@/components/admin/CompanyLeaderboard";
import { DepartmentRevenueChart } from "@/components/admin/DepartmentRevenueChart";
import { departments } from "@/data/adminData";
import { ProjectionCard } from "@/components/dashboard/ProjectionCard";
import { companyProjections } from "@/data/projectionData";

export default function SuperAdminDashboard() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overzicht van alle afdelingen en consultants</p>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {departments.map((dept, i) => (
          <DepartmentKPICard
            key={dept.id}
            departmentId={dept.id}
            departmentName={dept.name}
            color={dept.color}
            delay={100 + i * 100}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <CompanyLeaderboard delay={400} />
        </div>
        <div className="col-span-1">
          <DepartmentRevenueChart delay={500} />
        </div>
      </div>

      {/* Projection Cards */}
      <div className="grid grid-cols-2 gap-5 mt-5">
        <ProjectionCard
          title="Projectie Plaatsingen"
          description="Gebaseerd op het aantal gesprekken"
          data={companyProjections.plaatsingen}
          inputMetrics={companyProjections.plaatsingenMetrics}
          delay={600}
        />
        <ProjectionCard
          title="Projectie Gesprekken"
          description="Gebaseerd op acquisities, telefoonduur en e-mails"
          data={companyProjections.gesprekken}
          inputMetrics={companyProjections.gesprekkenMetrics}
          delay={650}
        />
      </div>
    </>
  );
}

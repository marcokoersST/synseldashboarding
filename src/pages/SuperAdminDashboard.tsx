import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DepartmentKPICard } from "@/components/admin/DepartmentKPICard";
import { CompanyLeaderboard } from "@/components/admin/CompanyLeaderboard";
import { DepartmentRevenueChart } from "@/components/admin/DepartmentRevenueChart";
import { departments } from "@/data/adminData";

export default function SuperAdminDashboard() {
  return (
    <div className="h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto overscroll-contain">
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
        </main>
      </div>
    </div>
  );
}

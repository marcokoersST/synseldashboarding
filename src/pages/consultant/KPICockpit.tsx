import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { KPITile } from "@/components/consultant/KPITile";
import { kpiData } from "@/data/consultantData";

export default function KPICockpit() {
  return (
    <ConsultantLayout title="KPI Cockpit" subtitle="De 10 cijfers die je elke dag wil zien">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiData.map((kpi, i) => (
          <KPITile key={kpi.id} label={kpi.label} today={kpi.today} week={kpi.week} target={kpi.target} sparkline={kpi.sparkline} delay={i * 50} />
        ))}
      </div>
    </ConsultantLayout>
  );
}

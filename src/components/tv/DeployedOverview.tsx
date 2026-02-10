import { Users, PlayCircle, StopCircle } from "lucide-react";
import { deployedStats, deployedPersons } from "@/data/tvData";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Actief", className: "text-accent" },
  starting: { label: "Start binnenkort", className: "text-primary" },
  ending: { label: "Gaat stoppen", className: "text-destructive" },
};

export function DeployedOverview() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Gedetacheerd", value: deployedStats.active, color: "text-accent" },
          { icon: PlayCircle, label: "Nog te starten", value: deployedStats.starting, color: "text-primary" },
          { icon: StopCircle, label: "Gaat stoppen", value: deployedStats.ending, color: "text-destructive" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl p-5 border border-border text-center">
            <kpi.icon className={cn("w-6 h-6 mx-auto mb-2", kpi.color)} />
            <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Momenteel Gedetacheerd</h3>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Naam</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Bedrijf</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Start</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Eind</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Consultant</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {deployedPersons.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="p-3 text-foreground font-medium">{p.name}</td>
                  <td className="p-3 text-foreground">{p.company}</td>
                  <td className="p-3 text-muted-foreground">{new Date(p.startDate).toLocaleDateString("nl-NL")}</td>
                  <td className="p-3 text-muted-foreground">{p.endDate ? new Date(p.endDate).toLocaleDateString("nl-NL") : "—"}</td>
                  <td className="p-3 text-foreground">{p.consultant}</td>
                  <td className="p-3">
                    <span className={cn("text-xs font-medium", statusConfig[p.status].className)}>
                      {statusConfig[p.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

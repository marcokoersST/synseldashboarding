import { useState } from "react";
import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { ranglijstenColumns, ranglijstenFilters } from "@/data/ranglijstenData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TVRanglijsten() {
  const [jaar, setJaar] = useState("2026");
  const [periode, setPeriode] = useState("Week");
  const [unit, setUnit] = useState("Unit");

  return (
    <TVDashboardLayout title="Ranglijsten">
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={jaar} onValueChange={setJaar}>
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Jaar" />
          </SelectTrigger>
          <SelectContent>
            {ranglijstenFilters.jaren.map((j) => (
              <SelectItem key={j} value={String(j)}>Jaar: {j}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={periode} onValueChange={setPeriode}>
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Periode" />
          </SelectTrigger>
          <SelectContent>
            {ranglijstenFilters.periodes.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {ranglijstenFilters.units.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ranking Columns */}
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${ranglijstenColumns.length}, minmax(0, 1fr))` }}>
        {ranglijstenColumns.map((col) => (
          <div key={col.title} className="min-w-0">
            <h2 className="text-sm font-semibold text-muted-foreground mb-1 truncate">{col.title}</h2>
            <p className="text-3xl font-bold text-foreground mb-4 tabular-nums">
              {col.total.toLocaleString("nl-NL")}
            </p>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-0">
                {col.entries.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    className="flex items-center gap-2 py-1.5 border-b border-border/40 text-sm"
                  >
                    <span className="text-muted-foreground w-6 text-right shrink-0">{entry.rank}.</span>
                    <span className="truncate flex-1 text-foreground">{entry.name}</span>
                    <span className="font-semibold text-foreground tabular-nums shrink-0">{entry.value}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </TVDashboardLayout>
  );
}

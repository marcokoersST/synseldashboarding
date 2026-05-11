import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { UnitOverviewTiles } from "@/components/prognose/UnitOverviewTiles";
import { PrognoseTable } from "@/components/prognose/PrognoseTable";
import { InterventionPanel } from "@/components/prognose/InterventionPanel";
import { prognoseRows, type PrognoseConsultantRow } from "@/data/prognoseData";

export default function PrognoseDashboard() {
  const allUnits = useMemo(() => Array.from(new Set(prognoseRows.map((r) => r.unit))).sort(), []);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(allUnits);
  const [active, setActive] = useState<PrognoseConsultantRow | null>(null);

  const filteredRows = useMemo(
    () => prognoseRows.filter((r) => selectedUnits.includes(r.unit)),
    [selectedUnits],
  );

  const toggleUnit = (u: string) =>
    setSelectedUnits((p) => (p.includes(u) ? p.filter((x) => x !== u) : [...p, u]));

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prognose Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Forecast en interventies per sales-consultant
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Units ({selectedUnits.length}/{allUnits.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Filter op unit</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelectedUnits(allUnits)}>
                  Alles aan
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelectedUnits([])}>
                  Alles uit
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              {allUnits.map((u) => (
                <label key={u} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedUnits.includes(u)} onCheckedChange={() => toggleUnit(u)} />
                  {u}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-6">
        <UnitOverviewTiles rows={filteredRows} onSelectConsultant={setActive} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Consultant output</h2>
        <PrognoseTable rows={filteredRows} onIntervene={setActive} />
      </div>

      <InterventionPanel row={active} onClose={() => setActive(null)} />
    </>
  );
}

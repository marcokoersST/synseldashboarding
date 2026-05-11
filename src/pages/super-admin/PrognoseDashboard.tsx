import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, Plus, Check } from "lucide-react";
import { UnitOverviewTiles } from "@/components/prognose/UnitOverviewTiles";
import { PrognoseTable } from "@/components/prognose/PrognoseTable";
import { InterventionPanel } from "@/components/prognose/InterventionPanel";
import { InsightsStrip } from "@/components/prognose/InsightsStrip";
import { PeriodFilter } from "@/components/prognose/PeriodFilter";
import { ConsultantOutputVisuals } from "@/components/prognose/ConsultantOutputVisuals";
import { cn } from "@/lib/utils";
import {
  PrognosePeriodProvider,
  usePrognosePeriod,
} from "@/contexts/PrognosePeriodContext";
import {
  prognoseRows,
  scaleRow,
  redMetricCount,
  type PrognoseConsultantRow,
  type BottleneckCategory,
} from "@/data/prognoseData";

function PrognoseDashboardInner() {
  const { scale, offset } = usePrognosePeriod();
  const allUnits = useMemo(() => Array.from(new Set(prognoseRows.map((r) => r.unit))).sort(), []);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(allUnits);
  const [active, setActive] = useState<PrognoseConsultantRow | null>(null);
  const [bottleneckFilter, setBottleneckFilter] = useState<BottleneckCategory | null>(null);
  const [mindsetOnly, setMindsetOnly] = useState(false);

  // Re-render on status override changes
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("prognose-status-changed", h);
    return () => window.removeEventListener("prognose-status-changed", h);
  }, []);

  const scaledRows = useMemo(
    () => prognoseRows.map((r) => scaleRow(r, scale, offset)),
    [scale, offset],
  );

  const filteredRows = useMemo(() => {
    let rows = scaledRows.filter((r) => selectedUnits.includes(r.unit));
    if (bottleneckFilter) rows = rows.filter((r) => r.bottleneck === bottleneckFilter);
    if (mindsetOnly) rows = rows.filter((r) => redMetricCount(r) >= 4);
    return rows;
  }, [scaledRows, selectedUnits, bottleneckFilter, mindsetOnly]);

  // Active row needs to be re-resolved when scale changes
  const activeScaled = useMemo(
    () => (active ? scaledRows.find((r) => r.id === active.id) ?? null : null),
    [active, scaledRows],
  );


  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Prognose Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Forecast en interventies per sales-consultant
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodFilter />
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
              <p className="text-[10px] text-muted-foreground mb-2">
                Klik = alleen tonen · <Plus className="inline h-2.5 w-2.5" /> = toevoegen
              </p>
              <div className="space-y-1">
                {allUnits.map((u) => {
                  const active = selectedUnits.includes(u);
                  const soloed = active && selectedUnits.length === 1;
                  return (
                    <div
                      key={u}
                      className={cn(
                        "group flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm cursor-pointer border",
                        active ? "bg-primary/5 border-primary/30" : "border-transparent hover:bg-muted/60",
                      )}
                      onClick={() => setSelectedUnits([u])}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Check className={cn("h-3.5 w-3.5 shrink-0", active ? "text-primary" : "text-transparent")} />
                        <span className={cn("truncate", soloed && "font-semibold")}>{u}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnits((p) =>
                            p.includes(u) ? p.filter((x) => x !== u) : [...p, u],
                          );
                        }}
                        className={cn(
                          "shrink-0 h-6 w-6 rounded inline-flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity",
                          active
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                            : "border-border text-muted-foreground hover:bg-accent",
                        )}
                        aria-label={active ? `Verwijder ${u}` : `Voeg ${u} toe`}
                      >
                        <Plus className={cn("h-3 w-3", active && "rotate-45")} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mb-4">
        <UnitOverviewTiles rows={filteredRows} onSelectConsultant={setActive} />
      </div>

      <div className="mb-4">
        <InsightsStrip
          rows={scaledRows.filter((r) => selectedUnits.includes(r.unit))}
          bottleneckFilter={bottleneckFilter}
          onBottleneckFilter={setBottleneckFilter}
          mindsetOnly={mindsetOnly}
          onMindsetToggle={() => setMindsetOnly((v) => !v)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Consultant output</h2>
          {(bottleneckFilter || mindsetOnly) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Actieve filters:</span>
              {bottleneckFilter && (
                <button
                  onClick={() => setBottleneckFilter(null)}
                  className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {bottleneckFilter} ✕
                </button>
              )}
              {mindsetOnly && (
                <button
                  onClick={() => setMindsetOnly(false)}
                  className="px-2 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  Mindset risico ✕
                </button>
              )}
            </div>
          )}
        </div>
        <PrognoseTable rows={filteredRows} onIntervene={setActive} />
      </div>

      <InterventionPanel row={activeScaled} onClose={() => setActive(null)} />
    </>
  );
}

export default function PrognoseDashboard() {
  return (
    <PrognosePeriodProvider>
      <PrognoseDashboardInner />
    </PrognosePeriodProvider>
  );
}

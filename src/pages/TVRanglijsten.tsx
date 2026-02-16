import { useState, useEffect } from "react";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { ranglijstenWeekColumns, ranglijstenPeriodeColumns, ranglijstenFilters } from "@/data/ranglijstenData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function ComparisonBar({ current, previous }: { current: number; previous: number }) {
  const delta = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const max = Math.max(current, previous);
  const currentPct = max > 0 ? (current / max) * 100 : 0;
  const previousPct = max > 0 ? (previous / max) * 100 : 0;

  return (
    <div className="mt-2 space-y-1">
      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/25"
          style={{ width: `${previousPct}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700"
          style={{ width: `${currentPct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        <span className={cn("font-semibold", delta >= 0 ? "text-accent" : "text-destructive")}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(0)}%
        </span>
        {" "}t.o.v. vorige periode
      </p>
    </div>
  );
}

function getRankStyle(rank: number) {
  if (rank === 1) return "border-l-[3px] border-l-amber-400 bg-amber-50/50 font-semibold";
  if (rank === 2) return "border-l-[3px] border-l-slate-400 bg-amber-50/40 font-semibold";
  if (rank === 3) return "border-l-[3px] border-l-orange-400 bg-amber-50/30 font-semibold";
  if (rank <= 10) return "bg-muted/30";
  return "";
}

export default function TVRanglijsten() {
  const [jaar, setJaar] = useState("2026");
  const [periode, setPeriode] = useState("Week");
  const [unit, setUnit] = useState("Unit");
  const isCompact = useTVCompact();

  // Auto-swap between week and periode in TV mode
  const [autoView, setAutoView] = useState<"week" | "periode">("week");

  useEffect(() => {
    if (!isCompact) {
      setAutoView("week");
      return;
    }
    const interval = setInterval(() => {
      setAutoView((v) => (v === "week" ? "periode" : "week"));
    }, 10000);
    return () => clearInterval(interval);
  }, [isCompact]);

  // Determine active columns
  const activeView = isCompact ? autoView : (periode === "Periode" ? "periode" : "week");
  const columns = activeView === "periode" ? ranglijstenPeriodeColumns : ranglijstenWeekColumns;

  return (
    <TVDashboardLayout title="Ranglijsten">
      {/* Filters + TV indicator */}
      <div className="flex items-center gap-4 mb-4">
        {!isCompact && (
          <>
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
          </>
        )}

        {isCompact && (
          <>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Badge
                variant={autoView === "week" ? "default" : "secondary"}
                className="transition-all duration-300"
              >
                Week
              </Badge>
              <Badge
                variant={autoView === "periode" ? "default" : "secondary"}
                className="transition-all duration-300"
              >
                Periode
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Ranking Columns */}
      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <div key={col.title} className="min-w-0">
            <h2 className="text-xs font-semibold text-muted-foreground mb-1 truncate uppercase tracking-wide">{col.title}</h2>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {col.total.toLocaleString("nl-NL")}
            </p>
            <ComparisonBar current={col.total} previous={col.previousTotal} />

            <ScrollArea className={cn("mt-3", isCompact ? "h-[calc(100vh-240px)]" : "h-[calc(100vh-320px)]")}>
              <div className="space-y-0">
                {col.entries.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    className={cn(
                      "flex items-center gap-2 py-1.5 text-sm rounded-sm px-1.5",
                      entry.rank <= 10 ? "border-b border-border/20" : "border-b border-border/10",
                      getRankStyle(entry.rank)
                    )}
                  >
                    <span className={cn(
                      "w-5 text-right shrink-0 text-xs",
                      entry.rank <= 3 ? "font-bold" : "text-muted-foreground"
                    )}>
                      {entry.rank}.
                    </span>
                    <span className="truncate flex-1 text-foreground">{entry.name}</span>
                    <span className={cn(
                      "tabular-nums shrink-0",
                      entry.rank <= 3 ? "font-bold" : "font-semibold",
                      "text-foreground"
                    )}>
                      {entry.value}
                    </span>
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

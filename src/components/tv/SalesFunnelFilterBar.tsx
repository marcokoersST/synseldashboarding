import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, CalendarIcon, Columns3, Timer, SlidersHorizontal, Percent } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ranglijstenFilters, allConsultantsList } from "@/data/ranglijstenData";
import { useSalesFunnelFilters, ALL_COLUMN_GROUPS, ALL_UNITS } from "@/contexts/SalesFunnelFiltersContext";
import { columnGroups, subKey, DEFAULT_VISIBLE_SUBKEYS, ALL_SUBKEYS } from "@/data/unitFunnelColumns";

export function SalesFunnelFilterBar() {
  const f = useSalesFunnelFilters();
  const [unitOpen, setUnitOpen] = useState(false);
  const [consOpen, setConsOpen] = useState(false);
  const [consSearch, setConsSearch] = useState("");
  const [hideInactive, setHideInactive] = useState(true);
  const [pendingUnits, setPendingUnits] = useState(f.selectedUnits);
  const [pendingCons, setPendingCons] = useState(f.selectedConsultants);

  useEffect(() => { setPendingCons(["Alle consultants"]); f.setSelectedConsultants(["Alle consultants"]); /* reset on unit change */ }, [f.selectedUnits.join(",")]);

  const availableConsultants = allConsultantsList.filter(c => {
    if (!f.selectedUnits.includes("Alle units") && !f.selectedUnits.includes(c.unit)) return false;
    if (hideInactive && !c.isActive) return false;
    return true;
  });

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Select value={f.jaar} onValueChange={f.setJaar}>
        <SelectTrigger className="w-[120px] bg-card border-border h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ranglijstenFilters.jaren.map(j => <SelectItem key={j} value={String(j)}>Jaar: {j}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        {(["week", "periode", "custom"] as const).map(mode => (
          <Badge
            key={mode}
            variant={f.viewMode === mode ? "default" : "secondary"}
            className="cursor-pointer capitalize"
            onClick={() => f.setViewMode(mode)}
          >
            {mode === "custom" ? "Aangepast" : mode}
          </Badge>
        ))}
      </div>

      {f.viewMode === "week" && (
        <Select value={f.selectedWeek} onValueChange={f.setSelectedWeek}>
          <SelectTrigger className="w-[100px] bg-card border-border h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{ranglijstenFilters.weeknummers.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
        </Select>
      )}
      {f.viewMode === "periode" && (
        <Select value={f.selectedPeriode} onValueChange={f.setSelectedPeriode}>
          <SelectTrigger className="w-[90px] bg-card border-border h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{ranglijstenFilters.periodenummers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      )}
      {f.viewMode === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <CalendarIcon className="w-4 h-4" />
              {f.customRange?.from
                ? f.customRange.to
                  ? `${format(f.customRange.from, "d MMM", { locale: nl })} – ${format(f.customRange.to, "d MMM", { locale: nl })}`
                  : format(f.customRange.from, "d MMM yyyy", { locale: nl })
                : "Selecteer periode"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={f.customRange} onSelect={f.setCustomRange} numberOfMonths={2} className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
      )}

      {/* Units */}
      <Popover open={unitOpen} onOpenChange={(o) => { setUnitOpen(o); if (o) setPendingUnits([...f.selectedUnits]); }}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 min-w-[140px] justify-between h-9">
            {f.selectedUnits.includes("Alle units") ? "Alle units" : `${f.selectedUnits.length} unit${f.selectedUnits.length > 1 ? "s" : ""}`}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Units</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setPendingUnits(["Alle units"])}>Alles aan</Button>
              <span className="text-muted-foreground text-xs">·</span>
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setPendingUnits([])}>Alles uit</Button>
            </div>
          </div>
          <div className="space-y-2">
            {ALL_UNITS.map(u => (
              <label key={u} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={pendingUnits.includes("Alle units") || pendingUnits.includes(u)}
                  onCheckedChange={() => setPendingUnits(prev => {
                    if (prev.includes("Alle units")) return [u];
                    if (prev.includes(u)) {
                      const next = prev.filter(x => x !== u);
                      return next.length === 0 ? ["Alle units"] : next;
                    }
                    const next = [...prev, u];
                    return next.length === ALL_UNITS.length ? ["Alle units"] : next;
                  })}
                />
                {u}
              </label>
            ))}
          </div>
          <Button size="sm" className="w-full mt-3" onClick={() => { f.setSelectedUnits([...pendingUnits]); setUnitOpen(false); }}>Toepassen</Button>
        </PopoverContent>
      </Popover>

      {/* Consultants */}
      <Popover open={consOpen} onOpenChange={(o) => { setConsOpen(o); if (o) { setPendingCons([...f.selectedConsultants]); setConsSearch(""); } }}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 min-w-[170px] justify-between h-9">
            {f.selectedConsultants.includes("Alle consultants") ? "Alle consultants" : `${f.selectedConsultants.length} consultant${f.selectedConsultants.length > 1 ? "s" : ""}`}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Consultants</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setPendingCons(["Alle consultants"])}>Alles aan</Button>
              <span className="text-muted-foreground text-xs">·</span>
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setPendingCons([])}>Alles uit</Button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/40">
            <label className="text-xs text-muted-foreground cursor-pointer">Verberg inactieve</label>
            <Switch checked={hideInactive} onCheckedChange={setHideInactive} className="scale-75" />
          </div>
          <Input placeholder="Zoek..." value={consSearch} onChange={(e) => setConsSearch(e.target.value)} className="mb-2 h-8 text-sm" />
          <div className="max-h-[240px] overflow-y-auto space-y-1">
            {availableConsultants.filter(c => c.fullName.toLowerCase().includes(consSearch.toLowerCase())).map(c => (
              <label key={c.fullName} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                <Checkbox
                  checked={pendingCons.includes("Alle consultants") || pendingCons.includes(c.fullName)}
                  onCheckedChange={() => setPendingCons(prev => {
                    if (prev.includes("Alle consultants")) return [c.fullName];
                    if (prev.includes(c.fullName)) {
                      const next = prev.filter(x => x !== c.fullName);
                      return next.length === 0 ? ["Alle consultants"] : next;
                    }
                    const next = [...prev, c.fullName];
                    return next.length === availableConsultants.length ? ["Alle consultants"] : next;
                  })}
                />
                <span className={cn("truncate", !c.isActive && "opacity-50")}>{c.fullName}</span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">{c.unit}</span>
              </label>
            ))}
          </div>
          <Button size="sm" className="w-full mt-3" onClick={() => { f.setSelectedConsultants([...pendingCons]); setConsOpen(false); }}>Toepassen</Button>
        </PopoverContent>
      </Popover>

      {/* Combined Tabelkolommen popover (group + sub-column toggles) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Columns3 className="w-4 h-4" />
            Tabelkolommen ({f.visibleSubKeys.length}/{ALL_SUBKEYS.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-[520px] overflow-y-auto" align="start">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <p className="text-sm font-medium">Tabelkolommen unit-tabel</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2"
                onClick={() => { f.setVisibleSubKeys([...DEFAULT_VISIBLE_SUBKEYS]); f.setVisibleColumnGroups([...ALL_COLUMN_GROUPS]); }}>
                Reset
              </Button>
              <span className="text-muted-foreground text-xs">·</span>
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2"
                onClick={() => { f.setVisibleSubKeys([...ALL_SUBKEYS]); f.setVisibleColumnGroups([...ALL_COLUMN_GROUPS]); }}>
                Alles aan
              </Button>
              <span className="text-muted-foreground text-xs">·</span>
              <Button variant="ghost" size="sm" className="text-xs h-6 px-2"
                onClick={() => f.setVisibleSubKeys([])}>
                Alles uit
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {columnGroups.map(g => {
              const groupKeys = g.subs.map(subKey);
              const onCount = groupKeys.filter(k => f.visibleSubKeys.includes(k)).length;
              const allOn = onCount === groupKeys.length;
              const noneOn = onCount === 0;
              const groupVisible = f.visibleColumnGroups.includes(g.group);
              const values = g.subs.filter(s => s.type === "value");
              const convs = g.subs.filter(s => s.type === "conv");

              const setGroup = (on: boolean) => {
                if (on) {
                  f.setVisibleSubKeys(Array.from(new Set([...f.visibleSubKeys, ...groupKeys])));
                  if (!groupVisible) f.setVisibleColumnGroups([...f.visibleColumnGroups, g.group]);
                } else {
                  f.setVisibleSubKeys(f.visibleSubKeys.filter(k => !groupKeys.includes(k)));
                }
              };

              return (
                <div key={g.group} className="border border-border/60 rounded-md p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={allOn ? true : noneOn ? false : "indeterminate"}
                        onCheckedChange={() => setGroup(!allOn)}
                      />
                      <span className="text-xs font-semibold text-foreground">{g.group}</span>
                      <span className="text-[10px] text-muted-foreground">({onCount}/{groupKeys.length})</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="text-xs h-5 px-1.5"
                        onClick={() => setGroup(true)}>aan</Button>
                      <span className="text-muted-foreground text-xs">·</span>
                      <Button variant="ghost" size="sm" className="text-xs h-5 px-1.5"
                        onClick={() => setGroup(false)}>uit</Button>
                    </div>
                  </div>
                  <div className="space-y-1 pl-6">
                    {values.map(s => {
                      const k = subKey(s);
                      return (
                        <label key={k} className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox
                            checked={f.visibleSubKeys.includes(k)}
                            onCheckedChange={() => {
                              f.setVisibleSubKeys(
                                f.visibleSubKeys.includes(k)
                                  ? f.visibleSubKeys.filter(x => x !== k)
                                  : [...f.visibleSubKeys, k]
                              );
                            }}
                          />
                          {s.label}
                        </label>
                      );
                    })}
                    {convs.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-dashed border-border/40">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Percent className="w-2.5 h-2.5" /> Conversies
                        </p>
                        {convs.map(s => {
                          const k = subKey(s);
                          return (
                            <label key={k} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                              <Checkbox
                                checked={f.visibleSubKeys.includes(k)}
                                onCheckedChange={() => {
                                  f.setVisibleSubKeys(
                                    f.visibleSubKeys.includes(k)
                                      ? f.visibleSubKeys.filter(x => x !== k)
                                      : [...f.visibleSubKeys, k]
                                  );
                                }}
                              />
                              {s.label}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Rotation interval */}
      <div className="flex items-center gap-1.5 ml-auto">
        <Timer className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">TV-rotatie:</span>
        <Input
          type="number"
          min={3}
          max={120}
          value={f.rotationSec}
          onChange={(e) => f.setRotationSec(Math.max(3, Math.min(120, Number(e.target.value) || 12)))}
          className="w-16 h-9 text-xs"
        />
        <span className="text-xs text-muted-foreground">s</span>
      </div>
    </div>
  );
}

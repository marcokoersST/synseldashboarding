import { useMemo, useState } from "react";
import {
  Phone, PhoneIncoming, PhoneOutgoing, Clock, ArrowUpDown,
  Search, Filter, Users, Check,
} from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  CONSULTANTS, getCallsInRange, aggregatePerConsultant,
  defaultPeriod, previousPeriod, formatDurationHMS, formatTimestamp,
  consultantById, Period,
} from "@/data/callDashboardingData";
import { HeroCounter } from "@/components/calldashboarding/HeroCounter";
import { PeriodFilter } from "@/components/calldashboarding/PeriodFilter";
import { ConsultantDetail } from "@/components/calldashboarding/ConsultantDetail";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { TVConsultantSummaryTile } from "@/components/calldashboarding/tv/TVConsultantSummaryTile";
import { TVOutreachEffectivenessTile } from "@/components/calldashboarding/tv/TVOutreachEffectivenessTile";
import { TVHourlyCallsTile } from "@/components/calldashboarding/tv/TVHourlyCallsTile";

// ─── Multi-select popover ──────────────────────────────────────────────────
interface MultiSelectProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  searchable?: boolean;
}

function MultiSelect({ label, icon: Icon, options, selected, onChange, searchable }: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const allOn = selected.size === options.length;
  const filtered = query ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())) : options;

  const toggle = (v: string) => {
    // Smart "all-selected" → clicking solo-selects that single option.
    if (allOn) {
      onChange(new Set([v]));
      return;
    }
    const next = new Set(selected);
    if (next.has(v)) next.delete(v); else next.add(v);
    onChange(next);
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <Icon className="h-3.5 w-3.5" />
          {label}
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
            {allOn ? "Alle" : selected.size}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b border-border flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onChange(new Set(options))}>
              Alles aan
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onChange(new Set())}>
              Uit
            </Button>
          </div>
        </div>
        {searchable && (
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Zoeken..."
                className="h-7 pl-6 text-xs"
              />
            </div>
          </div>
        )}
        <ScrollArea className="h-64">
          <div className="p-1">
            {filtered.map(opt => {
              const isOn = selected.has(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary/60 text-left text-xs"
                >
                  <Checkbox checked={isOn} className="pointer-events-none" />
                  <span className="flex-1 truncate text-foreground">{opt}</span>
                  {isOn && <Check className="h-3 w-3 text-primary" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">Geen resultaten</div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// ─── Table types ────────────────────────────────────────────────────────────
type SortKey = "consultantName" | "status" | "total" | "inbound" | "outbound" | "durationSec" | "lastCallAt";

interface Row {
  consultantId: number;
  consultantName: string;
  unit: string;
  status: "Free" | "On Call";
  total: number;
  inbound: number;
  outbound: number;
  durationSec: number;
  connected: number;
  lastCallAt: number | null;
}

// ─── Page body ─────────────────────────────────────────────────────────────
function CallDashboardingBody() {
  const isTV = useTVCompact();
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [query, setQuery] = useState("");
  const [drilldownId, setDrilldownId] = useState<number | null>(null);

  const allUnits = useMemo(() => Array.from(new Set(CONSULTANTS.map(c => c.unit))).sort(), []);
  const allNames = useMemo(() => CONSULTANTS.map(c => c.name).sort(), []);

  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(() => new Set(allUnits));
  const [selectedConsultants, setSelectedConsultants] = useState<Set<string>>(() => new Set(allNames));

  const consultantOptions = useMemo(
    () => CONSULTANTS.filter(c => selectedUnits.has(c.unit)).map(c => c.name).sort(),
    [selectedUnits, allUnits],
  );

  // Resolve which consultant ids are visible
  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const set = new Set<number>();
    for (const c of CONSULTANTS) {
      if (!selectedUnits.has(c.unit)) continue;
      if (!selectedConsultants.has(c.name)) continue;
      if (q && !c.name.toLowerCase().includes(q) && !c.unit.toLowerCase().includes(q)) continue;
      set.add(c.id);
    }
    return set;
  }, [selectedUnits, selectedConsultants, query]);

  const calls = useMemo(
    () => getCallsInRange(period.from, period.to, visibleIds),
    [period, visibleIds],
  );
  const prev = useMemo(() => previousPeriod(period), [period]);
  const prevCalls = useMemo(
    () => getCallsInRange(prev.from, prev.to, visibleIds),
    [prev, visibleIds],
  );

  const aggMap = useMemo(() => aggregatePerConsultant(calls), [calls]);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const c of CONSULTANTS) {
      if (!visibleIds.has(c.id)) continue;
      const a = aggMap.get(c.id);
      // Status "On Call" if a call started in the last 90s
      const last = a?.lastCallAt ?? null;
      const onCall = last !== null && Date.now() - last < 90 * 1000 && c.id % 13 === 0;
      out.push({
        consultantId: c.id,
        consultantName: c.name,
        unit: c.unit,
        status: onCall ? "On Call" : "Free",
        total: a?.total ?? 0,
        inbound: a?.inbound ?? 0,
        outbound: a?.outbound ?? 0,
        durationSec: a?.durationSec ?? 0,
        connected: a?.connected ?? 0,
        lastCallAt: last,
      });
    }
    out.sort((a, b) => {
      const av = a[sortKey] as any;
      const bv = b[sortKey] as any;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? (av - bv) : (bv - av);
    });
    return out;
  }, [aggMap, visibleIds, sortKey, sortAsc]);

  const totals = useMemo(() => {
    let total = 0, inbound = 0, outbound = 0, durationSec = 0, connected = 0;
    for (const r of rows) {
      total += r.total; inbound += r.inbound; outbound += r.outbound;
      durationSec += r.durationSec; connected += r.connected;
    }
    return { total, inbound, outbound, durationSec, connected, onCall: rows.filter(r => r.status === "On Call").length };
  }, [rows]);

  const prevTotals = useMemo(() => {
    const m = aggregatePerConsultant(prevCalls);
    let total = 0, inbound = 0, outbound = 0, durationSec = 0, connected = 0;
    for (const a of m.values()) {
      total += a.total; inbound += a.inbound; outbound += a.outbound;
      durationSec += a.durationSec; connected += a.connected;
    }
    return { total, inbound, outbound, durationSec, connected };
  }, [prevCalls]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(!sortAsc);
    else { setSortKey(k); setSortAsc(false); }
  };

  const columns: { key: SortKey; label: string; align?: "left" | "right" | "center" }[] = [
    { key: "consultantName", label: "Agent", align: "left" },
    { key: "status", label: "Status", align: "center" },
    { key: "total", label: "Totaal", align: "right" },
    { key: "inbound", label: "Inkomend", align: "right" },
    { key: "outbound", label: "Uitgaand", align: "right" },
    { key: "durationSec", label: "Gesprekstijd", align: "right" },
    { key: "lastCallAt", label: "Laatste gesprek", align: "right" },
  ];

  // ─── TV mode rendering ──────────────────────────────────────────────────
  if (isTV) {
    return (
      <div className="h-full flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-bold text-foreground leading-none">Call Dashboarding</h2>
            <p className="text-[0.7em] text-muted-foreground mt-0.5">{period.label}</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
        <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
          <div className="col-span-2 min-h-0">
            <TVConsultantSummaryTile calls={calls} isLive={!!period.live} visibleIds={visibleIds} />
          </div>
          <div className="col-span-1 grid grid-rows-6 gap-2 h-full min-h-0">
            {/* Totalen 1/6, Effectiviteit 3/6, Belactiviteit 2/6 */}
            <div className="row-span-1 min-h-0 rounded-xl bg-card border border-border flex flex-col overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-foreground">Totalen</h3>
                <span className="text-[0.7em] text-muted-foreground">{period.label}</span>
              </div>
              <div className="flex-1 min-h-0 grid grid-cols-4 divide-x divide-border">
                <div className="px-3 py-1.5 flex flex-col items-center justify-center text-center gap-0.5 min-w-0 overflow-hidden">
                  <HeroCounter
                    label="Totaal"
                    value={totals.total}
                    previousValue={prevTotals.total}
                    icon={<Phone className="h-3.5 w-3.5 text-primary" />}
                    hideShare
                  />
                </div>
                <div className="px-3 py-1.5 flex flex-col items-center justify-center text-center gap-0.5 min-w-0 overflow-hidden">
                  <HeroCounter
                    label="Inkomend"
                    value={totals.inbound}
                    total={totals.total}
                    previousValue={prevTotals.inbound}
                    previousTotal={prevTotals.total}
                    tone="in"
                    icon={<PhoneIncoming className="h-3.5 w-3.5 text-teal" />}
                  />
                </div>
                <div className="px-3 py-1.5 flex flex-col items-center justify-center text-center gap-0.5 min-w-0 overflow-hidden">
                  <HeroCounter
                    label="Uitgaand"
                    value={totals.outbound}
                    total={totals.total}
                    previousValue={prevTotals.outbound}
                    previousTotal={prevTotals.total}
                    tone="out"
                    icon={<PhoneOutgoing className="h-3.5 w-3.5 text-primary" />}
                  />
                </div>
                <div className="px-3 py-1.5 flex flex-col items-center justify-center text-center gap-0.5 min-w-0 overflow-hidden">
                  <HeroCounter
                    label="Gesprekstijd"
                    value={totals.durationSec}
                    format="duration"
                    previousValue={prevTotals.durationSec}
                    icon={<Clock className="h-3.5 w-3.5 text-success" />}
                    hideShare
                  />
                </div>
              </div>


            </div>
            <div className="row-span-3 min-h-0">
              <TVOutreachEffectivenessTile calls={calls} prevCalls={prevCalls} />
            </div>
            <div className="row-span-2 min-h-0">
              <TVHourlyCallsTile calls={calls} />
            </div>
          </div>
        </div>
      </div>
    );
  }



  // ─── Standard page ──────────────────────────────────────────────────────
  if (drilldownId !== null) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <ConsultantDetail
          consultantId={drilldownId}
          period={period}
          onBack={() => setDrilldownId(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
          <Phone className="h-3.5 w-3.5" />
          Concepts · Telefonie
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Call Dashboarding</h1>
            <p className="text-sm text-muted-foreground">
              Inkomende en uitgaande gesprekken per consultant.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px]">{period.label}</Badge>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>
        </div>
      </header>

      {/* KPI strip — abs + share % + delta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnimatedCard delay={0}>
          <div className="rounded-xl bg-card border border-border p-4">
            <HeroCounter
              label="Totaal gesprekken"
              value={totals.total}
              previousValue={prevTotals.total}
              icon={<Phone className="h-3.5 w-3.5 text-primary" />}
              hideShare
            />
            <div className="text-[11px] text-muted-foreground mt-2">{totals.onCall} nu in gesprek</div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={60}>
          <div className="rounded-xl bg-card border border-border p-4">
            <HeroCounter
              label="Inkomend"
              value={totals.inbound}
              total={totals.total}
              previousValue={prevTotals.inbound}
              previousTotal={prevTotals.total}
              tone="in"
              icon={<PhoneIncoming className="h-3.5 w-3.5 text-teal" />}
            />
          </div>
        </AnimatedCard>
        <AnimatedCard delay={120}>
          <div className="rounded-xl bg-card border border-border p-4">
            <HeroCounter
              label="Uitgaand"
              value={totals.outbound}
              total={totals.total}
              previousValue={prevTotals.outbound}
              previousTotal={prevTotals.total}
              tone="out"
              icon={<PhoneOutgoing className="h-3.5 w-3.5 text-primary" />}
            />
          </div>
        </AnimatedCard>
        <AnimatedCard delay={180}>
          <div className="rounded-xl bg-card border border-border p-4">
            <HeroCounter
              label="Totale gesprekstijd"
              value={totals.durationSec}
              format="duration"
              previousValue={prevTotals.durationSec}
              icon={<Clock className="h-3.5 w-3.5 text-success" />}
              hideShare
            />
            <div className="text-[11px] text-muted-foreground mt-2">
              {totals.total > 0 ? `${Math.round(totals.durationSec / totals.total)}s gemiddeld` : "—"}
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Table */}
      <AnimatedCard delay={220}>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
            <div>
              <h2 className="text-sm font-medium text-foreground">Agents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rows.length} van {CONSULTANTS.length} consultants · klik een rij voor details
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <MultiSelect
                label="Unit"
                icon={Filter}
                options={allUnits}
                selected={selectedUnits}
                onChange={setSelectedUnits}
              />
              <MultiSelect
                label="Consultant"
                icon={Users}
                options={consultantOptions}
                selected={selectedConsultants}
                onChange={setSelectedConsultants}
                searchable
              />
              <div className="relative w-56">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Zoek agent of unit..."
                  className="h-8 pl-7 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "py-2.5 px-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.align === "left" && "text-left",
                      )}
                    >
                      <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                        {col.label}
                        <ArrowUpDown className="h-3 w-3 opacity-60" />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr
                    key={row.consultantId}
                    onClick={() => setDrilldownId(row.consultantId)}
                    className="border-t border-border/60 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3">
                      <div className="font-medium text-foreground">{row.consultantName}</div>
                      <div className="text-[10px] text-muted-foreground">{row.unit}</div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.status === "On Call" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping" />
                            <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
                          </span>
                          On Call
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-success" />
                          Free
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="font-semibold text-foreground tabular-nums">{row.total}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        {totals.total > 0 ? `${Math.round((row.total / totals.total) * 100)}%` : "—"}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="text-foreground tabular-nums">{row.inbound}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        {row.total > 0 ? `${Math.round((row.inbound / row.total) * 100)}%` : "—"}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="text-foreground tabular-nums">{row.outbound}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        {row.total > 0 ? `${Math.round((row.outbound / row.total) * 100)}%` : "—"}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-foreground">
                      {formatDurationHMS(row.durationSec)}
                    </td>
                    <td className={cn(
                      "py-2 px-3 text-right tabular-nums",
                      row.status === "On Call" ? "text-primary font-medium" : "text-muted-foreground",
                    )}>
                      {row.status === "On Call"
                        ? "In gesprek"
                        : row.lastCallAt
                          ? formatTimestamp(row.lastCallAt)
                          : "—"}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                      Geen consultants in selectie
                    </td>
                  </tr>
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20">
                    <td className="py-2.5 px-3 font-semibold text-foreground">Totaal</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">{totals.onCall} on call</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.total}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.inbound}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.outbound}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{formatDurationHMS(totals.durationSec)}</td>
                    <td className="py-2.5 px-3" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}

export default function CallDashboarding() {
  return (
    <TVDashboardLayout title="Call Dashboarding">
      <CallDashboardingBody />
    </TVDashboardLayout>
  );
}

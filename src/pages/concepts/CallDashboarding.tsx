import { useMemo, useState } from "react";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, ArrowUpDown, Search, Filter, Users, Check } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { allConsultants } from "@/data/managerData";

// ─── Deterministic seeded mock generator ───
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface Row {
  consultantId: number;
  consultantName: string;
  unit: string;
  status: "Free" | "On Call";
  inbound: number;
  outbound: number;
  total: number;
  totalMinutes: number;
  totalSeconds: number;
  lastCallAt: number; // ms ago from "now"
}

const NOW = Date.now();

const allRows: Row[] = allConsultants.map((c, i) => {
  const rng = seeded(c.id * 131 + 7);
  const inbound = 5 + Math.floor(rng() * 70);
  const outbound = 30 + Math.floor(rng() * 200);
  const total = inbound + outbound;
  const totalMinutes = 30 + Math.floor(rng() * 380);
  const totalSeconds = Math.floor(rng() * 60);
  const status: "Free" | "On Call" = i % 13 === 0 ? "On Call" : "Free";
  const lastCallMs =
    status === "On Call"
      ? 0
      : Math.floor(rng() * 1000 * 60 * 60 * 28); // up to ~28h ago
  return {
    consultantId: c.id,
    consultantName: c.name,
    unit: c.unit,
    status,
    inbound,
    outbound,
    total,
    totalMinutes,
    totalSeconds,
    lastCallAt: NOW - lastCallMs,
  };
});

function formatHMS(totalMinutes: number, extraSeconds = 0) {
  const totalSec = totalMinutes * 60 + extraSeconds;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatRelative(ts: number, status: "Free" | "On Call") {
  if (status === "On Call") return "Now";
  const diff = NOW - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

type SortKey = "consultantName" | "status" | "total" | "inbound" | "outbound" | "totalMinutes" | "lastCallAt";

// ─── Multi-select popover ───
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

export default function CallDashboarding() {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [query, setQuery] = useState("");

  const allUnits = useMemo(() => Array.from(new Set(allRows.map(r => r.unit))).sort(), []);
  const allConsultantNames = useMemo(() => allRows.map(r => r.consultantName).sort(), []);

  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(() => new Set(allUnits));
  const [selectedConsultants, setSelectedConsultants] = useState<Set<string>>(() => new Set(allConsultantNames));

  // consultants visible in popover are narrowed by unit selection
  const consultantOptions = useMemo(
    () => allRows.filter(r => selectedUnits.has(r.unit)).map(r => r.consultantName).sort(),
    [selectedUnits]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = allRows.filter(r => {
      if (!selectedUnits.has(r.unit)) return false;
      if (!selectedConsultants.has(r.consultantName)) return false;
      if (q && !r.consultantName.toLowerCase().includes(q) && !r.unit.toLowerCase().includes(q)) return false;
      return true;
    });
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [query, sortKey, sortAsc, selectedUnits, selectedConsultants]);

  const totals = useMemo(() => ({
    calls: filtered.reduce((s, r) => s + r.total, 0),
    inbound: filtered.reduce((s, r) => s + r.inbound, 0),
    outbound: filtered.reduce((s, r) => s + r.outbound, 0),
    minutes: filtered.reduce((s, r) => s + r.totalMinutes, 0),
    onCall: filtered.filter(r => r.status === "On Call").length,
  }), [filtered]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(!sortAsc);
    else { setSortKey(k); setSortAsc(false); }
  };

  const columns: { key: SortKey; label: string; align?: "left" | "right" | "center" }[] = [
    { key: "consultantName", label: "Agent", align: "left" },
    { key: "status", label: "Status", align: "center" },
    { key: "total", label: "Total Calls", align: "right" },
    { key: "inbound", label: "Incoming", align: "right" },
    { key: "outbound", label: "Outgoing", align: "right" },
    { key: "totalMinutes", label: "Total Talk Time", align: "right" },
    { key: "lastCallAt", label: "Last Call", align: "right" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
          <Phone className="h-3.5 w-3.5" />
          Concepts · Telefonie
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Call Dashboarding</h1>
        <p className="text-sm text-muted-foreground">
          Live overzicht van inkomende en uitgaande gesprekken per consultant (deze week).
        </p>
      </header>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnimatedCard delay={0}>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Phone className="h-4 w-4 text-primary" /> Totaal gesprekken
            </div>
            <AnimatedNumber value={totals.calls} className="text-2xl font-bold text-foreground" />
            <div className="text-[11px] text-muted-foreground mt-1">{totals.onCall} nu in gesprek</div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={60}>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <PhoneIncoming className="h-4 w-4 text-teal" /> Inkomend
            </div>
            <AnimatedNumber value={totals.inbound} className="text-2xl font-bold text-foreground" />
            <div className="text-[11px] text-muted-foreground mt-1">
              {Math.round((totals.inbound / Math.max(totals.calls, 1)) * 100)}% van totaal
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={120}>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <PhoneOutgoing className="h-4 w-4 text-primary" /> Uitgaand
            </div>
            <AnimatedNumber value={totals.outbound} className="text-2xl font-bold text-foreground" />
            <div className="text-[11px] text-muted-foreground mt-1">
              {Math.round((totals.outbound / Math.max(totals.calls, 1)) * 100)}% van totaal
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard delay={180}>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Clock className="h-4 w-4 text-success" /> Totale beltijd
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">{formatHMS(totals.minutes)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">[H:M:S]</div>
          </div>
        </AnimatedCard>
      </div>

      {/* Table */}
      <AnimatedCard delay={220}>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
            <div>
              <h2 className="text-sm font-medium text-foreground">Agents · deze week</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filtered.length} van {allRows.length} consultants
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
                {filtered.map(row => (
                  <tr key={row.consultantId} className="border-t border-border/60 hover:bg-secondary/20 transition-colors">
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
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-foreground">{row.total}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-foreground">{row.inbound}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-foreground">{row.outbound}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-foreground">{formatHMS(row.totalMinutes, row.totalSeconds)}</td>
                    <td className={cn(
                      "py-2 px-3 text-right tabular-nums",
                      row.status === "On Call" ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                      {formatRelative(row.lastCallAt, row.status)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                      Geen consultants in selectie
                    </td>
                  </tr>
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20">
                    <td className="py-2.5 px-3 font-semibold text-foreground">Totaal</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">{totals.onCall} on call</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.calls}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.inbound}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.outbound}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{formatHMS(totals.minutes)}</td>
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

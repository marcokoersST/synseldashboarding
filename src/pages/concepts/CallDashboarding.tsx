import { useMemo, useState } from "react";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, ArrowUpDown, Search } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { consultantCallData } from "@/data/managerOperationalData";

function formatHMS(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const s = (totalMinutes * 7) % 60; // deterministic pseudo-seconds for mock display
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type SortKey = "consultantName" | "status" | "total" | "inbound" | "outbound" | "totalMinutes";

interface Row {
  consultantId: number;
  consultantName: string;
  unit: string;
  status: "Free" | "On Call";
  inbound: number;
  outbound: number;
  total: number;
  totalMinutes: number;
}

export default function CallDashboarding() {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [query, setQuery] = useState("");

  const rows: Row[] = useMemo(() => {
    return consultantCallData.map((c, i) => ({
      consultantId: c.consultantId,
      consultantName: c.consultantName,
      unit: c.unit,
      status: i % 11 === 0 ? "On Call" : "Free",
      inbound: c.inbound,
      outbound: c.outbound,
      total: c.inbound + c.outbound,
      totalMinutes: c.totalMinutes,
    }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = q
      ? rows.filter(r => r.consultantName.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q))
      : [...rows];
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [rows, query, sortKey, sortAsc]);

  const totals = useMemo(() => ({
    calls: rows.reduce((s, r) => s + r.total, 0),
    inbound: rows.reduce((s, r) => s + r.inbound, 0),
    outbound: rows.reduce((s, r) => s + r.outbound, 0),
    minutes: rows.reduce((s, r) => s + r.totalMinutes, 0),
    onCall: rows.filter(r => r.status === "On Call").length,
  }), [rows]);

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
          <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
            <div>
              <h2 className="text-sm font-medium text-foreground">Agents · deze week</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} consultants</p>
            </div>
            <div className="relative w-64 max-w-full">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Zoek agent of unit..."
                className="h-8 pl-7 text-xs"
              />
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
                    <td className="py-2 px-3 text-right tabular-nums text-foreground">{formatHMS(row.totalMinutes)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="py-2.5 px-3 font-semibold text-foreground">Totaal</td>
                  <td className="py-2.5 px-3 text-center text-muted-foreground">{totals.onCall} on call</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.calls}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.inbound}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{totals.outbound}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{formatHMS(totals.minutes)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}

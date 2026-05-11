import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Plus, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PrognoseConsultantRow,
  type PrognoseStatus,
  formatTelefonie,
  effectiveStatus,
  setStatusOverride,
  getStatusOverride,
  metricTier,
} from "@/data/prognoseData";
import { MetricDrilldownPanel, type MetricKey } from "./MetricDrilldownPanel";
import { usePrognosePeriod } from "@/contexts/PrognosePeriodContext";
import { loadTickets, type InterventionTicket } from "@/data/prognoseTickets";
import { TicketCard } from "./TicketCard";
import { TicketComposer } from "./TicketComposer";
import { useForceSidebarCollapse } from "@/contexts/SidebarCollapseContext";

interface Props {
  row: PrognoseConsultantRow | null;
  onClose: () => void;
}

const TIER_BAR: Record<ReturnType<typeof metricTier>, string> = {
  good: "bg-emerald-500",
  ok: "bg-yellow-500",
  warn: "bg-orange-500",
  bad: "bg-destructive",
};
const TIER_DOT: Record<ReturnType<typeof metricTier>, string> = {
  good: "bg-emerald-500",
  ok: "bg-yellow-500",
  warn: "bg-orange-500",
  bad: "bg-destructive",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");
}

export function InterventionPanel({ row, onClose }: Props) {
  const [activeMetric, setActiveMetric] = useState<MetricKey | null>(null);
  const [status, setStatus] = useState<PrognoseStatus>("op-koers");
  const [hasOverride, setHasOverride] = useState(false);
  const [tab, setTab] = useState<"open" | "history">("open");
  const [composing, setComposing] = useState(false);
  const [tickets, setTickets] = useState<InterventionTicket[]>([]);
  const { label: periodLabel } = usePrognosePeriod();

  // Auto-collapse the sidebar while detail is open, restore on close.
  useForceSidebarCollapse(!!row);

  const refresh = (rid?: string) => {
    if (!rid) return setTickets([]);
    setTickets(loadTickets(rid));
  };

  useEffect(() => {
    if (row) {
      setActiveMetric(null);
      setStatus(effectiveStatus(row));
      setHasOverride(getStatusOverride(row.id) !== undefined);
      setComposing(false);
      setTab("open");
      refresh(row.id);
    }
  }, [row]);

  useEffect(() => {
    const h = () => row && refresh(row.id);
    window.addEventListener("prognose-tickets-changed", h);
    return () => window.removeEventListener("prognose-tickets-changed", h);
  }, [row]);

  // Esc to close
  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeMetric) setActiveMetric(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, activeMetric, onClose]);

  const handleStatusChange = (s: PrognoseStatus) => {
    if (!row) return;
    setStatus(s);
    setStatusOverride(row.id, s);
    setHasOverride(true);
  };
  const resetStatus = () => {
    if (!row) return;
    setStatusOverride(row.id, null);
    setStatus(row.status);
    setHasOverride(false);
  };

  const breakdown = useMemo(() => {
    if (!row) return [] as { key: MetricKey; label: string; a: number; t: number }[];
    return [
      { key: "intakes" as const, label: "Intakes", a: row.intakes.actual, t: row.intakes.target },
      { key: "acquisities" as const, label: "Acquisities", a: row.acquisities.actual, t: row.acquisities.target },
      { key: "voorstellen" as const, label: "Voorstellen", a: row.voorstellen.actual, t: row.voorstellen.target },
      { key: "gesprekken" as const, label: "Gesprekken", a: row.gesprekken.actual, t: row.gesprekken.target },
      { key: "plaatsingen" as const, label: "Plaatsingen", a: row.plaatsingen.actual, t: row.plaatsingen.target },
    ];
  }, [row]);

  const openTickets = tickets.filter((t) => t.status !== "closed");
  const closedTickets = tickets.filter((t) => t.status === "closed");

  if (!row) return null;

  const statusBadgeClass =
    status === "kritiek"
      ? "border-destructive text-destructive"
      : status === "risico"
        ? "border-amber-500 text-amber-600"
        : "border-emerald-500 text-emerald-600";

  const drillOpen = !!activeMetric;

  return createPortal(
    <div className="fixed inset-0 z-[55] pointer-events-none">
      {/* Peek strip — clickable to close. Sits behind the panel. */}
      <button
        type="button"
        aria-label="Sluit detail"
        onClick={onClose}
        className="absolute inset-y-0 left-0 w-[72px] md:w-[96px] bg-black/20 backdrop-blur-[1px] hover:bg-black/30 transition-colors pointer-events-auto"
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 left-[72px] md:left-[96px] bg-card border-l border-border",
          "shadow-[-12px_0_40px_-12px_hsl(var(--foreground)/0.25)]",
          "flex pointer-events-auto animate-in slide-in-from-right duration-300",
        )}
      >
        {/* Drill-down column (animated width) */}
        <div
          className={cn(
            "h-full overflow-hidden transition-[width,opacity] duration-300 ease-in-out border-r border-border",
            drillOpen ? "w-[min(620px,48%)] opacity-100" : "w-0 opacity-0",
          )}
        >
          {drillOpen && (
            <MetricDrilldownPanel
              metric={activeMetric!}
              row={row}
              onClose={() => setActiveMetric(null)}
            />
          )}
        </div>

        {/* Intervention column */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/10 via-card to-card border-b px-5 pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0 shadow">
                {initials(row.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold leading-tight">{row.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {row.unit} · {periodLabel}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums">{row.prognoseScore}%</span>
                <span className="text-xs text-muted-foreground">score</span>
              </div>
              <div className="flex items-center gap-1">
                {breakdown.map((b) => (
                  <span
                    key={b.key}
                    className={cn("h-2 w-2 rounded-full", TIER_DOT[metricTier(b.a, b.t)])}
                    title={`${b.label}: ${b.a}/${b.t}`}
                  />
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Select value={status} onValueChange={(v) => handleStatusChange(v as PrognoseStatus)}>
                  <SelectTrigger className={cn("h-7 w-auto px-2 text-xs gap-1 font-medium", statusBadgeClass)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="op-koers">Op koers</SelectItem>
                    <SelectItem value="risico">Risico</SelectItem>
                    <SelectItem value="kritiek">Kritiek</SelectItem>
                  </SelectContent>
                </Select>
                {hasOverride && (
                  <button
                    onClick={resetStatus}
                    className="text-[11px] underline text-muted-foreground hover:text-foreground"
                  >
                    Auto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-5">
            {/* Breakdown */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Prognose breakdown
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {breakdown.map((b) => {
                  const tier = metricTier(b.a, b.t);
                  const pct = Math.min(100, Math.round((b.a / Math.max(1, b.t)) * 100));
                  const isActive = activeMetric === b.key;
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setActiveMetric(isActive ? null : b.key)}
                      className={cn(
                        "group relative rounded-lg border bg-card p-2.5 text-left transition-all hover:border-primary/60 hover:shadow-sm",
                        isActive && "border-l-4 border-l-primary border-primary/60 shadow-md bg-primary/5",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-muted-foreground font-medium">{b.label}</div>
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 text-muted-foreground transition-transform",
                            isActive && "rotate-90 text-primary",
                          )}
                        />
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold tabular-nums leading-none">{b.a}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">/{b.t}</span>
                      </div>
                      <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full transition-all", TIER_BAR[tier])} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">{pct}%</div>
                    </button>
                  );
                })}
                {/* Telefonie spans full row */}
                <button
                  type="button"
                  onClick={() => setActiveMetric(activeMetric === "telefonie" ? null : "telefonie")}
                  className={cn(
                    "group relative rounded-lg border bg-card p-2.5 col-span-3 text-left transition-all hover:border-primary/60 hover:shadow-sm",
                    activeMetric === "telefonie" && "border-l-4 border-l-primary border-primary/60 shadow-md bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Phone className="h-3 w-3" /> Telefonie
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 text-muted-foreground transition-transform",
                        activeMetric === "telefonie" && "rotate-90 text-primary",
                      )}
                    />
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums leading-none">
                    {formatTelefonie(row.telefonie)}
                  </div>
                </button>
              </div>
            </div>

            {/* Tickets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
                  <button
                    onClick={() => setTab("open")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded transition-colors",
                      tab === "open"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Open ({openTickets.length})
                  </button>
                  <button
                    onClick={() => setTab("history")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded transition-colors",
                      tab === "history"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Geschiedenis ({closedTickets.length})
                  </button>
                </div>
                {!composing && tab === "open" && (
                  <Button size="sm" onClick={() => setComposing(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Nieuw ticket
                  </Button>
                )}
              </div>

              {composing && tab === "open" && (
                <div className="mb-3">
                  <TicketComposer
                    consultantId={row.id}
                    defaultCategory={row.bottleneck === "Geen knelpunt" ? "Anders" : row.bottleneck}
                    onCancel={() => setComposing(false)}
                    onCreated={() => setComposing(false)}
                  />
                </div>
              )}

              <div className="space-y-2">
                {tab === "open" ? (
                  openTickets.length === 0 ? (
                    <div className="text-center py-8 rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">Geen open interventies.</p>
                      {!composing && (
                        <Button
                          size="sm"
                          variant="link"
                          className="mt-1"
                          onClick={() => setComposing(true)}
                        >
                          Maak eerste ticket aan
                        </Button>
                      )}
                    </div>
                  ) : (
                    openTickets.map((t) => <TicketCard key={t.id} ticket={t} defaultOpen={openTickets.length === 1} />)
                  )
                ) : closedTickets.length === 0 ? (
                  <div className="text-center py-8 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">Geen gesloten interventies.</p>
                  </div>
                ) : (
                  closedTickets.map((t) => <TicketCard key={t.id} ticket={t} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

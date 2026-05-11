import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, AlertTriangle, AlertOctagon, AlarmClock } from "lucide-react";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { cn } from "@/lib/utils";
import {
  type PrognoseConsultantRow,
  getTopPerformers,
  getBottomPerformers,
  getTopBottlenecks,
  getCriticalList,
} from "@/data/prognoseData";
import { loadTickets, type InterventionTicket } from "@/data/prognoseTickets";

interface Props {
  rows: PrognoseConsultantRow[];
  onSelectConsultant: (row: PrognoseConsultantRow) => void;
}

function PerfList({
  rows,
  onSelect,
}: {
  rows: PrognoseConsultantRow[];
  onSelect: (r: PrognoseConsultantRow) => void;
}) {
  return (
    <div className="max-h-[240px] overflow-y-auto pr-1">
      <ul className="space-y-0.5">
        {rows.map((r, i) => (
          <li
            key={r.id}
            onClick={() => onSelect(r)}
            className="flex items-center justify-between gap-2 rounded px-1.5 py-1 cursor-pointer hover:bg-muted/50 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-4 text-[10px] text-muted-foreground tabular-nums">{i + 1}</span>
              <div className="min-w-0">
                <div className="truncate font-medium">{r.name}</div>
                <div className="truncate text-[10px] text-muted-foreground">{r.unit}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="tabular-nums font-semibold">{r.prognoseScore}%</span>
              <span
                className={cn(
                  "inline-flex items-center text-[10px] tabular-nums",
                  r.deltaScore >= 0 ? "text-emerald-600" : "text-destructive",
                )}
              >
                {r.deltaScore >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(r.deltaScore)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {rows.length > limit && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 w-full text-[10px] text-muted-foreground hover:text-foreground underline"
        >
          {expanded ? "Toon minder" : `Toon alle ${rows.length}`}
        </button>
      )}
    </>
  );
}

function useOverdueTickets() {
  const [tickets, setTickets] = useState<InterventionTicket[]>(() => loadTickets());
  useEffect(() => {
    const h = () => setTickets(loadTickets());
    window.addEventListener("prognose-tickets-changed", h);
    return () => window.removeEventListener("prognose-tickets-changed", h);
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  return tickets
    .filter((t) => t.status !== "closed" && t.followUpDate && t.followUpDate < today)
    .sort((a, b) => (a.followUpDate || "").localeCompare(b.followUpDate || ""));
}

function daysOverdue(dateStr: string): number {
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - d) / (1000 * 60 * 60 * 24)));
}

export function UnitOverviewTiles({ rows, onSelectConsultant }: Props) {
  const top = getTopPerformers(rows);
  const bottom = getBottomPerformers(rows);
  const bottlenecks = getTopBottlenecks(rows);
  const critical = getCriticalList(rows);
  const totalBn = bottlenecks.reduce((a, b) => a + b.count, 0);
  const overdue = useOverdueTickets();
  // Only count overdue tickets for consultants currently in selection
  const visibleIds = new Set(rows.map((r) => r.id));
  const visibleOverdue = overdue.filter((t) => visibleIds.has(t.consultantId));

  const findConsultant = (id: string) => rows.find((r) => r.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      <Card>
        <CardHeader className="pb-1.5 pt-3 px-4 bg-gradient-to-b from-emerald-500/10 to-transparent border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-3 px-3">
          <PerfList rows={top} onSelect={onSelectConsultant} limit={5} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1.5 pt-3 px-4 bg-gradient-to-b from-destructive/10 to-transparent border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            Bottom Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-3 px-3">
          <PerfList rows={bottom} onSelect={onSelectConsultant} limit={5} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1.5 pt-3 px-4 bg-gradient-to-b from-amber-500/10 to-transparent border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Top Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-3 px-3 space-y-1.5">
          {bottlenecks.map((b, i) => {
            const pct = totalBn ? (b.count / totalBn) * 100 : 0;
            return (
              <div key={b.category} className="rounded border bg-card px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">#{i + 1}</Badge>
                    <span className="text-xs font-medium truncate">{b.category}</span>
                  </div>
                  <span className="text-base font-bold tabular-nums shrink-0">
                    <AnimatedNumber value={b.count} />
                  </span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader className="pb-1.5 pt-3 px-4 bg-gradient-to-b from-destructive/20 to-transparent border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertOctagon className="h-3.5 w-3.5 text-destructive" />
            Kritiek
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-3 px-3">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="rounded border bg-destructive/5 p-1.5 text-center">
              <div className="text-2xl font-bold text-destructive tabular-nums leading-tight">
                <AnimatedNumber value={critical.length} />
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">consultants</div>
            </div>
            <div className="rounded border bg-destructive/5 p-1.5 text-center">
              <div className="text-2xl font-bold text-destructive tabular-nums leading-tight flex items-center justify-center gap-1">
                <AlarmClock className="h-4 w-4" />
                <AnimatedNumber value={visibleOverdue.length} />
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">tickets over tijd</div>
            </div>
          </div>

          <div className="border-t pt-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Directe aandacht
            </div>
            <ul className="space-y-0.5 max-h-24 overflow-y-auto">
              {critical.slice(0, 4).map((r) => (
                <li
                  key={r.id}
                  onClick={() => onSelectConsultant(r)}
                  className="text-[11px] cursor-pointer rounded px-1.5 py-0.5 hover:bg-muted/50"
                >
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-muted-foreground truncate text-[10px]">{r.criticalReason}</div>
                </li>
              ))}
              {critical.length === 0 && (
                <li className="text-[10px] text-muted-foreground">Geen kritieke gevallen.</li>
              )}
            </ul>
          </div>

          <div className="border-t pt-1.5 mt-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide flex items-center gap-1">
              <AlarmClock className="h-3 w-3" />
              Tickets over tijd
            </div>
            <ul className="space-y-0.5 max-h-24 overflow-y-auto">
              {visibleOverdue.slice(0, 5).map((t) => {
                const c = findConsultant(t.consultantId);
                return (
                  <li
                    key={t.id}
                    onClick={() => c && onSelectConsultant(c)}
                    className="flex items-center justify-between gap-2 text-[11px] cursor-pointer rounded px-1.5 py-0.5 hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="text-muted-foreground truncate text-[10px]">
                        {c?.name ?? "—"} · {t.owner}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded bg-destructive/10 text-destructive px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {daysOverdue(t.followUpDate!)} d
                    </span>
                  </li>
                );
              })}
              {visibleOverdue.length === 0 && (
                <li className="text-[10px] text-muted-foreground">Geen achterstallige tickets.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

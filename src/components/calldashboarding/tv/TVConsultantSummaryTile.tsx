import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CallRecord, aggregatePerConsultant, consultantById,
  formatDurationHMS, formatTimestamp, CONSULTANTS,
} from "@/data/callDashboardingData";

interface Props {
  calls: CallRecord[];
  isLive?: boolean;
  visibleIds?: Set<number>;
}

type Status = "Beschikbaar" | "Bezet" | "Niet aanwezig" | "Niet storen";
const STATUS_VALUES: Status[] = ["Beschikbaar", "Bezet", "Niet aanwezig", "Niet storen"];

// Deterministic, weighted: mostly beschikbaar/bezet, fewer offline/dnd.
function getStatus(id: number): Status {
  const r = ((id * 2654435761) >>> 0) % 100;
  if (r < 55) return "Beschikbaar";
  if (r < 85) return "Bezet";
  if (r < 95) return "Niet aanwezig";
  return "Niet storen";
}

const STATUS_PILL: Record<Status, string> = {
  "Beschikbaar": "bg-success/15 text-success border-success/30",
  "Bezet": "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400",
  "Niet aanwezig": "bg-muted text-muted-foreground border-border",
  "Niet storen": "bg-destructive/15 text-destructive border-destructive/30",
};

export function TVConsultantSummaryTile({ calls, isLive = false, visibleIds }: Props) {
  const rows = useMemo(() => {
    const map = aggregatePerConsultant(calls);
    const baseConsultants = isLive
      ? CONSULTANTS
      : Array.from(map.keys()).map((id) => consultantById(id)!).filter(Boolean);
    const list = baseConsultants
      .filter((c) => !visibleIds || visibleIds.has(c.id))
      .map((c) => {
        const a = map.get(c.id);
        return {
          consultantId: c.id,
          name: c.name,
          unit: c.unit,
          total: a?.total ?? 0,
          inbound: a?.inbound ?? 0,
          outbound: a?.outbound ?? 0,
          durationSec: a?.durationSec ?? 0,
          lastCallAt: a?.lastCallAt ?? null,
          status: getStatus(c.id),
        };
      })
      .sort((a, b) => {
        if (isLive) {
          const aAway = a.status === "Niet aanwezig" ? 1 : 0;
          const bAway = b.status === "Niet aanwezig" ? 1 : 0;
          if (aAway !== bAway) return aAway - bAway;
        }
        return b.total - a.total;
      });

    const totals = list.reduce(
      (acc, r) => ({
        total: acc.total + r.total,
        durationSec: acc.durationSec + r.durationSec,
      }),
      { total: 0, durationSec: 0 },
    );
    return { list, totals };
  }, [calls, isLive, visibleIds]);

  const numCell = (val: number, share: number, masked: boolean, isDuration = false) => (
    <div className="text-right">
      <div className="font-semibold text-foreground tabular-nums">
        {masked ? "--" : isDuration ? formatDurationHMS(val) : val}
      </div>
      {!masked && (
        <div className="text-xs text-muted-foreground tabular-nums">
          {(share * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl bg-card border border-border h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-foreground">Activiteit per consultant</h3>
        <span className="text-[0.7em] text-muted-foreground">
          {rows.list.length} agents{isLive ? " · live" : ""}
        </span>
      </div>
      <ScrollArea className="flex-1">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground sticky top-0">
            <tr>
              <th className="text-left py-1.5 px-2 font-medium">Consultant</th>
              {isLive && <th className="text-left py-1.5 px-2 font-medium">Status</th>}
              <th className="text-right py-1.5 px-2 font-medium">Totaal</th>
              <th className="text-right py-1.5 px-2 font-medium">In</th>
              <th className="text-right py-1.5 px-2 font-medium">Uit</th>
              <th className="text-right py-1.5 px-2 font-medium">Duur</th>
              <th className="text-right py-1.5 px-2 font-medium">Laatste gesprek</th>
            </tr>
          </thead>
          <tbody>
            {rows.list.map((r) => {
              const masked = isLive && r.status === "Niet aanwezig";
              const busy = isLive && r.status === "Bezet";
              return (
                <tr
                  key={r.consultantId}
                  className={cn(
                    "border-t border-border/50",
                    busy && "bg-amber-500/10",
                    masked && "opacity-50",
                  )}
                >
                  <td className="py-1 px-2">
                    <div className="font-medium text-foreground truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.unit}</div>
                  </td>
                  {isLive && (
                    <td className="py-1 px-2">
                      <span className={cn("inline-block rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_PILL[r.status])}>
                        {r.status}
                      </span>
                    </td>
                  )}
                  <td className="py-1 px-2">{numCell(r.total, r.total / Math.max(rows.totals.total, 1), masked)}</td>
                  <td className="py-1 px-2">{numCell(r.inbound, r.inbound / Math.max(r.total, 1), masked)}</td>
                  <td className="py-1 px-2">{numCell(r.outbound, r.outbound / Math.max(r.total, 1), masked)}</td>
                  <td className="py-1 px-2">{numCell(r.durationSec, r.durationSec / Math.max(rows.totals.durationSec, 1), masked, true)}</td>
                  <td className="py-1 px-2 text-right tabular-nums text-muted-foreground">
                    {masked ? "--" : r.lastCallAt ? formatTimestamp(r.lastCallAt) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

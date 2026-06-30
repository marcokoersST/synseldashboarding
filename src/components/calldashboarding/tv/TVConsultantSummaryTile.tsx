import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CallRecord, aggregatePerConsultant, consultantById,
  formatDurationHMS, formatTimestamp,
} from "@/data/callDashboardingData";

interface Props {
  calls: CallRecord[];
}

export function TVConsultantSummaryTile({ calls }: Props) {
  const rows = useMemo(() => {
    const map = aggregatePerConsultant(calls);
    const list = Array.from(map.values())
      .map((a) => ({ ...a, name: consultantById(a.consultantId)?.name ?? "—", unit: consultantById(a.consultantId)?.unit ?? "" }))
      .sort((a, b) => b.total - a.total);
    const totals = list.reduce(
      (acc, r) => ({
        total: acc.total + r.total,
        inbound: acc.inbound + r.inbound,
        outbound: acc.outbound + r.outbound,
        durationSec: acc.durationSec + r.durationSec,
      }),
      { total: 0, inbound: 0, outbound: 0, durationSec: 0 },
    );
    return { list, totals };
  }, [calls]);

  const cell = (val: number, share: number) => (
    <div className="text-right">
      <div className="font-semibold text-foreground tabular-nums">{val}</div>
      <div className="text-[0.65em] text-muted-foreground tabular-nums">{(share * 100).toFixed(0)}%</div>
    </div>
  );

  return (
    <div className="rounded-xl bg-card border border-border h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">Activiteit per consultant</h3>
        <span className="text-[0.7em] text-muted-foreground">{rows.list.length} agents</span>
      </div>
      <ScrollArea className="flex-1">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 text-muted-foreground sticky top-0">
            <tr>
              <th className="text-left py-1.5 px-2 font-medium">Consultant</th>
              <th className="text-right py-1.5 px-2 font-medium">Totaal</th>
              <th className="text-right py-1.5 px-2 font-medium">In</th>
              <th className="text-right py-1.5 px-2 font-medium">Uit</th>
              <th className="text-right py-1.5 px-2 font-medium">Duur</th>
              <th className="text-right py-1.5 px-2 font-medium">Laatste</th>
            </tr>
          </thead>
          <tbody>
            {rows.list.map((r) => (
              <tr key={r.consultantId} className="border-t border-border/50">
                <td className="py-1 px-2">
                  <div className="font-medium text-foreground truncate">{r.name}</div>
                  <div className="text-[0.65em] text-muted-foreground">{r.unit}</div>
                </td>
                <td className="py-1 px-2">{cell(r.total, r.total / Math.max(rows.totals.total, 1))}</td>
                <td className="py-1 px-2">{cell(r.inbound, r.inbound / Math.max(r.total, 1))}</td>
                <td className="py-1 px-2">{cell(r.outbound, r.outbound / Math.max(r.total, 1))}</td>
                <td className="py-1 px-2 text-right">
                  <div className="font-semibold text-foreground tabular-nums">{formatDurationHMS(r.durationSec)}</div>
                  <div className="text-[0.65em] text-muted-foreground tabular-nums">
                    {((r.durationSec / Math.max(rows.totals.durationSec, 1)) * 100).toFixed(0)}%
                  </div>
                </td>
                <td className="py-1 px-2 text-right tabular-nums text-muted-foreground">
                  {r.lastCallAt ? formatTimestamp(r.lastCallAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

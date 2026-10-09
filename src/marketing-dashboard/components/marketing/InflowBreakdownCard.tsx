import { useMemo, useState, type ReactNode } from "react";
import { Card, CardContent } from "@/marketing-dashboard/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/marketing-dashboard/components/ui/dialog";
import { aggregateQualityScore, formatQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import { inflowSourceData } from "@/marketing-dashboard/data/marketingInflowData";

/** Local demo split: total distributed over inflow sources (largest remainder), bounded per-source quality. */
function splitBySource(total: number, seed: number) {
  const weights = inflowSourceData.map(s => s.inschrijvingen);
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (total * w) / sum);
  const counts = raw.map(Math.floor);
  let rest = total - counts.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest-- > 0) counts[i] = (counts[i] ?? 0) + 1; });
  return inflowSourceData.map((s, i) => ({
    bron: s.bron,
    count: counts[i] ?? 0,
    qualityScore: Math.min(100, Math.max(0, 62 + ((i * 37 + seed * 11) % 31))),
  })).sort((a, b) => b.count - a.count);
}

interface Props {
  title: string;
  value: number;
  seed: number;
  qualityLabel: string;
  children: ReactNode;
  active?: boolean;
  dimmed?: boolean;
  onSelect?: () => void;
}

export default function InflowBreakdownCard({ title, value, seed, qualityLabel, children, active = false, dimmed = false, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rows = useMemo(() => splitBySource(value, seed), [value, seed]);
  const quality = aggregateQualityScore(rows.map(r => ({ qualityScore: r.qualityScore, conversions: r.count })));
  return (
    <>
      <Card role="button" tabIndex={0} aria-pressed={onSelect ? active : undefined} onClick={() => (onSelect ? onSelect() : setOpen(true))} onKeyDown={e => (e.key === "Enter" || e.key === " ") && (onSelect ? onSelect() : setOpen(true))} className={`cursor-pointer transition-shadow hover:shadow-md ${active ? "ring-2 ring-primary" : ""} ${dimmed ? "opacity-50" : ""}`}>
        <CardContent className="p-5">
          <div className="mb-1 flex items-start justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="text-right">
              <p className="whitespace-pre-line text-[10px] leading-tight text-muted-foreground">{qualityLabel}</p>
              <p className="text-sm font-semibold tabular-nums">{formatQualityScore(quality)}</p>
            </div>
          </div>
          <p className="text-2xl font-bold">{value}</p>
          {children}
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title} per bron</DialogTitle>
            <DialogDescription>Totaal {value} · Quality score {formatQualityScore(quality)}</DialogDescription>
          </DialogHeader>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="h-11 px-3 text-left font-medium">Bron</th>
                <th className="h-11 px-3 text-right font-medium">Aantal</th>
                <th className="h-11 px-3 text-right font-medium">Aandeel</th>
                <th className="h-11 px-3 text-right font-medium">Quality score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.bron} className="border-b last:border-0">
                  <td className="px-3 py-2.5">{r.bron}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.count}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{value > 0 ? ((r.count / value) * 100).toFixed(1).replace(".", ",") : "0"}%</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{formatQualityScore(r.qualityScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </>
  );
}

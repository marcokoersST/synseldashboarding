import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/marketing-dashboard/components/ui/dialog";
import { aggregateQualityScore, formatQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import { inflowSourceData, type InflowConsultantEntry } from "@/marketing-dashboard/data/marketingInflowData";

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Local demo: bounded per-consultant source split; quality = conversion-weighted mean of its sources. */
export function consultantSources(c: InflowConsultantEntry) {
  const seed = hash(c.consultant);
  const weights = inflowSourceData.map((s, i) => s.bemiddelbareKandidaten * (1 + ((seed >> i) % 5) / 4));
  const sum = weights.reduce((a, b) => a + b, 0);
  const total = Math.round(c.inschrijvingen * 1.3);
  const raw = weights.map(w => (total * w) / sum);
  const counts = raw.map(Math.floor);
  let rest = total - counts.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest-- > 0) counts[i] = (counts[i] ?? 0) + 1; });
  return inflowSourceData.map((s, i) => ({
    bron: s.bron,
    count: counts[i] ?? 0,
    qualityScore: Math.min(100, Math.max(0, 58 + ((i * 29 + seed) % 35))),
  })).filter(r => r.count > 0).sort((a, b) => b.count - a.count);
}

export function consultantQuality(c: InflowConsultantEntry) {
  return aggregateQualityScore(consultantSources(c).map(r => ({ qualityScore: r.qualityScore, conversions: r.count }))) ?? 0;
}

export function consultantHeractiveringen(c: InflowConsultantEntry) {
  return Math.max(0, Math.round(c.inschrijvingen * (0.12 + (hash(c.consultant) % 10) / 100)));
}

interface Props {
  consultant: InflowConsultantEntry | null;
  onClose: () => void;
}

export default function ConsultantDetailDialog({ consultant, onClose }: Props) {
  const sources = useMemo(() => (consultant ? consultantSources(consultant) : []), [consultant]);
  if (!consultant) return null;
  const totalCandidates = sources.reduce((a, r) => a + r.count, 0);
  const quality = consultantQuality(consultant);
  const stats = [
    { label: "Inschrijvingen", value: String(consultant.inschrijvingen) },
    { label: "Heractiveringen", value: String(consultantHeractiveringen(consultant)) },
    { label: "Kandidaten", value: String(totalCandidates) },
    { label: "Quality score", value: formatQualityScore(quality) },
  ];
  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{consultant.consultant}</DialogTitle>
          <DialogDescription>{consultant.unit}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold">Kandidaten per bron</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="h-11 px-3 text-left font-medium">Bron</th>
                <th className="h-11 px-3 text-right font-medium">Kandidaten</th>
                <th className="h-11 px-3 text-right font-medium">Aandeel</th>
                <th className="h-11 px-3 text-right font-medium">Quality score</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(r => (
                <tr key={r.bron} className="border-b last:border-0">
                  <td className="px-3 py-2.5">{r.bron}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.count}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{totalCandidates > 0 ? ((r.count / totalCandidates) * 100).toFixed(1).replace(".", ",") : "0"}%</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{formatQualityScore(r.qualityScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

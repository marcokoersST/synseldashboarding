import { ChevronLeft, ChevronRight, Wallet, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BonusRecord } from "@/data/bonusTabelData";

const money = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const REVENUE: { key: keyof BonusRecord; label: string; color: string }[] = [
  { key: "omzetDetachering", label: "Omzet Jigler", color: "hsl(var(--primary))" },
  { key: "omzetWns", label: "Omzet W&S", color: "hsl(var(--primary) / 0.7)" },
  { key: "omzetMargefactuur", label: "Omzet margefactuur", color: "hsl(var(--primary) / 0.45)" },
  { key: "omzetPlease", label: "Omzet Please", color: "hsl(var(--primary) / 0.25)" },
];
const BONUS: { key: keyof BonusRecord; label: string }[] = [
  { key: "omzetbonus", label: "Omzetbonus" },
  { key: "hpcFg", label: "HPC/FG" },
  { key: "forecastbonus", label: "Forecastbonus" },
  { key: "periodesF", label: "Periodes forecastbonus" },
  { key: "targetbonus", label: "Targetbonus" },
  { key: "prijzen", label: "Prijzen" },
];

const num = (v: unknown) => (typeof v === "number" ? v : 0);
const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);

export function BonusConsultantDetail({ rows, consultant, periode, onChange }: { rows: BonusRecord[]; consultant: string | null; periode: number; onChange: (c: string | null) => void }) {
  const idx = rows.findIndex((r) => r.consultant === consultant);
  const r = idx >= 0 ? rows[idx] : null;
  const go = (d: number) => rows.length && onChange(rows[(idx + d + rows.length) % rows.length].consultant);

  return (
    <Dialog open={!!r} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="max-w-3xl">
        {r && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 pr-6">
                <div>
                  <DialogTitle className="text-xl">{r.consultant}</DialogTitle>
                  <DialogDescription>{r.unit} · Periode {periode} · In dienst sinds {r.datumInDienst} · Uitbetaling {r.uitbetaling}</DialogDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(-1)} aria-label="Vorige consultant"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(1)} aria-label="Volgende consultant"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3">
              <Kpi label="Totaal marge" value={money.format(r.totaalMarge)} />
              <Kpi label="Totaal uit te keren" value={money.format(r.totaalUitTeKeren)} accent />
              <Kpi label="Totale bonus 2026" value={money.format(r.totaleBonus)} />
            </div>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-primary" />Omzetverdeling</h3>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {REVENUE.map((c) => (
                  <div key={c.key} style={{ width: `${pct(num(r[c.key]), REVENUE.reduce((s, x) => s + num(r[x.key]), 0))}%`, background: c.color }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {REVENUE.map((c) => (
                  <div key={c.key} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.label}</div>
                    <div className="mt-1 font-semibold tabular-nums">{money.format(num(r[c.key]))}</div>
                    <div className="text-xs text-muted-foreground">{pct(num(r[c.key]), REVENUE.reduce((s, x) => s + num(r[x.key]), 0))}%</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Wallet className="h-4 w-4 text-primary" />Bonusopbouw deze periode</h3>
              {BONUS.map((b) => {
                const v = num(r[b.key]);
                return (
                  <div key={b.key} className="grid grid-cols-[160px_1fr_90px] items-center gap-3 text-sm">
                    <span className={v ? "text-foreground" : "text-muted-foreground"}>{b.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct(v, r.totaalUitTeKeren)}%` }} /></div>
                    <span className="text-right tabular-nums font-medium">{v ? money.format(v) : "–"}</span>
                  </div>
                );
              })}
              {r.yellowCards > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {Array.from({ length: r.yellowCards }).map((_, i) => (
                    <span key={i} aria-label="Gele kaart" className="inline-block h-4 w-3 rotate-6 rounded-[2px] border border-amber-500 bg-yellow-400 shadow-sm" />
                  ))}
                  Gele kaart
                </p>
              )}
            </section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? "rounded-lg border border-primary/40 bg-primary/5 p-3" : "rounded-lg border border-border p-3"}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}

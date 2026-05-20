import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { myTeamConsultants } from "@/data/managerData";
import { consultantRevenueDetailData } from "@/data/managerRevenueDetailData";
import { attritionProjectionData, activeSecondmentsData } from "@/data/managerRevenueDetailData";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, statusFromRatio } from "@/lib/lcbStatus";

interface Props {
  selectedUnits: string[];
  selectedConsultants: number[];
  search: string;
  onOpenStoppers: (consultantId: number) => void;
  onOpenPlacements: (consultantId: number) => void;
  onOpenRevenue: (consultantId: number) => void;
}

export function FinanceForecastTab({
  selectedUnits,
  selectedConsultants,
  search,
  onOpenStoppers,
  onOpenPlacements,
  onOpenRevenue,
}: Props) {
  const consultants = useMemo(() => {
    let r = myTeamConsultants;
    if (selectedUnits.length > 0) r = r.filter((c) => selectedUnits.includes(c.unit));
    if (selectedConsultants.length > 0) r = r.filter((c) => selectedConsultants.includes(c.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) => c.name.toLowerCase().includes(q));
    }
    return r;
  }, [selectedUnits, selectedConsultants, search]);

  const rows = useMemo(() =>
    consultants.map((c) => {
      const detail = consultantRevenueDetailData.find((d) => d.consultantId === c.id);
      const target = Math.round(c.revenue / 1000); // k
      const realised = Math.round((c.revenue * (0.7 + Math.random() * 0.35)) / 1000);
      const forecast = Math.round(realised * (1 + Math.random() * 0.25));
      const delta = realised - target;
      const margePerHour = 38 + Math.round(Math.random() * 22);
      const active = activeSecondmentsData.filter((s) => s.consultantName === c.name).length;
      const stoppers = attritionProjectionData.reduce(
        (s, p) => s + p.candidates.filter((cc) => cc.consultantName === c.name).length,
        0,
      );
      const wns = detail
        ? detail.secondments.filter((s) => s.type === "W&S").reduce((s, r) => s + r.monthlyRevenue, 0)
        : 0;
      const ratio = realised / Math.max(target, 1);
      const status = statusFromRatio(ratio);
      const risk = stoppers >= 3 ? "Hoog" : stoppers >= 1 ? "Middel" : "Laag";
      const riskClass = risk === "Hoog" ? "text-red-500" : risk === "Middel" ? "text-amber-500" : "text-emerald-500";
      return { c, target, realised, forecast, delta, margePerHour, active, stoppers, wns, status, risk, riskClass };
    }), [consultants]);

  const totals = useMemo(() => {
    return rows.reduce(
      (a, r) => ({
        target: a.target + r.target,
        realised: a.realised + r.realised,
        forecast: a.forecast + r.forecast,
        active: a.active + r.active,
        stoppers: a.stoppers + r.stoppers,
        wns: a.wns + r.wns,
      }),
      { target: 0, realised: 0, forecast: 0, active: 0, stoppers: 0, wns: 0 },
    );
  }, [rows]);
  const realisedPct = totals.target ? Math.round((totals.realised / totals.target) * 100) : 0;
  const margePct = 28.4;

  return (
    <div className="h-full flex flex-col">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-3">
        <Kpi label="YTD realised" value={`€${totals.realised}k`} sub={`${realisedPct}% v target (€${totals.target}k)`} tone={realisedPct >= 90 ? "clean" : "attention"} />
        <Kpi label="Forecast YR" value={`€${totals.forecast}k`} sub={`${Math.round((totals.forecast / Math.max(totals.target, 1)) * 100)}% v target`} />
        <Kpi label="Brutomarge" value={`${margePct}%`} sub="Marge/uur ø €48" tone="clean" />
        <Kpi label="Actieve plaatsingen" value={`${totals.active}`} sub={`${totals.stoppers} verwachte stoppers`} tone={totals.stoppers >= 3 ? "attention" : "clean"} />
        <Kpi label="WNS revenue" value={`€${totals.wns}k`} sub="Apart van Detavast/Marge Fac" />
      </div>

      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Omzet & forecast per consultant</h2>
          <p className="text-[11px] text-muted-foreground">
            Klik op "Verwachte stoppers" of "Actieve plaatsingen" voor onderliggende kandidaten en risico-acties.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-20 bg-muted/60 backdrop-blur">
            <tr className="text-left">
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Consultant</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Target</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Realised</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Forecast</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Δ vs target</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Marge/uur</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Actief</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Stoppers</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">WNS</th>
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Risico</th>
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{r.c.name}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">€{r.target}k</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => onOpenRevenue(r.c.id)} className="tabular-nums font-semibold hover:text-primary hover:underline">€{r.realised}k</button>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">€{r.forecast}k</td>
                <td className={cn("px-3 py-2 text-right tabular-nums font-medium", r.delta >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {r.delta >= 0 ? "+" : ""}€{r.delta}k
                </td>
                <td className="px-3 py-2 text-right tabular-nums">€{r.margePerHour}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => onOpenPlacements(r.c.id)} className="tabular-nums hover:text-primary hover:underline">{r.active}</button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => onOpenStoppers(r.c.id)} className={cn("tabular-nums hover:underline", r.stoppers > 0 ? "text-amber-500 hover:text-amber-600 font-medium" : "text-muted-foreground")}>{r.stoppers}</button>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">€{r.wns}k</td>
                <td className={cn("px-3 py-2 text-[11px] font-medium", r.riskClass)}>{r.risk}</td>
                <td className="px-3 py-2">
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[r.status])}>
                    {LCB_STATUS_LABEL[r.status]}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-12 text-center text-xs text-muted-foreground">Geen consultants gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "clean" | "attention" | "critical" }) {
  const color = tone === "clean" ? "text-emerald-500" : tone === "attention" ? "text-amber-500" : tone === "critical" ? "text-red-500" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">{label}</div>
      <div className={cn("text-lg font-bold tabular-nums leading-tight mt-0.5", color)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground truncate mt-0.5">{sub}</div>}
    </div>
  );
}

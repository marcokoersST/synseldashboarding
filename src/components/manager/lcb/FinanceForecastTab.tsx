import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { consultantRevenueDetailData, attritionProjectionData, activeSecondmentsData } from "@/data/managerRevenueDetailData";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, statusFromRatio } from "@/lib/lcbStatus";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { buildFinancePerfRow, lcbTeam } from "@/data/lcbMarketData";
import { RevenueForecastChart } from "./RevenueForecastChart";

type Perspective = "margin" | "performance";

interface Props {
  selectedUnits: string[];
  selectedConsultants: number[];
  search: string;
  onOpenStoppers: (consultantId: number) => void;
  onOpenPlacements: (consultantId: number) => void;
  onOpenRevenue: (consultantId: number) => void;
  onOpenYtd: () => void;
  onOpenForecast: () => void;
  onOpenSoonToStart: (consultantId: number) => void;
  onOpenNetImpact: (consultantId: number) => void;
}

export function FinanceForecastTab({
  selectedUnits, selectedConsultants, search,
  onOpenStoppers, onOpenPlacements, onOpenRevenue,
  onOpenYtd, onOpenForecast, onOpenSoonToStart, onOpenNetImpact,
}: Props) {
  const [perspective, setPerspective] = useState<Perspective>("margin");
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);

  const consultants = useMemo(() => {
    let r = lcbTeam;
    if (selectedUnits.length > 0) r = r.filter((c) => selectedUnits.includes(c.unit));
    if (selectedConsultants.length > 0) r = r.filter((c) => selectedConsultants.includes(c.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) => c.name.toLowerCase().includes(q));
    }
    return r;
  }, [selectedUnits, selectedConsultants, search]);

  // ─── Margin perspective rows ───
  const marginRows = useMemo(() => consultants.map((c) => {
    const detail = consultantRevenueDetailData.find((d) => d.consultantId === c.id);
    const target = 600 + ((c.id * 53) % 1200);
    const seedR = ((c.id * 131) % 100) / 100;
    const realised = Math.round(target * (0.7 + seedR * 0.35));
    const forecast = Math.round(realised * (1 + ((c.id * 7) % 25) / 100));
    const potential = Math.round(target * 1.15);
    const realisedPotential = Math.round(potential * (0.6 + seedR * 0.3));
    const margin = Math.round(realised * (0.25 + seedR * 0.1));
    const margePerHour = 38 + ((c.id * 3) % 22);
    const revRisk = attritionProjectionData.reduce((s, p) =>
      s + p.candidates.filter((cc) => cc.consultantName === c.name).reduce((acc, cc) => acc + cc.revenue, 0), 0,
    );
    const financialCat = ["Detavast", "W&S", "Marge Fac"][c.id % 3];
    const ratio = realised / Math.max(target, 1);
    const status = statusFromRatio(ratio);
    const wns = detail ? detail.secondments.filter((s) => s.type === "W&S").reduce((s, r) => s + r.monthlyRevenue, 0) : 0;
    return { c, target, realised, forecast, margin, potential, realisedPotential, margePerHour, revRisk, financialCat, status, wns };
  }), [consultants]);

  // ─── Performance perspective rows (financial consequences) ───
  const perfRows = useMemo(() => consultants.map((c) => buildFinancePerfRow(c.id, c.name)), [consultants]);

  // ─── Totals ───
  const marginTotals = useMemo(() => marginRows.reduce((a, r) => ({
    target: a.target + r.target, realised: a.realised + r.realised, forecast: a.forecast + r.forecast,
    margin: a.margin + r.margin, potential: a.potential + r.potential, realisedPotential: a.realisedPotential + r.realisedPotential,
    revRisk: a.revRisk + r.revRisk, wns: a.wns + r.wns,
  }), { target: 0, realised: 0, forecast: 0, margin: 0, potential: 0, realisedPotential: 0, revRisk: 0, wns: 0 }), [marginRows]);

  const perfTotals = useMemo(() => perfRows.reduce((a, r) => ({
    activeCandidates: a.activeCandidates + r.activeCandidates,
    activeMonthlyRevenue: a.activeMonthlyRevenue + r.activeMonthlyRevenue,
    soonToStart: a.soonToStart + r.soonToStart,
    soonToStartRevenue: a.soonToStartRevenue + r.soonToStartRevenue,
    expectedStoppers: a.expectedStoppers + r.expectedStoppers,
    stopperRiskRevenue: a.stopperRiskRevenue + r.stopperRiskRevenue,
    likelyExtensions: a.likelyExtensions + r.likelyExtensions,
    likelyExtensionRevenue: a.likelyExtensionRevenue + r.likelyExtensionRevenue,
    placementsYTD: a.placementsYTD + r.placementsYTD,
    netImpact: a.netImpact + r.netImpact,
  }), { activeCandidates: 0, activeMonthlyRevenue: 0, soonToStart: 0, soonToStartRevenue: 0, expectedStoppers: 0, stopperRiskRevenue: 0, likelyExtensions: 0, likelyExtensionRevenue: 0, placementsYTD: 0, netImpact: 0 }), [perfRows]);

  const realisedPct = marginTotals.target ? Math.round((marginTotals.realised / marginTotals.target) * 100) : 0;
  const margePct = marginTotals.realised ? Math.round((marginTotals.margin / marginTotals.realised) * 100) : 0;
  const totalRevenue = marginTotals.realised; // Detavast + W&S + Marge Fac combined (all secondment types contribute to realised)
  const totalActive = activeSecondmentsData.filter((s) => consultants.some((c) => c.name === s.consultantName)).length;

  return (
    <div className="h-full flex flex-col">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
        <Kpi label="YTD realised" value={`€${marginTotals.realised}k`} sub={`${realisedPct}% v target (€${marginTotals.target}k)`} tone={realisedPct >= 90 ? "clean" : "attention"} onClick={onOpenYtd} />
        <Kpi label="Forecast jaar" value={`€${marginTotals.forecast}k`} sub={`${Math.round((marginTotals.forecast / Math.max(marginTotals.target, 1)) * 100)}% v target`} onClick={onOpenForecast} />
        <Kpi label="Brutomarge" value={`${margePct}%`} sub="Marge ÷ omzet × 100" tooltip="Brutomarge = (omzet − directe kosten) ÷ omzet × 100. Toont het percentage van iedere omgezette euro dat overblijft als marge. Hoger = winstgevender per geplaatste uur." tone="clean" />
        <Kpi label="Actieve plaatsingen" value={`${totalActive}`} sub={`${perfTotals.expectedStoppers} verwachte stoppers`} tone={perfTotals.expectedStoppers >= 3 ? "attention" : "clean"} />
        <Kpi label="Total revenue" value={`€${totalRevenue}k`} sub={`Detavast + W&S + Marge Fac (W&S €${marginTotals.wns}k)`} tone="clean" />
      </div>

      {/* Perspective switcher */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Omzet & forecast per consultant</h2>
          <p className="text-[11px] text-muted-foreground">
            {perspective === "margin"
              ? "Marge-perspectief: financiële cijfers centraal. Klik een bedrag voor onderliggende deals."
              : "Performance-perspectief: actieve kandidaten met hun financiële gevolgen. Klik een aantal voor onderliggende kandidaten."}
          </p>
        </div>
        <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-card text-[11px]">
          <PerspBtn active={perspective === "margin"} onClick={() => setPerspective("margin")}>Marge</PerspBtn>
          <PerspBtn active={perspective === "performance"} onClick={() => setPerspective("performance")}>Performance</PerspBtn>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="rounded-lg border border-border bg-card">
          {perspective === "margin" ? (
            <MarginTable
              rows={marginRows} totals={marginTotals}
              hoverRow={hoverRow} hoverCol={hoverCol}
              setHoverRow={setHoverRow} setHoverCol={setHoverCol}
              onOpenRevenue={onOpenRevenue}
            />
          ) : (
            <PerformanceTable
              rows={perfRows} totals={perfTotals}
              hoverRow={hoverRow} hoverCol={hoverCol}
              setHoverRow={setHoverRow} setHoverCol={setHoverCol}
              onOpenPlacements={onOpenPlacements}
              onOpenSoonToStart={onOpenSoonToStart}
              onOpenStoppers={onOpenStoppers}
              onOpenNetImpact={onOpenNetImpact}
            />
          )}
        </div>
        {perspective === "margin" && (
          <RevenueForecastChart rows={marginRows} onOpenRevenue={onOpenRevenue} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────── Margin table ───────────────────────
function MarginTable({ rows, totals, hoverRow, hoverCol, setHoverRow, setHoverCol, onOpenRevenue }: any) {
  const cols = [
    { key: "consultant", label: "Consultant", sticky: true },
    { key: "revenue", label: "Revenue (€k)", right: true },
    { key: "margin", label: "Margin (€k)", right: true },
    { key: "forecast", label: "Forecast (€k)", right: true },
    { key: "realised", label: "Realised", right: true },
    { key: "potential", label: "Potentieel", right: true },
    { key: "realisedPot", label: "Realised pot.", right: true },
    { key: "revRisk", label: "Revenue risk", right: true },
    { key: "margePerHour", label: "Marge/uur", right: true },
    { key: "financialCat", label: "Categorie" },
    { key: "status", label: "Status" },
  ];
  return (
    <table className="w-full text-xs border-collapse">
      <THead cols={cols} hoverCol={hoverCol} />
      <tbody>
        {rows.map((r: any) => {
          const isRow = hoverRow === r.c.id;
          const cell = (key: string) => isRow || hoverCol === key;
          const enter = (key: string) => () => { setHoverRow(r.c.id); setHoverCol(key); };
          return (
            <tr key={r.c.id} className={cn("border-t border-border", isRow && "bg-muted/30")} onMouseLeave={() => hoverRow === r.c.id && setHoverRow(null)}>
              <Td sticky highlight={cell("consultant")} intersect={isRow && hoverCol === "consultant"} onEnter={enter("consultant")}>
                <span className="font-medium whitespace-nowrap">{r.c.name}</span>
              </Td>
              <Td align="right" highlight={cell("revenue")} intersect={isRow && hoverCol === "revenue"} onEnter={enter("revenue")}>
                <button type="button" onClick={() => onOpenRevenue(r.c.id)} className="tabular-nums font-semibold hover:text-primary hover:underline">€{r.realised}k</button>
              </Td>
              <Td align="right" highlight={cell("margin")} intersect={isRow && hoverCol === "margin"} onEnter={enter("margin")}><span className="tabular-nums">€{r.margin}k</span></Td>
              <Td align="right" highlight={cell("forecast")} intersect={isRow && hoverCol === "forecast"} onEnter={enter("forecast")}><span className="tabular-nums">€{r.forecast}k</span></Td>
              <Td align="right" highlight={cell("realised")} intersect={isRow && hoverCol === "realised"} onEnter={enter("realised")}>
                <span className={cn("tabular-nums font-medium", r.realised - r.target >= 0 ? "text-emerald-500" : "text-red-500")}>€{r.realised}k</span>
              </Td>
              <Td align="right" highlight={cell("potential")} intersect={isRow && hoverCol === "potential"} onEnter={enter("potential")}><span className="tabular-nums">€{r.potential}k</span></Td>
              <Td align="right" highlight={cell("realisedPot")} intersect={isRow && hoverCol === "realisedPot"} onEnter={enter("realisedPot")}><span className="tabular-nums">€{r.realisedPotential}k</span></Td>
              <Td align="right" highlight={cell("revRisk")} intersect={isRow && hoverCol === "revRisk"} onEnter={enter("revRisk")}>
                <span className={cn("tabular-nums", r.revRisk > 0 ? "text-amber-500" : "text-muted-foreground")}>€{r.revRisk}</span>
              </Td>
              <Td align="right" highlight={cell("margePerHour")} intersect={isRow && hoverCol === "margePerHour"} onEnter={enter("margePerHour")}><span className="tabular-nums">€{r.margePerHour}</span></Td>
              <Td highlight={cell("financialCat")} intersect={isRow && hoverCol === "financialCat"} onEnter={enter("financialCat")}><span className="text-[11px] text-muted-foreground">{r.financialCat}</span></Td>
              <Td highlight={cell("status")} intersect={isRow && hoverCol === "status"} onEnter={enter("status")}>
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[r.status])}>{LCB_STATUS_LABEL[r.status]}</span>
              </Td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="sticky bottom-0 z-20 bg-card border-t-2 border-border font-semibold">
        <tr>
          <td className="sticky left-0 z-10 bg-card px-3 py-2 border-r border-border">Totaal</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.realised}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.margin}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.forecast}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.realised}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.potential}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.realisedPotential}k</td>
          <td className="px-3 py-2 text-right tabular-nums text-amber-500">€{totals.revRisk}</td>
          <td colSpan={3} />
        </tr>
      </tfoot>
    </table>
  );
}

// ─────────────────────── Performance table (financial consequences) ───────────────────────
function PerformanceTable({ rows, totals, hoverRow, hoverCol, setHoverRow, setHoverCol, onOpenPlacements, onOpenSoonToStart, onOpenStoppers, onOpenNetImpact }: any) {
  const cols = [
    { key: "consultant", label: "Consultant", sticky: true },
    { key: "active", label: "Actieve kand.", right: true },
    { key: "activeRev", label: "€/mnd actief", right: true },
    { key: "soon", label: "Soon-to-start", right: true },
    { key: "soonRev", label: "€/mnd soon", right: true },
    { key: "stoppers", label: "Verw. stoppers", right: true },
    { key: "stopperRev", label: "Omzetrisico", right: true },
    { key: "likely", label: "Verlenging waarsch.", right: true },
    { key: "placements", label: "Plaatsingen YTD", right: true },
    { key: "avgMargin", label: "Ø marge/kand.", right: true },
    { key: "netImpact", label: "Netto fin. impact", right: true },
    { key: "ops", label: "Opdrachtgevers" },
  ];
  return (
    <table className="w-full text-xs border-collapse">
      <THead cols={cols} hoverCol={hoverCol} />
      <tbody>
        {rows.map((r: any) => {
          const isRow = hoverRow === r.consultantId;
          const cell = (key: string) => isRow || hoverCol === key;
          const enter = (key: string) => () => { setHoverRow(r.consultantId); setHoverCol(key); };
          const netClass = r.netImpact >= 0 ? "text-emerald-500" : "text-red-500";
          return (
            <tr key={r.consultantId} className={cn("border-t border-border", isRow && "bg-muted/30")} onMouseLeave={() => hoverRow === r.consultantId && setHoverRow(null)}>
              <Td sticky highlight={cell("consultant")} intersect={isRow && hoverCol === "consultant"} onEnter={enter("consultant")}>
                <span className="font-medium whitespace-nowrap">{r.consultantName}</span>
              </Td>
              <Td align="right" highlight={cell("active")} intersect={isRow && hoverCol === "active"} onEnter={enter("active")}>
                <button type="button" onClick={() => onOpenPlacements(r.consultantId)} className="tabular-nums hover:text-primary hover:underline">{r.activeCandidates}</button>
              </Td>
              <Td align="right" highlight={cell("activeRev")} intersect={isRow && hoverCol === "activeRev"} onEnter={enter("activeRev")}>
                <button type="button" onClick={() => onOpenPlacements(r.consultantId)} className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400 hover:underline">€{r.activeMonthlyRevenue}k</button>
              </Td>
              <Td align="right" highlight={cell("soon")} intersect={isRow && hoverCol === "soon"} onEnter={enter("soon")}>
                <button type="button" onClick={() => onOpenSoonToStart(r.consultantId)} className="tabular-nums hover:text-primary hover:underline">{r.soonToStart}</button>
              </Td>
              <Td align="right" highlight={cell("soonRev")} intersect={isRow && hoverCol === "soonRev"} onEnter={enter("soonRev")}>
                <button type="button" onClick={() => onOpenSoonToStart(r.consultantId)} className="tabular-nums text-blue-600 dark:text-blue-400 hover:underline">€{r.soonToStartRevenue}k</button>
              </Td>
              <Td align="right" highlight={cell("stoppers")} intersect={isRow && hoverCol === "stoppers"} onEnter={enter("stoppers")}>
                <button type="button" onClick={() => onOpenStoppers(r.consultantId)} className={cn("tabular-nums hover:underline", r.expectedStoppers > 0 ? "text-amber-500 font-medium" : "text-muted-foreground")}>{r.expectedStoppers}</button>
              </Td>
              <Td align="right" highlight={cell("stopperRev")} intersect={isRow && hoverCol === "stopperRev"} onEnter={enter("stopperRev")}>
                <button type="button" onClick={() => onOpenStoppers(r.consultantId)} className={cn("tabular-nums hover:underline", r.stopperRiskRevenue > 0 ? "text-red-500 font-medium" : "text-muted-foreground")}>−€{r.stopperRiskRevenue}k</button>
              </Td>
              <Td align="right" highlight={cell("likely")} intersect={isRow && hoverCol === "likely"} onEnter={enter("likely")}>
                <span className="tabular-nums text-[11px]">{r.likelyExtensions} <span className="text-muted-foreground">(€{r.likelyExtensionRevenue}k)</span></span>
              </Td>
              <Td align="right" highlight={cell("placements")} intersect={isRow && hoverCol === "placements"} onEnter={enter("placements")}>
                <span className="tabular-nums">{r.placementsYTD}</span>
              </Td>
              <Td align="right" highlight={cell("avgMargin")} intersect={isRow && hoverCol === "avgMargin"} onEnter={enter("avgMargin")}>
                <span className="tabular-nums">€{r.avgMarginPerCandidate.toLocaleString("nl-NL")}</span>
              </Td>
              <Td align="right" highlight={cell("netImpact")} intersect={isRow && hoverCol === "netImpact"} onEnter={enter("netImpact")}>
                <button type="button" onClick={() => onOpenNetImpact(r.consultantId)} className={cn("tabular-nums font-bold hover:underline", netClass)}>
                  {r.netImpact >= 0 ? "+" : ""}€{r.netImpact}k
                </button>
              </Td>
              <Td highlight={cell("ops")} intersect={isRow && hoverCol === "ops"} onEnter={enter("ops")}>
                <div className="flex items-center gap-1 flex-wrap">
                  {r.topOpdrachtgevers.map((o: string) => (
                    <span key={o} className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px]">{o}</span>
                  ))}
                  {r.totalOpdrachtgevers > 2 && <span className="text-[10px] text-muted-foreground">+{r.totalOpdrachtgevers - 2}</span>}
                </div>
              </Td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="sticky bottom-0 z-20 bg-card border-t-2 border-border font-semibold">
        <tr>
          <td className="sticky left-0 z-10 bg-card px-3 py-2 border-r border-border">Totaal</td>
          <td className="px-3 py-2 text-right tabular-nums">{totals.activeCandidates}</td>
          <td className="px-3 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">€{totals.activeMonthlyRevenue}k</td>
          <td className="px-3 py-2 text-right tabular-nums">{totals.soonToStart}</td>
          <td className="px-3 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">€{totals.soonToStartRevenue}k</td>
          <td className="px-3 py-2 text-right tabular-nums">{totals.expectedStoppers}</td>
          <td className="px-3 py-2 text-right tabular-nums text-red-500">−€{totals.stopperRiskRevenue}k</td>
          <td className="px-3 py-2 text-right tabular-nums text-[11px]">{totals.likelyExtensions} (€{totals.likelyExtensionRevenue}k)</td>
          <td className="px-3 py-2 text-right tabular-nums">{totals.placementsYTD}</td>
          <td className="px-3 py-2" />
          <td className={cn("px-3 py-2 text-right tabular-nums font-bold", totals.netImpact >= 0 ? "text-emerald-500" : "text-red-500")}>
            {totals.netImpact >= 0 ? "+" : ""}€{totals.netImpact}k
          </td>
          <td />
        </tr>
      </tfoot>
    </table>
  );
}

// ─────────────────────── shared bits ───────────────────────
function THead({ cols, hoverCol }: { cols: { key: string; label: string; sticky?: boolean; right?: boolean }[]; hoverCol: string | null }) {
  return (
    <thead className="sticky top-0 z-20 bg-muted/70 backdrop-blur">
      <tr className="text-left">
        {cols.map((c) => (
          <th
            key={c.key}
            className={cn(
              "px-3 py-2 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap",
              c.right && "text-right",
              c.sticky && "sticky left-0 z-30 bg-muted/70 backdrop-blur border-r border-border",
              hoverCol === c.key && "text-foreground bg-muted/40",
            )}
          >{c.label}</th>
        ))}
      </tr>
    </thead>
  );
}

function Td({ children, align = "left", sticky, highlight, intersect, onEnter }: {
  children: React.ReactNode; align?: "left" | "right"; sticky?: boolean;
  highlight?: boolean; intersect?: boolean; onEnter?: () => void;
}) {
  return (
    <td
      onMouseEnter={onEnter}
      className={cn(
        "px-3 py-1.5",
        align === "right" && "text-right",
        sticky && "sticky left-0 z-10 bg-card border-r border-border",
        highlight && (sticky ? "bg-muted/40" : "bg-muted/30"),
        intersect && "bg-muted/60",
      )}
    >
      {children}
    </td>
  );
}

function PerspBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("px-2.5 py-1 rounded text-[11px] transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
      {children}
    </button>
  );
}

function Kpi({ label, value, sub, tone, tooltip, onClick }: { label: string; value: string; sub?: string; tone?: "clean" | "attention" | "critical"; tooltip?: string; onClick?: () => void }) {
  const color = tone === "clean" ? "text-emerald-500" : tone === "attention" ? "text-amber-500" : tone === "critical" ? "text-red-500" : "text-foreground";
  const Wrap: any = onClick ? "button" : "div";
  const content = (
    <Wrap onClick={onClick} type={onClick ? "button" : undefined} className={cn("rounded-lg border border-border bg-card px-3 py-2 text-left w-full", onClick && "hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer")}>
      <div className="flex items-center gap-1">
        <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">{label}</div>
        {tooltip && <Info className="h-3 w-3 text-muted-foreground/70" />}
      </div>
      <div className={cn("text-lg font-bold tabular-nums leading-tight mt-0.5", color)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground truncate mt-0.5">{sub}</div>}
    </Wrap>
  );
  if (!tooltip) return content;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild><div>{content}</div></TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

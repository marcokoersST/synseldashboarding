import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Info, ChevronRight, ChevronDown } from "lucide-react";
import { consultantRevenueDetailData, attritionProjectionData, activeSecondmentsData } from "@/data/managerRevenueDetailData";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, statusFromRatio } from "@/lib/lcbStatus";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { buildFinancePerfRow, lcbTeam } from "@/data/lcbMarketData";
import { FinanceTrendChart } from "./FinanceTrendChart";
import { getFunctiegroepRows, type FunctiegroepRevenueRow } from "@/data/lcbFunctiegroepRevenue";
import { DevNote } from "@/components/groeimodel/DevNote";

type Perspective = "margin" | "functiegroep";

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
  perspective?: Perspective;
  onPerspectiveChange?: (p: Perspective) => void;
}

export function FinanceForecastTab({
  selectedUnits, selectedConsultants, search,
  onOpenStoppers, onOpenPlacements, onOpenRevenue,
  onOpenYtd, onOpenForecast, onOpenSoonToStart, onOpenNetImpact,
  perspective: perspectiveProp, onPerspectiveChange,
}: Props) {
  const [perspectiveLocal, setPerspectiveLocal] = useState<Perspective>("margin");
  const perspective = perspectiveProp ?? perspectiveLocal;
  const setPerspective = (p: Perspective) => {
    if (onPerspectiveChange) onPerspectiveChange(p);
    else setPerspectiveLocal(p);
  };
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);
  const [lockedId, setLockedId] = useState<number | null>(null);
  const toggleLock = (id: number) => setLockedId((curr) => (curr === id ? null : id));


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

  // ─── Performance perspective rows (financial consequences) — kept for KPI strip totals ───
  const perfRows = useMemo(() => consultants.map((c) => buildFinancePerfRow(c.id, c.name)), [consultants]);

  // ─── Functiegroep perspective rows ───
  const functiegroepRows = useMemo<FunctiegroepRevenueRow[]>(() => getFunctiegroepRows(), []);
  const functiegroepChartRows = useMemo(() => functiegroepRows.map((r) => ({
    c: { id: r.id, name: r.group },
    realised: r.realised,
    forecast: r.forecast,
    potential: r.potential,
    realisedPotential: r.realisedPotential,
    margin: r.margin,
    revRisk: r.revRisk,
  })), [functiegroepRows]);


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
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {perspective === "margin" ? "Omzet & forecast per consultant" : "Omzet & forecast per functiegroep"}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {perspective === "margin"
              ? "Marge-perspectief: financiële cijfers centraal. Klik een bedrag voor onderliggende deals."
              : "Omzet en marge per functiegroep. Klik een groep om functies te tonen."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DevNote
            id={4}
            story={<><strong>As a manager</strong>, I want realised vs target, forecast, marge en risk per consultant of functiegroep, <strong>so that</strong> I can steer revenue and spot at-risk accounts.</>}
            logic={`Finance & Forecast tab:

  • KPI strip: YTD realised, Forecast jaar, Brutomarge,
    Actieve plaatsingen, Total revenue — totals from
    marginTotals + perfTotals + activeSecondmentsData.
  • Perspective switcher toggles between
      - margin: row per consultant. target/realised/
        forecast/potential seeded deterministisch uit
        consultant id; margin = realised × (0.25..0.35);
        revRisk from attritionProjectionData.
      - functiegroep: rows from getFunctiegroepRows();
        consultantsLabel in topbar wijzigt mee.
  • Tabel: kolommen Revenue, Margin, Forecast, Realised
    (groen/rood vs target), Potentieel, Realised pot.,
    Revenue risk, Marge/uur, Categorie, Status.
  • Klik op revenue-bedrag → onOpenRevenue(consultantId).
  • FinanceTrendChart wordt onder de tabel gerenderd met
    labelMode = "consultant" of "functiegroep" zodat
    legenda en labels meeschakelen.
  • lockedId synct met de naam-kolom en de chart:
    klikken op een naam vergrendelt die serie.`}
          />
          <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-card text-[11px]">
            <PerspBtn active={perspective === "margin"} onClick={() => setPerspective("margin")}>Marge</PerspBtn>
            <PerspBtn active={perspective === "functiegroep"} onClick={() => setPerspective("functiegroep")}>Omzet per functiegroep</PerspBtn>
          </div>
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
              lockedId={lockedId} onToggleLock={toggleLock}
            />
          ) : (
            <FunctiegroepTable
              rows={functiegroepRows}
              hoverRow={hoverRow} hoverCol={hoverCol}
              setHoverRow={setHoverRow} setHoverCol={setHoverCol}
              lockedId={lockedId} onToggleLock={toggleLock}
            />
          )}
        </div>
        {perspective === "margin" ? (
          <FinanceTrendChart
            rows={marginRows}
            selectedConsultants={selectedConsultants}
            lockedId={lockedId}
            onLockedIdChange={setLockedId}
            onDrilldown={(_bucket, _metric, ids) => {
              if (ids.length === 1) onOpenRevenue(ids[0]);
            }}
            labelMode="consultant"
          />
        ) : (
          <FinanceTrendChart
            rows={functiegroepChartRows}
            selectedConsultants={[]}
            lockedId={lockedId}
            onLockedIdChange={setLockedId}
            onDrilldown={() => {}}
            labelMode="functiegroep"
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────── Margin table ───────────────────────
function MarginTable({ rows, totals, hoverRow, hoverCol, setHoverRow, setHoverCol, onOpenRevenue, lockedId, onToggleLock }: any) {
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
          const isLocked = lockedId === r.c.id;
          const cell = (key: string) => isRow || hoverCol === key;
          const enter = (key: string) => () => { setHoverRow(r.c.id); setHoverCol(key); };
          return (
            <tr key={r.c.id} className={cn("border-t border-border", isRow && "bg-muted/30", isLocked && "bg-primary/10 ring-1 ring-inset ring-primary/30")} onMouseLeave={() => hoverRow === r.c.id && setHoverRow(null)}>
              <Td sticky highlight={cell("consultant")} intersect={isRow && hoverCol === "consultant"} onEnter={enter("consultant")}>
                <button
                  type="button"
                  onClick={() => onToggleLock?.(r.c.id)}
                  className={cn("font-medium whitespace-nowrap text-left hover:text-primary hover:underline", isLocked && "text-primary underline")}
                  title={isLocked ? "Klik om te ontgrendelen" : "Klik om in de grafiek vast te zetten"}
                >
                  {r.c.name}
                </button>
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

// ─────────────────────── Functiegroep table ───────────────────────
type FgSortKey = "group" | "revenue" | "margin" | "forecast" | "realised" | "potential" | "realisedPot" | "revRisk" | "margePerHour" | "placements";
type SortDir = "asc" | "desc";

function FunctiegroepTable({ rows, hoverRow, hoverCol, setHoverRow, setHoverCol, lockedId, onToggleLock }: {
  rows: FunctiegroepRevenueRow[];
  hoverRow: number | null; hoverCol: string | null;
  setHoverRow: (n: number | null) => void; setHoverCol: (s: string | null) => void;
  lockedId: number | null; onToggleLock: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<FgSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleSort = (k: FgSortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const getVal = (r: FunctiegroepRevenueRow, k: FgSortKey): number | string => {
    switch (k) {
      case "group": return r.group;
      case "revenue": return r.revenue;
      case "margin": return r.margin;
      case "forecast": return r.forecast;
      case "realised": return r.revenue - r.target;
      case "potential": return r.potential;
      case "realisedPot": return r.realisedPotential;
      case "revRisk": return r.revRisk;
      case "margePerHour": return r.margePerHour;
      case "placements": return r.placements;
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const mult = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = getVal(a, sortKey), vb = getVal(b, sortKey);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * mult;
      return String(va).localeCompare(String(vb)) * mult;
    });
  }, [rows, sortKey, sortDir]);

  const totals = useMemo(() => rows.reduce((a, r) => ({
    revenue: a.revenue + r.revenue,
    margin: a.margin + r.margin,
    forecast: a.forecast + r.forecast,
    potential: a.potential + r.potential,
    realisedPotential: a.realisedPotential + r.realisedPotential,
    revRisk: a.revRisk + r.revRisk,
    placements: a.placements + r.placements,
    target: a.target + r.target,
  }), { revenue: 0, margin: 0, forecast: 0, potential: 0, realisedPotential: 0, revRisk: 0, placements: 0, target: 0 }), [rows]);

  const cols: { key: FgSortKey | "status"; label: string; right?: boolean; sticky?: boolean; sortable?: boolean }[] = [
    { key: "group", label: "Functiegroep", sticky: true, sortable: true },
    { key: "revenue", label: "Revenue (€k)", right: true, sortable: true },
    { key: "margin", label: "Margin (€k)", right: true, sortable: true },
    { key: "forecast", label: "Forecast (€k)", right: true, sortable: true },
    { key: "realised", label: "Realised", right: true, sortable: true },
    { key: "potential", label: "Potentieel", right: true, sortable: true },
    { key: "realisedPot", label: "Realised pot.", right: true, sortable: true },
    { key: "revRisk", label: "Revenue risk", right: true, sortable: true },
    { key: "margePerHour", label: "Marge/uur", right: true, sortable: true },
    { key: "placements", label: "Plaatsingen", right: true, sortable: true },
    { key: "status", label: "Status" },
  ];

  const arrow = (k: FgSortKey) => sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "↕";

  return (
    <table className="w-full text-xs border-collapse">
      <thead className="sticky top-0 z-20 bg-muted/70 backdrop-blur">
        <tr className="text-left">
          {cols.map((c) => (
            <th
              key={c.key}
              onClick={() => c.sortable && toggleSort(c.key as FgSortKey)}
              className={cn(
                "px-3 py-2 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap",
                c.right && "text-right",
                c.sticky && "sticky left-0 z-30 bg-muted/70 backdrop-blur border-r border-border",
                c.sortable && "cursor-pointer select-none hover:text-foreground",
                hoverCol === c.key && "text-foreground bg-muted/40",
              )}
            >
              <span className="inline-flex items-center gap-1">
                {c.label}
                {c.sortable && <span className={cn("text-[9px]", sortKey === c.key ? "text-foreground" : "opacity-30")}>{arrow(c.key as FgSortKey)}</span>}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => {
          const isRow = hoverRow === r.id;
          const isLocked = lockedId === r.id;
          const isExp = expanded.has(r.id);
          const cell = (key: string) => isRow || hoverCol === key;
          const enter = (key: string) => () => { setHoverRow(r.id); setHoverCol(key); };
          const status = statusFromRatio(r.target ? r.revenue / r.target : 0);
          return (
            <React.Fragment key={r.id}>
              <tr
                className={cn("border-t border-border", isRow && "bg-muted/30", isLocked && "bg-primary/10 ring-1 ring-inset ring-primary/30")}
                onMouseLeave={() => hoverRow === r.id && setHoverRow(null)}
              >
                <Td sticky highlight={cell("group")} intersect={isRow && hoverCol === "group"} onEnter={enter("group")}>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(r.id)}
                      className="p-0.5 hover:text-primary"
                      title={isExp ? "Inklappen" : "Toon functies"}
                    >
                      {isExp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLock(r.id)}
                      className={cn("font-medium whitespace-nowrap text-left hover:text-primary hover:underline", isLocked && "text-primary underline")}
                      title={isLocked ? "Klik om te ontgrendelen" : "Klik om in de grafiek vast te zetten"}
                    >
                      {r.group}
                    </button>
                  </div>
                </Td>
                <Td align="right" highlight={cell("revenue")} intersect={isRow && hoverCol === "revenue"} onEnter={enter("revenue")}><span className="tabular-nums font-semibold">€{r.revenue}k</span></Td>
                <Td align="right" highlight={cell("margin")} intersect={isRow && hoverCol === "margin"} onEnter={enter("margin")}><span className="tabular-nums">€{r.margin}k</span></Td>
                <Td align="right" highlight={cell("forecast")} intersect={isRow && hoverCol === "forecast"} onEnter={enter("forecast")}><span className="tabular-nums">€{r.forecast}k</span></Td>
                <Td align="right" highlight={cell("realised")} intersect={isRow && hoverCol === "realised"} onEnter={enter("realised")}>
                  <span className={cn("tabular-nums font-medium", r.revenue - r.target >= 0 ? "text-emerald-500" : "text-red-500")}>€{r.revenue}k</span>
                </Td>
                <Td align="right" highlight={cell("potential")} intersect={isRow && hoverCol === "potential"} onEnter={enter("potential")}><span className="tabular-nums">€{r.potential}k</span></Td>
                <Td align="right" highlight={cell("realisedPot")} intersect={isRow && hoverCol === "realisedPot"} onEnter={enter("realisedPot")}><span className="tabular-nums">€{r.realisedPotential}k</span></Td>
                <Td align="right" highlight={cell("revRisk")} intersect={isRow && hoverCol === "revRisk"} onEnter={enter("revRisk")}>
                  <span className={cn("tabular-nums", r.revRisk > 0 ? "text-amber-500" : "text-muted-foreground")}>€{r.revRisk}</span>
                </Td>
                <Td align="right" highlight={cell("margePerHour")} intersect={isRow && hoverCol === "margePerHour"} onEnter={enter("margePerHour")}><span className="tabular-nums">€{r.margePerHour}</span></Td>
                <Td align="right" highlight={cell("placements")} intersect={isRow && hoverCol === "placements"} onEnter={enter("placements")}><span className="tabular-nums">{r.placements}</span></Td>
                <Td highlight={cell("status")} intersect={isRow && hoverCol === "status"} onEnter={enter("status")}>
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[status])}>{LCB_STATUS_LABEL[status]}</span>
                </Td>
              </tr>
              {isExp && r.functies.map((f) => (
                <tr key={`${r.id}-${f.functie}`} className="border-t border-border/50 bg-muted/10">
                  <td className="sticky left-0 z-10 bg-muted/10 px-3 py-1 border-r border-border pl-10 text-[11px] text-muted-foreground whitespace-nowrap">{f.functie}</td>
                  <td className="px-3 py-1 text-right tabular-nums">€{f.revenue}k</td>
                  <td className="px-3 py-1 text-right tabular-nums">€{f.margin}k</td>
                  <td className="px-3 py-1 text-right tabular-nums">€{f.forecast}k</td>
                  <td className={cn("px-3 py-1 text-right tabular-nums", f.revenue - f.target >= 0 ? "text-emerald-500" : "text-red-500")}>€{f.revenue}k</td>
                  <td className="px-3 py-1 text-right tabular-nums">€{f.potential}k</td>
                  <td className="px-3 py-1 text-right tabular-nums">€{f.realisedPotential}k</td>
                  <td className={cn("px-3 py-1 text-right tabular-nums", f.revRisk > 0 ? "text-amber-500" : "text-muted-foreground")}>€{f.revRisk}</td>
                  <td className="px-3 py-1 text-right tabular-nums">€{f.margePerHour}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{f.placements}</td>
                  <td />
                </tr>
              ))}
            </React.Fragment>
          );
        })}
      </tbody>
      <tfoot className="sticky bottom-0 z-20 bg-card border-t-2 border-border font-semibold">
        <tr>
          <td className="sticky left-0 z-10 bg-card px-3 py-2 border-r border-border">Totaal</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.revenue}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.margin}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.forecast}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.revenue}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.potential}k</td>
          <td className="px-3 py-2 text-right tabular-nums">€{totals.realisedPotential}k</td>
          <td className="px-3 py-2 text-right tabular-nums text-amber-500">€{totals.revRisk}</td>
          <td className="px-3 py-2" />
          <td className="px-3 py-2 text-right tabular-nums">{totals.placements}</td>
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

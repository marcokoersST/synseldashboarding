import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BonusConsultantDetail } from "@/components/bonus/BonusConsultantDetail";
import { RankingDevInfo } from "@/components/dashboard/RankingDevInfo";
import { cn } from "@/lib/utils";
import { BONUS_UNITS, BonusRecord, DEFAULT_PERIODE, PERIODES, bonusRecordsForPeriode, periodeWeeks } from "@/data/bonusTabelData";

type Key = keyof BonusRecord;
type Kind = "text" | "money" | "count";
const COLUMNS: { key: Key; label: string; kind: Kind }[] = [
  { key: "datumInDienst", label: "Datum in dienst", kind: "text" },
  { key: "uitbetaling", label: "Uitbetaling", kind: "text" },
  { key: "targetbonus", label: "Targetbonus", kind: "money" },
  { key: "prijzen", label: "Prijzen", kind: "money" },
  { key: "periodesF", label: "Periodes forecastbonus", kind: "money" },
  { key: "forecastbonus", label: "Forecastbonus", kind: "money" },
  { key: "hpcFg", label: "HPC/FG", kind: "money" },
  { key: "omzetDetachering", label: "Omzet Jigler", kind: "money" },
  { key: "omzetWns", label: "Omzet W&S", kind: "money" },
  { key: "omzetMargefactuur", label: "Omzet margefactuur", kind: "money" },
  { key: "omzetPlease", label: "Omzet Please", kind: "money" },
  { key: "totaalMarge", label: "Totaal marge", kind: "money" },
  { key: "omzetbonus", label: "Omzetbonus", kind: "money" },
  { key: "totaalUitTeKeren", label: "Totaal uit te keren", kind: "money" },
  { key: "totaleBonus", label: "Totale bonus 2026", kind: "money" },
];
const STORAGE = "bonus-tabel-columns-v4";
const DEFAULT_HIDDEN: Key[] = ["datumInDienst", "uitbetaling", "omzetDetachering", "omzetWns", "omzetMargefactuur", "omzetPlease"];
const money = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const fmt = (v: unknown, kind: Kind) => (v === null || v === undefined || v === 0 || v === "" ? "–" : kind === "money" ? money.format(v as number) : String(v));

function MultiFilter({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const all = selected.length === 0 || selected.length === options.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          {label}: {all ? "Alle" : selected.length}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-semibold">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onChange([])}>Alles aan</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onChange(["__none__"])}>Alles uit</Button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {options.map((o) => {
            const checked = selected.length === 0 || selected.includes(o);
            return (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => {
                    const base = selected.length === 0 ? options : selected.filter((s) => s !== "__none__");
                    const next = checked ? base.filter((s) => s !== o) : [...base, o];
                    onChange(next.length === options.length ? [] : next.length ? next : ["__none__"]);
                  }}
                />
                {o}
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function BonusTabelOverzicht() {
  const [periode, setPeriode] = useState(DEFAULT_PERIODE);
  const [units, setUnits] = useState<string[]>([]);
  const [consultants, setConsultants] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "totaleBonus", dir: -1 });
  const [visible, setVisible] = useState<Key[]>(() => {
    try { const s = localStorage.getItem(STORAGE); if (s) return JSON.parse(s); } catch { /* ignore */ }
    return COLUMNS.map((c) => c.key).filter((k) => !DEFAULT_HIDDEN.includes(k));
  });
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(visible)); }, [visible]);

  const records = useMemo(() => bonusRecordsForPeriode(periode), [periode]);
  const consultantOptions = useMemo(
    () => records.filter((r) => units.length === 0 || units.includes(r.unit)).map((r) => r.consultant).sort(),
    [records, units],
  );
  const rows = useMemo(() => {
    const list = records.filter((r) => (units.length === 0 || units.includes(r.unit)) && (consultants.length === 0 || consultants.includes(r.consultant)));
    return [...list].sort((a, b) => {
      const x = a[sort.key] ?? 0, y = b[sort.key] ?? 0;
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [records, units, consultants, sort]);

  const cols = COLUMNS.filter((c) => visible.includes(c.key));
  const total = (k: Key) => rows.reduce((s, r) => s + ((r[k] as number) || 0), 0);
  const toggleSort = (key: Key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  const weeks = periodeWeeks(periode);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bonus Tabel Overzicht</h1>
          <p className="text-sm text-muted-foreground">
            Bonus periode {periode} (week {weeks.slice(0, 3).join(", ")} & {weeks[3]})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9" disabled={periode <= 1} onClick={() => setPeriode((p) => p - 1)} aria-label="Vorige periode"><ChevronLeft className="h-4 w-4" /></Button>
            <Select value={String(periode)} onValueChange={(v) => setPeriode(Number(v))}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{PERIODES.map((p) => <SelectItem key={p} value={String(p)}>Periode {p}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9" disabled={periode >= 13} onClick={() => setPeriode((p) => p + 1)} aria-label="Volgende periode"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <MultiFilter label="Unit" options={[...BONUS_UNITS]} selected={units} onChange={(v) => { setUnits(v); setConsultants([]); }} />
          <MultiFilter label="Consultant" options={consultantOptions} selected={consultants} onChange={setConsultants} />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5"><Columns3 className="h-4 w-4" />Kolommen ({cols.length}/{COLUMNS.length})</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-0">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-semibold">Kolommen</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setVisible(COLUMNS.map((c) => c.key))}>Alles aan</Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setVisible([])}>Alles uit</Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {COLUMNS.map((c) => (
                  <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                    <Checkbox checked={visible.includes(c.key)} onCheckedChange={(on) => setVisible((v) => (on ? [...v, c.key] : v.filter((k) => k !== c.key)))} />
                    {c.label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <RankingDevInfo
            source="Static mock data reproducing the bonus spreadsheet (period 8 matches the source exactly; other periods are deterministic derivations)."
            filters="Period (P1–P13, 4 weeks each), unit multi-select, consultant multi-select (options limited to selected units). Column visibility persisted in localStorage."
            ranking="Default: Total bonus 2026 descending. Every column header toggles sort."
            calculations={[
              "Periods: 13 periods of 4 weeks. Holiday periods are fixed: P1, P8, P9 and P13.",
              "'Starts' everywhere = number of placements with a creation start date (aanmaakstartdatum) within that period.",
              "Omzet Jigler = secondment (detachering) revenue invoiced via Jigler in the selected period",
              "Omzet W&S = recruitment & selection fee revenue (mock values, no source column yet)",
              "Omzet margefactuur = margin-invoice revenue; Omzet Please = revenue via Please",
              "Totaal marge = Omzet Jigler + Omzet margefactuur + Omzet Please. W&S is NOT included.",
              "Omzetbonus (per period): ladder on period revenue (excl. W&S). Strict floor: the highest tier the revenue is at or above applies, never rounded up (e.g. €48k → €40k tier). Full ladder: €10k → €200 · €20k → €300 · €30k → €400 · €40k → €500 · €50k → €700 · €60k → €900 · €70k → €1,250 · €80k → €1,750 · €90k → €2,250 · €100k → €2,750 · €110k → €3,250 · €120k → €4,000 · €130k → €5,000 · €140k → €6,000 · €150k → €8,000 · €160k → €10,000.",
              "Targetbonus: one-off payout per yearly cumulative revenue threshold; not cumulative (each tier pays its own amount once). Counts ALL revenue: Jigler + margefactuur + Please + W&S. It is the only bonus where W&S revenue counts. Full ladder: €250k → €1,000 · €500k → €3,000 · €750k → €5,000 · €1M → €10,000 · €1.25M → €15,000 · €1.5M → €22,500 · €1.75M → €30,000 · €2M → €40,000.",
              "Forecastbonus (monetary amount): average period revenue of the last 3 non-holiday periods (excl. W&S), compared to yearly level / 13. Tiers (yearly RF → required avg period revenue → bonus): €500k → €38,462 → +€500/month · €750k → €57,692 → +€1,000/month · €1M → €76,923 → +€1,500/month · €1.25M → €96,154 → +€2,000/month · €1.5M → €115,385 → +€2,500/month. 3-month lock-in. Retention requires avg ≥ 20 conversations per period and ≥ 6 placements with creation start date in the last 3 non-holiday periods.",
              "Periodes forecastbonus = monetary amount (€) of forecast bonus for locked-in periods; not a counter. Counts in Totaal uit te keren.",
              "HPC/FG: HPC Million €2,000/month (period revenue ≥ €76,923), HPC 7.5 Ton €1,000/month (≥ €57,692), Fast Growers €500/month (≥ €7.5k growth over 3 periods). Club bonuses continue during holiday periods; holiday periods do not count as reference periods.",
              "Prijzen: €500 per trophy, also awarded in holiday periods. Assigned MANUALLY via the Financieel tab (assign button still to be built). Trophies: Meeste Omzetgroei (≥ €3.5k growth), Margebaas (≥ 2 placements with creation start date, highest potential margin), Plaatsingskanon (≥ 3 placements with creation start date), Gesprekken-goeroe (≥ 24 conversations).",
              "Gele kaarten = shown as a yellow football-card icon directly before the HPC/FG value (one icon per card received; no separate column). A yellow card is given when Fast Growers growth drops below €7.5k; the consultant then has 2 non-holiday periods to recover.",
              "Totaal uit te keren = Omzetbonus + HPC/FG + Forecastbonus + Periodes forecastbonus + Targetbonus + Prijzen (empty = 0)",
              "Totale bonus 2026 = cumulative bonus paid out in 2026 up to the selected period",
              "Datum in dienst / Uitbetaling = HR fields. Fixed salary (salary house by RF level, €2,550–€6,500/month) is not part of this table.",
              "Row click opens a consultant detail view: revenue split (share of Totaal marge) and payout per bonus component (share of Totaal uit te keren)",
              "Hidden by default: Datum in dienst, Uitbetaling, Omzet Jigler, Omzet W&S, Omzet margefactuur, Omzet Please",
              "Footer row sums all visible monetary columns for the filtered rows",
            ]}
            rowCount={rows.length}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-muted/60">
            <tr className="h-11">
              <th className="sticky left-0 z-10 bg-muted px-3 text-left text-xs font-semibold text-muted-foreground">
                <button className="flex items-center gap-1" onClick={() => toggleSort("consultant")}>Consultant <ArrowUpDown className="h-3 w-3" /></button>
              </th>
              {cols.map((c) => (
                <th key={c.key} className={cn("whitespace-nowrap px-3 text-xs font-semibold text-muted-foreground", c.kind !== "text" ? "text-right" : "text-left")}>
                  <button className={cn("inline-flex items-center gap-1", sort.key === c.key && "text-foreground")} onClick={() => toggleSort(c.key)}>
                    {c.label} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.consultant} onClick={() => setDetail(r.consultant)} className="h-9 cursor-pointer border-t border-border hover:bg-muted/40">
                <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-3 font-medium text-foreground">
                  {r.consultant}
                  <span className="ml-2 text-[10px] text-muted-foreground">{r.unit}</span>
                </td>
                {cols.map((c) => (
                  <td key={c.key} className={cn("whitespace-nowrap px-3 tabular-nums", c.kind !== "text" ? "text-right" : "text-left", c.key === "totaleBonus" && "font-bold text-foreground", fmt(r[c.key], c.kind) === "–" && "text-muted-foreground")}>
                    {c.key === "hpcFg" && r.yellowCards > 0 ? (
                      <span className="inline-flex items-center justify-end gap-1.5">
                        {Array.from({ length: r.yellowCards }).map((_, i) => (
                          <span key={i} title={`Gele kaart (${r.yellowCards})`} aria-label="Gele kaart" className="inline-block h-4 w-3 rotate-6 rounded-[2px] border border-amber-500 bg-yellow-400 shadow-sm" />
                        ))}
                        {fmt(r[c.key], c.kind)}
                      </span>
                    ) : fmt(r[c.key], c.kind)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={cols.length + 1} className="px-3 py-8 text-center text-muted-foreground">Geen consultants voor deze filters</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="h-10 border-t-2 border-border bg-muted/60 font-semibold">
              <td className="sticky left-0 z-10 bg-muted px-3">Totaal</td>
              {cols.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-3 text-right tabular-nums">{c.kind !== "text" ? fmt(total(c.key), c.kind) : ""}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <BonusConsultantDetail rows={rows} consultant={detail} periode={periode} onChange={setDetail} />
    </div>
  );
}

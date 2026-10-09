import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DateRange } from "react-day-picker-v9";
import { getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";
import { Button } from "@/marketing-dashboard/components/ui/button";

export interface GroupChartRow { unit: string; registrations: number; acquisitions: number; prevRegistrations?: number; prevAcquisitions?: number; registrationsLabel?: string; acquisitionsLabel?: string }
export const GROUPS_PER_PAGE = 8;
export function groupChartPage(data: GroupChartRow[], page: number) {
  const pages = Math.max(1, Math.ceil(data.length / GROUPS_PER_PAGE));
  const current = Math.max(0, Math.min(page, pages - 1));
  return { pages, current, rows: data.slice(current * GROUPS_PER_PAGE, (current + 1) * GROUPS_PER_PAGE) };
}

function CategoryTick({ x = 0, y = 0, payload, onSelect, dim }: { x?: number; y?: number; payload?: { value: string }; onSelect?: ((v: string) => void) | undefined; dim?: ((v: string) => boolean) | undefined }) {
  const value = payload?.value ?? "";
  const words = value.split(/\s+/);
  const lines: string[] = [""];
  for (const word of words) {
    const index = lines.length - 1;
    if (`${lines[index]} ${word}`.trim().length > 22 && lines[index]) lines.push(word);
    else lines[index] = `${lines[index]} ${word}`.trim();
  }
  const visible = lines.slice(0, 2).map((line, index) => line.length > 24 ? `${line.slice(0, 21)}…` : index === 1 && lines.length > 2 ? `${line.slice(0, 21)}…` : line);
  return <g transform={`translate(${x},${y})`} opacity={dim?.(value) ? 0.4 : 1} style={onSelect ? { cursor: "pointer" } : undefined} onClick={() => onSelect?.(value)}><title>{value}</title><text textAnchor="end" fill="var(--muted-foreground)" fontSize={12}>{visible.map((line, index) => <tspan key={index} x={-8} dy={index === 0 ? visible.length > 1 ? -3 : 4 : 15}>{line}</tspan>)}</text></g>;
}

function deltaLabel(cur: number, prev: number, mode: "percent" | "absolute") {
  if (mode === "absolute") { const d = Math.round(cur - prev); return `${d > 0 ? "+" : ""}${d.toLocaleString("nl-NL")}`; }
  if (prev <= 0) return "";
  const d = ((cur - prev) / prev) * 100;
  return `${d > 0 ? "+" : ""}${d.toFixed(1).replace(".", ",")}%`;
}

interface ChartProps { data: GroupChartRow[]; dateRange?: DateRange; compareRange?: DateRange | null; deltaMode?: "percent" | "absolute"; selected?: string[]; onSelect?: ((unit: string) => void) | undefined }

export default function MarketingGroupChart({ data: rawData, dateRange, compareRange, deltaMode = "percent", selected = [], onSelect }: ChartProps) {
  const dim = (u: string) => selected.length > 0 && !selected.includes(u);
  const click = (d: unknown) => { if (!onSelect) return; const u = (d as { payload?: GroupChartRow; unit?: string }).payload?.unit ?? (d as { unit?: string }).unit; if (u) onSelect(u); };
  const cells = (op = 1) => rows.map(r => <Cell key={r.unit} fillOpacity={dim(r.unit) ? op * 0.3 : op} style={onSelect ? { cursor: "pointer" } : undefined} />);
  const [page, setPage] = useState(0);
  const comparing = !!(compareRange && dateRange);
  const data: GroupChartRow[] = comparing ? rawData.map(r => {
    const prevRegistrations = getComparisonValue(r.registrations, { dateRange: dateRange!, compareRange: compareRange!, seed: `group-${r.unit}-reg` });
    const prevAcquisitions = getComparisonValue(r.acquisitions, { dateRange: dateRange!, compareRange: compareRange!, seed: `group-${r.unit}-acq` });
    return { ...r, prevRegistrations, prevAcquisitions, registrationsLabel: deltaLabel(r.registrations, prevRegistrations, deltaMode), acquisitionsLabel: deltaLabel(r.acquisitions, prevAcquisitions, deltaMode) };
  }) : rawData;
  const { rows, current, pages } = groupChartPage(data, page);
  const max = Math.max(1, ...data.flatMap(row => [row.registrations, row.acquisitions, row.prevRegistrations ?? 0, row.prevAcquisitions ?? 0]));
  const height = Math.max(250, rows.length * (comparing ? 100 : 64) + 45);
  if (!data.length) return <div className="py-12 text-center text-sm text-muted-foreground">Geen data in deze selectie</div>;
  return <div aria-label="Groepsgrafiek" className="space-y-3">
    {pages > 1 && <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>{current * GROUPS_PER_PAGE + 1}–{Math.min((current + 1) * GROUPS_PER_PAGE, data.length)} van {data.length} groepen</span>
      <div className="flex items-center gap-2"><Button variant="outline" size="icon" className="size-8" aria-label="Vorige groepen" disabled={current === 0} onClick={() => setPage(current - 1)}><ChevronLeft /></Button><span className="tabular-nums">{current + 1} / {pages}</span><Button variant="outline" size="icon" className="size-8" aria-label="Volgende groepen" disabled={current === pages - 1} onClick={() => setPage(current + 1)}><ChevronRight /></Button></div>
    </div>}
    <div className="overflow-x-auto"><div className="min-w-[520px]" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={rows} layout="vertical" margin={{ left: 0, right: comparing ? 64 : 28, top: 8, bottom: 8 }} barGap={comparing ? 2 : 5} barCategoryGap={14}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, Math.ceil(max * 1.15)]} tickCount={5} allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="unit" width={175} interval={0} tick={<CategoryTick onSelect={onSelect} dim={dim} />} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          const row = payload[0]?.payload as GroupChartRow | undefined;
          if (!row) return null;
          return <div className="max-w-80 rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-sm"><p className="mb-2 break-words font-semibold">{row.unit}</p><p>Inschrijven: {row.registrations.toLocaleString("nl-NL")}{row.prevRegistrations !== undefined && ` (vorige: ${row.prevRegistrations.toLocaleString("nl-NL")}${row.registrationsLabel ? `, ${row.registrationsLabel}` : ""})`}</p><p className="mt-1">Cost per Inschrijving: {row.acquisitions.toLocaleString("nl-NL")}{row.prevAcquisitions !== undefined && ` (vorige: ${row.prevAcquisitions.toLocaleString("nl-NL")}${row.acquisitionsLabel ? `, ${row.acquisitionsLabel}` : ""})`}</p></div>;
        }} />
        {comparing && <Bar dataKey="prevRegistrations" name="Inschrijven (vorige periode)" fill="var(--trend-conversions)" fillOpacity={0.35} barSize={10} radius={[0, 3, 3, 0]} isAnimationActive={false} onClick={click}>{cells(0.35)}</Bar>}
        <Bar dataKey="registrations" name="Inschrijven" fill="var(--trend-conversions)" barSize={comparing ? 14 : 18} radius={[0, 3, 3, 0]} isAnimationActive={false} onClick={click}>{cells()}
          {comparing && <LabelList dataKey="registrationsLabel" position="right" style={{ fontSize: 11, fill: "var(--foreground)" }} />}
        </Bar>
        {comparing && <Bar dataKey="prevAcquisitions" name="Cost per Inschrijving (vorige periode)" fill="var(--trend-registrations)" fillOpacity={0.35} barSize={10} radius={[0, 3, 3, 0]} isAnimationActive={false} onClick={click}>{cells(0.35)}</Bar>}
        <Bar dataKey="acquisitions" name="Cost per Inschrijving" fill="var(--trend-registrations)" barSize={comparing ? 14 : 18} radius={[0, 3, 3, 0]} isAnimationActive={false} onClick={click}>{cells()}
          {comparing && <LabelList dataKey="acquisitionsLabel" position="right" style={{ fontSize: 11, fill: "var(--foreground)" }} />}
        </Bar>
      </BarChart></ResponsiveContainer>
    </div></div>
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="trend-swatch size-2.5" data-metric="conversions" />Inschrijven</span><span className="flex items-center gap-1.5"><span className="trend-swatch size-2.5" data-metric="registrations" />Cost per Inschrijving</span>{comparing && <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-muted-foreground/35" />Lichter = vorige periode</span>}</div>
  </div>;
}
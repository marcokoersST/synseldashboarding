import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight, BarChart3, Table2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  omzetConsultantsPerType, omzetTypes, getUitsplitsingPerType, jaarFactor, omzetLaatste13Periodes,
  type OmzetType, type PeriodeOmzetPerType,
} from "@/data/omzetDashboardVernieuwdData";

const money = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${money.format(Math.abs(v))}`;

// Vaste kleur per omzettype (gevalideerd op kleurenblind-veiligheid, licht en donker); de kleur hoort bij het type, niet bij de volgorde
const TYPE_KLEUR: Record<OmzetType, { light: string; dark: string }> = {
  jigler: { light: "#2a78d6", dark: "#3987e5" },
  please: { light: "#eb6834", dark: "#d95926" },
  ws: { light: "#1baf7a", dark: "#199e70" },
  margefacturatie: { light: "#eda100", dark: "#c98500" },
  overnamefee: { light: "#e87ba4", dark: "#d55181" },
};

const chartConfig = Object.fromEntries(
  omzetTypes.map((t) => [t.key, { label: t.label, theme: TYPE_KLEUR[t.key] }])
) satisfies ChartConfig;

const periodeLabel = (r: { jaar: string; periode: string }) => `${r.periode} '${r.jaar.slice(2)}`;

interface Props {
  rows: { name: string }[];
  consultant: string | null;
  onChange: (c: string | null) => void;
  groep1: string[];
  groep2: string[];
  jaar1: string;
  jaar2: string;
  g1Label: string;
  g2Label: string;
  typeFilter: OmzetType[];
}

export function OmzetConsultantDetail({ rows, consultant, onChange, groep1, groep2, jaar1, jaar2, g1Label, g2Label, typeFilter }: Props) {
  const [weergave, setWeergave] = useState<"grafiek" | "tabel">("grafiek");
  const c = omzetConsultantsPerType.find((x) => x.name === consultant) ?? null;
  const idx = rows.findIndex((r) => r.name === consultant);
  const go = (d: number) => rows.length && onChange(rows[(idx + d + rows.length) % rows.length].name);

  const perType = useMemo(
    () => (c ? getUitsplitsingPerType([c], groep1, groep2, typeFilter, jaarFactor(jaar1), jaarFactor(jaar2)) : []),
    [c, groep1, groep2, typeFilter, jaar1, jaar2]
  );
  const totaal = perType.reduce(
    (acc, t) => ({ p1: acc.p1 + t.periode1, p2: acc.p2 + t.periode2 }),
    { p1: 0, p2: 0 }
  );
  const verloop = useMemo(() => (c ? omzetLaatste13Periodes(c) : []), [c]);
  const zichtbareTypes = omzetTypes.filter((t) => typeFilter.includes(t.key));

  return (
    <Dialog open={!!c} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent data-chart="omzet-detail" className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {/* Typekleuren ook buiten de grafiek beschikbaar (bolletjes in de tabel per type) */}
        <ChartStyle id="omzet-detail" config={chartConfig} />
        {c && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 pr-6">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    {c.name}
                    {c.status === "inactief" && (
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">Inactief</Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>{c.unit}</DialogDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(-1)} aria-label="Vorige consultant"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(1)} aria-label="Volgende consultant"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3">
              <Kpi label={g1Label} value={money.format(totaal.p1)} />
              <Kpi label={g2Label} value={money.format(totaal.p2)} />
              <Kpi
                label="Verschil"
                value={signed(totaal.p2 - totaal.p1)}
                className={totaal.p2 - totaal.p1 >= 0 ? "text-emerald-600" : "text-red-500"}
              />
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Omzet per type</h3>
              <div className="rounded-lg border border-border text-sm">
                <div className="grid grid-cols-[1fr_repeat(3,110px)] gap-2 border-b border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold">
                  <span>Type omzet</span>
                  <span className="text-right">{g1Label}</span>
                  <span className="text-right">{g2Label}</span>
                  <span className="text-right">Verschil</span>
                </div>
                {perType.length === 0 ? (
                  <p className="px-3 py-3 text-center text-muted-foreground">Geen type omzet geselecteerd</p>
                ) : (
                  perType.map((t) => (
                    <div key={t.key} className="grid grid-cols-[1fr_repeat(3,110px)] gap-2 px-3 py-1.5 tabular-nums">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: `var(--color-${t.key})` }} />
                        {t.label}
                      </span>
                      <span className="text-right">{money.format(t.periode1)}</span>
                      <span className="text-right">{money.format(t.periode2)}</span>
                      <span className={cn("text-right font-semibold", t.verschil > 0 ? "text-emerald-600" : t.verschil < 0 ? "text-red-500" : "text-muted-foreground")}>
                        {signed(t.verschil)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Omzet afgelopen 13 periodes
                  {verloop.length > 0 && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({periodeLabel(verloop[0])} t/m {periodeLabel(verloop[verloop.length - 1])})
                    </span>
                  )}
                </h3>
                <div className="flex gap-1">
                  <Button variant={weergave === "grafiek" ? "secondary" : "ghost"} size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setWeergave("grafiek")}>
                    <BarChart3 className="h-3.5 w-3.5" />Grafiek
                  </Button>
                  <Button variant={weergave === "tabel" ? "secondary" : "ghost"} size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setWeergave("tabel")}>
                    <Table2 className="h-3.5 w-3.5" />Tabel
                  </Button>
                </div>
              </div>

              {zichtbareTypes.length === 0 ? (
                <p className="rounded-lg border border-border px-3 py-6 text-center text-sm text-muted-foreground">Geen type omzet geselecteerd</p>
              ) : weergave === "grafiek" ? (
                <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                  <BarChart data={verloop.map((r) => ({ ...r, label: periodeLabel(r) }))} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => `€${Math.round(v / 1000)}k`} />
                    <ChartTooltip cursor={{ fillOpacity: 0.4 }} content={<PeriodeTooltip types={zichtbareTypes.map((t) => t.key)} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {zichtbareTypes.map((t) => (
                      <Bar
                        key={t.key}
                        dataKey={t.key}
                        stackId="omzet"
                        fill={`var(--color-${t.key})`}
                        maxBarSize={24}
                        isAnimationActive={false}
                        shape={(props: StapelProps) => <StapelSegment {...props} type={t.key} types={zichtbareTypes.map((x) => x.key)} />}
                      />
                    ))}
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border text-xs">
                  <table className="w-full tabular-nums">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-semibold">Periode</th>
                        {zichtbareTypes.map((t) => <th key={t.key} className="px-2 py-1.5 text-right font-semibold">{t.label}</th>)}
                        <th className="px-2 py-1.5 text-right font-semibold">Totaal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verloop.map((r) => (
                        <tr key={`${r.jaar}-${r.periode}`} className="border-t border-border">
                          <td className="px-2 py-1">{periodeLabel(r)}</td>
                          {zichtbareTypes.map((t) => <td key={t.key} className="px-2 py-1 text-right">{money.format(r[t.key])}</td>)}
                          <td className="px-2 py-1 text-right font-semibold">{money.format(zichtbareTypes.reduce((s, t) => s + r[t.key], 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Kpi({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-lg font-bold tabular-nums", className)}>{value}</div>
    </div>
  );
}

type StapelProps = { x?: number; y?: number; width?: number; height?: number; fill?: string; payload?: PeriodeOmzetPerType };

/** Gestapeld segment: 2px tussenruimte naar het segment erboven; alleen het bovenste gevulde segment krijgt ronde hoeken */
function StapelSegment({ x = 0, y = 0, width = 0, height = 0, fill, payload, type, types }: StapelProps & { type: OmzetType; types: OmzetType[] }) {
  const bovenste = payload ? [...types].reverse().find((t) => payload[t] > 0) : undefined;
  const isBovenste = bovenste === type;
  const gap = isBovenste ? 0 : Math.min(2, height);
  return (
    <Rectangle
      x={x}
      y={y + gap}
      width={width}
      height={Math.max(0, height - gap)}
      fill={fill}
      radius={isBovenste ? [4, 4, 0, 0] : 0}
    />
  );
}

type TooltipItem = { dataKey?: string | number; value?: number };

/** Tooltip per periode: types in dezelfde volgorde als de stapel (bovenste eerst) plus het totaal */
function PeriodeTooltip({ active, payload, label, types }: { active?: boolean; payload?: TooltipItem[]; label?: string; types: OmzetType[] }) {
  if (!active || !payload?.length) return null;
  const waarde = (t: OmzetType) => Number(payload.find((p) => p.dataKey === t)?.value ?? 0);
  const totaal = types.reduce((s, t) => s + waarde(t), 0);
  return (
    <div className="grid min-w-[11rem] gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{label}</div>
      {[...types].reverse().map((t) => (
        <div key={t} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: `var(--color-${t})` }} />
          <span className="flex-1 text-muted-foreground">{chartConfig[t].label}</span>
          <span className="font-medium tabular-nums text-foreground">{money.format(waarde(t))}</span>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-border/50 pt-1.5 font-medium">
        <span>Totaal</span>
        <span className="tabular-nums">{money.format(totaal)}</span>
      </div>
    </div>
  );
}

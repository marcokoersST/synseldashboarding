import { useState, useMemo, ReactNode } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle } from "lucide-react";
import {
  Briefcase, Users, Send, Building2, MessageSquare, CheckCircle,
  PhoneOff, Clock, MessageSquareWarning, AlarmClock,
  TrendingUp, TrendingDown, Filter, Mail, Smartphone, Linkedin,
  ArrowUpDown, Trophy, Wallet, Percent, PiggyBank, Gauge, Radar,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Line, Area, Bar, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  reverseFunnelKpis, actieNodigTiles, bronMixData, trendOverTimeData,
  kanaalPerformance, matchKwaliteitBuckets, functiegroepRows,
  recruiterLeaderboard, financieleMetrics, monthlyRevenue, roiPerKanaal,
  periodOptions, type PeriodOption,
} from "@/data/barendData";

const iconMap: Record<string, typeof Briefcase> = {
  Briefcase, Users, Send, Building2, MessageSquare, CheckCircle,
  PhoneOff, Clock, MessageSquareWarning, AlarmClock, Mail, Smartphone, Linkedin,
};

const toneClasses: Record<string, string> = {
  primary: "text-primary bg-primary/10",
  "chart-primary": "text-[hsl(var(--chart-primary))] bg-[hsl(var(--chart-primary)/0.1)]",
  accent: "text-accent bg-accent/10",
  gold: "text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.12)]",
};

function fmtEuro(n: number) {
  return `€ ${n.toLocaleString("nl-NL")}`;
}

function DeltaBadge({ change }: { change: number }) {
  const positive = change >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        positive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
      )}
    >
      <Icon className="w-3 h-3" />
      {positive ? "+" : ""}{change.toFixed(1)}%
    </span>
  );
}

/** Compact Dev info popover-knop — inline variant van DevNote voor in tile-headers. */
function DevInfo({ story, logic }: { story: ReactNode; logic: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="h-7 px-2.5 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white shrink-0"
        >
          <Info className="w-3.5 h-3.5" />
          Dev info
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 text-xs space-y-3" align="end">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="w-3.5 h-3.5" />
          For the development team
        </div>
        <div className="flex items-start gap-1.5 text-red-600 font-medium border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded p-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Delete this button after development.</span>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground/80">User story</div>
          <p className="leading-relaxed text-muted-foreground">{story}</p>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground/80">Logic</div>
          <pre className="bg-muted/60 p-3 rounded text-[11px] leading-snug font-mono whitespace-pre-wrap text-foreground/90">{logic}</pre>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Reusable tile header — same gradient strip used across the project (TileHeader pattern). */
function TileStrip({ icon: Icon, title, subtitle, right, tone = "primary", devStory, devLogic }: {
  icon: typeof Briefcase; title: string; subtitle?: string; right?: React.ReactNode; tone?: string;
  devStory?: ReactNode; devLogic?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-t-xl bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/50 -mx-6 -mt-6 mb-4 px-6 py-3">
      <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", toneClasses[tone] ?? toneClasses.primary)}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-base leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right}
      {devStory && devLogic && <DevInfo story={devStory} logic={devLogic} />}
    </div>
  );
}

export default function ReverseMatchingAnalytics() {
  const [period, setPeriod] = useState<PeriodOption>("30d");
  const [vacature, setVacature] = useState("all");
  const [functiegroep, setFunctiegroep] = useState("all");
  const [bedrijf, setBedrijf] = useState("all");
  const [consultant, setConsultant] = useState("all");
  const [funcSort, setFuncSort] = useState<keyof typeof functiegroepRows[number]>("vac");
  const [funcDir, setFuncDir] = useState<"asc" | "desc">("desc");

  const sortedFunctiegroep = useMemo(() => {
    const rows = [...functiegroepRows];
    rows.sort((a, b) => {
      const av = a[funcSort] as number | string;
      const bv = b[funcSort] as number | string;
      if (typeof av === "number" && typeof bv === "number") {
        return funcDir === "desc" ? bv - av : av - bv;
      }
      return funcDir === "desc" ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
    return rows;
  }, [funcSort, funcDir]);

  const toggleSort = (col: keyof typeof functiegroepRows[number]) => {
    if (funcSort === col) setFuncDir(d => d === "desc" ? "asc" : "desc");
    else { setFuncSort(col); setFuncDir("desc"); }
  };

  return (
    <ConsultantLayout
      title="Reverse Matching Analytics"
      subtitle="Synsel Techniek · End-to-end monitoring van de matching engine, SLA-bewaking en kanaal-ROI"
    >
      {/* ============= Filterbar ============= */}
      <Card className="mb-4 animate-fade-in">
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {periodOptions.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                  period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-border mx-1" />
          {([
            ["Vacature", vacature, setVacature],
            ["Functiegroep", functiegroep, setFunctiegroep],
            ["Bedrijf", bedrijf, setBedrijf],
            ["Consultant", consultant, setConsultant],
          ] as const).map(([label, value, setter]) => (
            <Select key={label} value={value} onValueChange={setter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle {label.toLowerCase()}</SelectItem>
                <SelectItem value="opt1">Voorbeeld 1</SelectItem>
                <SelectItem value="opt2">Voorbeeld 2</SelectItem>
              </SelectContent>
            </Select>
          ))}
          <div className="ml-auto text-xs text-muted-foreground">Laatst ververst: 10:09</div>
        </CardContent>
      </Card>

      {/* ============= 1. KPI strip ============= */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Funnel KPI's</h2>
        <DevInfo
          story={<>De 6 kerntegels tonen de hoofdstappen van de reverse-matching funnel: vacatures opgepakt → kandidaten gematched → doorgezet → voorgesteld → op gesprek → geplaatst. <strong>Barend</strong> wil één blik op de hele engine en direct weten of er ergens dropoff is.</>}
          logic={`KPI tegels (6) — bron: reverseFunnelKpis in barendData.ts.
Elke tegel:
  • value (AnimatedNumber count-up)
  • delta vs. vorige periode (DeltaBadge)
  • subtitel met context (bv. "Door matching engine")
  • tone bepaalt accent-kleur (primary/accent/gold/chart-primary)

Conversies tussen stappen worden NIET getoond op deze
strip — daarvoor zie de Trend over tijd + Match-kwaliteit.`}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {reverseFunnelKpis.map((k, i) => {
          const Icon = iconMap[k.icon] ?? Briefcase;
          return (
            <Card key={k.key} className="animate-fade-in overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={cn("h-1 w-full", toneClasses[k.tone].split(" ")[1])} />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("w-7 h-7 rounded-md flex items-center justify-center", toneClasses[k.tone])}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                    {k.label}
                  </span>
                </div>
                <div className="text-3xl font-bold text-foreground tabular-nums">
                  <AnimatedNumber value={k.value} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <DeltaBadge change={k.change} />
                  <span className="text-xs text-muted-foreground truncate">{k.sub}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ============= 2 + 3. Actie nodig + Bron-mix ============= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <TileStrip
              icon={AlarmClock}
              title="Actie nodig"
              subtitle="Kandidaten die wachten op een vervolgstap of binnen SLA opgevolgd moeten worden"
              tone="gold"
            />
            <div className="grid grid-cols-2 gap-3">
              {actieNodigTiles.map(tile => {
                const Icon = iconMap[tile.icon] ?? AlarmClock;
                const danger = tile.severity === "danger";
                return (
                  <div
                    key={tile.key}
                    className={cn(
                      "rounded-lg border p-4",
                      danger
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-[hsl(var(--gold)/0.06)] border-[hsl(var(--gold)/0.3)]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={cn("text-[11px] font-semibold uppercase tracking-wide", danger ? "text-destructive" : "text-[hsl(var(--gold-dark))]")}>
                        {tile.label}
                      </span>
                      <Icon className={cn("w-4 h-4 shrink-0", danger ? "text-destructive" : "text-[hsl(var(--gold))]")} />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-3xl font-bold tabular-nums", danger ? "text-destructive" : "text-foreground")}>
                        <AnimatedNumber value={tile.count} />
                      </span>
                      <span className="text-xs text-muted-foreground">{tile.subject}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{tile.detail}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <TileStrip
              icon={Filter}
              title="Bron-mix"
              subtitle="Hoe kandidaten binnenkomen — eerste contactkanaal"
              tone="chart-primary"
            />
            <div className="grid grid-cols-[200px_1fr] gap-6 items-center">
              <div className="relative h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bronMixData.segments}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {bronMixData.segments.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <RTooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground tabular-nums">{bronMixData.total.toLocaleString("nl-NL")}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Kandidaten</span>
                </div>
              </div>
              <div className="space-y-2">
                {bronMixData.segments.map(s => (
                  <div key={s.name} className="flex items-center gap-3 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="flex-1 text-foreground">{s.name}</span>
                    <span className="tabular-nums text-foreground font-semibold w-14 text-right">{s.value.toLocaleString("nl-NL")}</span>
                    <span className="tabular-nums text-muted-foreground w-12 text-right">{s.share.toFixed(1)}%</span>
                    <DeltaBadge change={s.change} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============= 4. Trend over tijd ============= */}
      <Card className="mb-4 animate-fade-in">
        <CardContent className="p-6">
          <TileStrip
            icon={TrendingUp}
            title="Trend over tijd"
            subtitle="Outreach, responses, CVs, plaatsingen + omzet · 30d (globaal)"
            tone="primary"
          />
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="omzetFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v / 1000}k`} />
                <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area yAxisId="right" type="monotone" dataKey="omzet" name="Omzet (€)" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#omzetFill)" />
                <Line yAxisId="left" type="monotone" dataKey="outreach" name="Outreach" stroke="hsl(var(--chart-primary))" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="responses" name="Responses" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="cvs" name="CVs gedeeld" stroke="hsl(var(--gold))" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="plaatsingen" name="Plaatsingen" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ============= 5. Kanaal performance ============= */}
      <Card className="mb-4 animate-fade-in">
        <CardContent className="p-6">
          <TileStrip
            icon={Send}
            title="Kanaal performance"
            subtitle="Email · WhatsApp · LinkedIn"
            tone="accent"
            right={<Badge variant="outline" className="text-[10px]">Beste ROI: Email · 2070×</Badge>}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kanaalPerformance.map(k => {
              const Icon = k.name === "Email" ? Mail : k.name === "WhatsApp" ? Smartphone : Linkedin;
              return (
                <div key={k.name} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-8 h-8 rounded-md flex items-center justify-center", toneClasses[k.tone])}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{k.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.provider}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground tabular-nums">{k.responseRate.toFixed(1)}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Response rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs pt-3 border-t border-border">
                    <span className="text-muted-foreground">Sent</span>           <span className="text-right tabular-nums font-medium">{k.sent.toLocaleString("nl-NL")}</span>
                    <span className="text-muted-foreground">Avg resp</span>       <span className="text-right tabular-nums font-medium">{k.avgResp}</span>
                    <span className="text-muted-foreground">Kosten/resp</span>    <span className="text-right tabular-nums font-medium">€ {k.kostenPerResp.toFixed(2).replace(".", ",")}</span>
                    <span className="text-muted-foreground">Plaatsingen</span>    <span className="text-right tabular-nums font-medium">{k.plaatsingen}</span>
                    <span className="text-muted-foreground">Omzet</span>          <span className="text-right tabular-nums font-medium">{fmtEuro(k.omzet)}</span>
                    <span className="text-muted-foreground">ROI</span>            <span className="text-right tabular-nums font-bold text-accent">{k.roi}×</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============= 6. Match-kwaliteit ============= */}
      <Card className="mb-4 animate-fade-in">
        <CardContent className="p-6">
          <TileStrip
            icon={Gauge}
            title="Match-kwaliteit"
            subtitle="Kandidaten · Response · Doorgezet naar Sales"
            tone="chart-primary"
          />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={matchKwaliteitBuckets} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar yAxisId="left" dataKey="kandidaten" name="Kandidaten" fill="hsl(var(--chart-primary))" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="responsePct" name="Response %" stroke="hsl(var(--accent))" strokeWidth={2.5} />
                <Line yAxisId="right" type="monotone" dataKey="doorgezetPct" name="Doorgezet %" stroke="hsl(var(--gold))" strokeWidth={2.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <span className="font-semibold text-foreground">Excellent-bucket reageert 3.8× beter dan zwak-bucket</span>{" "}
            (31,4% vs 8,3%) — en wordt 9.8× vaker doorgezet naar Sales.
          </p>
        </CardContent>
      </Card>

      {/* ============= 7. Functiegroep tabel ============= */}
      <Card className="mb-4 animate-fade-in">
        <CardContent className="p-6">
          <TileStrip
            icon={Briefcase}
            title="Functiegroep performance"
            subtitle="Gesorteerd op vacatures opgepakt"
            tone="primary"
          />
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Functiegroep</TableHead>
                  {[
                    ["vac", "Vac. opgepakt"],
                    ["gematched", "Gematched"],
                    ["geinteresseerd", "Geïnteresseerd"],
                    ["voorgesteld", "Voorgesteld"],
                    ["plaatsingen", "Plaatsingen"],
                    ["fillRate", "Fill rate"],
                    ["avgTime", "Avg time"],
                    ["omzet", "Omzet"],
                  ].map(([k, label]) => (
                    <TableHead key={k} className="text-right">
                      <button onClick={() => toggleSort(k as keyof typeof functiegroepRows[number])} className="inline-flex items-center gap-1 hover:text-foreground">
                        {label} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFunctiegroep.map(r => (
                  <TableRow key={r.naam} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{r.naam}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.vac}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.gematched}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.geinteresseerd}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.voorgesteld}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{r.plaatsingen}</TableCell>
                    <TableCell className={cn("text-right tabular-nums", r.fillRate >= 30 ? "text-accent" : r.fillRate >= 20 ? "text-foreground" : "text-destructive")}>
                      {r.fillRate.toFixed(1).replace(".", ",")}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{r.avgTime}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{r.omzet === 0 ? "€ 0" : fmtEuro(r.omzet)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ============= 8. Recruiter leaderboard ============= */}
      <Card className="mb-4 animate-fade-in">
        <CardContent className="p-6">
          <TileStrip
            icon={Trophy}
            title="Recruiter leaderboard"
            subtitle="Output, kwaliteit & omzet"
            tone="gold"
          />
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Recruiter</TableHead>
                  <TableHead className="text-right">Vac</TableHead>
                  <TableHead className="text-right">Plaats</TableHead>
                  <TableHead className="text-right">Resp rate</TableHead>
                  <TableHead className="text-right">Fill rate</TableHead>
                  <TableHead className="text-right">Tijd shortlist</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                  <TableHead className="text-right">Omzet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recruiterLeaderboard.map(r => {
                  const top = r.rank <= 3;
                  const podiumTone = r.rank === 1 ? "bg-[hsl(var(--gold)/0.12)]" : r.rank === 2 ? "bg-primary/5" : r.rank === 3 ? "bg-accent/5" : "";
                  return (
                    <TableRow key={r.naam} className={cn("hover:bg-muted/20", top && podiumTone)}>
                      <TableCell>
                        {top ? (
                          <Trophy className={cn("w-4 h-4", r.rank === 1 ? "text-[hsl(var(--gold))]" : r.rank === 2 ? "text-muted-foreground" : "text-accent")} />
                        ) : (
                          <span className="text-xs text-muted-foreground">#{r.rank}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-md bg-[hsl(210_85%_55%)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {r.initials}
                          </span>
                          <span className="font-medium text-foreground">{r.naam}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.vac}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{r.plaats}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.respRate.toFixed(1).replace(".", ",")}%</TableCell>
                      <TableCell className="text-right tabular-nums">{r.fillRate.toFixed(1).replace(".", ",")}%</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{r.tijdShortlist}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtEuro(r.pipeline)}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{fmtEuro(r.omzet)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ============= 9. Financiële metrics ============= */}
      <Card className="mb-4 animate-fade-in">
        <CardContent className="p-6">
          <TileStrip
            icon={Wallet}
            title="Financiële metrics"
            subtitle="Omzet, marge, pipeline & ROI · inclusief pipeline"
            tone="accent"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Omzet", value: fmtEuro(financieleMetrics.omzet.value), change: financieleMetrics.omzet.change, sub: financieleMetrics.omzet.sub, icon: Wallet, tone: "primary" },
              { label: "Brutomarge", value: fmtEuro(financieleMetrics.brutomarge.value), change: financieleMetrics.brutomarge.change, sub: financieleMetrics.brutomarge.sub, icon: Percent, tone: "accent" },
              { label: "Pipeline value", value: fmtEuro(financieleMetrics.pipeline.value), change: financieleMetrics.pipeline.change, sub: financieleMetrics.pipeline.sub, icon: PiggyBank, tone: "chart-primary" },
              { label: "ROI totaal", value: `${financieleMetrics.roiTotaal.value}×`, sub: financieleMetrics.roiTotaal.sub, icon: Gauge, tone: "gold" },
            ].map(t => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("w-7 h-7 rounded-md flex items-center justify-center", toneClasses[t.tone])}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{t.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground tabular-nums">{t.value}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {t.change !== undefined && <DeltaBadge change={t.change} />}
                    <span className="text-xs text-muted-foreground">{t.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-semibold text-foreground mb-2">Maandomzet (12 maanden)</div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v / 1000}k`} />
                    <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtEuro(v)} />
                    <Bar dataKey="omzet" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-semibold text-foreground mb-3">ROI per kanaal</div>
              <div className="space-y-3">
                {roiPerKanaal.map((r, i) => {
                  const max = Math.max(...roiPerKanaal.map(x => x.roi));
                  const colors = ["hsl(var(--chart-primary))", "hsl(var(--accent))", "hsl(var(--gold))"];
                  return (
                    <div key={r.kanaal}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{r.kanaal}</span>
                        <span className="font-bold tabular-nums text-foreground">{r.roi}×</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(r.roi / max) * 100}%`, background: colors[i] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border mt-4 pt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Kosten per plaatsing</span><span className="tabular-nums text-foreground">€ 23</span></div>
                <div className="flex justify-between"><span>Kosten per response</span><span className="tabular-nums text-foreground">€ 1,80</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============= Dev info ============= */}
      <DevNote
        story={
          <>
            <strong>Als Barend</strong> wil ik de reverse-matching engine end-to-end monitoren
            (vacatures → match → doorzet → voorstel → gesprek → plaatsing) inclusief SLA-breaches
            en kanaal-ROI in één scherm, <strong>zodat</strong> ik direct kan zien waar de pipeline
            stagneert en welke kanalen het meeste rendement opleveren.
          </>
        }
        logic={`Page-secties (top → bottom):

  1. Filterbar — periode (7d/30d/90d/QTD/YTD/Custom) +
     Vacature, Functiegroep, Bedrijf, Consultant.
     Werkt via lokale state; UI is in lijn met de
     ProductiviteitDashboard filterbar.

  2. KPI strip (6) — funnel-stappen Vacatures opgepakt
     → Geplaatst, met delta vs. vorige periode.

  3. Actie nodig — 4 SLA-tegels:
       • Doorgezet, nog niet gebeld (warning)
       • > 2u niet gebeld (danger)
       • Gereageerd, nog niet doorgezet (warning)
       • > 1u geen reactie (danger)
     SLA-grenzen: 2u call-deadline, 1u response-deadline.

  4. Bron-mix — donut + legenda. Eerste contactkanaal
     verdeeld over Mail, Bird (WhatsApp), Sollicitatie,
     LinkedIn. Totaal 2.416 kandidaten.

  5. Trend over tijd — ComposedChart 12 weken.
     Lines: Outreach, Responses, CVs, Plaatsingen.
     Area: Omzet (€) op rechter Y-as.

  6. Kanaal performance — Email/WhatsApp/LinkedIn met
     response rate, sent, avg resp tijd, kosten/resp,
     plaatsingen, omzet, ROI.

  7. Match-kwaliteit — combo bar + 2 lines per
     kwaliteits-bucket (0-50, 50-70, 70-85, 85-100).
     Excellent-bucket reageert 3.8× beter en wordt
     9.8× vaker doorgezet.

  8. Functiegroep tabel — sorteerbare tabel (10 rijen).
     Default sort: vac. opgepakt desc. Fill rate
     gekleurd: ≥30% accent, ≥20% neutraal, anders rood.

  9. Recruiter leaderboard — top-3 met trofee + subtiele
     gold/primary/accent achtergrond. Recruit CRM-stijl
     blauwe initialen-badge.

 10. Financiële metrics — Omzet / Brutomarge / Pipeline
     / ROI tegels + 12-maands omzet BarChart + ROI per
     kanaal mini-bars.

Data source: src/data/barendData.ts (statisch mock,
in lijn met de "static synchronized demo data" core
rule).`}
      />
    </ConsultantLayout>
  );
}

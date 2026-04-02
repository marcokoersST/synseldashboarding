import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  getProductiviteitData,
  filterByUnit,
  formatMinutesToHMS,
  berekenProductiviteit,
  aggregateTotals,
  units,
} from "@/data/productiviteitData";
import {
  UserCheck,
  Phone,
  Mail,
  FileText,
  Clock,
  Users,
  AlertTriangle,
  Target,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

const periodOptions = [
  { value: "week", label: "Deze week" },
  { value: "vorige-week", label: "Vorige week" },
  { value: "periode", label: "Periode 1" },
];

export default function ProductiviteitDashboard() {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<string>("all");
  const [werkuren, setWerkuren] = useState(40);
  const [period, setPeriod] = useState("week");

  const allData = getProductiviteitData();
  const filteredData = useMemo(() => {
    let data = filterByUnit(allData, selectedUnits);
    if (selectedConsultant !== "all") {
      data = data.filter((d) => d.id === Number(selectedConsultant));
    }
    return data;
  }, [allData, selectedUnits, selectedConsultant]);

  const totals = useMemo(() => aggregateTotals(filteredData), [filteredData]);

  const avgProductiviteit = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, c) => {
      const { totaalPercentage } = berekenProductiviteit(c, werkuren);
      return acc + totaalPercentage;
    }, 0);
    return sum / filteredData.length;
  }, [filteredData, werkuren]);

  const toggleUnit = (unit: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const scoreColor = (pct: number) =>
    pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-500" : "text-red-500";

  const scoreBg = (pct: number) =>
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  const gaugeData = [{ value: Math.min(avgProductiviteit, 100), fill: avgProductiviteit >= 80 ? "hsl(var(--primary))" : avgProductiviteit >= 50 ? "hsl(45, 93%, 47%)" : "hsl(0, 84%, 60%)" }];

  const kpis = [
    { label: "Inschrijvingen", value: totals.inschrijvingen, icon: UserCheck, sub: formatMinutesToHMS(totals.inschrijvingenGesprekstijdMin) + " gesprekstijd" },
    { label: "Acquisities", value: totals.acquisities, icon: Target },
    { label: "Voorstellen", value: totals.voorstellen, icon: FileText },
    { label: "Mails", value: totals.mails, icon: Mail },
    { label: "Telefoontjes", value: totals.telefoontjes, icon: Phone, sub: formatMinutesToHMS(totals.beltijdMin) + " beltijd" },
    { label: "Gesprekken", value: totals.gesprekkenGevoerd, icon: Users, sub: `${totals.gesprekkenInTePlannen} in te plannen` },
  ];

  return (
    <ConsultantLayout
      title="Productiviteitsdashboard"
      subtitle="Overzicht van productiviteit per consultant en unit"
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          {units.map((unit) => (
            <button
              key={unit}
              onClick={() => toggleUnit(unit)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                selectedUnits.includes(unit)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {unit}
            </button>
          ))}
        </div>

        <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Alle consultants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle consultants</SelectItem>
            {allData.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Werkuren/week:</span>
          <Input
            type="number"
            value={werkuren}
            onChange={(e) => setWerkuren(Math.max(1, Number(e.target.value)))}
            className="w-16 h-9 text-center"
            min={1}
            max={80}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <AnimatedCard key={kpi.label} delay={i * 50}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedNumber value={kpi.value} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                  {kpi.sub && (
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{kpi.sub}</p>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Productiviteitsmeter + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Gauge */}
        <AnimatedCard delay={100}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gemiddelde Productiviteit</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-4">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="72%"
                    outerRadius="100%"
                    data={gaugeData}
                    startAngle={180}
                    endAngle={0}
                    barSize={14}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      background={{ fill: "hsl(var(--muted))" }}
                      dataKey="value"
                      cornerRadius={8}
                      angleAxisId={0}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center -mt-4">
                  <div className="text-center">
                    <span className={cn("text-3xl font-bold", scoreColor(avgProductiviteit))}>
                      {avgProductiviteit.toFixed(0)}%
                    </span>
                    <p className="text-[10px] text-muted-foreground">aan het werk</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredData.length} consultant{filteredData.length !== 1 ? "s" : ""} · {werkuren}u/week
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Per-activiteit breakdown */}
        <AnimatedCard delay={150} className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tijdsbesteding per activiteit (gemiddeld)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              {filteredData.length > 0 ? (() => {
                const avgScores = filteredData
                  .map((c) => berekenProductiviteit(c, werkuren))
                  .reduce(
                    (acc, p) => {
                      p.scores.forEach((s, i) => {
                        if (!acc[i]) acc[i] = { label: s.label, uren: 0, percentage: 0 };
                        acc[i].uren += s.uren;
                        acc[i].percentage += s.percentage;
                      });
                      return acc;
                    },
                    [] as { label: string; uren: number; percentage: number }[]
                  )
                  .map((s) => ({
                    ...s,
                    uren: s.uren / filteredData.length,
                    percentage: s.percentage / filteredData.length,
                  }));

                return avgScores.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-muted-foreground shrink-0">{s.label}</span>
                    <div className="flex-1">
                      <Progress value={Math.min(s.percentage, 100)} className="h-2.5" />
                    </div>
                    <span className="w-16 text-xs font-medium text-right text-foreground">
                      {s.uren.toFixed(1)}u
                    </span>
                    <span className={cn("w-12 text-xs font-semibold text-right", scoreColor(s.percentage))}>
                      {s.percentage.toFixed(0)}%
                    </span>
                  </div>
                ));
              })() : (
                <p className="text-sm text-muted-foreground">Geen data beschikbaar</p>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Detail Table */}
      <AnimatedCard delay={200}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Detail per consultant</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Consultant</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs text-right">Inschr.</TableHead>
                  <TableHead className="text-xs text-right">Gesprekstijd</TableHead>
                  <TableHead className="text-xs text-right">Acq.</TableHead>
                  <TableHead className="text-xs text-right">Voorst.</TableHead>
                  <TableHead className="text-xs text-right">D/V/I</TableHead>
                  <TableHead className="text-xs text-right">Mails</TableHead>
                  <TableHead className="text-xs text-right">Calls</TableHead>
                  <TableHead className="text-xs text-right">Beltijd</TableHead>
                  <TableHead className="text-xs text-right">Gespr.</TableHead>
                  <TableHead className="text-xs text-center">Neg. Status</TableHead>
                  <TableHead className="text-xs text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((c) => {
                  const { totaalPercentage } = berekenProductiviteit(c, werkuren);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{c.unit}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right">{c.inschrijvingen}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatMinutesToHMS(c.inschrijvingenGesprekstijdMin)}</TableCell>
                      <TableCell className="text-xs text-right">{c.acquisities}</TableCell>
                      <TableCell className="text-xs text-right">{c.voorstellen}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{c.voorstelType.detachering}/{c.voorstelType.vast}/{c.voorstelType.interim}</TableCell>
                      <TableCell className="text-xs text-right">{c.mails}</TableCell>
                      <TableCell className="text-xs text-right">{c.telefoontjes}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatMinutesToHMS(c.beltijdMin)}</TableCell>
                      <TableCell className="text-xs text-right">{c.gesprekkenGevoerd} <span className="text-muted-foreground">({c.gesprekkenInTePlannen})</span></TableCell>
                      <TableCell className="text-center">
                        {c.negatieveStatusBelpogingen > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs text-amber-600 font-medium">{c.negatieveStatusBelpogingen}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("text-xs font-bold", scoreColor(totaalPercentage))}>
                          {totaalPercentage.toFixed(0)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}

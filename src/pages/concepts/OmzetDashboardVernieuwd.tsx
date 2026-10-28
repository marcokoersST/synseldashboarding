import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Trophy, Medal, Flame, Rocket, ChevronDown } from "lucide-react";
import { allPeriodes, unitAbbr } from "@/data/omzetDashboardData";
import {
  omzetConsultantsPerType, omzetTypes, alleOmzetTypes, getOmzetPerTypeForPeriodeGroups, getUitsplitsingPerType,
  beschikbareJaren, jaarFactor,
  type ConsultantStatus, type OmzetType,
} from "@/data/omzetDashboardVernieuwdData";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";

type StatusFilter = "alle" | ConsultantStatus;

function formatCurrency(val: number) {
  return `€${val.toLocaleString("nl-NL")}`;
}

const rankIcons = [
  <Trophy className="h-4 w-4 text-yellow-500" />,
  <Medal className="h-4 w-4 text-slate-400" />,
  <Medal className="h-4 w-4 text-amber-600" />,
  <Flame className="h-4 w-4 text-orange-500" />,
  <Rocket className="h-4 w-4 text-primary" />,
];

function PeriodeMultiSelect({ label, selected, onChange, jaar, onJaarChange }: { label: string; selected: string[]; onChange: (v: string[]) => void; jaar: string; onJaarChange: (v: string) => void }) {
  const toggle = (p: string) => {
    if (selected.includes(p)) {
      onChange(selected.filter((s) => s !== p));
    } else {
      onChange([...selected, p].sort((a, b) => allPeriodes.indexOf(a) - allPeriodes.indexOf(b)));
    }
  };

  return (
    <div className="space-y-2 min-w-0">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex gap-2">
      <Select value={jaar} onValueChange={onJaarChange}>
        <SelectTrigger className="w-24 shrink-0 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {beschikbareJaren().map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex-1 min-w-0 justify-between text-sm font-normal">
            <span className="truncate">{selected.length === 0 ? "Selecteer..." : selected.join(", ")}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 pointer-events-auto" align="start">
          <div className="grid grid-cols-2 gap-1">
            {allPeriodes.map((p) => (
              <label key={p} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm">
                <Checkbox
                  checked={selected.includes(p)}
                  onCheckedChange={() => toggle(p)}
                />
                {p}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      </div>
    </div>
  );
}

function OmzetTypeMultiSelect({ selected, onChange }: { selected: OmzetType[]; onChange: (v: OmzetType[]) => void }) {
  const toggle = (type: OmzetType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((s) => s !== type));
    } else {
      onChange(alleOmzetTypes.filter((t) => t === type || selected.includes(t)));
    }
  };

  const buttonLabel =
    selected.length === alleOmzetTypes.length
      ? "Alle types"
      : selected.length === 0
      ? "Selecteer..."
      : omzetTypes.filter((t) => selected.includes(t.key)).map((t) => t.label).join(", ");

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">Type omzet</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-56 justify-between text-sm font-normal">
            <span className="truncate">{buttonLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 pointer-events-auto" align="start">
          <div className="flex flex-col gap-1">
            {omzetTypes.map((t) => (
              <label key={t.key} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm">
                <Checkbox
                  checked={selected.includes(t.key)}
                  onCheckedChange={() => toggle(t.key)}
                />
                {t.label}
              </label>
            ))}
          </div>
          <div className="mt-1 border-t border-border pt-1">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onChange(alleOmzetTypes)}>
              Alle types
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface PanelProps {
  title: string;
  groep1: string[];
  groep2: string[];
  setGroep1: (v: string[]) => void;
  setGroep2: (v: string[]) => void;
  unitFilter: string;
  statusFilter: StatusFilter;
  typeFilter: OmzetType[];
}

function OmzetPanel({ title, groep1, groep2, setGroep1, setGroep2, unitFilter, statusFilter, typeFilter }: PanelProps) {
  const base = useMemo(
    () => omzetConsultantsPerType.filter(
      (c) => (unitFilter === "alle" || c.unit === unitFilter) && (statusFilter === "alle" || c.status === statusFilter)
    ),
    [unitFilter, statusFilter]
  );

  // Standaard het jaar van vandaag
  const [jaar1, setJaar1] = useState(() => beschikbareJaren()[0]);
  const [jaar2, setJaar2] = useState(() => beschikbareJaren()[0]);

  const filtered = useMemo(
    () => getOmzetPerTypeForPeriodeGroups(base, groep1, groep2, typeFilter, jaarFactor(jaar1), jaarFactor(jaar2)),
    [base, groep1, groep2, typeFilter, jaar1, jaar2]
  );

  const uitsplitsing = useMemo(
    () => getUitsplitsingPerType(base, groep1, groep2, typeFilter, jaarFactor(jaar1), jaarFactor(jaar2)),
    [base, groep1, groep2, typeFilter, jaar1, jaar2]
  );

  const totals = useMemo(() => {
    const p1 = filtered.reduce((s, r) => s + r.periode1, 0);
    const p2 = filtered.reduce((s, r) => s + r.periode2, 0);
    return { p1, p2, verschil: p2 - p1 };
  }, [filtered]);

  // Jaar alleen in de labels als de groepen verschillende jaren hebben, anders zijn beide kolommen bijv. "P4"
  const toonJaar = jaar1 !== jaar2;
  const g1Label = groep1.length ? `${toonJaar ? `${jaar1} ` : ""}${groep1.join("+")}` : "—";
  const g2Label = groep2.length ? `${toonJaar ? `${jaar2} ` : ""}${groep2.join("+")}` : "—";
  const up = totals.verschil >= 0;
  const fmt = (v: number) => Math.round(v).toLocaleString("nl-NL");

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <PeriodeMultiSelect label="Groep 1" selected={groep1} onChange={setGroep1} jaar={jaar1} onJaarChange={setJaar1} />
            <PeriodeMultiSelect label="Groep 2" selected={groep2} onChange={setGroep2} jaar={jaar2} onJaarChange={setJaar2} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border bg-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{g1Label}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                <AnimatedNumber value={totals.p1} prefix="€" formatFn={fmt} />
              </p>
            </div>
            <div className="border border-border bg-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{g2Label}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                <AnimatedNumber value={totals.p2} prefix="€" formatFn={fmt} />
              </p>
            </div>
            <div className="border border-border bg-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2">Verschil</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${up ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {up ? "+€" : "-€"}{Math.abs(totals.verschil).toLocaleString("nl-NL")}
              </span>
            </div>
          </div>

          {/* Uitsplitsing per type omzet */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="h-8 text-xs font-semibold">Type omzet</TableHead>
                  <TableHead className="h-8 text-right text-xs font-semibold">{g1Label}</TableHead>
                  <TableHead className="h-8 text-right text-xs font-semibold">{g2Label}</TableHead>
                  <TableHead className="h-8 text-right text-xs font-semibold">Verschil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uitsplitsing.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-3 text-center text-sm text-muted-foreground">
                      Geen type omzet geselecteerd
                    </TableCell>
                  </TableRow>
                ) : (
                  uitsplitsing.map((t) => (
                    <TableRow key={t.key}>
                      <TableCell className="py-1.5 text-sm font-medium">{t.label}</TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums">{formatCurrency(t.periode1)}</TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums">{formatCurrency(t.periode2)}</TableCell>
                      <TableCell
                        className={`py-1.5 text-right text-sm font-semibold tabular-nums ${
                          t.verschil > 0 ? "text-emerald-600" : t.verschil < 0 ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        {t.verschil >= 0 ? "+" : ""}
                        {formatCurrency(t.verschil)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border flex-1">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10 font-semibold">#</TableHead>
                <TableHead className="font-semibold">Consultant</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
                <TableHead className="text-right font-semibold">{g1Label}</TableHead>
                <TableHead className="text-right font-semibold">{g2Label}</TableHead>
                <TableHead className="text-right font-semibold">Verschil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, idx) => (
                <TableRow key={row.name} className={idx < 3 ? "bg-primary/5" : row.verschil < 0 ? "bg-red-50/60" : ""}>
                  <TableCell className="font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {idx < 5 && rankIcons[idx]}
                      <span>{idx + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{row.name}</span>
                      {row.status === "inactief" && (
                        <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                          Inactief
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{unitAbbr(row.unit)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(row.periode1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(row.periode2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`tabular-nums font-semibold gap-1 ${
                        row.verschil > 0
                          ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                          : row.verschil < 0
                          ? "text-red-500 border-red-200 bg-red-50"
                          : "text-muted-foreground"
                      }`}
                    >
                      {row.verschil > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : row.verschil < 0 ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : null}
                      {row.verschil >= 0 ? "+" : ""}
                      {formatCurrency(row.verschil)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    Geen consultants voor deze filters
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/40 border-t-2 border-border font-bold">
                <TableCell />
                <TableCell className="font-bold">Totaal</TableCell>
                <TableCell />
                <TableCell className="text-right tabular-nums font-bold">{formatCurrency(totals.p1)}</TableCell>
                <TableCell className="text-right tabular-nums font-bold">{formatCurrency(totals.p2)}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={`tabular-nums font-bold gap-1 ${
                      totals.verschil >= 0
                        ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                        : "text-red-500 border-red-200 bg-red-50"
                    }`}
                  >
                    {totals.verschil >= 0 ? "+" : ""}{formatCurrency(totals.verschil)}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const OmzetDashboardVernieuwd = () => {
  const [unitFilter, setUnitFilter] = useState("alle");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [typeFilter, setTypeFilter] = useState<OmzetType[]>(alleOmzetTypes);

  // Panel A: single period comparison (default)
  const [groepA1, setGroepA1] = useState(["P4"]);
  const [groepA2, setGroepA2] = useState(["P5"]);

  // Panel B: multi-period comparison (default 3 vs 3)
  const [groepB1, setGroepB1] = useState(["P10", "P11", "P12"]);
  const [groepB2, setGroepB2] = useState(["P13", "P1", "P2"]);

  const units = useMemo(
    () => [...new Set(omzetConsultantsPerType.map((c) => c.unit))].sort(),
    []
  );

  return (
    <ConsultantLayout
      title="Omzet dashboard - vernieuwde versie"
      subtitle="Omzetontwikkeling per consultant — te filteren op status en uit te splitsen per type omzet"
    >
      {/* Global filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Unit</label>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle units</SelectItem>
              {units.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status consultant</label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle consultants</SelectItem>
              <SelectItem value="actief">Actief</SelectItem>
              <SelectItem value="inactief">Inactief</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <OmzetTypeMultiSelect selected={typeFilter} onChange={setTypeFilter} />
      </div>

      {/* Two panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OmzetPanel
          title="Periode vergelijking A"
          groep1={groepA1}
          groep2={groepA2}
          setGroep1={setGroepA1}
          setGroep2={setGroepA2}
          unitFilter={unitFilter}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
        />
        <OmzetPanel
          title="Periode vergelijking B"
          groep1={groepB1}
          groep2={groepB2}
          setGroep1={setGroepB1}
          setGroep2={setGroepB2}
          unitFilter={unitFilter}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
        />
      </div>
    </ConsultantLayout>
  );
};

export default OmzetDashboardVernieuwd;

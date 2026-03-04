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
import { omzetConsultants, allPeriodes, getOmzetForPeriodeGroups, unitAbbr } from "@/data/omzetDashboardData";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";

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

function PeriodeMultiSelect({ label, selected, onChange }: { label: string; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (p: string) => {
    if (selected.includes(p)) {
      onChange(selected.filter((s) => s !== p));
    } else {
      onChange([...selected, p].sort((a, b) => allPeriodes.indexOf(a) - allPeriodes.indexOf(b)));
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-40 justify-between text-sm font-normal">
            {selected.length === 0 ? "Selecteer..." : selected.join(", ")}
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
  );
}

interface PanelProps {
  title: string;
  groep1: string[];
  groep2: string[];
  setGroep1: (v: string[]) => void;
  setGroep2: (v: string[]) => void;
  unitFilter: string;
}

function OmzetPanel({ title, groep1, groep2, setGroep1, setGroep2, unitFilter }: PanelProps) {
  const filtered = useMemo(() => {
    const base = unitFilter === "alle"
      ? omzetConsultants
      : omzetConsultants.filter((c) => c.unit === unitFilter);
    return getOmzetForPeriodeGroups(base, groep1, groep2);
  }, [groep1, groep2, unitFilter]);

  const totals = useMemo(
    () => filtered.reduce(
      (acc, r) => ({ p1: acc.p1 + r.periode1, p2: acc.p2 + r.periode2, verschil: acc.verschil + r.verschil }),
      { p1: 0, p2: 0, verschil: 0 }
    ),
    [filtered]
  );

  const g1Label = groep1.length ? groep1.join("+") : "—";
  const g2Label = groep2.length ? groep2.join("+") : "—";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <PeriodeMultiSelect label="Groep 1" selected={groep1} onChange={setGroep1} />
            <PeriodeMultiSelect label="Groep 2" selected={groep2} onChange={setGroep2} />
          </div>

          {/* Mini KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{g1Label}</p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                <AnimatedNumber value={totals.p1} prefix="€" formatFn={(v) => Math.round(v).toLocaleString("nl-NL")} />
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{g2Label}</p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                <AnimatedNumber value={totals.p2} prefix="€" formatFn={(v) => Math.round(v).toLocaleString("nl-NL")} />
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Verschil</p>
              <div className="flex items-center gap-1">
                <p className={`text-lg font-bold tabular-nums ${totals.verschil >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  <AnimatedNumber
                    value={totals.verschil}
                    prefix={totals.verschil >= 0 ? "+€" : "-€"}
                    formatFn={(v) => Math.abs(Math.round(v)).toLocaleString("nl-NL")}
                  />
                </p>
                {totals.verschil >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
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
                <TableRow key={row.name} className={idx < 3 ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {idx < 5 && rankIcons[idx]}
                      <span>{idx + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
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

const OmzetDashboard = () => {
  const [unitFilter, setUnitFilter] = useState("alle");

  // Panel A: single period comparison (default)
  const [groepA1, setGroepA1] = useState(["P4"]);
  const [groepA2, setGroepA2] = useState(["P5"]);

  // Panel B: multi-period comparison (default 3 vs 3)
  const [groepB1, setGroepB1] = useState(["P10", "P11", "P12"]);
  const [groepB2, setGroepB2] = useState(["P13", "P1", "P2"]);

  const units = useMemo(
    () => [...new Set(omzetConsultants.map((c) => c.unit))].sort(),
    []
  );

  return (
    <ConsultantLayout
      title="Omzetdashboard"
      subtitle="Omzetontwikkeling per consultant — gesorteerd op hardste stijgers"
    >
      {/* Global unit filter */}
      <div className="flex items-end gap-4 mb-6">
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
        />
        <OmzetPanel
          title="Periode vergelijking B"
          groep1={groepB1}
          groep2={groepB2}
          setGroep1={setGroepB1}
          setGroep2={setGroepB2}
          unitFilter={unitFilter}
        />
      </div>
    </ConsultantLayout>
  );
};

export default OmzetDashboard;

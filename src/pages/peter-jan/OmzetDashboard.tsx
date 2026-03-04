import { useState, useMemo } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { omzetConsultants, allPeriodes, getOmzetForPeriodes } from "@/data/omzetDashboardData";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";

function formatCurrency(val: number) {
  return `€${val.toLocaleString("nl-NL")}`;
}

const OmzetDashboard = () => {
  const [periode1, setPeriode1] = useState("P4");
  const [periode2, setPeriode2] = useState("P5");
  const [unitFilter, setUnitFilter] = useState("alle");

  const units = useMemo(
    () => [...new Set(omzetConsultants.map((c) => c.unit))].sort(),
    []
  );

  const filtered = useMemo(() => {
    const base = unitFilter === "alle"
      ? omzetConsultants
      : omzetConsultants.filter((c) => c.unit === unitFilter);
    return getOmzetForPeriodes(base, periode1, periode2);
  }, [periode1, periode2, unitFilter]);

  const totals = useMemo(
    () => filtered.reduce(
      (acc, r) => ({
        p1: acc.p1 + r.periode1,
        p2: acc.p2 + r.periode2,
        verschil: acc.verschil + r.verschil,
      }),
      { p1: 0, p2: 0, verschil: 0 }
    ),
    [filtered]
  );

  return (
    <ConsultantLayout
      title="Omzetdashboard"
      subtitle="Omzetontwikkeling per consultant — gesorteerd op hardste stijgers"
    >
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Periode 1</label>
          <Select value={periode1} onValueChange={setPeriode1}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allPeriodes.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Periode 2</label>
          <Select value={periode2} onValueChange={setPeriode2}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allPeriodes.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

      {/* KPI tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Totaal {periode1}</p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedNumber value={totals.p1} prefix="€" formatFn={(v) => Math.round(v).toLocaleString("nl-NL")} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Totaal {periode2}</p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedNumber value={totals.p2} prefix="€" formatFn={(v) => Math.round(v).toLocaleString("nl-NL")} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Totaal Verschil</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${totals.verschil >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                <AnimatedNumber
                  value={totals.verschil}
                  prefix={totals.verschil >= 0 ? "+€" : "-€"}
                  formatFn={(v) => Math.abs(Math.round(v)).toLocaleString("nl-NL")}
                />
              </p>
              {totals.verschil >= 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12 font-semibold">#</TableHead>
                <TableHead className="font-semibold">Consultant</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
                <TableHead className="text-right font-semibold">{periode1}</TableHead>
                <TableHead className="text-right font-semibold">{periode2}</TableHead>
                <TableHead className="text-right font-semibold">Verschil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, idx) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.unit}</TableCell>
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
              {/* Totaal */}
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
    </ConsultantLayout>
  );
};

export default OmzetDashboard;

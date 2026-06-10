import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { ArrowUpDown, X } from "lucide-react";

import type { DeltaMode } from "@/components/marketing/DeltaCell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecruitCRMLink } from "@/components/prognose/RecruitCRMLink";
import {
  afgewezenCandidates,
  afgewezenReasons,
  afgewezenTotal,
  instroomPerConsultant,
  type AfgewezenCandidate,
} from "@/data/marketingAfgewezenData";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode: DeltaMode;
}

type SortKey = keyof AfgewezenCandidate;

const reasonColorMap = Object.fromEntries(afgewezenReasons.map((r) => [r.reason, r.color]));

const rateTone = (pct: number) => {
  if (pct >= 30) return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
  if (pct >= 15) return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
};

const AfgewezenTab = (_props: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("datum");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [consultantFilter, setConsultantFilter] = useState<string | null>(null);
  const [regioFilter, setRegioFilter] = useState<string | null>(null);
  const [redenFilter, setRedenFilter] = useState<string | null>(null);

  // Consultant — instroom vs afwijzing, sorted by afwijspercentage desc.
  const consultantRows = useMemo(() => {
    const afgewezenMap = new Map<string, number>();
    for (const c of afgewezenCandidates) {
      afgewezenMap.set(c.recruiter, (afgewezenMap.get(c.recruiter) ?? 0) + 1);
    }
    const consultants = new Set<string>([
      ...Object.keys(instroomPerConsultant),
      ...afgewezenMap.keys(),
    ]);
    return Array.from(consultants)
      .map((name) => {
        const afgewezen = afgewezenMap.get(name) ?? 0;
        const gekregen = instroomPerConsultant[name] ?? afgewezen;
        const pct = gekregen > 0 ? (afgewezen / gekregen) * 100 : 0;
        return { name, gekregen, afgewezen, pct };
      })
      .sort((a, b) => b.pct - a.pct);
  }, []);

  // Regio — top redenen per regio.
  const regioRows = useMemo(() => {
    const byRegio = new Map<string, Map<string, number>>();
    for (const c of afgewezenCandidates) {
      const r = c.regio || "Onbekend";
      if (!byRegio.has(r)) byRegio.set(r, new Map());
      const m = byRegio.get(r)!;
      m.set(c.reden, (m.get(c.reden) ?? 0) + 1);
    }
    return Array.from(byRegio.entries())
      .map(([regio, reasons]) => {
        const total = Array.from(reasons.values()).reduce((s, n) => s + n, 0);
        const items = Array.from(reasons.entries())
          .map(([reden, count]) => ({ reden, count, pct: (count / total) * 100 }))
          .sort((a, b) => b.count - a.count);
        return { regio, total, items };
      })
      .sort((a, b) => b.total - a.total);
  }, []);

  const filtered = useMemo(() => {
    return afgewezenCandidates.filter(
      (c) =>
        (!consultantFilter || c.recruiter === consultantFilter) &&
        (!regioFilter || (c.regio || "Onbekend") === regioFilter) &&
        (!redenFilter || c.reden === redenFilter),
    );
  }, [consultantFilter, regioFilter, redenFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const TABLE_LIMIT = 100;
  const tableRows = sorted.slice(0, TABLE_LIMIT);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortableHead = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <TableHead>
      <button
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  );

  const activeFilters: { label: string; value: string; clear: () => void }[] = [];
  if (consultantFilter)
    activeFilters.push({ label: "Consultant", value: consultantFilter, clear: () => setConsultantFilter(null) });
  if (regioFilter)
    activeFilters.push({ label: "Regio", value: regioFilter, clear: () => setRegioFilter(null) });
  if (redenFilter)
    activeFilters.push({ label: "Reden", value: redenFilter, clear: () => setRedenFilter(null) });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Totaal afgewezen kandidaten
          </CardTitle>
          <div className="text-4xl font-bold text-foreground">{afgewezenTotal.toLocaleString("nl-NL")}</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {afgewezenReasons.map((r) => {
              const pct = (r.count / afgewezenTotal) * 100;
              return (
                <div
                  key={r.reason}
                  className="rounded-lg border bg-card p-4 overflow-hidden relative"
                  style={{ borderTop: `3px solid ${r.color}` }}
                >
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {r.reason}
                  </div>
                  <div className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                    {r.count.toLocaleString("nl-NL")}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                    {pct.toFixed(1)}% van totaal
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">
              Afgewezen kandidaten{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({filtered.length.toLocaleString("nl-NL")}
                {filtered.length > TABLE_LIMIT ? ` — top ${TABLE_LIMIT} getoond` : ""})
              </span>
            </CardTitle>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeFilters.map((f) => (
                  <Badge key={f.label} variant="secondary" className="gap-1 pl-2 pr-1 text-xs">
                    <span className="text-muted-foreground">{f.label}:</span>
                    <span className="font-medium">{f.value}</span>
                    <button
                      onClick={f.clear}
                      className="ml-0.5 rounded-sm p-0.5 hover:bg-muted-foreground/20"
                      aria-label={`Verwijder filter ${f.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead k="naam">Naam</SortableHead>
                <SortableHead k="bron">Bron</SortableHead>
                <SortableHead k="unit">Unit</SortableHead>
                <SortableHead k="regio">Regio</SortableHead>
                <SortableHead k="functie">Functie</SortableHead>
                <SortableHead k="reden">Reden afgewezen</SortableHead>
                <SortableHead k="recruiter">Recruiter</SortableHead>
                <SortableHead k="datum">Datum</SortableHead>
                <TableHead className="w-12">RCRM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.naam}</TableCell>
                  <TableCell className="text-muted-foreground">{c.bron}</TableCell>
                  <TableCell>{c.unit}</TableCell>
                  <TableCell className="text-muted-foreground">{c.regio || "Onbekend"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.functie}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: reasonColorMap[c.reden],
                        color: reasonColorMap[c.reden],
                      }}
                    >
                      {c.reden}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.recruiter}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {new Date(c.datum).toLocaleDateString("nl-NL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <RecruitCRMLink />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Instroom vs. afwijzing per consultant
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Gesorteerd op hoogste afwijspercentage — klik een rij om de tabel te filteren.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Consultant</TableHead>
                  <TableHead className="text-xs text-right">Gekregen</TableHead>
                  <TableHead className="text-xs text-right">Afgewezen</TableHead>
                  <TableHead className="text-xs text-right">Afwijspercentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultantRows.map((r) => {
                  const active = consultantFilter === r.name;
                  return (
                    <TableRow
                      key={r.name}
                      onClick={() => setConsultantFilter(active ? null : r.name)}
                      className={`cursor-pointer ${active ? "bg-primary/10" : ""}`}
                    >
                      <TableCell className={`text-xs font-medium ${active ? "text-foreground" : ""}`}>
                        {r.name}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                        {r.gekregen.toLocaleString("nl-NL")}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {r.afgewezen.toLocaleString("nl-NL")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`tabular-nums ${rateTone(r.pct)}`}>
                          {r.pct.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Redenen van afwijzing per regio
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Top-redenen per regio met aandeel binnen die regio. Klik om te filteren.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {regioRows.map((r) => (
              <div key={r.regio} className="rounded-md border bg-card/50 p-2">
                <div className="flex items-baseline justify-between px-1 pb-1">
                  <button
                    onClick={() => setRegioFilter(regioFilter === r.regio ? null : r.regio)}
                    className={`text-xs font-semibold hover:text-primary transition-colors ${
                      regioFilter === r.regio ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {r.regio}
                  </button>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {r.total.toLocaleString("nl-NL")} afgewezen
                  </span>
                </div>
                <div className="space-y-0.5">
                  {r.items.slice(0, 3).map((item) => {
                    const active = redenFilter === item.reden && regioFilter === r.regio;
                    return (
                      <button
                        key={item.reden}
                        onClick={() => {
                          setRegioFilter(r.regio);
                          setRedenFilter(redenFilter === item.reden ? null : item.reden);
                        }}
                        className={`relative w-full overflow-hidden rounded text-left transition-colors ${
                          active ? "bg-primary/15" : "hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-primary/10"
                          style={{ width: `${item.pct}%` }}
                          aria-hidden
                        />
                        <div className="relative flex items-center justify-between gap-2 px-2 py-1">
                          <span className="truncate text-xs text-foreground/90">{item.reden}</span>
                          <span className="shrink-0 text-xs tabular-nums">
                            <span className="font-semibold">{item.pct.toFixed(0)}%</span>
                            <span className="ml-1.5 text-muted-foreground">
                              ({item.count})
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AfgewezenTab;

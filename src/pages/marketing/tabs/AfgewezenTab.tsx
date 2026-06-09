import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { ArrowUpDown } from "lucide-react";


import type { DeltaMode } from "@/components/marketing/DeltaCell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  type AfgewezenCandidate,
} from "@/data/marketingAfgewezenData";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode: DeltaMode;
}

type SortKey = keyof AfgewezenCandidate;

const reasonColorMap = Object.fromEntries(afgewezenReasons.map((r) => [r.reason, r.color]));

const AfgewezenTab = (_props: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("datum");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...afgewezenCandidates];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [sortKey, sortDir]);

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
          <CardTitle className="text-base">Afgewezen kandidaten</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead k="naam">Naam</SortableHead>
                <SortableHead k="bron">Bron</SortableHead>
                <SortableHead k="unit">Unit</SortableHead>
                <SortableHead k="functie">Functie</SortableHead>
                <SortableHead k="reden">Reden afgewezen</SortableHead>
                <SortableHead k="recruiter">Recruiter</SortableHead>
                <SortableHead k="datum">Datum</SortableHead>
                <TableHead className="w-12">RCRM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.naam}</TableCell>
                  <TableCell className="text-muted-foreground">{c.bron}</TableCell>
                  <TableCell>{c.unit}</TableCell>
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
    </div>
  );
};

export default AfgewezenTab;

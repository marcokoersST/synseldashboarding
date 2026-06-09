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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex-1 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={afgewezenReasons} margin={{ top: 24, right: 16, bottom: 8, left: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="reason"
                    tick={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {afgewezenReasons.map((r) => (
                      <Cell key={r.reason} fill={r.color} />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      className="fill-foreground"
                      style={{ fontSize: 13, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 lg:w-56">
              {afgewezenReasons.map((r) => (
                <div key={r.reason} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-3 w-3 rounded-sm shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="text-foreground">{r.reason}</span>
                </div>
              ))}
            </div>
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

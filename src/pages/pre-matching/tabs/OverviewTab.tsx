import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import FunnelSteps from "@/components/pre-matching/FunnelSteps";
import { DevNote } from "@/components/groeimodel/DevNote";
import VacatureTable from "@/components/pre-matching/VacatureTable";
import {
  aggregateFunnel,
  filterMatches,
  trendByWeek,
  type PreMatchingFilters,
} from "@/data/preMatchingData";

const SERIES = [
  { key: "s1", label: "Match → consultant", color: "hsl(var(--primary))" },
  { key: "s2", label: "Consultant → kandidaat", color: "hsl(199 89% 48%)" },
  { key: "s3", label: "Kandidaat → klant", color: "hsl(38 92% 50%)" },
  { key: "s4", label: "Klant → plaatsing", color: "hsl(142 71% 45%)" },
  { key: "e2e", label: "Match → plaatsing (totaal)", color: "hsl(280 65% 55%)" },
] as const;

interface Props {
  filters: PreMatchingFilters;
  filterState: PreMatchingFilters;
  onFiltersChange: (f: PreMatchingFilters) => void;
  onSelectVacature: (id: string) => void;
}

export function OverviewTab({ filters, filterState, onFiltersChange, onSelectVacature }: Props) {
  const [visible, setVisible] = useState<string[]>(SERIES.map((s) => s.key));

  const ms = useMemo(() => filterMatches(filters), [filters]);
  const funnel = useMemo(() => aggregateFunnel(ms), [ms]);
  const trend = useMemo(() => trendByWeek(ms), [ms]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Totaalfunnel</h2>
        <FunnelSteps data={funnel} />
        <DevNote
          story="Overview — Totaalfunnel"
          logic={`Match gegenereerd: the amount of candidates for which a match was found.

Voorgesteld aan Consultant: the amount of candidates where a match was found and the candidate was set to the status Inschrijven on name of that consultant (as owner)

Voorgesteld aan kandidaat: the amount of candidates where a match was found and the candidate was set to the status Inschrijven on name of that consultant (as owner) and there is an Inschrijvings call.

Voorgesteld aan klant: the amount of candidates for which we found a match and there was a deal created by a consultant on the status 2.0 or higher.

Plaatsing: the amount of candidates placed at the vacancy they were matched on.`}
        />
      </div>

      <VacatureTable
        filters={filters}
        filterState={filterState}
        onFiltersChange={onFiltersChange}
        onSelectVacature={onSelectVacature}
        showFilters={false}

      />
    </div>
  );
}

export default OverviewTab;

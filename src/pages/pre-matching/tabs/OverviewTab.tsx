import { useMemo } from "react";
import FunnelSteps from "@/components/pre-matching/FunnelSteps";
import { DevNote } from "@/components/groeimodel/DevNote";
import VacatureTable from "@/components/pre-matching/VacatureTable";
import {
  aggregateFunnel,
  filterMatches,
  type PreMatchingFilters,
} from "@/data/preMatchingData";

interface Props {
  filters: PreMatchingFilters;
  filterState: PreMatchingFilters;
  onFiltersChange: (f: PreMatchingFilters) => void;
  onSelectVacature: (id: string) => void;
}

export function OverviewTab({ filters, filterState, onFiltersChange, onSelectVacature }: Props) {
  const ms = useMemo(() => filterMatches(filters), [filters]);
  const funnel = useMemo(() => aggregateFunnel(ms), [ms]);

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

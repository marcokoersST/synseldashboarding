import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpDown, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import FunnelSteps from "@/components/pre-matching/FunnelSteps";
import { DevNote } from "@/components/groeimodel/DevNote";
import VacatureTable from "@/components/pre-matching/VacatureTable";
import {
  FUNNEL_STEPS,
  aggregateFunnel,
  filterMatches,
  rcrmCandidateProfileUrl,
  synselCandidateProfileUrl,

  
  vacatures,

  type PreMatchingFilters,
} from "@/data/preMatchingData";

interface Props {
  vacatureId: string;
  filters: PreMatchingFilters;
  filterState?: PreMatchingFilters;
  onFiltersChange?: (f: PreMatchingFilters) => void;
  onBack: () => void;
  onSelectVacature?: (id: string) => void;
}

type SortKey = "matchScore" | "candidateName" | "reachedStep" | "crmStatus";

export function VacatureDrilldownTab({
  vacatureId,
  filters,
  filterState,
  onFiltersChange,
  onBack,
  onSelectVacature,
}: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "matchScore", dir: "desc" });
  const vac = vacatures.find((v) => v.id === vacatureId);




  const list = useMemo(() => {
    const ms = filterMatches({ ...filters, vacatureStatus: "alle", consultants: [], functiegroepen: [], klanten: [] });
    return ms.filter((m) => m.vacatureId === vacatureId);
  }, [filters, vacatureId]);

  const funnel = useMemo(() => aggregateFunnel(list), [list]);

  const sorted = useMemo(() => {
    const arr = [...list];
    arr.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string" && typeof bv === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [list, sort]);

  if (!vac) {
    return (
      <div className="space-y-4">
        <VacatureTable
          filters={filters}
          filterState={filterState ?? filters}
          onFiltersChange={onFiltersChange ?? (() => {})}
          onSelectVacature={(id) => onSelectVacature?.(id)}
          title="Kies een vacature — klik op een rij voor de drill-down"
        />
      </div>
    );
  }

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug naar vacaturelijst
        </Button>
      </div>



      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Vacature</div>
            <div className="text-lg font-bold text-foreground">{vac.titel}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Klant</div>
            <div className="text-sm text-foreground">{vac.klant}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Consultant</div>
            <div className="text-sm text-foreground">{vac.consultant}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Functiegroep</div>
            <div className="text-sm text-foreground">{vac.functiegroep}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</div>
            <Badge variant={vac.status === "actief" ? "default" : "secondary"} className="text-[10px]">
              {vac.status}
            </Badge>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Geopend</div>
            <div className="text-sm tabular-nums text-foreground">
              {format(vac.geopend, "d MMM yyyy", { locale: nl })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Funnel voor deze vacature</h2>
        <FunnelSteps data={funnel} />
        <DevNote
          story="Vacature drilldown — Funnel voor deze vacature"
          logic={`Match gegenereerd: the amount of candidates for which a match was found on this vacancy.

Voorgesteld aan Consultant: the amount of candidates where a match was found and the candidate was set to the status Inschrijven on name of that consultant (as owner) on this vacancy.

Voorgesteld aan kandidaat: the amount of candidates where a match was found and the candidate was set to the status Inschrijven on name of that consultant (as owner) and there is an Inschrijvings call on this vacancy.

Voorgesteld aan klant: the amount of candidates for which we found a match and there was a deal created by a consultant on the status 2.0 or higher on this vacancy.

Plaatsing: the amount of candidates placed at this vacancy.`}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Kandidaten ({sorted.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-muted/60 text-muted-foreground backdrop-blur">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">
                    <button onClick={() => toggleSort("candidateName")} className="inline-flex items-center gap-1">
                      Kandidaat <ArrowUpDown className={cn("h-3 w-3", sort.key === "candidateName" ? "opacity-100" : "opacity-30")} />
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    <button onClick={() => toggleSort("reachedStep")} className="inline-flex items-center gap-1">
                      Laatst bereikte stap <ArrowUpDown className={cn("h-3 w-3", sort.key === "reachedStep" ? "opacity-100" : "opacity-30")} />
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    <button onClick={() => toggleSort("crmStatus")} className="inline-flex items-center gap-1">
                      Status <ArrowUpDown className={cn("h-3 w-3", sort.key === "crmStatus" ? "opacity-100" : "opacity-30")} />
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    <button onClick={() => toggleSort("matchScore")} className="inline-flex items-center gap-1">
                      Matchscore <ArrowUpDown className={cn("h-3 w-3", sort.key === "matchScore" ? "opacity-100" : "opacity-30")} />
                    </button>
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((m) => (
                  <tr key={m.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-3 py-2 font-medium text-foreground">{m.candidateName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{FUNNEL_STEPS[m.reachedStep]}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          m.crmStatus === "Geplaatst"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : m.crmStatus === "Niet Beschikbaar" || m.crmStatus === "Niet Geplaatst"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/10 text-primary",
                        )}
                      >
                        {m.crmStatus}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-semibold tabular-nums",
                        m.matchScore > 80 ? "text-emerald-600" : m.matchScore >= 65 ? "text-amber-600" : "text-muted-foreground",
                      )}
                    >
                      {m.matchScore}%
                    </td>

                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={rcrmCandidateProfileUrl(m.candidateId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Recruit CRM"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-primary text-[9px] font-bold text-primary-foreground">
                            R
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={synselCandidateProfileUrl(m.candidateId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="AI.synsel"
                          className="inline-flex items-center gap-1 text-foreground hover:underline"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-foreground text-[9px] font-bold text-background">
                            S
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>

                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      Geen matches binnen de gekozen periode.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-3 pb-3">
            <DevNote
              story="Vacature drilldown — Kandidaten"
              logic={`Naam: Name of the candidate

Laatst bereikte stap: till which point of the funnel explained above did this candidate go?

Status: Candidate status in RCRM

Matchscore: the matchscore for the candidate on this vacancy

R: link to RCRM profile

S: link to Synsel AI profile`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VacatureDrilldownTab;

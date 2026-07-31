import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpDown, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import FunnelSteps from "@/components/pre-matching/FunnelSteps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FUNNEL_STEPS,
  aggregateFunnel,
  filterMatches,
  filterVacatures,
  rcrmCandidateProfileUrl,
  vacatures,
  type PreMatchingFilters,
} from "@/data/preMatchingData";

interface Props {
  vacatureId: string;
  filters: PreMatchingFilters;
  onBack: () => void;
  onSelectVacature?: (id: string) => void;
}

type SortKey = "matchScore" | "candidateName" | "reachedStep" | "crmStatus";

export function VacatureDrilldownTab({ vacatureId, filters, onBack, onSelectVacature }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "matchScore", dir: "desc" });
  const vac = vacatures.find((v) => v.id === vacatureId);

  const options = useMemo(() => {
    const list = filterVacatures(filters);
    const withCurrent = vac && !list.some((v) => v.id === vac.id) ? [vac, ...list] : list;
    return [...withCurrent].sort((a, b) => a.titel.localeCompare(b.titel));
  }, [filters, vac]);

  const selector = (
    <Select value={vacatureId || undefined} onValueChange={(v) => onSelectVacature?.(v)}>
      <SelectTrigger className="h-9 w-[380px] max-w-full text-xs">
        <SelectValue placeholder="Kies een vacature…" />
      </SelectTrigger>
      <SelectContent className="max-h-[320px]">
        {options.map((v) => (
          <SelectItem key={v.id} value={v.id} className="text-xs">
            {v.titel} — {v.klant} ({v.consultant})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );


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
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug naar overview
        </Button>
        {selector}
        <p className="text-sm text-muted-foreground">Kies hierboven een vacature of selecteer er één in de overview-tabel.</p>
      </div>
    );
  }

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug naar overview
        </Button>
        {selector}
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
                      <a
                        href={rcrmCandidateProfileUrl(m.candidateId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded bg-primary text-[9px] font-bold text-primary-foreground">
                          R
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default VacatureDrilldownTab;

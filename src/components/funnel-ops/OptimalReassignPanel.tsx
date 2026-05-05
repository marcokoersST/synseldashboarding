import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, Search } from "lucide-react";
import { optimalReassignments, kpis, UNITS_REF } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { CandidateLink, UserLink } from "./CandidateLink";
import { TierBadge } from "./TierBadge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TIERS: Tier[] = ["85+", "70-85", "50-70"];

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export function OptimalReassignPanel({ open, onOpenChange }: Props) {
  const all = useMemo(() => optimalReassignments(), []);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState<Set<string>>(new Set(UNITS_REF));
  const [tierFilter, setTierFilter] = useState<Set<Tier>>(new Set(TIERS));

  const filtered = all.filter(s =>
    unitFilter.has(s.candidate.unit) &&
    tierFilter.has(s.candidate.tier) &&
    (search === "" || s.candidate.naam.toLowerCase().includes(search.toLowerCase()))
  );

  const sumExtra = filtered.reduce((s, r) => s + r.expectedExtraPlacements, 0);
  const avgUplift = filtered.length ? +(filtered.reduce((s, r) => s + r.uplift, 0) / filtered.length).toFixed(1) : 0;
  const consultantsInvolved = new Set(filtered.map(r => r.toConsultant.id)).size;

  const toggleUnit = (u: string) => {
    const n = new Set(unitFilter);
    n.has(u) ? n.delete(u) : n.add(u);
    setUnitFilter(n);
  };
  const toggleTier = (t: Tier) => {
    const n = new Set(tierFilter);
    n.has(t) ? n.delete(t) : n.add(t);
    setTierFilter(n);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[960px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Optimale herverdeling
            <Badge variant="outline" className="text-orange-500 border-orange-500/40">+{kpis.forecastMaand.ideal - kpis.forecastMaand.p50} plaatsingen potentie</Badge>
          </SheetTitle>
          <SheetDescription className="flex items-center gap-1.5 text-xs">
            <Lock className="w-3 h-3" /> READ-ONLY suggestielijst — daadwerkelijk schuiven gebeurt in RecruitCRM.
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <Stat label="Kandidaten" value={filtered.length.toString()} />
          <Stat label="Gem. uplift" value={`${avgUplift} pp`} />
          <Stat label="Consultants betrokken" value={consultantsInvolved.toString()} />
          <Stat label="Cumulatief extra" value={`+${sumExtra.toFixed(1)}`} />
        </div>

        <Card className="p-3 mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoek kandidaat…" className="h-8 pl-7 text-xs" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground mr-1">Tier</span>
              {TIERS.map(t => (
                <button key={t} onClick={() => toggleTier(t)}
                  className={cn("text-xs px-2 py-1 rounded border", tierFilter.has(t) ? "bg-primary/10 border-primary/40 text-foreground" : "border-border text-muted-foreground")}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground mr-1">Unit</span>
              {UNITS_REF.map(u => (
                <button key={u} onClick={() => toggleUnit(u)}
                  className={cn("text-xs px-2 py-1 rounded border", unitFilter.has(u) ? "bg-primary/10 border-primary/40 text-foreground" : "border-border text-muted-foreground")}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left p-2 font-normal">Kandidaat</th>
                  <th className="p-2 font-normal">Tier</th>
                  <th className="text-left p-2 font-normal">Functiegroep</th>
                  <th className="text-left p-2 font-normal">Unit</th>
                  <th className="text-left p-2 font-normal">Huidig</th>
                  <th className="p-2 font-normal"></th>
                  <th className="text-left p-2 font-normal">Voorstel</th>
                  <th className="p-2 font-normal text-right">Uplift</th>
                  <th className="p-2 font-normal text-right">Extra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="p-4 text-center text-muted-foreground">Geen suggesties met huidige filters.</td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/30 align-top">
                    <td className="p-2">
                      <CandidateLink id={s.candidate.id} name={s.candidate.naam} />
                      <div className="text-[10px] text-muted-foreground mt-0.5">{s.reden}</div>
                    </td>
                    <td className="p-2"><TierBadge tier={s.candidate.tier} /></td>
                    <td className="p-2">{s.candidate.functiegroep}</td>
                    <td className="p-2">{s.candidate.unit}</td>
                    <td className="p-2">
                      {s.fromConsultant
                        ? <div className="space-y-0.5"><UserLink id={s.fromConsultant.id} name={s.fromConsultant.naam} /><div className="text-[10px] text-muted-foreground tabular-nums">{s.currentHitRate}%</div></div>
                        : <span className="text-muted-foreground italic">—<div className="text-[10px]">8% baseline</div></span>}
                    </td>
                    <td className="p-2 text-muted-foreground"><ArrowRight className="w-3.5 h-3.5" /></td>
                    <td className="p-2">
                      <UserLink id={s.toConsultant.id} name={s.toConsultant.naam} />
                      <div className="text-[10px] text-success tabular-nums">{s.suggestedHitRate}%</div>
                    </td>
                    <td className="p-2 text-right">
                      <span className={cn("inline-block tabular-nums px-1.5 py-0.5 rounded text-[11px] font-semibold",
                        s.uplift >= 15 ? "bg-destructive/15 text-destructive" : "bg-orange-500/15 text-orange-500")}>
                        +{s.uplift}pp
                      </span>
                    </td>
                    <td className="p-2 text-right tabular-nums font-semibold">+{s.expectedExtraPlacements.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground bg-muted/20">
            Cumulatief verwacht effect: <span className="text-foreground font-semibold tabular-nums">+{sumExtra.toFixed(1)}</span> plaatsingen → forecast {kpis.forecastMaand.p50 + Math.round(sumExtra)}.
          </div>
        </Card>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-md p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

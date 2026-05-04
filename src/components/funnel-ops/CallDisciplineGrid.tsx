import { recruiterCallGrids } from "@/data/funnelOperationsData";
import { CandidateLink, UserLink } from "./CandidateLink";
import { TierBadge } from "./TierBadge";
import { MessageCircle, Voicemail, Check, X, Circle } from "lucide-react";

const SLOTS: { dag: 1 | 2; dagdeel: "ochtend" | "middag" | "avond"; label: string }[] = [
  { dag: 1, dagdeel: "ochtend", label: "D1 08:30" },
  { dag: 1, dagdeel: "middag",  label: "D1 12:00" },
  { dag: 1, dagdeel: "avond",   label: "D1 17:00" },
  { dag: 2, dagdeel: "ochtend", label: "D2 08:30" },
  { dag: 2, dagdeel: "middag",  label: "D2 12:00" },
  { dag: 2, dagdeel: "avond",   label: "D2 17:00" },
];

export function CallDisciplineGrid() {
  const recruiterGrids = recruiterCallGrids().slice(0, 8);

  return (
    <div className="space-y-4">
      {recruiterGrids.map(({ recruiter, grids, six, total, totalAttempts }) => (
        <div key={recruiter.id} className="border border-border rounded-md bg-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-b border-border bg-muted/20">
            <UserLink id={recruiter.id} name={recruiter.naam} className="font-medium text-sm" />
            <span className="text-xs text-muted-foreground">{grids.length} kandidaten · {totalAttempts} pogingen</span>
            <span className={`ml-auto text-xs font-semibold tabular-nums ${six / Math.max(total,1) >= 0.7 ? "text-success" : "text-orange-500"}`}>
              {six}/{total} · 6/6
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left p-2 font-normal">Kandidaat</th>
                  <th className="p-2 font-normal">Tier</th>
                  {SLOTS.map(s => <th key={s.label} className="p-2 font-normal text-center whitespace-nowrap">{s.label}</th>)}
                  <th className="p-2 font-normal text-center">WA</th>
                  <th className="p-2 font-normal text-center">VM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grids.map(({ candidate, attempts }) => {
                  const first = attempts.find(a => a.dagOffset === 1 && a.dagdeel === "ochtend");
                  return (
                    <tr key={candidate.id}>
                      <td className="p-2"><CandidateLink id={candidate.id} name={candidate.naam} /></td>
                      <td className="p-2"><TierBadge tier={candidate.tier} /></td>
                      {SLOTS.map(s => {
                        const a = attempts.find(x => x.dagOffset === s.dag && x.dagdeel === s.dagdeel);
                        const Icon = !a || !a.uitgevoerd ? X : a.succesvol ? Check : Circle;
                        const color = !a || !a.uitgevoerd ? "text-destructive" : a.succesvol ? "text-success" : "text-orange-500";
                        return (
                          <td key={s.label} className="p-2 text-center">
                            <Icon className={`inline-block w-3.5 h-3.5 ${color}`} strokeWidth={3} />
                          </td>
                        );
                      })}
                      <td className="p-2 text-center">{first?.whatsapp ? <MessageCircle className="inline-block w-3.5 h-3.5 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-2 text-center">{first?.voicemail ? <Voicemail className="inline-block w-3.5 h-3.5 text-orange-500" /> : <span className="text-muted-foreground">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground text-center">
        Toont 8 van {recruiterCallGrids().length} recruiters. Bel-data is read-only — wijzigen via RecruitCRM.
      </p>
    </div>
  );
}

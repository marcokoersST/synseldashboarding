import { recruiterSLAStats } from "@/data/funnelOperationsData";
import { UserLink } from "./CandidateLink";

export function SLALeaderboard() {
  const rows = recruiterSLAStats().slice(0, 12);
  return (
    <div className="border border-border rounded-md bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border text-sm font-medium">Recruiter leaderboard · contact-SLA</div>
      <table className="w-full text-xs">
        <thead className="text-muted-foreground bg-muted/20">
          <tr>
            <th className="text-left p-2 font-normal">Recruiter</th>
            <th className="p-2 font-normal text-right">Toegewezen</th>
            <th className="p-2 font-normal text-right">% Contact</th>
            <th className="p-2 font-normal text-right">% Gesprek</th>
            <th className="p-2 font-normal text-right">Open verlopen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(r => (
            <tr key={r.recruiter.id} className="hover:bg-muted/30">
              <td className="p-2"><UserLink id={r.recruiter.id} name={r.recruiter.naam} /></td>
              <td className="p-2 text-right tabular-nums">{r.assigned}</td>
              <td className={`p-2 text-right tabular-nums font-medium ${r.pctContact >= 80 ? "text-success" : r.pctContact >= 60 ? "text-orange-500" : "text-destructive"}`}>{r.pctContact}%</td>
              <td className={`p-2 text-right tabular-nums ${r.pctGesprek >= 70 ? "text-success" : "text-muted-foreground"}`}>{r.pctGesprek}%</td>
              <td className={`p-2 text-right tabular-nums ${r.overdue > 0 ? "text-destructive" : "text-muted-foreground"}`}>{r.overdue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { TierBadge } from "./TierBadge";
import { SLAStatusPill } from "./SLAStatusPill";
import { CandidateLink, UserLink } from "./CandidateLink";
import type { ActionRow } from "@/data/funnelOperationsData";
import { recruiterById, consultantById } from "@/data/funnelOperationsData";

export function ActionList({ rows, dense }: { rows: ActionRow[]; dense?: boolean }) {
  if (!rows.length) return <div className="text-sm text-muted-foreground p-4">Geen acties — alle SLA's binnen.</div>;
  return (
    <div className="divide-y divide-border">
      {rows.map(({ candidate: c, reason, sla }) => {
        const r = recruiterById(c.recruiterId);
        const co = consultantById(c.consultantId);
        return (
          <div key={c.id} className={`grid grid-cols-12 items-center gap-2 ${dense ? "py-1.5" : "py-2"} px-2 text-sm hover:bg-muted/30`}>
            <div className="col-span-3 flex items-center gap-2 min-w-0">
              <TierBadge tier={c.tier} />
              <CandidateLink id={c.id} name={c.naam} className="truncate" />
            </div>
            <div className="col-span-3 text-muted-foreground truncate">{reason}</div>
            <div className="col-span-2"><SLAStatusPill sla={sla} /></div>
            <div className="col-span-2 text-xs truncate">
              {r ? <UserLink id={r.id} name={r.naam} /> : <span className="text-muted-foreground">—</span>}
            </div>
            <div className="col-span-2 text-xs truncate">
              {co ? <UserLink id={co.id} name={co.naam} /> : <span className="text-muted-foreground">—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

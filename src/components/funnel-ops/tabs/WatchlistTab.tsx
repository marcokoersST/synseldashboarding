import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { watchlist } from "@/data/funnelOperationsData";
import type { Candidate } from "@/data/funnelOperationsData";
import { CandidateLink, UserLink } from "../CandidateLink";
import { TierBadge } from "../TierBadge";
import { recruiterById, consultantById } from "@/data/funnelOperationsData";
import { TileInfo, type TileInfoProps } from "../TileInfo";

function Section({ title, desc, items, info }: { title: string; desc: string; items: Candidate[]; info: TileInfoProps }) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 text-left">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">{desc}</div>
          </div>
        </div>
        <span className="flex items-center gap-2">
          <span className="text-xs tabular-nums bg-muted rounded-full px-2 py-0.5">{items.length}</span>
          <span onClick={(e) => e.stopPropagation()}><TileInfo {...info} /></span>
        </span>
      </button>
      {open && (
        <table className="w-full text-xs">
          <thead className="text-muted-foreground bg-muted/20 border-t border-border">
            <tr>
              <th className="text-left p-2 font-normal">Kandidaat</th>
              <th className="p-2 font-normal">Tier</th>
              <th className="p-2 font-normal text-right">Score</th>
              <th className="text-left p-2 font-normal">Unit</th>
              <th className="text-left p-2 font-normal">Recruiter</th>
              <th className="text-left p-2 font-normal">Consultant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr><td colSpan={6} className="p-3 text-center text-muted-foreground">Geen kandidaten in deze categorie.</td></tr>
            ) : items.map(c => {
              const r = recruiterById(c.recruiterId);
              const co = consultantById(c.consultantId);
              return (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="p-2"><CandidateLink id={c.id} name={c.naam} /></td>
                  <td className="p-2"><TierBadge tier={c.tier} /></td>
                  <td className="p-2 text-right tabular-nums">{c.score}</td>
                  <td className="p-2">{c.unit}</td>
                  <td className="p-2">{r ? <UserLink id={r.id} name={r.naam} /> : "—"}</td>
                  <td className="p-2">{co ? <UserLink id={co.id} name={co.naam} /> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export function WatchlistTab() {
  const w = watchlist();
  return (
    <div className="space-y-3">
      <Section title="Hoge score, lange tijd zonder contact" desc="Score ≥75 en >2 dagen na toewijzing zonder eerste contact." items={w.hoogScoreNoContact}
        info={{ title: "Hoge score zonder contact", what: "Sterke kandidaten waar nog geen recruiter heeft gebeld na 48u.", formula: "score ≥ 75 && eersteContactOp = null && (NOW − toegewezenOp) > 2d", source: "watchlist().hoogScoreNoContact" }} />
      <Section title="Verlopen SLA's > 24u" desc="Contact-SLA langer dan 24 uur over de deadline." items={w.verlopenSLA24}
        info={{ title: "Verlopen SLA > 24u", what: "Kandidaten waar contact-SLA al meer dan een dag is overschreden.", formula: "getContactSLA(c).status='verlopen' && (NOW − deadline) > 24u", source: "watchlist().verlopenSLA24" }} />
      <Section title="Bel-discipline incompleet" desc="Meer dan 2 belmomenten gemist en kandidaat nog niet ingeschreven." items={w.belIncompleet}
        info={{ title: "Bel-discipline incompleet", what: "Kandidaten met >2 gemiste belmomenten die nog niet zijn ingeschreven.", formula: "missed > 2 && status ∉ {ingeschreven, geplaatst}", source: "watchlist().belIncompleet" }} />
      <Section title="Geen statuswijziging > 7 dagen" desc="Sinds toewijzing geen vooruitgang in status." items={w.geenStatus7d}
        info={{ title: "Stilstand > 7 dagen", what: "Kandidaten die al een week op status 'toegewezen' staan zonder progressie.", formula: "status='toegewezen' && (NOW − toegewezenOp) > 7d", source: "watchlist().geenStatus7d" }} />
    </div>
  );
}

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CallDisciplineGrid } from "../CallDisciplineGrid";
import { SLALeaderboard } from "../SLALeaderboard";
import { ActionList } from "../ActionList";
import { tierContactStats, getActionList, TIER_COLOR, candidates, SLA_MATRIX } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { TileInfo } from "../TileInfo";

export function OpvolgingTab() {
  const [sub, setSub] = useState<"bel" | "sla">("bel");
  const tierStats = tierContactStats();
  const contactRows = getActionList(15);
  const gesprekRows = candidates
    .filter(c => !c.eersteGesprekOp && c.eersteContactOp)
    .map(c => {
      const dl = c.toegewezenOp + SLA_MATRIX[c.tier].gesprekH * 3600 * 1000;
      const elapsed = Date.now() - c.toegewezenOp;
      const pct = elapsed / (SLA_MATRIX[c.tier].gesprekH * 3600 * 1000);
      return { c, pct, dl };
    })
    .filter(x => x.pct >= 0.8)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 12)
    .map(x => ({
      candidate: x.c,
      reason: "Gesprek-SLA dreigend/verlopen",
      overdue: x.pct >= 1 ? "verlopen" : "<20% rest",
      sla: { status: x.pct >= 1 ? "verlopen" as const : "dreigend" as const, label: x.pct >= 1 ? "verlopen" : `${Math.round((1 - x.pct) * 100)}% rest`, pctElapsed: x.pct },
    }));

  return (
    <Tabs value={sub} onValueChange={(v) => setSub(v as "bel" | "sla")} className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full max-w-md">
        <TabsTrigger value="bel">Bel-discipline</TabsTrigger>
        <TabsTrigger value="sla">Opvolg-SLA</TabsTrigger>
      </TabsList>

      <TabsContent value="bel" className="space-y-3">
        <Card className="p-3 flex items-start justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            6 belmomenten over 2 dagen (08:30 / 12:00 / 17:00). Groen = succesvol contact, oranje = poging zonder gehoor, rood = niet uitgevoerd. Bel-data is niet aanpasbaar in dit dashboard.
          </p>
          <TileInfo title="Call discipline grid" what="A 6-cell grid per candidate per recruiter showing the status of each scheduled call attempt. Measures process discipline, regardless of whether contact was made." formula="6 attempts = 2 days × 3 day-parts (morning/afternoon/evening)" source="recruiterCallGrids() · callAttempts" notes="Mock assumption: ~70% of candidates reach 6/6 executed." />
        </Card>
        <CallDisciplineGrid />
      </TabsContent>

      <TabsContent value="sla" className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">SLA-score per tier</h3>
            <TileInfo title="SLA per tier" what="Contact-SLA score per candidate tier (A+ down to D). Used to verify that the highest-value candidates are actually being prioritised." formula="in_SLA / contacted × 100, grouped by tier" source="tierContactStats()" notes="Strict window for A+: 2 hours from assignment." />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {tierStats.map(t => (
              <Card key={t.tier} className="p-3 border-l-4" style={{ borderLeftColor: TIER_COLOR[t.tier as Tier] }}>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Tier {t.tier}</div>
                <div className="text-2xl font-bold tabular-nums">{t.pct}%</div>
                <div className="text-[11px] text-muted-foreground">binnen contact-SLA · n={t.n}</div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">SLA-leaderboard recruiters</h3>
            <TileInfo title="SLA leaderboard" what="Per recruiter: number of assigned candidates, % within contact-SLA, % within first-conversation SLA, and number of breaches. Surfaces individual workload and quality." formula="see recruiterSLAStats() — all aggregates grouped by recruiter.id" source="recruiterSLAStats()" />
          </div>
          <SLALeaderboard />
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Contact-SLA verlopen of dreigend</h3>
              <p className="text-xs text-muted-foreground">A+ candidates not contacted within 30 minutes of assignment are flagged red automatically.</p>
            </div>
            <TileInfo title="Contact-SLA action list" what="Open candidates whose contact-SLA is breached or within 20% of its deadline. Drives recruiter follow-up." formula="getActionList(15) filtered on contact-SLA" source="getActionList()" />
          </div>
          <ActionList rows={contactRows} />
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">First-conversation SLA — breached or at risk</h3>
            <TileInfo title="Conversation-SLA action list" what="Candidates that were contacted but whose first-conversation deadline is approaching or breached. Indicates handover risk between recruiter and consultant." formula="filter: pctElapsed ≥ 0.8 against SLA_MATRIX[tier].gesprekH" source="candidates × SLA_MATRIX" />
          </div>
          <ActionList rows={gesprekRows} />
        </Card>
      </TabsContent>
    </Tabs>
  );
}

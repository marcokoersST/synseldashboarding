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
        <Card className="p-3 text-xs text-muted-foreground">
          6 belmomenten over 2 dagen (08:30 / 12:00 / 17:00). Groen = succesvol contact, oranje = poging zonder gehoor, rood = niet uitgevoerd. Bel-data is niet aanpasbaar in dit dashboard.
        </Card>
        <CallDisciplineGrid />
      </TabsContent>

      <TabsContent value="sla" className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {tierStats.map(t => (
            <Card key={t.tier} className="p-3 border-l-4" style={{ borderLeftColor: TIER_COLOR[t.tier as Tier] }}>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Tier {t.tier}</div>
              <div className="text-2xl font-bold tabular-nums">{t.pct}%</div>
              <div className="text-[11px] text-muted-foreground">binnen contact-SLA · n={t.n}</div>
            </Card>
          ))}
        </div>

        <SLALeaderboard />

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Contact-SLA verlopen of dreigend</h3>
            <p className="text-xs text-muted-foreground">A+ binnen 30 minuten van toewijzing automatisch rood.</p>
          </div>
          <ActionList rows={contactRows} />
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Gesprek-SLA verlopen of dreigend</h3>
          </div>
          <ActionList rows={gesprekRows} />
        </Card>
      </TabsContent>
    </Tabs>
  );
}

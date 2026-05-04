import { Card } from "@/components/ui/card";
import { SLA_MATRIX, candidates, recruiters, consultants, callAttempts } from "@/data/funnelOperationsData";

export function DevInfoTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      <Card className="p-5 space-y-2">
        <h2 className="text-base font-semibold">Read-only constraint</h2>
        <p className="text-sm text-muted-foreground">
          Dit dashboard toont alleen informatie en deeplinkt naar RecruitCRM voor acties. Er zijn geen knoppen, formulieren
          of context-menu's die kandidaat-, bel-, status- of toewijs-data wijzigen. Alle mutaties gebeuren in RCRM.
        </p>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-base font-semibold">Mock-data setup</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat label="Kandidaten" value={candidates.length.toLocaleString()} />
          <Stat label="Recruiters" value={recruiters.length.toString()} />
          <Stat label="Consultants" value={consultants.length.toString()} />
          <Stat label="Bel-pogingen" value={callAttempts.length.toLocaleString()} />
        </div>
        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
          <li>Score-verdeling D/C/B/A/A+: 5% / 15% / 30% / 35% / 15%</li>
          <li>Bron-mix jobscan / open_cv / cv_database / reactivering / linkedin: 30% / 15% / 20% / 25% / 10%</li>
          <li>Type-mix nieuw / bestaand: 60% / 40%</li>
          <li>Bel-discipline: ~70% van kandidaten haalt 6/6 belmomenten</li>
          <li>Deterministische seed (1729) — alle tabs zijn consistent.</li>
        </ul>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-base font-semibold">SLA-matrix per tier</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-2">Tier</th>
              <th className="text-left p-2">Score</th>
              <th className="text-right p-2">Toewijzen</th>
              <th className="text-right p-2">Eerste contact</th>
              <th className="text-right p-2">Eerste gesprek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(["A+","A","B","C","D"] as const).map(t => (
              <tr key={t}>
                <td className="p-2 font-semibold">{t}</td>
                <td className="p-2 text-muted-foreground">{t === "A+" ? "90–100" : t === "A" ? "75–89" : t === "B" ? "55–74" : t === "C" ? "35–54" : "0–34"}</td>
                <td className="p-2 text-right tabular-nums">{fmtH(SLA_MATRIX[t].toewijzenH)}</td>
                <td className="p-2 text-right tabular-nums">{fmtH(SLA_MATRIX[t].contactH)}</td>
                <td className="p-2 text-right tabular-nums">{fmtH(SLA_MATRIX[t].gesprekH)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-5 space-y-2">
        <h2 className="text-base font-semibold">Kleurensysteem</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <ColorChip label="SLA · binnen" color="hsl(var(--success))" />
          <ColorChip label="SLA · dreigend" color="hsl(25 90% 55%)" />
          <ColorChip label="SLA · verlopen" color="hsl(var(--destructive))" />
          <ColorChip label="Tier A+" color="hsl(var(--destructive))" />
          <ColorChip label="Tier A" color="hsl(25 90% 55%)" />
          <ColorChip label="Tier B" color="hsl(210 80% 55%)" />
          <ColorChip label="Tier C" color="hsl(var(--success))" />
          <ColorChip label="Tier D" color="hsl(var(--muted-foreground))" />
        </div>
      </Card>

      <Card className="p-5 space-y-2">
        <h2 className="text-base font-semibold">Deeplink-formats</h2>
        <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto">{`Kandidaat:  https://app.recruitcrm.io/candidates/{candidate_id}
Recruiter:  https://app.recruitcrm.io/users/{user_id}
Consultant: https://app.recruitcrm.io/users/{user_id}`}</pre>
        <p className="text-xs text-muted-foreground">
          In productie wordt dit de echte RCRM-URL met tenant. Geen pre-filled actiequeries — gebruiker
          handelt in RCRM zelf.
        </p>
      </Card>

      <Card className="p-5 space-y-2">
        <h2 className="text-base font-semibold">Data-schema (mock)</h2>
        <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto">{`candidates(id, naam, type, score, tier, unit, functiegroep, bron, subBron,
  status, recruiterId, consultantId, toegewezenOp, eersteContactOp,
  eersteGesprekOp, ingeschrevenOp)

call_attempts(candidateId, recruiterId, dagdeel, dagOffset,
  uitgevoerd, succesvol, whatsapp, voicemail)

recruiters(id, naam)
consultants(id, naam)
placements (afgeleid van candidates met status='geplaatst')`}</pre>
        <p className="text-xs text-muted-foreground">
          Single source of truth: <code className="bg-muted px-1 rounded">src/data/funnelOperationsData.ts</code>
        </p>
      </Card>

      <Card className="p-5 space-y-2">
        <h2 className="text-base font-semibold">Out of scope (v1)</h2>
        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
          <li>Live integratie met RecruitCRM, BigQuery, telefonie of welke bron dan ook — alles is mock.</li>
          <li>Authenticatie en gebruikersbeheer — single-shared-view demo.</li>
          <li>Sub-bronnen onder top-level bronnen — alleen treeview-architectuur.</li>
          <li>Notificaties (email, push, Slack) — alleen in-app statuskleur.</li>
          <li>Echt forecast-model — gebruik hit-rate-tabel als deterministische berekening.</li>
          <li>Audit log voor wijzigingen.</li>
          <li>UTM-tracking en kanaal-attributie voor bron-detail.</li>
        </ul>
      </Card>
    </div>
  );
}

function fmtH(h: number) {
  if (h < 24) return `${h} uur`;
  return `${h / 24} dagen`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-md p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ColorChip({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1.5">
      <span className="w-3 h-3 rounded" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import { LCBOverlay } from "./LCBOverlay";
import { cn } from "@/lib/utils";
import { myTeamConsultants } from "@/data/managerData";
import {
  consultantFunnelDataV2,
  consultantDetailData,
  funnelStepsV2,
  consultantOutreachData,
  type FunnelStepKey,
  type CandidateRecord,
} from "@/data/managerOperationalDataV2";
import {
  attritionProjectionData,
  activeSecondmentsData,
  consultantRevenueDetailData,
} from "@/data/managerRevenueDetailData";
import {
  consultantSkillData,
  managerGoalsData,
} from "@/data/managerPerformanceData";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const COMPANIES = ["Shell", "ASML", "Philips", "ING", "KPN", "Rabobank", "Unilever", "Heineken"];
const CONTACTS = ["Peter Hendriks", "Sandra Mol", "Erik de Groot", "Marloes Kuiper", "Tim van Aken"];
const OUTREACH_METHODS: ("E-mail" | "Telefoon" | "Beide")[] = ["E-mail", "Telefoon", "Beide"];
const RESULTS = ["Doorgezet", "Afgewezen", "Wacht op reactie", "Geïnviteerd"];

function consultant(id: number) {
  return myTeamConsultants.find((c) => c.id === id);
}

// ─────────────── Step detail ───────────────

interface StepProps {
  open: boolean;
  consultantId: number | null;
  step: FunnelStepKey | null;
  period: string;
  onClose: () => void;
  onOpenCandidate: (cand: CandidateRecord, consultantId: number) => void;
  onOpenConsultant: (id: number) => void;
}

export function StepDetailOverlay({ open, consultantId, step, period, onClose, onOpenCandidate, onOpenConsultant }: StepProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const stepDef = funnelStepsV2.find((s) => s.key === step);
  const cd = consultantId != null ? consultantDetailData.find((d) => d.consultantId === consultantId) : null;
  const candidates = cd?.candidates ?? [];

  return (
    <LCBOverlay
      open={open && !!c && !!stepDef}
      onClose={onClose}
      size="wide"
      breadcrumbs={["Candidate Market", c?.name ?? "", stepDef?.label ?? "", period]}
      title={`${stepDef?.label ?? ""} — ${c?.name ?? ""}`}
      subtitle={`Alle kandidaten in deze stap in periode ${period}.`}
    >
      {c && (
        <div className="mb-3 flex items-center justify-end">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOpenConsultant(c.id)}>
            Open consultant-overzicht
          </Button>
        </div>
      )}
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60">
            <tr className="text-left">
              <Th>Kandidaat</Th>
              <Th>Cat.</Th>
              <Th>Kand. status</Th>
              <Th>Deal status</Th>
              <Th align="right"># voorstellen</Th>
              <Th>Bedrijf</Th>
              <Th>Contactpersoon</Th>
              <Th>Outreach</Th>
              <Th>Datum</Th>
              <Th>Resultaat</Th>
              <Th>CRM</Th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((cand, i) => {
              const method = OUTREACH_METHODS[i % OUTREACH_METHODS.length];
              const company = COMPANIES[i % COMPANIES.length];
              const contact = CONTACTS[i % CONTACTS.length];
              const result = RESULTS[i % RESULTS.length];
              return (
                <tr key={cand.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => consultantId != null && onOpenCandidate(cand, consultantId)}>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{cand.name}</td>
                  <td className="px-3 py-2"><Badge>{cand.category}</Badge></td>
                  <td className="px-3 py-2 capitalize text-muted-foreground">{cand.status}</td>
                  <td className="px-3 py-2 text-muted-foreground">{i % 3 === 0 ? "Voorgesteld" : i % 3 === 1 ? "In gesprek" : "Open"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{1 + (i % 4)}</td>
                  <td className="px-3 py-2">{company}</td>
                  <td className="px-3 py-2">{contact}</td>
                  <td className="px-3 py-2 text-[11px]">{method}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{cand.toewijzingsDatum}</td>
                  <td className="px-3 py-2 text-[11px]">{result}</td>
                  <td className="px-3 py-2">
                    <CRMIcon />
                  </td>
                </tr>
              );
            })}
            {candidates.length === 0 && <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">Geen kandidaten in deze stap.</td></tr>}
          </tbody>
        </table>
      </div>
    </LCBOverlay>
  );
}

// ─────────────── Consultant overview ───────────────

interface ConsultantProps {
  open: boolean;
  consultantId: number | null;
  onClose: () => void;
  onBack?: () => void;
  onOpenStep: (consultantId: number, step: FunnelStepKey) => void;
}

export function ConsultantOverviewOverlay({ open, consultantId, onClose, onBack, onOpenStep }: ConsultantProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const f = consultantId != null ? consultantFunnelDataV2.find((x) => x.consultantId === consultantId) : null;
  const out = consultantId != null ? consultantOutreachData.find((x) => x.consultantId === consultantId) : null;
  const cd = consultantId != null ? consultantDetailData.find((x) => x.consultantId === consultantId) : null;

  return (
    <LCBOverlay
      open={open && !!c}
      onClose={onClose}
      onBack={onBack}
      size="wide"
      breadcrumbs={["Candidate Market", c?.name ?? ""]}
      title={`Consultant-overzicht — ${c?.name ?? ""}`}
      subtitle={c?.unit}
    >
      {f && (
        <section className="mb-4">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Funnel</h3>
          <div className="grid grid-cols-9 gap-1.5">
            {funnelStepsV2.map((s) => (
              <button key={s.key} type="button" onClick={() => onOpenStep(f.consultantId, s.key as FunnelStepKey)}
                className="rounded-lg border border-border bg-card px-2 py-2 text-left hover:border-primary/40 hover:bg-primary/5">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground truncate">{s.label}</div>
                <div className="text-base font-bold tabular-nums">{f[s.key as FunnelStepKey] as number}</div>
              </button>
            ))}
          </div>
        </section>
      )}
      {out && (
        <section className="mb-4">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Outreach</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Kpi label="Calls uit" value={`${out.callsOut}`} />
            <Kpi label="Calls in" value={`${out.callsIn}`} />
            <Kpi label="E-mails" value={`${out.emailsSent}`} />
            <Kpi label="Kwaliteit" value={`${out.qualityScore}`} />
          </div>
        </section>
      )}
      {cd && (
        <section>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Recente kandidaten</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/60"><tr className="text-left"><Th>Kandidaat</Th><Th>Cat.</Th><Th>Status</Th><Th>Toewijzing</Th><Th>AI score</Th><Th>CRM</Th></tr></thead>
              <tbody>
                {cd.candidates.slice(0, 8).map((cand) => (
                  <tr key={cand.id} className="border-t border-border">
                    <td className="px-3 py-1.5 font-medium">{cand.name}</td>
                    <td className="px-3 py-1.5"><Badge>{cand.category}</Badge></td>
                    <td className="px-3 py-1.5 capitalize text-muted-foreground">{cand.status}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{cand.toewijzingsDatum}</td>
                    <td className="px-3 py-1.5 tabular-nums">{cand.aiScore}</td>
                    <td className="px-3 py-1.5"><CRMIcon /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </LCBOverlay>
  );
}

// ─────────────── Candidate detail ───────────────

interface CandProps {
  open: boolean;
  candidate: CandidateRecord | null;
  consultantId: number | null;
  onClose: () => void;
  onBack?: () => void;
}

export function CandidateDetailOverlay({ open, candidate, consultantId, onClose, onBack }: CandProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  return (
    <LCBOverlay
      open={open && !!candidate}
      onClose={onClose}
      onBack={onBack}
      breadcrumbs={["Candidate Market", c?.name ?? "", "Kandidaat", candidate?.name ?? ""]}
      title={candidate?.name ?? ""}
      subtitle={`Cat. ${candidate?.category} · ${candidate?.status}`}
    >
      {candidate && (
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Funnel-voortgang</h3>
            <div className="space-y-1.5">
              {funnelStepsV2.map((s, i) => {
                const reached = funnelStepsV2.findIndex((x) => x.key === candidate.status || (candidate.status === "ingeschreven" && x.key === "inschrijvingen")) >= i;
                return (
                  <div key={s.key} className="flex items-center gap-2 text-xs">
                    <div className={cn("h-2.5 w-2.5 rounded-full", reached ? "bg-emerald-500" : "bg-muted")} />
                    <span className={cn(reached ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Outreach-historie</h3>
            <ul className="space-y-2 text-xs">
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">12 mrt</span> · E-mail naar Peter Hendriks (Shell) — geen reactie</li>
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">14 mrt</span> · Telefonisch contact — opvolging gepland</li>
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">18 mrt</span> · CV doorgestuurd naar contactpersoon</li>
            </ul>
          </section>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <CRMIcon /> Open in RecruitCRM
            </Button>
          </div>
        </div>
      )}
    </LCBOverlay>
  );
}

// ─────────────── Development overlay ───────────────

interface DevProps {
  open: boolean;
  consultantId: number | null;
  onClose: () => void;
}

function suggestedFocus(consultantId: number): string[] {
  const f = consultantFunnelDataV2.find((x) => x.consultantId === consultantId);
  const out = consultantOutreachData.find((x) => x.consultantId === consultantId);
  const tips: string[] = [];
  if (f && f.acquisities > 0 && f.intakes / f.acquisities < 0.65) tips.push("Coachen op kwaliteit van voorstellen — lage acquisitie→intake conversie.");
  if (f && f.uitnodiging > 0 && f.gesprekken / f.uitnodiging < 0.6) tips.push("Procedurediscipline uitnodiging→gesprek — kandidaten lopen weg.");
  if (out && out.totalOutreach < 150) tips.push("Verhoog commercieel outreach-volume (calls + e-mail).");
  if (tips.length === 0) tips.push("Sterke prestaties — overweeg mentorrol of complexere klanten.");
  return tips;
}

export function DevelopmentOverlay({ open, consultantId, onClose }: DevProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const skill = consultantId != null ? consultantSkillData.find((x) => x.consultantId === consultantId) : null;
  const goals = consultantId != null ? managerGoalsData.filter((g) => g.consultantId === consultantId) : [];
  return (
    <LCBOverlay
      open={open && !!c}
      onClose={onClose}
      breadcrumbs={["Consultant Development", c?.name ?? ""]}
      title={`Ontwikkeling — ${c?.name ?? ""}`}
      subtitle={c?.unit}
    >
      {skill && (
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Doelen</h3>
            <div className="space-y-1.5">
              {goals.map((g) => (
                <label key={g.id} className="flex items-start gap-2 rounded-md border border-border px-2 py-1.5 text-xs">
                  <Checkbox checked={g.completed} className="mt-0.5" />
                  <div className="flex-1">
                    <div className={cn(g.completed && "line-through text-muted-foreground")}>{g.text}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{g.isManagerGoal ? "Manager-doel" : "Persoonlijk doel"}</div>
                  </div>
                </label>
              ))}
              <Button variant="outline" size="sm" className="h-7 text-xs w-full">+ Nieuw doel toevoegen</Button>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Scores</h3>
            <div className="grid grid-cols-2 gap-2">
              <ScoreBar label="Pitching" value={skill.pitchingPower} />
              <ScoreBar label="Responstijd" value={skill.responsiveness} />
              <ScoreBar label="Networking" value={skill.networking} />
              <ScoreBar label="Bezwaarbehandeling" value={skill.bezwaarverlegging} />
              <ScoreBar label="Procedure inschr." value={skill.procedureInschrijving} />
              <ScoreBar label="Procedure acq." value={skill.procedureAcquisities} />
              <ScoreBar label="Systeem hygiene" value={skill.systeemHygieneScore} />
              <ScoreBar label="NPS klant" value={Math.max(0, skill.npsKlant)} />
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Suggested coaching focus</h3>
            <ul className="space-y-1.5 text-xs">
              {c && suggestedFocus(c.id).map((t, i) => (
                <li key={i} className="rounded-md border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5 text-amber-700 dark:text-amber-400">{t}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Coaching-notities</h3>
            <ul className="space-y-1.5 text-xs">
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">10 mrt</span> · 1-op-1 — focus op opvolging na voorstellen</li>
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">24 mrt</span> · Rollenspel acquisitiegesprek</li>
            </ul>
          </section>
        </div>
      )}
    </LCBOverlay>
  );
}

// ─────────────── Stopper overlay ───────────────

interface StopperProps { open: boolean; consultantId: number | null; onClose: () => void; }

export function StopperOverlay({ open, consultantId, onClose }: StopperProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const items = consultantId != null
    ? attritionProjectionData.flatMap((p) =>
        p.candidates.filter((cc) => cc.consultantName === c?.name).map((cc) => ({ ...cc, period: p.period })),
      )
    : [];
  return (
    <LCBOverlay
      open={open && !!c}
      onClose={onClose}
      size="wide"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Verwachte stoppers"]}
      title={`Verwachte stoppers — ${c?.name ?? ""}`}
      subtitle={`${items.length} kandidaten met verwachte uitstroom.`}
    >
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr className="text-left">
            <Th>Periode</Th><Th>Kandidaat</Th><Th align="right">Revenue risk</Th><Th>Notitie</Th><Th>AI advies</Th>
          </tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{it.period}</td>
                <td className="px-3 py-2">{it.candidateName}</td>
                <td className="px-3 py-2 text-right tabular-nums text-red-500">€{it.revenue}</td>
                <td className="px-3 py-2 text-muted-foreground">{it.notes}</td>
                <td className="px-3 py-2 text-[11px]">{it.aiAnalysis}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Geen verwachte stoppers.</td></tr>}
          </tbody>
        </table>
      </div>
    </LCBOverlay>
  );
}

// ─────────────── Active placements ───────────────

interface PlacementProps { open: boolean; consultantId: number | null; onClose: () => void; }

export function ActivePlacementsOverlay({ open, consultantId, onClose }: PlacementProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const items = consultantId != null ? activeSecondmentsData.filter((s) => s.consultantName === c?.name) : [];
  const detail = consultantId != null ? consultantRevenueDetailData.find((x) => x.consultantId === consultantId) : null;
  return (
    <LCBOverlay
      open={open && !!c}
      onClose={onClose}
      size="wide"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Actieve plaatsingen"]}
      title={`Actieve plaatsingen — ${c?.name ?? ""}`}
      subtitle={`${items.length} actieve detacheringen / contracten.`}
    >
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr className="text-left">
            <Th>Kandidaat</Th><Th>Bedrijf</Th><Th>Start</Th><Th>Eind</Th><Th align="right">Maandomzet</Th><Th align="right">Marge/uur</Th><Th>Type</Th><Th>Status</Th>
          </tr></thead>
          <tbody>
            {items.map((it, i) => {
              const secondment = detail?.secondments[i];
              return (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{it.candidateName}</td>
                  <td className="px-3 py-2">{it.company}</td>
                  <td className="px-3 py-2 text-muted-foreground">{it.startDate}</td>
                  <td className="px-3 py-2 text-muted-foreground">{it.expectedEnd}</td>
                  <td className="px-3 py-2 text-right tabular-nums">€{it.monthlyRevenue}k</td>
                  <td className="px-3 py-2 text-right tabular-nums">€{40 + (i * 3) % 25}</td>
                  <td className="px-3 py-2">{secondment?.type ?? "Detavast"}</td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      it.status === "active" && "bg-emerald-500/10 text-emerald-600",
                      it.status === "ending-soon" && "bg-amber-500/10 text-amber-600",
                      it.status === "new" && "bg-blue-500/10 text-blue-600",
                    )}>
                      {it.status === "active" ? "Actief" : it.status === "ending-soon" ? "Loopt af" : "Nieuw"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Geen actieve plaatsingen.</td></tr>}
          </tbody>
        </table>
      </div>
    </LCBOverlay>
  );
}

// ─────────────── Revenue detail (uses RevenueChartV2) ───────────────

interface RevProps { open: boolean; consultantId: number | null; onClose: () => void; }

export function RevenueDetailOverlay({ open, consultantId, onClose }: RevProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const detail = consultantId != null ? consultantRevenueDetailData.find((x) => x.consultantId === consultantId) : null;
  return (
    <LCBOverlay
      open={open && !!c}
      onClose={onClose}
      size="side"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Omzet"]}
      title={`Omzetdetail — ${c?.name ?? ""}`}
    >
      {detail && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Kpi label="Totaal omzet" value={`€${detail.totalRevenue}k`} />
            <Kpi label="Detacheringen" value={`${detail.detacheringCount}`} />
            <Kpi label="W&S" value={`${detail.rsCount}`} />
            <Kpi label="Performance" value={`${detail.performanceRatio}%`} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Secondments</h3>
            <div className="rounded-lg border border-border overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/60"><tr className="text-left"><Th>Kandidaat</Th><Th>Bedrijf</Th><Th>Type</Th><Th align="right">€/mnd</Th></tr></thead>
                <tbody>
                  {detail.secondments.map((s, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5">{s.candidateName}</td>
                      <td className="px-3 py-1.5">{s.company}</td>
                      <td className="px-3 py-1.5">{s.type}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">€{s.monthlyRevenue}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </LCBOverlay>
  );
}

// ─────────────── shared bits ───────────────

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={cn("px-3 py-2 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap", align === "right" && "text-right")}>
      {children}
    </th>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{children}</span>;
}

function CRMIcon() {
  return (
    <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-blue-500 text-white text-[10px] font-bold cursor-pointer hover:bg-blue-600" title="Open in RecruitCRM">R</span>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2 bg-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 55 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded bg-muted overflow-hidden">
        <div className={cn("h-full", color)} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

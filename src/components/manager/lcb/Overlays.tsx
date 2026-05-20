import { useReducer, useState } from "react";
import { ExternalLink, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { LCBOverlay } from "./LCBOverlay";
import { cn } from "@/lib/utils";
import { myTeamConsultants } from "@/data/managerData";
import {
  lcbMarketRows,
  lcbFunnelSteps,
  buildFinancePerfRow,
  getCandidatesForStep,
  getDealsForStep,
  type LcbStepKey,
  type CandidateRow,
  type DealRow,
} from "@/data/lcbMarketData";
import { attritionProjectionData, activeSecondmentsData, consultantRevenueDetailData } from "@/data/managerRevenueDetailData";
import { consultantSkillData, managerGoalsData, type ManagerGoal } from "@/data/managerPerformanceData";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, statusFromScore } from "@/lib/lcbStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function consultant(id: number) {
  return myTeamConsultants.find((c) => c.id === id);
}

// ─────────────── Step detail (branches on entity) ───────────────
interface StepProps {
  open: boolean;
  consultantId: number | null;
  step: LcbStepKey | null;
  period: string;
  onClose: () => void;
  onOpenCandidate?: (cand: CandidateRow, consultantId: number) => void;
  onOpenConsultant: (id: number) => void;
}

export function StepDetailOverlay({ open, consultantId, step, period, onClose, onOpenCandidate, onOpenConsultant }: StepProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const stepDef = lcbFunnelSteps.find((s) => s.key === step);
  const entity = stepDef?.entity;

  const candidates: CandidateRow[] = entity === "candidate" && consultantId != null && step ? getCandidatesForStep(consultantId, step) : [];
  const deals: DealRow[] = entity === "deal" && consultantId != null && step ? getDealsForStep(consultantId, step) : [];

  return (
    <LCBOverlay
      open={open && !!c && !!stepDef}
      onClose={onClose}
      size="wide"
      breadcrumbs={["Candidate Market", c?.name ?? "", stepDef?.label ?? "", period]}
      title={`${stepDef?.label ?? ""} — ${c?.name ?? ""}`}
      subtitle={`${entity === "candidate" ? "Kandidaten" : "Deals"} in deze stap (${entity === "candidate" ? candidates.length : deals.length}). Volgende stap: detailrecord → RecruitCRM.`}
    >
      {c && (
        <div className="mb-3 flex items-center justify-end">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOpenConsultant(c.id)}>
            Open consultant-overzicht
          </Button>
        </div>
      )}
      {entity === "candidate" ? (
        <CandidateTable rows={candidates} onRowClick={(r) => onOpenCandidate && consultantId != null && onOpenCandidate(r, consultantId)} />
      ) : (
        <DealTable rows={deals} />
      )}
    </LCBOverlay>
  );
}

function CandidateTable({ rows, onRowClick }: { rows: CandidateRow[]; onRowClick?: (r: CandidateRow) => void }) {
  return (
    <div className="rounded-lg border border-border overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/60"><tr className="text-left">
          <Th>Kandidaat</Th><Th>ID</Th><Th>Cat.</Th><Th>Status</Th>
          <Th align="right"># deals</Th><Th align="right"># voorstellen</Th>
          <Th align="right"># e-mails</Th><Th align="right"># calls</Th>
          <Th>Last updated</Th><Th>CRM</Th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onRowClick?.(r)}>
              <td className="px-3 py-1.5 font-medium whitespace-nowrap">{r.name}</td>
              <td className="px-3 py-1.5 text-muted-foreground text-[11px]">{r.id}</td>
              <td className="px-3 py-1.5"><Badge>{r.category}</Badge></td>
              <td className="px-3 py-1.5 text-[11px] text-muted-foreground">{r.status}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{r.deals}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{r.proposals}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{r.emails}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{r.calls}</td>
              <td className="px-3 py-1.5 text-muted-foreground">{r.lastUpdated}</td>
              <td className="px-3 py-1.5"><CRMIcon /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">Geen records.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function DealTable({ rows }: { rows: DealRow[] }) {
  return (
    <div className="rounded-lg border border-border overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/60"><tr className="text-left">
          <Th>Deal</Th><Th>Deal ID</Th><Th>Status</Th>
          <Th>Kandidaat</Th><Th>Kand. ID</Th>
          <Th>Opdrachtgever</Th><Th>Opdr. ID</Th>
          <Th>Last updated</Th><Th>CRM</Th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.dealId} className="border-t border-border hover:bg-muted/30">
              <td className="px-3 py-1.5 font-medium whitespace-nowrap">{r.dealName}</td>
              <td className="px-3 py-1.5 text-muted-foreground text-[11px]">{r.dealId}</td>
              <td className="px-3 py-1.5 text-[11px]">{r.dealStatus}</td>
              <td className="px-3 py-1.5">{r.candidateName}</td>
              <td className="px-3 py-1.5 text-muted-foreground text-[11px]">{r.candidateId}</td>
              <td className="px-3 py-1.5">{r.opdrachtgeverName}</td>
              <td className="px-3 py-1.5 text-muted-foreground text-[11px]">{r.opdrachtgeverId}</td>
              <td className="px-3 py-1.5 text-muted-foreground">{r.lastUpdated}</td>
              <td className="px-3 py-1.5"><CRMIcon /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Geen deals.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────── Consultant overview ───────────────
interface ConsultantProps {
  open: boolean;
  consultantId: number | null;
  onClose: () => void;
  onBack?: () => void;
  onOpenStep: (consultantId: number, step: LcbStepKey) => void;
  onOpenCallConversions?: (consultantId: number, conversionId?: string) => void;
}

export function ConsultantOverviewOverlay({ open, consultantId, onClose, onBack, onOpenStep, onOpenCallConversions }: ConsultantProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const f = consultantId != null ? lcbMarketRows.find((x) => x.consultantId === consultantId) : null;

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
        <>
          <section className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Funnel</h3>
            <div className="grid grid-cols-9 gap-1.5">
              {lcbFunnelSteps.map((s) => (
                <button key={s.key} type="button" onClick={() => onOpenStep(f.consultantId, s.key)}
                  className="rounded-lg border border-border bg-card px-2 py-2 text-left hover:border-primary/40 hover:bg-primary/5">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground truncate">{s.label}</div>
                  <div className="text-base font-bold tabular-nums">{f[s.key] as number}</div>
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider">Conversies per stap</h3>
              {onOpenCallConversions && (
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => onOpenCallConversions(f.consultantId)}>
                  Open Call Conversions
                </Button>
              )}
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/60"><tr className="text-left"><Th>Stap</Th><Th align="right">Aantal</Th><Th align="right">Conversie</Th></tr></thead>
                <tbody>
                  {lcbFunnelSteps.map((s, i) => {
                    const val = f[s.key] as number;
                    let conv: number | null = null;
                    if (i > 0) {
                      const prev = f[lcbFunnelSteps[i - 1].key] as number;
                      if (prev > 0) conv = Math.round((val / prev) * 100);
                    }
                    const clickable = !!onOpenCallConversions && i > 0;
                    return (
                      <tr key={s.key}
                        className={cn("border-t border-border", clickable && "cursor-pointer hover:bg-muted/30")}
                        onClick={clickable ? () => onOpenCallConversions!(f.consultantId) : undefined}
                      >
                        <td className="px-3 py-1.5">{i > 0 ? `${lcbFunnelSteps[i - 1].label} → ${s.label}` : s.label}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">{val}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{conv !== null ? `${conv}%` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </LCBOverlay>
  );
}

// ─────────────── Candidate detail ───────────────
interface CandProps {
  open: boolean;
  candidate: CandidateRow | null;
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
      subtitle={candidate ? `${candidate.id} · Cat. ${candidate.category} · ${candidate.status}` : undefined}
    >
      {candidate && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Kpi label="# deals" value={`${candidate.deals}`} />
            <Kpi label="# voorstellen" value={`${candidate.proposals}`} />
            <Kpi label="# e-mails" value={`${candidate.emails}`} />
            <Kpi label="# calls" value={`${candidate.calls}`} />
          </div>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Outreach-historie</h3>
            <ul className="space-y-2 text-xs">
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">12 mrt</span> · E-mail — geen reactie</li>
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">14 mrt</span> · Telefonisch contact — opvolging gepland</li>
              <li className="rounded-md border border-border p-2"><span className="text-muted-foreground">18 mrt</span> · CV doorgestuurd</li>
            </ul>
          </section>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <CRMIcon /> Open in RecruitCRM <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}
    </LCBOverlay>
  );
}

// ─────────────── Development overlay (tickets + market mini) ───────────────
interface DevProps {
  open: boolean;
  consultantId: number | null;
  onClose: () => void;
}

type GoalTicket = ManagerGoal & { status: "Open" | "In progress" | "Done"; priority: "Hoog" | "Middel" | "Laag"; due: string; linkedStep?: string };
type GoalAction =
  | { type: "init"; goals: GoalTicket[] }
  | { type: "add"; goal: GoalTicket }
  | { type: "update"; id: number; patch: Partial<GoalTicket> }
  | { type: "delete"; id: number };

function goalsReducer(state: GoalTicket[], a: GoalAction): GoalTicket[] {
  switch (a.type) {
    case "init": return a.goals;
    case "add": return [...state, a.goal];
    case "update": return state.map((g) => g.id === a.id ? { ...g, ...a.patch } : g);
    case "delete": return state.filter((g) => g.id !== a.id);
  }
}

export function DevelopmentOverlay({ open, consultantId, onClose }: DevProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const skill = consultantId != null ? consultantSkillData.find((x) => x.consultantId === consultantId) : null;
  const market = consultantId != null ? lcbMarketRows.find((x) => x.consultantId === consultantId) : null;

  const initial: GoalTicket[] = consultantId != null
    ? managerGoalsData.filter((g) => g.consultantId === consultantId).map((g) => ({
        ...g,
        status: g.completed ? "Done" : (g.id % 3 === 0 ? "In progress" : "Open"),
        priority: g.isManagerGoal ? "Hoog" : "Middel",
        due: `${10 + (g.id % 18)} apr`,
        linkedStep: g.isManagerGoal ? "voorstellen" : undefined,
      }))
    : [];
  const [tickets, dispatch] = useReducer(goalsReducer, initial);
  const [draft, setDraft] = useState("");

  // Auto-coaching tips from market data
  const tips: string[] = [];
  if (market) {
    if (market.acquisities > 0 && market.intakes / market.acquisities < 0.5) tips.push("Lage acquisitie → intake: coach op kwaliteit van voorstellen en opvolging.");
    if (market.uitnodiging > 0 && market.gesprekken / market.uitnodiging < 0.5) tips.push("Veel uitnodigingen → weinig gesprekken: procesdiscipline en planning aanscherpen.");
    if (market.perf === "bad") tips.push("Lage voorstel → uitnodiging ratio (bad-class): focus op pitch en kandidaat-fit.");
    if (market.gesprekken > 0 && market.plaatsingen / market.gesprekken < 0.1) tips.push("Weinig plaatsingen uit gesprekken: closing-techniek en onderhandeling oefenen.");
  }
  if (tips.length === 0) tips.push("Sterke prestaties — overweeg mentorrol of complexere klanten.");

  const score = skill ? Math.round((skill.pitchingPower + skill.responsiveness + skill.networking + skill.bezwaarverlegging) / 4) : 0;
  const status = statusFromScore(score);

  return (
    <LCBOverlay
      open={open && !!c}
      onClose={onClose}
      size="wide"
      breadcrumbs={["Consultant Development", c?.name ?? ""]}
      title={`Ontwikkeling — ${c?.name ?? ""}`}
      subtitle={c?.unit}
    >
      {c && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[status])}>{LCB_STATUS_LABEL[status]}</span>
            <span className="text-xs text-muted-foreground">Overall score {score}</span>
          </div>

          {/* Section A: Market mini */}
          {market && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Candidate market — overzicht consultant</h3>
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60"><tr className="text-left">
                    {lcbFunnelSteps.map((s) => <Th key={s.key} align="right">{s.label}</Th>)}
                  </tr></thead>
                  <tbody>
                    <tr>
                      {lcbFunnelSteps.map((s, i) => {
                        const val = market[s.key] as number;
                        let conv: number | null = null;
                        if (i > 0) {
                          const prev = market[lcbFunnelSteps[i - 1].key] as number;
                          if (prev > 0) conv = Math.round((val / prev) * 100);
                        }
                        return (
                          <td key={s.key} className="px-2 py-2 text-right">
                            <div className="font-semibold tabular-nums">{val}</div>
                            {conv !== null && <div className="text-[9px] text-muted-foreground tabular-nums">{conv}%</div>}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section B: Coaching tips */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Aanbevolen coaching focus</h3>
            <ul className="space-y-1.5 text-xs">
              {tips.map((t, i) => (
                <li key={i} className="rounded-md border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5 text-amber-700 dark:text-amber-400">{t}</li>
              ))}
            </ul>
          </section>

          {/* Section C: Goals as tickets */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider">Doelen (tickets)</h3>
              <span className="text-[10px] text-muted-foreground">{tickets.filter((t) => t.status !== "Done").length} open · {tickets.filter((t) => t.status === "Done").length} done</span>
            </div>
            <div className="space-y-2">
              {tickets.map((g) => (
                <GoalTicketRow key={g.id} g={g} onPatch={(patch) => dispatch({ type: "update", id: g.id, patch })} onDelete={() => dispatch({ type: "delete", id: g.id })} />
              ))}
              <div className="flex items-center gap-2">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nieuw doel…" className="h-8 text-xs" />
                <Button size="sm" className="h-8 text-xs gap-1" onClick={() => {
                  if (!draft.trim() || consultantId == null) return;
                  dispatch({ type: "add", goal: {
                    id: Date.now(), consultantId, consultantName: c.name, text: draft.trim(),
                    completed: false, isManagerGoal: true,
                    status: "Open", priority: "Middel", due: "—",
                  }});
                  setDraft("");
                }}><Plus className="h-3 w-3" /> Toevoegen</Button>
              </div>
            </div>
          </section>

          {/* Section D: Coaching notes */}
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

function GoalTicketRow({ g, onPatch, onDelete }: { g: GoalTicket; onPatch: (p: Partial<GoalTicket>) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(g.text);
  const statusColor = g.status === "Done" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
    : g.status === "In progress" ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
    : "bg-muted text-foreground border-border";
  const prioColor = g.priority === "Hoog" ? "text-red-500" : g.priority === "Middel" ? "text-amber-500" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 flex items-start gap-2">
      <button type="button" onClick={() => onPatch({ status: g.status === "Done" ? "Open" : "Done", completed: g.status !== "Done" })} className={cn("mt-0.5 h-5 w-5 shrink-0 rounded border flex items-center justify-center", g.status === "Done" ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:border-primary")}>
        {g.status === "Done" && <Check className="h-3 w-3" />}
      </button>
      <div className="flex-1 min-w-0">
        {editing ? (
          <Input value={text} onChange={(e) => setText(e.target.value)} className="h-7 text-xs mb-1" autoFocus onBlur={() => { onPatch({ text }); setEditing(false); }} onKeyDown={(e) => { if (e.key === "Enter") { onPatch({ text }); setEditing(false); } }} />
        ) : (
          <div className={cn("text-xs font-medium", g.status === "Done" && "line-through text-muted-foreground")}>{g.text}</div>
        )}
        <div className="flex items-center gap-2 mt-1 text-[10px]">
          <select value={g.status} onChange={(e) => onPatch({ status: e.target.value as GoalTicket["status"] })} className={cn("rounded border px-1.5 py-0.5", statusColor)}>
            <option>Open</option><option>In progress</option><option>Done</option>
          </select>
          <select value={g.priority} onChange={(e) => onPatch({ priority: e.target.value as GoalTicket["priority"] })} className={cn("rounded border border-border bg-transparent px-1.5 py-0.5 font-medium", prioColor)}>
            <option>Hoog</option><option>Middel</option><option>Laag</option>
          </select>
          <span className="text-muted-foreground">Due {g.due}</span>
          <span className="text-muted-foreground">· {g.isManagerGoal ? "Manager" : "Persoonlijk"}</span>
          {g.linkedStep && <span className="text-primary">→ {g.linkedStep}</span>}
        </div>
      </div>
      <button type="button" onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
      <button type="button" onClick={onDelete} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
    </div>
  );
}

// ─────────────── Finance overlays ───────────────
interface CtxProps { open: boolean; consultantId: number | null; onClose: () => void; }

export function StopperOverlay({ open, consultantId, onClose }: CtxProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const items = consultantId != null
    ? attritionProjectionData.flatMap((p) => p.candidates.filter((cc) => cc.consultantName === c?.name).map((cc) => ({ ...cc, period: p.period })))
    : [];
  return (
    <LCBOverlay open={open && !!c} onClose={onClose} size="wide"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Verwachte stoppers"]}
      title={`Verwachte stoppers — ${c?.name ?? ""}`}
      subtitle={`${items.length} kandidaten met omzetrisico.`}>
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr className="text-left">
            <Th>Periode</Th><Th>Kandidaat</Th><Th>Opdrachtgever</Th><Th align="right">Omzetrisico</Th><Th>Verlenging waarsch.</Th><Th>Reden</Th><Th>AI advies</Th><Th>CRM</Th>
          </tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{it.period}</td>
                <td className="px-3 py-2">{it.candidateName}</td>
                <td className="px-3 py-2 text-muted-foreground">{["Shell","ASML","Philips","ING"][i % 4]}</td>
                <td className="px-3 py-2 text-right tabular-nums text-red-500">−€{it.revenue}</td>
                <td className="px-3 py-2 text-[11px]">{i % 2 === 0 ? "Ja" : "Nee"}</td>
                <td className="px-3 py-2 text-muted-foreground text-[11px]">{it.notes}</td>
                <td className="px-3 py-2 text-[11px]">{it.aiAnalysis}</td>
                <td className="px-3 py-2"><CRMIcon /></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Geen verwachte stoppers.</td></tr>}
          </tbody>
        </table>
      </div>
    </LCBOverlay>
  );
}

export function ActivePlacementsOverlay({ open, consultantId, onClose }: CtxProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const items = consultantId != null ? activeSecondmentsData.filter((s) => s.consultantName === c?.name) : [];
  const total = items.reduce((s, i) => s + i.monthlyRevenue, 0);
  return (
    <LCBOverlay open={open && !!c} onClose={onClose} size="wide"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Actieve plaatsingen"]}
      title={`Actieve plaatsingen — ${c?.name ?? ""}`}
      subtitle={`${items.length} actief · totaal €${total}k / maand`}>
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr className="text-left">
            <Th>Kandidaat</Th><Th>Opdrachtgever</Th><Th>Start</Th><Th>Eind</Th><Th align="right">€/maand</Th><Th align="right">Marge/uur</Th><Th>Type</Th><Th>Status</Th><Th>CRM</Th>
          </tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{it.candidateName}</td>
                <td className="px-3 py-2">{it.company}</td>
                <td className="px-3 py-2 text-muted-foreground">{it.startDate}</td>
                <td className="px-3 py-2 text-muted-foreground">{it.expectedEnd}</td>
                <td className="px-3 py-2 text-right tabular-nums">€{it.monthlyRevenue}k</td>
                <td className="px-3 py-2 text-right tabular-nums">€{40 + (i * 3) % 25}</td>
                <td className="px-3 py-2 text-[11px]">Detavast</td>
                <td className="px-3 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                    it.status === "active" && "bg-emerald-500/10 text-emerald-600",
                    it.status === "ending-soon" && "bg-amber-500/10 text-amber-600",
                    it.status === "new" && "bg-blue-500/10 text-blue-600")}>
                    {it.status === "active" ? "Actief" : it.status === "ending-soon" ? "Loopt af" : "Nieuw"}
                  </span>
                </td>
                <td className="px-3 py-2"><CRMIcon /></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Geen actieve plaatsingen.</td></tr>}
          </tbody>
          <tfoot className="bg-muted/30 font-semibold"><tr>
            <td colSpan={4} className="px-3 py-2">Totaal</td>
            <td className="px-3 py-2 text-right tabular-nums">€{total}k</td>
            <td colSpan={4} />
          </tr></tfoot>
        </table>
      </div>
    </LCBOverlay>
  );
}

export function SoonToStartOverlay({ open, consultantId, onClose }: CtxProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const perf = consultantId != null ? buildFinancePerfRow(consultantId, c?.name ?? "") : null;
  const items = perf ? Array.from({ length: perf.soonToStart }, (_, i) => ({
    candidate: `Kandidaat ${i + 1}`, opdrachtgever: ["Shell", "ASML", "Philips", "ING"][i % 4],
    start: `${5 + i * 3} apr`, monthly: Math.round(perf.soonToStartRevenue / Math.max(perf.soonToStart, 1)),
  })) : [];
  return (
    <LCBOverlay open={open && !!c} onClose={onClose} size="wide"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Soon-to-start"]}
      title={`Soon-to-start — ${c?.name ?? ""}`}
      subtitle={`${items.length} kandidaten · verwachte omzet €${perf?.soonToStartRevenue ?? 0}k`}>
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr className="text-left">
            <Th>Kandidaat</Th><Th>Opdrachtgever</Th><Th>Startdatum</Th><Th align="right">Verwachte €/mnd</Th><Th>CRM</Th>
          </tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{it.candidate}</td>
                <td className="px-3 py-2">{it.opdrachtgever}</td>
                <td className="px-3 py-2 text-muted-foreground">{it.start}</td>
                <td className="px-3 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">€{it.monthly}k</td>
                <td className="px-3 py-2"><CRMIcon /></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Geen soon-to-start plaatsingen.</td></tr>}
          </tbody>
        </table>
      </div>
    </LCBOverlay>
  );
}

export function NetImpactOverlay({ open, consultantId, onClose }: CtxProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const r = consultantId != null ? buildFinancePerfRow(consultantId, c?.name ?? "") : null;
  return (
    <LCBOverlay open={open && !!c} onClose={onClose} size="side"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Netto financiële impact"]}
      title={`Netto financiële impact — ${c?.name ?? ""}`}
      subtitle="Optelsom van actieve omzet + soon-to-start − omzetrisico stoppers.">
      {r && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <ImpactLine label="+ Actieve omzet" value={`€${r.activeMonthlyRevenue}k`} tone="pos" />
            <ImpactLine label="+ Soon-to-start" value={`€${r.soonToStartRevenue}k`} tone="pos" />
            <ImpactLine label="− Omzetrisico stoppers" value={`€${r.stopperRiskRevenue}k`} tone="neg" />
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Netto financiële impact</span>
              <span className={cn("text-lg font-bold tabular-nums", r.netImpact >= 0 ? "text-emerald-500" : "text-red-500")}>
                {r.netImpact >= 0 ? "+" : ""}€{r.netImpact}k
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Verlenging waarschijnlijk: {r.likelyExtensions} kandidaten (potentieel €{r.likelyExtensionRevenue}k terugverdienen).</p>
        </div>
      )}
    </LCBOverlay>
  );
}

function ImpactLine({ label, value, tone }: { label: string; value: string; tone: "pos" | "neg" }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums font-medium", tone === "pos" ? "text-emerald-500" : "text-red-500")}>{value}</span>
    </div>
  );
}

export function RevenueDetailOverlay({ open, consultantId, onClose }: CtxProps) {
  const c = consultantId != null ? consultant(consultantId) : null;
  const detail = consultantId != null ? consultantRevenueDetailData.find((x) => x.consultantId === consultantId) : null;
  return (
    <LCBOverlay open={open && !!c} onClose={onClose} size="side"
      breadcrumbs={["Finance & Forecast", c?.name ?? "", "Omzet"]}
      title={`Omzetdetail — ${c?.name ?? ""}`}>
      {detail && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Kpi label="Totaal omzet" value={`€${detail.totalRevenue}k`} />
            <Kpi label="Detacheringen" value={`${detail.detacheringCount}`} />
            <Kpi label="W&S" value={`${detail.rsCount}`} />
            <Kpi label="Performance" value={`${detail.performanceRatio}%`} />
          </div>
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
      )}
    </LCBOverlay>
  );
}

// ─────────────── YTD + Forecast (global) ───────────────
interface GlobalProps { open: boolean; onClose: () => void; }

export function YtdRealisedOverlay({ open, onClose }: GlobalProps) {
  const rows = consultantRevenueDetailData.flatMap((d) => d.secondments.slice(0, 2).map((s) => ({ ...s, consultant: d.consultantName })));
  return (
    <LCBOverlay open={open} onClose={onClose} size="wide"
      breadcrumbs={["Finance & Forecast", "YTD realised"]}
      title="YTD realised — onderliggende deals"
      subtitle="Welke deals zorgen voor de realised revenue.">
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr className="text-left">
            <Th>Deal</Th><Th>Kandidaat</Th><Th>Opdrachtgever</Th><Th>Consultant</Th><Th align="right">Potentieel</Th><Th align="right">Realised</Th><Th>CRM</Th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-1.5 font-medium">{r.dealId}</td>
                <td className="px-3 py-1.5">{r.candidateName}</td>
                <td className="px-3 py-1.5">{r.company}</td>
                <td className="px-3 py-1.5 text-muted-foreground">{r.consultant}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">€{r.monthlyRevenue * 6}k</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-emerald-600">€{r.monthlyRevenue * 4}k</td>
                <td className="px-3 py-1.5"><CRMIcon /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LCBOverlay>
  );
}

export function ForecastYearOverlay({ open, onClose }: GlobalProps) {
  const rows = consultantRevenueDetailData.flatMap((d, di) => d.secondments.slice(0, 2).map((s, i) => ({ ...s, consultant: d.consultantName, type: (di + i) % 2 === 0 ? "Actief" : "Soon-to-start" })));
  return (
    <LCBOverlay open={open} onClose={onClose} size="wide"
      breadcrumbs={["Finance & Forecast", "Forecast jaar"]}
      title="Forecast jaar — onderliggende deals"
      subtitle="Verwachte omzet, opgesplitst naar actieve en soon-to-start plaatsingen.">
      <div className="rounded-lg border border-border overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr className="text-left">
            <Th>Deal</Th><Th>Kandidaat</Th><Th>Opdrachtgever</Th><Th>Consultant</Th><Th align="right">Potentieel</Th><Th>Type</Th><Th>CRM</Th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-1.5 font-medium">{r.dealId}</td>
                <td className="px-3 py-1.5">{r.candidateName}</td>
                <td className="px-3 py-1.5">{r.company}</td>
                <td className="px-3 py-1.5 text-muted-foreground">{r.consultant}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">€{r.monthlyRevenue * 12}k</td>
                <td className="px-3 py-1.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                    r.type === "Actief" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600")}>{r.type}</span>
                </td>
                <td className="px-3 py-1.5"><CRMIcon /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  return <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-blue-500 text-white text-[10px] font-bold cursor-pointer hover:bg-blue-600" title="Open in RecruitCRM">R</span>;
}
function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2 bg-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}

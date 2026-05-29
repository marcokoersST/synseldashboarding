import { useMemo, useState, useEffect } from "react";
import { Mail, Phone, ArrowDownLeft, ArrowUpRight, ExternalLink, Check, X, AlertTriangle, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type DealRow, type ActivityItem,
  getDealNotes, getDealTasks, getDealMeetings, getDealActivity, getDealEvidence,
  getCandidateNotes,
} from "@/data/lcbMarketData";
import { dealStageBadgeClass, contactStatusBadgeClass, CONTACT_STATUSES } from "@/data/lcbDealStages";
import { MultiSelectFilter, SortableTh, useSort, ResetButton, filterBy } from "./tableControls";

interface Props {
  deal: DealRow;
  onOpenCandidate?: (candidateId: string, candidateName: string) => void;
  onOpenComm?: (item: ActivityItem, contextLabel: string) => void;
}

type ProofType = "mail" | "call" | "meeting" | "notitie" | "contract";
interface ManualOverride { type: ProofType; note: string; at: string }

const STEP_DEFS = [
  { key: "inschrijving", label: "Inschrijving" },
  { key: "acquisitie", label: "Acquisitie" },
  { key: "voorstellen", label: "Voorstellen" },
  { key: "intakes", label: "Intakes" },
  { key: "uitnodigingen", label: "Uitnodigingen" },
  { key: "vervolggesprekken", label: "Vervolggesprekken" },
  { key: "plaatsingen", label: "Plaatsingen" },
] as const;
type StepKey = typeof STEP_DEFS[number]["key"];

function lsKey(dealId: string, step: StepKey) {
  return `lcb.manualStepProof.${dealId}.${step}`;
}

export function DealDetailPane({ deal, onOpenCandidate, onOpenComm }: Props) {
  const notes = useMemo(() => getDealNotes(deal.dealId), [deal.dealId]);
  const tasks = useMemo(() => getDealTasks(deal.dealId), [deal.dealId]);
  const meetings = useMemo(() => getDealMeetings(deal.dealId), [deal.dealId]);
  const activity = useMemo(() => getDealActivity(deal.dealId), [deal.dealId]);
  const evidence = useMemo(() => getDealEvidence(deal), [deal]);
  const candidateNotes = useMemo(() => getCandidateNotes(deal.candidateId), [deal.candidateId]);
  const emails = activity.filter((a) => a.kind === "email");
  const calls = activity.filter((a) => a.kind === "call");

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card/30 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight truncate">{deal.dealName}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{deal.dealId}</span>
              <span>·</span>
              <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium max-w-[200px] truncate", dealStageBadgeClass(deal.dealStatus))}>
                {deal.dealStatus}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 shrink-0">
            <CRMIcon /> CRM <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div>
            <span className="text-muted-foreground">Kandidaat:</span>{" "}
            {onOpenCandidate ? (
              <button
                type="button"
                onClick={() => onOpenCandidate(deal.candidateId, deal.candidateName)}
                className="font-medium text-primary hover:underline"
              >
                {deal.candidateName}
              </button>
            ) : (
              <span className="font-medium">{deal.candidateName}</span>
            )}
            <span className="text-muted-foreground text-[10px]"> {deal.candidateId}</span>
          </div>
          <div><span className="text-muted-foreground">Opdrachtgever:</span> <span className="font-medium">{deal.opdrachtgeverName}</span> <span className="text-muted-foreground text-[10px]">{deal.opdrachtgeverId}</span></div>
          <div><span className="text-muted-foreground">Datum:</span> <span className="tabular-nums">{deal.lastUpdatedDate}</span></div>
          <div><span className="text-muted-foreground">Tijd:</span> <span className="tabular-nums">{deal.lastUpdatedTime}</span></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
        <AiStepChecks dealId={deal.dealId} evidence={evidence} candidateNotes={candidateNotes} />

        <ContactCheck evidence={evidence} />

        {deal.dealStatus === "2.3 | Lopende zaak" && (
          <LopendeZaakCheck deal={deal} stale={!!evidence.lopendeZaakStale} />
        )}

        <Section title="Notities">
          {notes.length === 0 ? <Empty>Geen notities.</Empty> : (
            <ul className="space-y-1.5">
              {notes.map((n) => (
                <li key={n.id} className="rounded-md border border-border bg-card p-2 text-xs">
                  <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground mb-0.5">
                    <span>{n.author}</span><span className="tabular-nums">{n.date} · {n.time}</span>
                  </div>
                  <div className="text-foreground">{n.body}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Taken">
          {tasks.length === 0 ? <Empty>Geen taken.</Empty> : (
            <ul className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 px-2.5 py-1.5 text-xs">
                  <span className={cn("h-4 w-4 rounded border flex items-center justify-center shrink-0", t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border")}>
                    {t.done && <Check className="h-3 w-3" />}
                  </span>
                  <span className={cn("flex-1", t.done && "line-through text-muted-foreground")}>{t.title}</span>
                  <span className="text-muted-foreground tabular-nums text-[10px]">{t.due}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Meetings">
          {meetings.length === 0 ? <Empty>Geen meetings.</Empty> : (
            <ul className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden">
              {meetings.map((m) => (
                <li key={m.id} className="flex items-center gap-2 px-2.5 py-1.5 text-xs">
                  <span className="font-medium">{m.title}</span>
                  <span className="text-muted-foreground">met {m.with}</span>
                  <span className="ml-auto text-muted-foreground tabular-nums text-[10px]">{m.date} · {m.time}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={`Emails (${emails.length})`}>
          <CommTable rows={emails} kind="email" onOpenComm={onOpenComm} contextLabel={`Deal · ${deal.dealName}`} />
        </Section>

        <Section title={`Calls (${calls.length})`}>
          <CommTable rows={calls} kind="call" onOpenComm={onOpenComm} contextLabel={`Deal · ${deal.dealName}`} />
        </Section>
      </div>
    </div>
  );
}

// ─── AI step checks ──────────────────────────────────────────────────
function AiStepChecks({
  dealId, evidence, candidateNotes,
}: {
  dealId: string;
  evidence: ReturnType<typeof getDealEvidence>;
  candidateNotes: ReturnType<typeof getCandidateNotes>;
}) {
  const [overrides, setOverrides] = useState<Record<StepKey, ManualOverride | null>>(() => {
    const out = {} as Record<StepKey, ManualOverride | null>;
    STEP_DEFS.forEach((s) => {
      try {
        const raw = localStorage.getItem(lsKey(dealId, s.key));
        out[s.key] = raw ? JSON.parse(raw) : null;
      } catch { out[s.key] = null; }
    });
    return out;
  });
  const [editing, setEditing] = useState<StepKey | null>(null);

  useEffect(() => {
    STEP_DEFS.forEach((s) => {
      const v = overrides[s.key];
      const key = lsKey(dealId, s.key);
      if (v) localStorage.setItem(key, JSON.stringify(v));
      else localStorage.removeItem(key);
    });
  }, [overrides, dealId]);

  const inschrijvingNote = candidateNotes[0];

  const autoResult = (step: StepKey): { ok: boolean | null; detail?: string } => {
    switch (step) {
      case "inschrijving":
        return inschrijvingNote
          ? { ok: true, detail: `${inschrijvingNote.author} · ${inschrijvingNote.date}` }
          : { ok: false, detail: "Geen kandidaat-notitie." };
      case "acquisitie":
        return { ok: evidence.hasMatch, detail: evidence.hasMatch ? "Match consultant ↔ kandidaat ↔ opdrachtgever." : "Geen match." };
      case "voorstellen":
        return evidence.hasOwnerMailProof || evidence.hasOwnerCallProof
          ? { ok: true, detail: `Bewijs: ${[evidence.hasOwnerMailProof && "mail", evidence.hasOwnerCallProof && "call"].filter(Boolean).join(" + ")}` }
          : { ok: false, detail: "Geen mail of call door owner." };
      case "intakes":
        return evidence.intakeMeeting
          ? { ok: true, detail: `${evidence.intakeMeeting.title} · ${evidence.intakeMeeting.date}` }
          : { ok: false, detail: "Geen meeting met type %intake." };
      case "uitnodigingen":
        return evidence.sollicitatieMeeting
          ? { ok: true, detail: `${evidence.sollicitatieMeeting.title} · ${evidence.sollicitatieMeeting.date}` }
          : { ok: false, detail: "Geen sollicitatiegesprek gepland." };
      case "vervolggesprekken":
        return evidence.vervolgMeeting
          ? { ok: true, detail: `${evidence.vervolgMeeting.title} · ${evidence.vervolgMeeting.date}` }
          : { ok: false, detail: "Geen vervolggesprek gepland." };
      case "plaatsingen":
        return { ok: evidence.isGeplaatst, detail: evidence.isGeplaatst ? "Deal stage = geplaatst." : "Nog niet geplaatst." };
    }
  };

  return (
    <Section title="AI step checks">
      <ul className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden">
        {STEP_DEFS.map((s) => {
          const auto = autoResult(s.key);
          const manual = overrides[s.key];
          const passed = !!manual || auto.ok === true;
          return (
            <li key={s.key} className="px-2.5 py-1.5 text-xs">
              <div className="flex items-center gap-2">
                <StatusDot passed={passed} unknown={auto.ok === null && !manual} />
                <span className="font-medium flex-1 min-w-0 flex items-center gap-1.5">
                  {s.key === "inschrijving" && <StickyNote className="h-3 w-3 text-amber-500" />}
                  {s.label}
                  {manual && <span className="rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0 text-[9px] font-medium">handmatig</span>}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[260px]">{auto.detail}</span>
                {!manual && auto.ok !== true && (
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                    onClick={() => setEditing(editing === s.key ? null : s.key)}>
                    Markeer als gedaan
                  </Button>
                )}
                {manual && (
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0"
                    onClick={() => setOverrides((o) => ({ ...o, [s.key]: null }))}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {editing === s.key && (
                <ManualOverrideForm
                  onCancel={() => setEditing(null)}
                  onSave={(v) => { setOverrides((o) => ({ ...o, [s.key]: v })); setEditing(null); }}
                />
              )}
              {manual && (
                <div className="mt-1 ml-5 text-[10px] text-muted-foreground">
                  Bewijs ({manual.type}): {manual.note} — {manual.at}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function ManualOverrideForm({ onSave, onCancel }: { onSave: (v: ManualOverride) => void; onCancel: () => void }) {
  const [type, setType] = useState<ProofType>("notitie");
  const [note, setNote] = useState("");
  return (
    <div className="mt-2 ml-5 rounded-md border border-border bg-muted/30 p-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Type bewijs:</span>
        <select value={type} onChange={(e) => setType(e.target.value as ProofType)}
          className="h-6 rounded border border-border bg-background px-1.5 text-[11px]">
          <option value="mail">mail</option>
          <option value="call">call</option>
          <option value="meeting">meeting</option>
          <option value="notitie">notitie</option>
          <option value="contract">contract</option>
        </select>
      </div>
      <Input
        value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="URL of korte toelichting (verplicht)"
        className="h-7 text-[11px]"
      />
      <div className="flex items-center gap-1.5 justify-end">
        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={onCancel}>Annuleer</Button>
        <Button
          size="sm" className="h-6 text-[10px]"
          disabled={note.trim().length === 0}
          onClick={() => onSave({ type, note: note.trim(), at: new Date().toLocaleString("nl-NL") })}
        >
          Opslaan
        </Button>
      </div>
    </div>
  );
}

function ContactCheck({ evidence }: { evidence: ReturnType<typeof getDealEvidence> }) {
  const passed = !!(evidence.lastMail || evidence.lastCall);
  return (
    <Section title="Contact check">
      <div className="rounded-md border border-border bg-card px-2.5 py-2 text-xs flex items-center gap-2">
        <StatusDot passed={passed} />
        <span className="flex-1">{passed ? "Consultant heeft gebeld en/of gemaild." : "Geen mail of call van consultant gevonden."}</span>
        {evidence.lastMail && (
          <span className="text-[10px] text-muted-foreground">Laatste mail: {evidence.lastMail.date} · {evidence.lastMail.time}</span>
        )}
        {evidence.lastCall && (
          <span className="text-[10px] text-muted-foreground">Laatste call: {evidence.lastCall.date} · {evidence.lastCall.time}</span>
        )}
      </div>
    </Section>
  );
}

function LopendeZaakCheck({ deal, stale }: { deal: DealRow; stale: boolean }) {
  return (
    <Section title="Lopende-zaak check-up">
      <div className={cn(
        "rounded-md border px-2.5 py-2 text-xs flex items-center gap-2",
        stale ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card",
      )}>
        {stale ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> : <StatusDot passed />}
        <span className="flex-1">{stale ? "Geen recente update, plan een check-in." : "Recente update aanwezig."}</span>
        <span className="text-[10px] text-muted-foreground">Laatste update: {deal.lastUpdatedDate} · {deal.lastUpdatedTime}</span>
      </div>
    </Section>
  );
}

// ─── Communication tables with filters + sort ────────────────────────
function CommTable({
  rows, kind, onOpenComm, contextLabel,
}: {
  rows: ActivityItem[]; kind: "email" | "call";
  onOpenComm?: (item: ActivityItem, contextLabel: string) => void;
  contextLabel: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const filtered = useMemo(() => filterBy(rows, (r) => r.contactStatus, statusFilter), [rows, statusFilter]);
  const { sortKey, sortDir, toggle, sorted } = useSort<ActivityItem, "contact" | "contactStatus" | "subject" | "date" | "duration">(filtered, (k) => (r) => {
    if (k === "date") return `${r.date} ${r.time}`;
    return (r as any)[k] ?? "";
  }, { key: "date", dir: "desc" });

  if (rows.length === 0) return <Empty>Geen items.</Empty>;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <MultiSelectFilter label="Status" options={CONTACT_STATUSES} value={statusFilter as any} onChange={(v) => setStatusFilter(v as string[])} />
        {statusFilter.length > 0 && <ResetButton onClick={() => setStatusFilter([])} />}
      </div>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-2 py-1.5 w-6" />
              <SortableTh active={sortKey === "contact"} dir={sortDir} onClick={() => toggle("contact")}>Contact</SortableTh>
              <SortableTh active={sortKey === "contactStatus"} dir={sortDir} onClick={() => toggle("contactStatus")}>Status</SortableTh>
              {kind === "email"
                ? <SortableTh active={sortKey === "subject"} dir={sortDir} onClick={() => toggle("subject")}>Onderwerp</SortableTh>
                : <SortableTh active={sortKey === "duration"} dir={sortDir} onClick={() => toggle("duration")} align="right">Duur</SortableTh>}
              <SortableTh active={sortKey === "date"} dir={sortDir} onClick={() => toggle("date")} align="right">Datum · Tijd</SortableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((a) => {
              const Arrow = a.direction === "in" ? ArrowDownLeft : ArrowUpRight;
              const Icon = a.kind === "email" ? Mail : Phone;
              const color = a.direction === "in" ? "text-blue-500" : "text-emerald-500";
              return (
                <tr
                  key={a.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => onOpenComm?.(a, contextLabel)}
                >
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex items-center gap-0.5", color)}>
                      <Arrow className="h-3 w-3" /><Icon className="h-3 w-3" />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-medium truncate max-w-[140px]">{a.contact}</td>
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(a.contactStatus))}>{a.contactStatus}</span>
                  </td>
                  {kind === "email"
                    ? <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[260px]">{a.subject ?? "—"}</td>
                    : <td className="px-2 py-1.5 text-right font-mono text-[10px]">{a.duration ?? "—"}</td>}
                  <td className="px-2 py-1.5 text-muted-foreground tabular-nums text-[10px] text-right whitespace-nowrap">{a.date} · {a.time}</td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">Geen items voor deze filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusDot({ passed, unknown }: { passed: boolean; unknown?: boolean }) {
  if (unknown) return <span className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />;
  return (
    <span className={cn(
      "h-2 w-2 rounded-full shrink-0",
      passed ? "bg-emerald-500" : "bg-red-500",
    )} />
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] text-muted-foreground italic">{children}</div>;
}
function CRMIcon() {
  return <span className="inline-flex items-center justify-center h-4 w-4 rounded-sm bg-blue-500 text-white text-[9px] font-bold">R</span>;
}

import { useMemo, useState, useEffect } from "react";
import { Mail, Phone, StickyNote, ArrowDownLeft, ArrowUpRight, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type CandidateRow, type CandidateDealLink, type ActivityItem,
  getCandidateActivity, getCandidateNotes, getCandidateDealLinks, getCandidateEvidence,
  isEndStage,
} from "@/data/lcbMarketData";
import { dealStageBadgeClass, contactStatusBadgeClass, LCB_DEAL_STAGES, CONTACT_STATUSES } from "@/data/lcbDealStages";
import { MultiSelectFilter, SortableTh, useSort, ResetButton, filterBy } from "./tableControls";

type Tab = "summary" | "deals" | "emails" | "calls";

interface Props {
  candidate: CandidateRow;
  onOpenDeal?: (dealLink: CandidateDealLink) => void;
  onOpenComm?: (item: ActivityItem, contextLabel: string) => void;
  onUserInteract?: () => void;
}

export function CandidateDetailPane({ candidate, onOpenDeal, onOpenComm, onUserInteract }: Props) {
  const [tab, setTab] = useState<Tab>("summary");
  const [dealsInitialFilter, setDealsInitialFilter] = useState<"open" | null>(null);
  const activity = useMemo(() => getCandidateActivity(candidate.id), [candidate.id]);
  const notes = useMemo(() => getCandidateNotes(candidate.id), [candidate.id]);
  const dealLinks = useMemo(() => getCandidateDealLinks(candidate.id, candidate.deals, candidate.consultantId), [candidate.id, candidate.deals, candidate.consultantId]);
  const evidence = useMemo(() => getCandidateEvidence(candidate.id, candidate.deals), [candidate.id, candidate.deals]);
  const emails = useMemo(() => activity.filter((a) => a.kind === "email"), [activity]);
  const calls = useMemo(() => activity.filter((a) => a.kind === "call"), [activity]);

  const contextLabel = `Kandidaat · ${candidate.name}`;

  const selectTab = (next: Tab) => {
    onUserInteract?.();
    setTab((prev) => (prev === next ? "summary" : next));
  };

  const goDeals = (filter: "open" | null = null) => {
    onUserInteract?.();
    setDealsInitialFilter(filter);
    setTab("deals");
  };


  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Sticky candidate header */}
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card/30 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight truncate">{candidate.name}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{candidate.id}</span>
              <span>·</span>
              <Badge>{candidate.category}</Badge>
              <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", "bg-muted text-foreground border-border")}>
                {candidate.status}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 shrink-0">
            <CRMIcon /> CRM <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Laatst bijgewerkt:</span>
          <span className="font-medium text-foreground">{candidate.lastUpdatedDate}</span>
          <span>·</span>
          <span className="font-medium text-foreground tabular-nums">{candidate.lastUpdatedTime}</span>
        </div>

        {/* Scorecards (clickable) */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <ScoreCard label="Deals" value={candidate.deals} active={tab === "deals"} onClick={() => selectTab("deals")} />
          <ScoreCard label="Voorstellen" value={candidate.proposals} active={tab === "deals"} onClick={() => selectTab("deals")} />
          <ScoreCard label="Emails" value={candidate.emails} active={tab === "emails"} onClick={() => selectTab("emails")} />
          <ScoreCard label="Calls" value={candidate.calls} active={tab === "calls"} onClick={() => selectTab("calls")} />
        </div>
      </div>

      {/* Tabs body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        {tab === "summary" && (
          <SummaryBody
            evidence={evidence}
            notes={notes}
            activity={activity}
            onGoDeals={goDeals}
          />
        )}
        {tab === "deals" && <DealsTab rows={dealLinks} initialFilter={dealsInitialFilter} onOpenDeal={onOpenDeal} />}
        {tab === "emails" && <EmailsTab rows={emails} onOpenComm={onOpenComm} contextLabel={contextLabel} />}
        {tab === "calls" && <CallsTab rows={calls} onOpenComm={onOpenComm} contextLabel={contextLabel} />}
      </div>
    </div>
  );
}

function AiCandidateChecks({
  evidence, onGoDeals,
}: {
  evidence: ReturnType<typeof getCandidateEvidence>;
  onGoDeals: (filter: "open" | null) => void;
}) {
  const approachOk = evidence.approached.viaMail || evidence.approached.viaCall;
  return (
    <section className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden">
      <CheckRow
        passed={approachOk}
        label="Benadering"
        detail={
          approachOk
            ? `${evidence.approached.viaMail ? "mail" : ""}${evidence.approached.viaMail && evidence.approached.viaCall ? " + " : ""}${evidence.approached.viaCall ? "call" : ""}${evidence.approached.success ? " · succes" : ""}`
            : "Nog geen mail of call gevonden."
        }
      />
      <CheckRow
        passed={evidence.matched.matched}
        label={`Match → ${evidence.matched.dealCount} deals`}
        detail={evidence.matched.matched ? "Klik om alle deals te zien." : "Nog niet gematcht."}
        onClick={evidence.matched.matched ? () => onGoDeals(null) : undefined}
      />
      <CheckRow
        passed={evidence.endStage.total > 0 && evidence.endStage.notEndStage === 0}
        label={`Open deals → ${evidence.endStage.notEndStage}/${evidence.endStage.total}`}
        detail={evidence.endStage.notEndStage > 0 ? "Nog niet alle deals afgerond." : "Alle deals in eindstatus."}
        onClick={evidence.endStage.total > 0 ? () => onGoDeals("open") : undefined}
      />
      <CheckRow
        passed={evidence.intakeDone}
        label="Intake gedaan"
        detail={evidence.intakeDone ? "Intake aanwezig in activiteit." : "Geen intake gevonden."}
        onClick={evidence.matched.matched ? () => onGoDeals(null) : undefined}
      />
    </section>
  );
}

function CheckRow({ passed, label, detail, onClick }: { passed: boolean; label: string; detail: string; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined as any}
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs",
        onClick && "hover:bg-muted/40 cursor-pointer",
      )}
    >
      <span className={cn("h-2 w-2 rounded-full shrink-0", passed ? "bg-emerald-500" : "bg-amber-500")} />
      <span className="font-medium flex-1 min-w-0 truncate">{label}</span>
      <span className="text-[10px] text-muted-foreground truncate max-w-[260px]">{detail}</span>
      {onClick && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
    </Comp>
  );
}

function SummaryBody({
  evidence, notes, activity, onGoDeals,
}: {
  evidence: ReturnType<typeof getCandidateEvidence>;
  notes: ReturnType<typeof getCandidateNotes>;
  activity: ReturnType<typeof getCandidateActivity>;
  onGoDeals: (filter: "open" | null) => void;
}) {
  const latest = activity[0];
  return (
    <div className="space-y-4">
      <Section title="AI candidate checks">
        <AiCandidateChecks evidence={evidence} onGoDeals={onGoDeals} />
      </Section>

      {latest && (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Laatste activiteit</span>
          <ActivityIcon kind={latest.kind} direction={latest.direction} />
          <span className="text-foreground">{latest.contact}</span>
          <span className="text-muted-foreground truncate">{latest.subject ?? latest.body ?? `Gesprek ${latest.duration}`}</span>
          <span className="ml-auto text-muted-foreground tabular-nums">{latest.date} · {latest.time}</span>
        </div>
      )}

      <Section title="Notities">
        {notes.length === 0 ? <Empty>Geen notities.</Empty> : (
          <ul className="space-y-1.5">
            {notes.map((n) => (
              <li key={n.id} className="rounded-md border border-border bg-card p-2 text-xs">
                <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground mb-0.5">
                  <span>{n.author}</span>
                  <span className="tabular-nums">{n.date} · {n.time}</span>
                </div>
                <div className="text-foreground">{n.body}</div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function DealsTab({
  rows, initialFilter, onOpenDeal,
}: {
  rows: CandidateDealLink[];
  initialFilter: "open" | null;
  onOpenDeal?: (d: CandidateDealLink) => void;
}) {
  const [openOnly, setOpenOnly] = useState(initialFilter === "open");
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  useEffect(() => { setOpenOnly(initialFilter === "open"); }, [initialFilter]);

  const filtered = useMemo(() => {
    let r = rows;
    if (openOnly) r = r.filter((d) => !isEndStage(d.dealStatus));
    r = filterBy(r, (d) => d.dealStatus, stageFilter);
    return r;
  }, [rows, openOnly, stageFilter]);

  const { sortKey, sortDir, toggle, sorted } = useSort<CandidateDealLink, "dealName" | "dealStatus" | "opdrachtgeverName" | "date">(filtered, (k) => (r) => {
    if (k === "date") return `${r.date} ${r.time}`;
    return (r as any)[k] ?? "";
  }, { key: "date", dir: "desc" });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <MultiSelectFilter label="Deal stage" options={LCB_DEAL_STAGES} value={stageFilter as any} onChange={(v) => setStageFilter(v as string[])} />
        <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
          <Checkbox checked={openOnly} onCheckedChange={(v) => setOpenOnly(!!v)} />
          <span>Alleen open</span>
        </label>
        {(stageFilter.length > 0 || openOnly) && <ResetButton onClick={() => { setStageFilter([]); setOpenOnly(false); }} />}
      </div>
      <div className="rounded-md border border-border overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/60 sticky top-0">
            <tr className="text-left">
              <SortableTh active={sortKey === "dealName"} dir={sortDir} onClick={() => toggle("dealName")}>Deal</SortableTh>
              <SortableTh active={sortKey === "dealStatus"} dir={sortDir} onClick={() => toggle("dealStatus")}>Status</SortableTh>
              <SortableTh active={sortKey === "opdrachtgeverName"} dir={sortDir} onClick={() => toggle("opdrachtgeverName")}>Opdrachtgever</SortableTh>
              <th className="px-2 py-1.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground text-center">Voorgesteld</th>
              <SortableTh active={sortKey === "date"} dir={sortDir} onClick={() => toggle("date")} align="right">Datum · Tijd</SortableTh>
              <th className="px-2 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.dealId}
                className="border-t border-border hover:bg-muted/30 cursor-pointer"
                onClick={() => onOpenDeal?.(r)}
              >
                <td className="px-2 py-1.5 font-medium whitespace-nowrap">
                  <div>{r.dealName}</div>
                  <div className="text-[10px] text-muted-foreground">{r.dealId}</div>
                </td>
                <td className="px-2 py-1.5">
                  <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium whitespace-nowrap max-w-[180px] truncate", dealStageBadgeClass(r.dealStatus))}>
                    {r.dealStatus}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <div>{r.opdrachtgeverName}</div>
                  <div className="text-[10px] text-muted-foreground">{r.opdrachtgeverId}</div>
                </td>
                <td className="px-2 py-1.5 text-center"><Checkbox checked={r.proposed} className="pointer-events-none" /></td>
                <td className="px-2 py-1.5 text-muted-foreground tabular-nums text-right whitespace-nowrap">{r.date} · {r.time}</td>
                <td className="px-2 py-1.5"><CRMIcon /></td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-muted-foreground">Geen deals.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailsTab({
  rows, onOpenComm, contextLabel,
}: {
  rows: ActivityItem[];
  onOpenComm?: (item: ActivityItem, contextLabel: string) => void;
  contextLabel: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const filtered = useMemo(() => filterBy(rows, (r) => r.contactStatus, statusFilter), [rows, statusFilter]);
  const { sortKey, sortDir, toggle, sorted } = useSort<ActivityItem, "contact" | "contactStatus" | "subject" | "date">(filtered, (k) => (r) => {
    if (k === "date") return `${r.date} ${r.time}`;
    return (r as any)[k] ?? "";
  }, { key: "date", dir: "desc" });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <MultiSelectFilter label="Status" options={CONTACT_STATUSES} value={statusFilter as any} onChange={(v) => setStatusFilter(v as string[])} />
        {statusFilter.length > 0 && <ResetButton onClick={() => setStatusFilter([])} />}
      </div>
      <div className="rounded-md border border-border overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/60 sticky top-0">
            <tr className="text-left">
              <th className="px-2 py-1.5 w-6" />
              <SortableTh active={sortKey === "contact"} dir={sortDir} onClick={() => toggle("contact")}>Contact</SortableTh>
              <SortableTh active={sortKey === "contactStatus"} dir={sortDir} onClick={() => toggle("contactStatus")}>Status</SortableTh>
              <SortableTh active={sortKey === "subject"} dir={sortDir} onClick={() => toggle("subject")}>Onderwerp</SortableTh>
              <SortableTh active={sortKey === "date"} dir={sortDir} onClick={() => toggle("date")} align="right">Datum · Tijd</SortableTh>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onOpenComm?.(r, contextLabel)}>
                <td className="px-2 py-1.5"><DirIcon dir={r.direction} kind="email" /></td>
                <td className="px-2 py-1.5">{r.contact}</td>
                <td className="px-2 py-1.5">
                  <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(r.contactStatus))}>{r.contactStatus}</span>
                </td>
                <td className="px-2 py-1.5 truncate max-w-[260px]">{r.subject}</td>
                <td className="px-2 py-1.5 text-muted-foreground tabular-nums text-right whitespace-nowrap">{r.date} · {r.time}</td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">Geen emails.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CallsTab({
  rows, onOpenComm, contextLabel,
}: {
  rows: ActivityItem[];
  onOpenComm?: (item: ActivityItem, contextLabel: string) => void;
  contextLabel: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const filtered = useMemo(() => filterBy(rows, (r) => r.contactStatus, statusFilter), [rows, statusFilter]);
  const { sortKey, sortDir, toggle, sorted } = useSort<ActivityItem, "contact" | "contactStatus" | "duration" | "date">(filtered, (k) => (r) => {
    if (k === "date") return `${r.date} ${r.time}`;
    return (r as any)[k] ?? "";
  }, { key: "date", dir: "desc" });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <MultiSelectFilter label="Status" options={CONTACT_STATUSES} value={statusFilter as any} onChange={(v) => setStatusFilter(v as string[])} />
        {statusFilter.length > 0 && <ResetButton onClick={() => setStatusFilter([])} />}
      </div>
      <div className="rounded-md border border-border overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/60 sticky top-0">
            <tr className="text-left">
              <th className="px-2 py-1.5 w-6" />
              <SortableTh active={sortKey === "contact"} dir={sortDir} onClick={() => toggle("contact")}>Contact</SortableTh>
              <SortableTh active={sortKey === "contactStatus"} dir={sortDir} onClick={() => toggle("contactStatus")}>Status</SortableTh>
              <SortableTh active={sortKey === "duration"} dir={sortDir} onClick={() => toggle("duration")} align="right">Duur</SortableTh>
              <SortableTh active={sortKey === "date"} dir={sortDir} onClick={() => toggle("date")} align="right">Datum · Tijd</SortableTh>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onOpenComm?.(r, contextLabel)}>
                <td className="px-2 py-1.5"><DirIcon dir={r.direction} kind="call" /></td>
                <td className="px-2 py-1.5">{r.contact}</td>
                <td className="px-2 py-1.5">
                  <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(r.contactStatus))}>{r.contactStatus}</span>
                </td>
                <td className="px-2 py-1.5 tabular-nums font-mono text-[10px] text-right">{r.duration}</td>
                <td className="px-2 py-1.5 text-muted-foreground tabular-nums text-right whitespace-nowrap">{r.date} · {r.time}</td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">Geen calls.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── helpers ───
function ScoreCard({ label, value, active, onClick }: { label: string; value: number; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      className={cn(
        "rounded-md border px-2 py-1.5 text-left transition-colors",
        active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/60",
      )}
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold tabular-nums">{value}</div>
    </button>
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
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0 text-[10px] font-medium">{children}</span>;
}
function CRMIcon() {
  return <span className="inline-flex items-center justify-center h-4 w-4 rounded-sm bg-blue-500 text-white text-[9px] font-bold">R</span>;
}
function ActivityIcon({ kind, direction }: { kind: "email" | "call" | "note"; direction: "in" | "out" }) {
  if (kind === "note") return <StickyNote className="h-3 w-3 text-amber-500" />;
  const Icon = kind === "email" ? Mail : Phone;
  const color = direction === "in" ? "text-blue-500" : "text-emerald-500";
  return <Icon className={cn("h-3 w-3", color)} />;
}
function DirIcon({ dir, kind }: { dir: "in" | "out"; kind: "email" | "call" }) {
  const Icon = kind === "email" ? Mail : Phone;
  const Arrow = dir === "in" ? ArrowDownLeft : ArrowUpRight;
  const color = dir === "in" ? "text-blue-500" : "text-emerald-500";
  return (
    <span className={cn("inline-flex items-center gap-0.5", color)}>
      <Arrow className="h-3 w-3" />
      <Icon className={cn("h-3 w-3")} />
    </span>
  );
}

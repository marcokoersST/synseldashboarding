import { useMemo, useState } from "react";
import { Mail, Phone, StickyNote, ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type CandidateRow,
  getCandidateActivity, getCandidateNotes, getCandidateDealLinks,
} from "@/data/lcbMarketData";
import { dealStageBadgeClass, contactStatusBadgeClass } from "@/data/lcbDealStages";

type Tab = "summary" | "deals" | "emails" | "calls";

interface Props {
  candidate: CandidateRow;
}

export function CandidateDetailPane({ candidate }: Props) {
  const [tab, setTab] = useState<Tab>("summary");
  const activity = useMemo(() => getCandidateActivity(candidate.id), [candidate.id]);
  const notes = useMemo(() => getCandidateNotes(candidate.id), [candidate.id]);
  const dealLinks = useMemo(() => getCandidateDealLinks(candidate.id, candidate.deals), [candidate.id, candidate.deals]);
  const emails = useMemo(() => activity.filter((a) => a.kind === "email"), [activity]);
  const calls = useMemo(() => activity.filter((a) => a.kind === "call"), [activity]);

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
          <ScoreCard label="Deals" value={candidate.deals} active={tab === "deals"} onClick={() => setTab(tab === "deals" ? "summary" : "deals")} />
          <ScoreCard label="Voorstellen" value={candidate.proposals} active={tab === "deals"} onClick={() => setTab(tab === "deals" ? "summary" : "deals")} />
          <ScoreCard label="Emails" value={candidate.emails} active={tab === "emails"} onClick={() => setTab(tab === "emails" ? "summary" : "emails")} />
          <ScoreCard label="Calls" value={candidate.calls} active={tab === "calls"} onClick={() => setTab(tab === "calls" ? "summary" : "calls")} />
        </div>
      </div>

      {/* Tabs body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        {tab === "summary" && (
          <SummaryBody notes={notes} activity={activity} />
        )}
        {tab === "deals" && <DealsTab rows={dealLinks} />}
        {tab === "emails" && <EmailsTab rows={emails} />}
        {tab === "calls" && <CallsTab rows={calls} />}
      </div>
    </div>
  );
}

function SummaryBody({ notes, activity }: { notes: ReturnType<typeof getCandidateNotes>; activity: ReturnType<typeof getCandidateActivity> }) {
  const latest = activity[0];
  return (
    <div className="space-y-4">
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

      <Section title="Outreach historie">
        <ul className="divide-y divide-border rounded-md border border-border bg-card overflow-hidden">
          {activity.map((a) => (
            <li key={a.id} className="flex items-center gap-2 px-2.5 py-1.5 text-xs">
              <ActivityIcon kind={a.kind} direction={a.direction} />
              <span className="font-medium truncate max-w-[120px]">{a.contact}</span>
              <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(a.contactStatus))}>
                {a.contactStatus}
              </span>
              <span className="text-muted-foreground truncate flex-1">{a.subject ?? a.body ?? "—"}</span>
              {a.duration && <span className="text-muted-foreground tabular-nums text-[10px]">{a.duration}</span>}
              <span className="text-muted-foreground tabular-nums text-[10px] shrink-0">{a.date} · {a.time}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function DealsTab({ rows }: { rows: ReturnType<typeof getCandidateDealLinks> }) {
  return (
    <div className="rounded-md border border-border overflow-auto">
      <table className="w-full text-[11px]">
        <thead className="bg-muted/60 sticky top-0">
          <tr className="text-left">
            <Th>Deal</Th><Th>Status</Th><Th>Opdrachtgever</Th>
            <Th className="text-center">Voorgesteld</Th><Th>Datum</Th><Th>Tijd</Th><Th>CRM</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.dealId} className="border-t border-border hover:bg-muted/30">
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
              <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.date}</td>
              <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.time}</td>
              <td className="px-2 py-1.5"><CRMIcon /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-muted-foreground">Geen deals.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function EmailsTab({ rows }: { rows: ReturnType<typeof getCandidateActivity> }) {
  return (
    <div className="rounded-md border border-border overflow-auto">
      <table className="w-full text-[11px]">
        <thead className="bg-muted/60 sticky top-0">
          <tr className="text-left">
            <Th></Th><Th>Contact</Th><Th>Status</Th><Th>Onderwerp</Th><Th>Datum</Th><Th>Tijd</Th><Th>Deal</Th><Th>Link</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-2 py-1.5"><DirIcon dir={r.direction} kind="email" /></td>
              <td className="px-2 py-1.5">{r.contact}</td>
              <td className="px-2 py-1.5">
                <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(r.contactStatus))}>{r.contactStatus}</span>
              </td>
              <td className="px-2 py-1.5 truncate max-w-[260px]">{r.subject}</td>
              <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.date}</td>
              <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.time}</td>
              <td className="px-2 py-1.5 text-muted-foreground text-[10px]">{r.dealRef ?? "—"}</td>
              <td className="px-2 py-1.5"><ExternalLink className="h-3 w-3 text-muted-foreground" /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={8} className="px-2 py-6 text-center text-muted-foreground">Geen emails.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function CallsTab({ rows }: { rows: ReturnType<typeof getCandidateActivity> }) {
  return (
    <div className="rounded-md border border-border overflow-auto">
      <table className="w-full text-[11px]">
        <thead className="bg-muted/60 sticky top-0">
          <tr className="text-left">
            <Th></Th><Th>Contact</Th><Th>Status</Th><Th>Datum</Th><Th>Tijd</Th><Th>Duur</Th><Th>Deal</Th><Th>Link</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-2 py-1.5"><DirIcon dir={r.direction} kind="call" /></td>
              <td className="px-2 py-1.5">{r.contact}</td>
              <td className="px-2 py-1.5">
                <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(r.contactStatus))}>{r.contactStatus}</span>
              </td>
              <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.date}</td>
              <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.time}</td>
              <td className="px-2 py-1.5 tabular-nums font-mono text-[10px]">{r.duration}</td>
              <td className="px-2 py-1.5 text-muted-foreground text-[10px]">{r.dealRef ?? "—"}</td>
              <td className="px-2 py-1.5"><ExternalLink className="h-3 w-3 text-muted-foreground" /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={8} className="px-2 py-6 text-center text-muted-foreground">Geen calls.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ─── helpers ───
function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-2 py-1.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-left", className)}>{children}</th>;
}
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
      <Icon className="h-3 w-3" />
    </span>
  );
}

import { useMemo } from "react";
import { Mail, Phone, ArrowDownLeft, ArrowUpRight, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type DealRow,
  getDealNotes, getDealTasks, getDealMeetings, getDealActivity,
} from "@/data/lcbMarketData";
import { dealStageBadgeClass, contactStatusBadgeClass } from "@/data/lcbDealStages";

export function DealDetailPane({ deal }: { deal: DealRow }) {
  const notes = useMemo(() => getDealNotes(deal.dealId), [deal.dealId]);
  const tasks = useMemo(() => getDealTasks(deal.dealId), [deal.dealId]);
  const meetings = useMemo(() => getDealMeetings(deal.dealId), [deal.dealId]);
  const activity = useMemo(() => getDealActivity(deal.dealId), [deal.dealId]);
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
          <div><span className="text-muted-foreground">Kandidaat:</span> <span className="font-medium">{deal.candidateName}</span> <span className="text-muted-foreground text-[10px]">{deal.candidateId}</span></div>
          <div><span className="text-muted-foreground">Opdrachtgever:</span> <span className="font-medium">{deal.opdrachtgeverName}</span> <span className="text-muted-foreground text-[10px]">{deal.opdrachtgeverId}</span></div>
          <div><span className="text-muted-foreground">Datum:</span> <span className="tabular-nums">{deal.lastUpdatedDate}</span></div>
          <div><span className="text-muted-foreground">Tijd:</span> <span className="tabular-nums">{deal.lastUpdatedTime}</span></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
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
          <ActivityList items={emails} />
        </Section>

        <Section title={`Calls (${calls.length})`}>
          <ActivityList items={calls} />
        </Section>
      </div>
    </div>
  );
}

function ActivityList({ items }: { items: ReturnType<typeof getDealActivity> }) {
  if (items.length === 0) return <Empty>Geen items.</Empty>;
  return (
    <ul className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden">
      {items.map((a) => {
        const Arrow = a.direction === "in" ? ArrowDownLeft : ArrowUpRight;
        const Icon = a.kind === "email" ? Mail : Phone;
        const color = a.direction === "in" ? "text-blue-500" : "text-emerald-500";
        return (
          <li key={a.id} className="flex items-center gap-2 px-2.5 py-1.5 text-xs">
            <span className={cn("inline-flex items-center gap-0.5", color)}>
              <Arrow className="h-3 w-3" /><Icon className="h-3 w-3" />
            </span>
            <span className="font-medium truncate max-w-[120px]">{a.contact}</span>
            <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(a.contactStatus))}>{a.contactStatus}</span>
            <span className="text-muted-foreground truncate flex-1">{a.subject ?? "—"}</span>
            {a.duration && <span className="font-mono text-muted-foreground text-[10px]">{a.duration}</span>}
            <span className="text-muted-foreground tabular-nums text-[10px] shrink-0">{a.date} · {a.time}</span>
          </li>
        );
      })}
    </ul>
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

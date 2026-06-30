import { useMemo, useState } from "react";
import {
  ArrowLeft, PhoneIncoming, PhoneOutgoing, Phone, Clock,
  CheckCircle2, VoicemailIcon, PhoneOff, PhoneMissed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CallRecord, CallMatch, CallOutcome, Period,
  getCallsInRange, previousPeriod, aggregatePerConsultant,
  formatDurationHMS, formatTimestamp, formatDateTime,
  MATCH_LABEL, OUTCOME_LABEL, consultantById,
} from "@/data/callDashboardingData";
import { HeroCounter } from "./HeroCounter";

const matchTone: Record<CallMatch, string> = {
  candidate: "bg-primary/10 text-primary border-primary/20",
  organisation: "bg-teal/10 text-teal border-teal/30",
  contact_person: "bg-success/10 text-success border-success/30",
  new: "bg-muted text-muted-foreground border-border",
};

const outcomeIcon: Record<CallOutcome, React.ComponentType<{ className?: string }>> = {
  connected: CheckCircle2,
  voicemail: VoicemailIcon,
  no_answer: PhoneMissed,
  hangup: PhoneOff,
};

const outcomeTone: Record<CallOutcome, string> = {
  connected: "text-success",
  voicemail: "text-muted-foreground",
  no_answer: "text-orange-500",
  hangup: "text-destructive",
};

interface Props {
  consultantId: number;
  period: Period;
  onBack: () => void;
}

export function ConsultantDetail({ consultantId, period, onBack }: Props) {
  const [selected, setSelected] = useState<CallRecord | null>(null);
  const consultant = consultantById(consultantId);

  const idsSet = useMemo(() => new Set([consultantId]), [consultantId]);
  const calls = useMemo(
    () => getCallsInRange(period.from, period.to, idsSet),
    [period, idsSet],
  );
  const prev = useMemo(() => previousPeriod(period), [period]);
  const prevCalls = useMemo(
    () => getCallsInRange(prev.from, prev.to, idsSet),
    [prev, idsSet],
  );

  const agg = useMemo(() => {
    const map = aggregatePerConsultant(calls);
    return map.get(consultantId) ?? {
      consultantId, total: 0, inbound: 0, outbound: 0, durationSec: 0, connected: 0, lastCallAt: null,
    };
  }, [calls, consultantId]);

  const prevAgg = useMemo(() => {
    const map = aggregatePerConsultant(prevCalls);
    return map.get(consultantId) ?? {
      consultantId, total: 0, inbound: 0, outbound: 0, durationSec: 0, connected: 0, lastCallAt: null,
    };
  }, [prevCalls, consultantId]);

  // Show most recent first in the log
  const ordered = useMemo(() => [...calls].sort((a, b) => b.startedAt - a.startedAt), [calls]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Terug naar overzicht
        </Button>
        <Badge variant="outline" className="text-[11px]">{period.label}</Badge>
      </div>

      <header className="space-y-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {consultant?.unit}
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{consultant?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {calls.length} gesprekken in geselecteerde periode
        </p>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl bg-card border border-border p-4">
          <HeroCounter
            label="Totaal gesprekken"
            value={agg.total}
            previousValue={prevAgg.total}
            icon={<Phone className="h-3.5 w-3.5 text-primary" />}
            hideShare
          />
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <HeroCounter
            label="Inkomend"
            value={agg.inbound}
            total={agg.total}
            previousValue={prevAgg.inbound}
            previousTotal={prevAgg.total}
            tone="in"
            icon={<PhoneIncoming className="h-3.5 w-3.5 text-teal" />}
          />
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <HeroCounter
            label="Uitgaand"
            value={agg.outbound}
            total={agg.total}
            previousValue={prevAgg.outbound}
            previousTotal={prevAgg.total}
            tone="out"
            icon={<PhoneOutgoing className="h-3.5 w-3.5 text-primary" />}
          />
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <HeroCounter
            label="Gesprekstijd"
            value={agg.durationSec}
            format="duration"
            previousValue={prevAgg.durationSec}
            icon={<Clock className="h-3.5 w-3.5 text-success" />}
            hideShare
          />
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <HeroCounter
            label="Connect-rate"
            value={agg.connected}
            total={agg.total}
            previousValue={prevAgg.connected}
            previousTotal={prevAgg.total}
            tone="positive"
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />}
            shareLabel="opgepakt"
          />
        </div>
      </div>

      {/* Call log */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Gesprekslog</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Klik op een rij voor details
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3 font-medium">Tijd</th>
                <th className="text-center py-2 px-3 font-medium">Richting</th>
                <th className="text-left py-2 px-3 font-medium">Van</th>
                <th className="text-left py-2 px-3 font-medium">Naar</th>
                <th className="text-right py-2 px-3 font-medium">Duur</th>
                <th className="text-left py-2 px-3 font-medium">Match</th>
                <th className="text-left py-2 px-3 font-medium">Resultaat</th>
              </tr>
            </thead>
            <tbody>
              {ordered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Geen gesprekken in deze periode
                  </td>
                </tr>
              )}
              {ordered.map((c) => {
                const OIcon = outcomeIcon[c.outcome];
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="border-t border-border/60 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 tabular-nums text-foreground">
                      <div>{formatTimestamp(c.startedAt)}</div>
                      <div className="text-[10px] text-muted-foreground">{formatDateTime(c.startedAt).split(" ")[0]}</div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {c.direction === "in" ? (
                        <PhoneIncoming className="h-3.5 w-3.5 text-teal inline" />
                      ) : (
                        <PhoneOutgoing className="h-3.5 w-3.5 text-primary inline" />
                      )}
                    </td>
                    <td className="py-2 px-3 tabular-nums text-foreground">{c.from}</td>
                    <td className="py-2 px-3 tabular-nums text-foreground">{c.to}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-foreground">
                      {formatDurationHMS(c.durationSec)}
                    </td>
                    <td className="py-2 px-3">
                      <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium", matchTone[c.match])}>
                        {MATCH_LABEL[c.match]}
                      </span>
                      {c.contactName && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{c.contactName}</div>
                      )}
                      {!c.contactName && c.company && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{c.company}</div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", outcomeTone[c.outcome])}>
                        <OIcon className="h-3 w-3" />
                        {OUTCOME_LABEL[c.outcome]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selected.direction === "in" ? (
                    <PhoneIncoming className="h-4 w-4 text-teal" />
                  ) : (
                    <PhoneOutgoing className="h-4 w-4 text-primary" />
                  )}
                  {selected.direction === "in" ? "Inkomend gesprek" : "Uitgaand gesprek"}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-3">
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-3 bg-muted/20">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Contact</div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {selected.contactName && (
                          <div className="text-sm font-medium text-foreground">{selected.contactName}</div>
                        )}
                        {selected.company && (
                          <div className="text-xs text-muted-foreground">{selected.company}</div>
                        )}
                        {!selected.contactName && !selected.company && (
                          <div className="text-sm text-muted-foreground">Onbekend nummer</div>
                        )}
                      </div>
                      <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium", matchTone[selected.match])}>
                        {MATCH_LABEL[selected.match]}
                      </span>
                    </div>
                    {selected.match === "candidate" && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-primary text-primary-foreground text-[10px] font-bold">R</span>
                        <span className="text-[11px] text-primary font-medium">Recruit CRM profiel</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Van</div>
                      <div className="text-sm font-medium text-foreground tabular-nums">{selected.from}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Naar</div>
                      <div className="text-sm font-medium text-foreground tabular-nums">{selected.to}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Tijd</div>
                      <div className="text-sm font-medium text-foreground tabular-nums">
                        {formatDateTime(selected.startedAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Duur</div>
                      <div className="text-sm font-medium text-foreground tabular-nums">
                        {formatDurationHMS(selected.durationSec)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Resultaat</div>
                    <div className={cn("inline-flex items-center gap-1.5 text-sm font-medium", outcomeTone[selected.outcome])}>
                      {(() => { const Ic = outcomeIcon[selected.outcome]; return <Ic className="h-4 w-4" />; })()}
                      {OUTCOME_LABEL[selected.outcome]}
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border p-3">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">AI samenvatting</div>
                    <p className="text-xs text-muted-foreground italic">
                      {selected.connected
                        ? "Gesprek samengevat: kandidaat is geïnteresseerd, vervolgafspraak ingepland."
                        : "Geen gesprek tot stand gekomen, follow-up taak aangemaakt."}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

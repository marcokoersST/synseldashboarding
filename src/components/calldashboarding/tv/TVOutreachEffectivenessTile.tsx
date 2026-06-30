import { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { CallRecord, aggregateOutreach, MATCH_LABEL } from "@/data/callDashboardingData";
import { HeroCounter } from "../HeroCounter";
import { cn } from "@/lib/utils";


interface Props {
  calls: CallRecord[];
  prevCalls: CallRecord[];
}

const MATCH_COLOR: Record<string, string> = {
  candidate: "bg-primary",
  organisation: "bg-teal",
  contact_person: "bg-success",
  new: "bg-muted-foreground/60",
};

export function TVOutreachEffectivenessTile({ calls, prevCalls }: Props) {
  const agg = useMemo(() => aggregateOutreach(calls), [calls]);
  const prev = useMemo(() => aggregateOutreach(prevCalls), [prevCalls]);

  const matches: Array<keyof typeof MATCH_LABEL> = ["candidate", "organisation", "contact_person", "new"];

  return (
    <div className="rounded-xl bg-card border border-border h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Effectiviteit outreach</h3>
        <p className="text-[0.7em] text-muted-foreground">Bekende vs nieuwe nummers + connect-rate</p>
      </div>

      <div className="p-3 space-y-4 flex-1 overflow-auto">
        {/* Match mix bar */}
        <div>
          <div className="flex items-center justify-between text-[0.7em] text-muted-foreground mb-1">
            <span>Mix gebelde nummers</span>
            <span className="tabular-nums">{agg.total} gesprekken</span>
          </div>
          <div className="flex h-3 rounded overflow-hidden bg-muted">
            {matches.map((m) => {
              const v = agg.byMatch[m];
              const pct = agg.total ? (v / agg.total) * 100 : 0;
              return (
                <div
                  key={m}
                  className={MATCH_COLOR[m]}
                  style={{ width: `${pct}%` }}
                  title={`${MATCH_LABEL[m]}: ${v}`}
                />
              );
            })}
          </div>
          <p className="mt-1 text-[0.65em] text-muted-foreground leading-snug">
            % = aandeel van alle gesprekken in de geselecteerde periode. ↑/↓ = verschil t.o.v. vorige even lange periode (in procentpunten).
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {matches.map((m) => {
              const v = agg.byMatch[m];
              const pv = prev.byMatch[m];
              const share = agg.total ? (v / agg.total) * 100 : 0;
              const prevShare = prev.total ? (pv / prev.total) * 100 : 0;
              const pp = share - prevShare;
              return (
                <div key={m} className="rounded-lg border border-border/60 p-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-[0.7em] text-muted-foreground mb-0.5 truncate">
                    <span className={`inline-block h-2 w-2 rounded ${MATCH_COLOR[m]}`} />
                    <span className="truncate">{MATCH_LABEL[m]}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xl font-bold tabular-nums leading-tight text-foreground">
                      {new Intl.NumberFormat("nl-NL").format(v)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {share.toFixed(share < 10 ? 1 : 0)}%
                    </span>
                  </div>
                  <DeltaPP pp={pp} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Connect rate */}
        <div className="rounded-lg border border-border/60 p-2 min-w-0 overflow-hidden">
          <HeroCounter
            label="Verbonden gesprekken"
            value={agg.connected}
            total={agg.total}
            previousValue={prev.connected}
            previousTotal={prev.total}
            tone="positive"
            size="md"
            shareLabel="opgepakt"
          />
          <div className="grid grid-cols-3 gap-2 mt-3 min-w-0">
            {([
              ["Voicemail", agg.byOutcome.voicemail, prev.byOutcome.voicemail],
              ["Geen gehoor", agg.byOutcome.no_answer, prev.byOutcome.no_answer],
              ["Opgehangen", agg.byOutcome.hangup, prev.byOutcome.hangup],
            ] as const).map(([label, v, pv]) => {
              const share = agg.total ? (v / agg.total) * 100 : 0;
              const prevShare = prev.total ? (pv / prev.total) * 100 : 0;
              const pp = share - prevShare;
              return (
                <div key={label} className="min-w-0 rounded-md border border-border/60 p-2">
                  <div className="text-xs text-muted-foreground truncate">{label}</div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xl font-bold tabular-nums leading-tight text-foreground">
                      {new Intl.NumberFormat("nl-NL").format(v)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {share.toFixed(0)}%
                    </span>
                  </div>
                  <DeltaPP pp={pp} inverse />
                </div>
              );
            })}
          </div>


        </div>

      </div>
    </div>
  );
}

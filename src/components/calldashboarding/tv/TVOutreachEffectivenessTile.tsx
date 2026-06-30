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

function DeltaPP({ pp, inverse = false }: { pp: number; inverse?: boolean }) {
  const up = pp > 0.05;
  const down = pp < -0.05;
  const good = inverse ? down : up;
  const bad = inverse ? up : down;
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus;
  const sign = pp > 0 ? "+" : pp < 0 ? "−" : "";
  return (
    <div
      className={cn(
        "mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
        good && "text-success",
        bad && "text-destructive",
        !good && !bad && "text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      {sign}
      {Math.abs(pp).toFixed(1)} pp
      <span className="ml-1 text-muted-foreground font-normal">vs vorige</span>
    </div>
  );
}


export function TVOutreachEffectivenessTile({ calls, prevCalls }: Props) {
  const agg = useMemo(() => aggregateOutreach(calls), [calls]);
  const prev = useMemo(() => aggregateOutreach(prevCalls), [prevCalls]);

  const matches: Array<keyof typeof MATCH_LABEL> = ["candidate", "organisation", "contact_person", "new"];

  return (
    <div className="rounded-xl bg-card border border-border h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">Effectiviteit outreach</h3>
        <p className="text-[0.7em] text-muted-foreground truncate">
          Bekende vs nieuwe nummers + connect-rate
        </p>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-auto">
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

        {/* Connect rate — dense 4-column strip */}
        {(() => {
          const connectedShare = agg.total ? (agg.connected / agg.total) * 100 : 0;
          const prevConnectedShare = prev.total ? (prev.connected / prev.total) * 100 : 0;
          const connectedPP = connectedShare - prevConnectedShare;
          const cols: Array<{
            label: string;
            value: number;
            prev: number;
            pp: number;
            share: number;
            highlight?: boolean;
            inverse?: boolean;
          }> = [
            {
              label: "Verbonden gesprekken",
              value: agg.connected,
              prev: prev.connected,
              pp: connectedPP,
              share: connectedShare,
              highlight: true,
            },
            {
              label: "Voicemail",
              value: agg.byOutcome.voicemail,
              prev: prev.byOutcome.voicemail,
              pp:
                (agg.total ? (agg.byOutcome.voicemail / agg.total) * 100 : 0) -
                (prev.total ? (prev.byOutcome.voicemail / prev.total) * 100 : 0),
              share: agg.total ? (agg.byOutcome.voicemail / agg.total) * 100 : 0,
              inverse: true,
            },
            {
              label: "Geen gehoor",
              value: agg.byOutcome.no_answer,
              prev: prev.byOutcome.no_answer,
              pp:
                (agg.total ? (agg.byOutcome.no_answer / agg.total) * 100 : 0) -
                (prev.total ? (prev.byOutcome.no_answer / prev.total) * 100 : 0),
              share: agg.total ? (agg.byOutcome.no_answer / agg.total) * 100 : 0,
              inverse: true,
            },
            {
              label: "Opgehangen",
              value: agg.byOutcome.hangup,
              prev: prev.byOutcome.hangup,
              pp:
                (agg.total ? (agg.byOutcome.hangup / agg.total) * 100 : 0) -
                (prev.total ? (prev.byOutcome.hangup / prev.total) * 100 : 0),
              share: agg.total ? (agg.byOutcome.hangup / agg.total) * 100 : 0,
              inverse: true,
            },
          ];
          return (
            <div className="rounded-lg border border-border/60 grid grid-cols-4 divide-x divide-border overflow-hidden">
              {cols.map((c) => (
                <div key={c.label} className="px-3 py-2 min-w-0">
                  <div
                    className={cn(
                      "text-xs truncate mb-1",
                      c.highlight ? "text-success font-medium" : "text-muted-foreground",
                    )}
                  >
                    {c.label}
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "font-bold tabular-nums leading-tight",
                        c.highlight ? "text-2xl text-success" : "text-xl text-foreground",
                      )}
                    >
                      {new Intl.NumberFormat("nl-NL").format(c.value)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {c.share.toFixed(c.share < 10 ? 1 : 0)}%
                      {c.highlight && " opgepakt"}
                    </span>
                  </div>
                  <DeltaPP pp={c.pp} inverse={c.inverse} />
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

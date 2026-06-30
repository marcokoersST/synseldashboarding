import { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { CallRecord, aggregateOutreach, MATCH_LABEL } from "@/data/callDashboardingData";
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

function DeltaPP({ pp, inverse = false, size = "md" }: { pp: number; inverse?: boolean; size?: "sm" | "md" }) {
  const up = pp > 0.05;
  const down = pp < -0.05;
  const good = inverse ? down : up;
  const bad = inverse ? up : down;
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus;
  const sign = pp > 0 ? "+" : pp < 0 ? "−" : "";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular-nums",
        size === "md" ? "text-sm" : "text-[11px]",
        good && "text-success",
        bad && "text-destructive",
        !good && !bad && "text-muted-foreground",
      )}
    >
      <Icon className={size === "md" ? "h-4 w-4" : "h-3 w-3"} />
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

  const connectedShare = agg.total ? (agg.connected / agg.total) * 100 : 0;
  const prevConnectedShare = prev.total ? (prev.connected / prev.total) * 100 : 0;
  const connectedPP = connectedShare - prevConnectedShare;

  const outcomes: Array<{
    label: string;
    value: number;
    share: number;
    pp: number;
    highlight?: boolean;
    inverse?: boolean;
    suffix?: string;
  }> = [
    {
      label: "Verbonden",
      value: agg.connected,
      share: connectedShare,
      pp: connectedPP,
      highlight: true,
      suffix: "opgepakt",
    },
    {
      label: "Voicemail",
      value: agg.byOutcome.voicemail,
      share: agg.total ? (agg.byOutcome.voicemail / agg.total) * 100 : 0,
      pp:
        (agg.total ? (agg.byOutcome.voicemail / agg.total) * 100 : 0) -
        (prev.total ? (prev.byOutcome.voicemail / prev.total) * 100 : 0),
      inverse: true,
    },
    {
      label: "Geen gehoor",
      value: agg.byOutcome.no_answer,
      share: agg.total ? (agg.byOutcome.no_answer / agg.total) * 100 : 0,
      pp:
        (agg.total ? (agg.byOutcome.no_answer / agg.total) * 100 : 0) -
        (prev.total ? (prev.byOutcome.no_answer / prev.total) * 100 : 0),
      inverse: true,
    },
    {
      label: "Opgehangen",
      value: agg.byOutcome.hangup,
      share: agg.total ? (agg.byOutcome.hangup / agg.total) * 100 : 0,
      pp:
        (agg.total ? (agg.byOutcome.hangup / agg.total) * 100 : 0) -
        (prev.total ? (prev.byOutcome.hangup / prev.total) * 100 : 0),
      inverse: true,
    },
  ];

  return (
    <div className="rounded-xl bg-card border border-border h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">Effectiviteit outreach</h3>
        <p className="text-[0.7em] text-muted-foreground truncate">
          Bekende vs nieuwe nummers · connect-rate
        </p>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1 min-h-0">
        {/* PRIMARY — Match mix */}
        <div className="flex flex-col flex-[4] min-h-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
            <span>Mix gebelde nummers</span>
            <span className="tabular-nums">
              {new Intl.NumberFormat("nl-NL").format(agg.total)} gesprekken
            </span>
          </div>
          <div className="flex h-2 rounded overflow-hidden bg-muted">
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
          <div className="mt-1 flex-1 min-h-0 grid grid-cols-4 divide-x divide-border">
            {matches.map((m) => {
              const v = agg.byMatch[m];
              const pv = prev.byMatch[m];
              const share = agg.total ? (v / agg.total) * 100 : 0;
              const prevShare = prev.total ? (pv / prev.total) * 100 : 0;
              const pp = share - prevShare;
              return (
                <div
                  key={m}
                  className="px-4 py-1 min-w-0 flex flex-col justify-center gap-1"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                    <span className={`inline-block h-2.5 w-2.5 rounded ${MATCH_COLOR[m]}`} />
                    <span className="truncate">{MATCH_LABEL[m]}</span>
                  </div>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-3xl font-bold tabular-nums leading-none text-foreground">
                      {new Intl.NumberFormat("nl-NL").format(v)}
                    </span>
                    <span className="text-base text-muted-foreground tabular-nums">
                      {share.toFixed(share < 10 ? 1 : 0)}%
                    </span>
                  </div>
                  <DeltaPP pp={pp} />
                </div>
              );
            })}
          </div>
        </div>

        {/* SECONDARY — Connect rate footer */}
        <div className="flex-[5] min-h-0 rounded-lg border border-border/60 grid grid-cols-4 divide-x divide-border bg-muted/20">
          {outcomes.map((c) => (
            <div key={c.label} className="px-3 py-2 min-w-0 flex flex-col justify-center gap-0.5">
              <div
                className={cn(
                  "text-xs truncate",
                  c.highlight ? "text-success font-medium" : "text-muted-foreground",
                )}
              >
                {c.label}
              </div>
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span
                  className={cn(
                    "text-lg font-semibold tabular-nums leading-tight",
                    c.highlight ? "text-success" : "text-foreground",
                  )}
                >
                  {new Intl.NumberFormat("nl-NL").format(c.value)}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums truncate">
                  {c.share.toFixed(c.share < 10 ? 1 : 0)}%{c.suffix ? ` ${c.suffix}` : ""}
                </span>
              </div>
              <DeltaPP pp={c.pp} inverse={c.inverse} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

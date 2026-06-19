import { Mail, Phone, ExternalLink, ArrowDownLeft, ArrowUpRight, MessageSquare, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type ActivityItem, type TranscriptLine, formatCallLinkLabel } from "@/data/lcbMarketData";
import { contactStatusBadgeClass } from "@/data/lcbDealStages";
import { DevNote } from "@/components/groeimodel/DevNote";

export interface CommItem extends ActivityItem {}


export function CommunicationPane({ item, contextLabel }: { item: CommItem; contextLabel: string }) {
  const isCall = item.kind === "call";
  const Arrow = item.direction === "in" ? ArrowDownLeft : ArrowUpRight;
  const dirColor = item.direction === "in" ? "text-blue-500" : "text-emerald-500";

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card/30 space-y-1.5">
        <div className="flex items-center gap-2 text-[11px]">
          <span className={cn("inline-flex items-center gap-0.5", dirColor)}>
            <Arrow className="h-3 w-3" />
            {isCall ? <Phone className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
          </span>
          <span className="font-medium text-foreground">{item.contact}</span>
          <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]", contactStatusBadgeClass(item.contactStatus))}>
            {item.contactStatus}
          </span>
          <span className="ml-auto text-muted-foreground tabular-nums text-[10px]">{item.date} · {item.time}</span>
        </div>
        <div className="text-sm font-semibold leading-tight">
          {item.subject ?? (isCall ? "Telefoongesprek" : "Bericht zonder onderwerp")}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">{contextLabel}</div>
        {isCall && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
            <span>Duur:</span>
            <span className="font-mono text-foreground">{item.duration ?? "—"}</span>
            {item.callId && (
              <>
                <span>·</span>
                <span>Call ID: <span className="font-mono text-foreground">{item.callId}</span></span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {isCall ? (
          <>
            <section>
              <TranscriptCard lines={item.transcript} />
            </section>
            {item.callId && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1.5"
              >
                <a href="https://ai.synsel.nl/recordings" target="_blank" rel="noopener noreferrer">
                  {formatCallLinkLabel(item.callId)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </>
        ) : (
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Bericht</h3>
            <div className="rounded-md border border-border bg-card p-3 text-xs whitespace-pre-wrap leading-relaxed">
              {item.body ?? "Geen inhoud beschikbaar."}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TranscriptCard({ lines }: { lines?: TranscriptLine[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!lines?.length) return;
    const text = lines.map((l) => `${l.t}  ${l.speaker} (${l.role}): ${l.text}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          Transcriptie
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          disabled={!lines?.length}
        >
          <Copy className="h-3 w-3" />
          {copied ? "Gekopieerd" : "Kopiëren"}
        </Button>
      </div>

      {!lines?.length ? (
        <div className="p-4 text-xs text-muted-foreground">Transcript niet beschikbaar.</div>
      ) : (
        <div className="divide-y divide-border/60">
          {lines.map((l, i) => {
            const isOntvanger = l.role === "Ontvanger";
            const speakerColor = isOntvanger
              ? "text-blue-700 dark:text-blue-300"
              : "text-amber-700 dark:text-amber-300";
            const textColor = isOntvanger
              ? "text-blue-600 dark:text-blue-400"
              : "text-amber-600 dark:text-amber-400";
            const badgeClass = isOntvanger
              ? "bg-muted text-muted-foreground border-border"
              : "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400";
            return (
              <div
                key={i}
                className="grid grid-cols-[44px_minmax(140px,180px)_1fr] gap-3 px-3 py-2 items-start"
              >
                <div className="text-[10px] text-muted-foreground tabular-nums pt-0.5">{l.t}</div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn("text-xs font-semibold truncate", speakerColor)}>
                    {l.speaker}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] shrink-0",
                      badgeClass,
                    )}
                  >
                    {l.role}
                  </span>
                </div>
                <div className={cn("text-xs leading-relaxed", textColor)}>{l.text}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

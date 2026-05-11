import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquarePlus, CheckCircle2, PlayCircle, RotateCcw, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type InterventionTicket,
  type TicketStatus,
  addTicketComment,
  getLastAuthor,
  labelStatus,
  setTicketFollowUp,
  setTicketOwner,
  setTicketStatus,
} from "@/data/prognoseTickets";

interface Props {
  ticket: InterventionTicket;
  defaultOpen?: boolean;
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/40",
  closed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40",
};

const ACCENT: Record<TicketStatus, string> = {
  open: "bg-amber-500",
  in_progress: "bg-blue-500",
  closed: "bg-emerald-500",
};

function relTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "zojuist";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}u`;
  const days = Math.round(h / 24);
  return `${days}d`;
}

export function TicketCard({ ticket, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState(getLastAuthor());
  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState(ticket.owner);
  const [editingFollow, setEditingFollow] = useState(false);
  const [followDraft, setFollowDraft] = useState(ticket.followUpDate || "");

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addTicketComment(ticket.id, author || "—", comment.trim());
    setComment("");
  };

  const transition = (s: TicketStatus) => setTicketStatus(ticket.id, s, author || "—");

  const isClosed = ticket.status === "closed";

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", isClosed && "opacity-80")}>
      <div className={cn("h-1 w-full", ACCENT[ticket.status])} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", STATUS_STYLES[ticket.status])}>
              {labelStatus(ticket.status)}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{ticket.category}</Badge>
            <span className="text-[10px] text-muted-foreground font-mono">{ticket.id.slice(0, 10)}</span>
          </div>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
        <div className={cn("mt-1.5 font-semibold text-sm", isClosed && "line-through")}>{ticket.title}</div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ticket.description}</p>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{ticket.owner || "—"}</span>
          {ticket.followUpDate && (
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{ticket.followUpDate}</span>
          )}
          <span>· {relTime(ticket.createdAt)} geleden</span>
          <span>· {ticket.updates.length} updates</span>
        </div>
      </button>

      {open && (
        <div className="border-t bg-muted/20 p-3 space-y-3">
          {/* Quick edits */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">Eigenaar</label>
              {editingOwner ? (
                <div className="flex gap-1">
                  <Input
                    className="h-7 text-xs"
                    value={ownerDraft}
                    onChange={(e) => setOwnerDraft(e.target.value)}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2"
                    onClick={() => {
                      setTicketOwner(ticket.id, ownerDraft, author || ownerDraft);
                      setEditingOwner(false);
                    }}
                  >
                    OK
                  </Button>
                </div>
              ) : (
                <button
                  className="w-full text-left h-7 px-2 rounded border bg-background hover:bg-muted/50"
                  onClick={() => setEditingOwner(true)}
                >
                  {ticket.owner || "—"}
                </button>
              )}
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Opvolging</label>
              {editingFollow ? (
                <div className="flex gap-1">
                  <Input
                    type="date"
                    className="h-7 text-xs"
                    value={followDraft}
                    onChange={(e) => setFollowDraft(e.target.value)}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2"
                    onClick={() => {
                      setTicketFollowUp(ticket.id, followDraft, author || "—");
                      setEditingFollow(false);
                    }}
                  >
                    OK
                  </Button>
                </div>
              ) : (
                <button
                  className="w-full text-left h-7 px-2 rounded border bg-background hover:bg-muted/50"
                  onClick={() => setEditingFollow(true)}
                >
                  {ticket.followUpDate || "—"}
                </button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground mb-2">Activiteit</h5>
            <div className="relative pl-4 space-y-2.5 before:content-[''] before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-border">
              {ticket.updates.map((u) => (
                <div key={u.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[13px] top-1 h-2 w-2 rounded-full ring-2 ring-background",
                      u.type === "comment"
                        ? "bg-primary"
                        : u.type === "status_change"
                          ? "bg-blue-500"
                          : u.type === "created"
                            ? "bg-emerald-500"
                            : "bg-muted-foreground",
                    )}
                  />
                  <div className="text-xs">
                    <span className="font-medium">{u.author}</span>
                    <span className="text-muted-foreground"> · {new Date(u.createdAt).toLocaleString("nl-NL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm mt-0.5 whitespace-pre-wrap">{u.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {!isClosed && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  placeholder="Jouw naam"
                  className="h-8 text-xs"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
              <Textarea
                rows={2}
                placeholder="Voeg een update toe..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="text-sm"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
                  <MessageSquarePlus className="h-3.5 w-3.5 mr-1" /> Reageren
                </Button>
                {ticket.status === "open" && (
                  <Button size="sm" variant="outline" onClick={() => transition("in_progress")}>
                    <PlayCircle className="h-3.5 w-3.5 mr-1" /> In behandeling
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-700 hover:bg-emerald-500/10"
                  onClick={() => transition("closed")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Sluiten
                </Button>
              </div>
            </div>
          )}
          {isClosed && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Gesloten {ticket.closedAt && new Date(ticket.closedAt).toLocaleDateString("nl-NL")}
              </span>
              <Button size="sm" variant="ghost" onClick={() => transition("open")}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Heropenen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

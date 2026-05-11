import type { BottleneckCategory } from "./prognoseData";

export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketUpdateType =
  | "comment"
  | "status_change"
  | "owner_change"
  | "followup_change"
  | "created";

export interface TicketUpdate {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  type: TicketUpdateType;
}

export interface InterventionTicket {
  id: string;
  consultantId: string;
  category: BottleneckCategory | "Anders";
  title: string;
  description: string;
  owner: string;
  followUpDate?: string;
  status: TicketStatus;
  createdAt: string;
  closedAt?: string;
  updates: TicketUpdate[];
}

const KEY = "prognose-tickets";
const MIGRATED_KEY = "prognose-tickets-migrated";
const LAST_AUTHOR_KEY = "prognose-last-author";

function emit() {
  window.dispatchEvent(new CustomEvent("prognose-tickets-changed"));
}

function uid(prefix = "t") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function readAll(): InterventionTicket[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeAll(list: InterventionTicket[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}

// One-time migration of legacy intervention notes → closed tickets
function migrateLegacy() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const raw = localStorage.getItem("prognose-interventions");
    const legacy = raw ? JSON.parse(raw) : [];
    if (Array.isArray(legacy) && legacy.length > 0) {
      const tickets: InterventionTicket[] = legacy.map((n: any) => ({
        id: uid("legacy"),
        consultantId: n.consultantId,
        category: n.category,
        title: (n.note || "Interventie").slice(0, 60),
        description: n.note || "",
        owner: n.owner || "—",
        followUpDate: n.followUpDate || undefined,
        status: "closed" as TicketStatus,
        createdAt: n.createdAt || nowISO(),
        closedAt: n.createdAt || nowISO(),
        updates: [
          {
            id: uid("u"),
            author: n.owner || "Systeem",
            message: "Geïmporteerd uit oude notities",
            createdAt: n.createdAt || nowISO(),
            type: "created",
          },
        ],
      }));
      const existing = readAll();
      writeAll([...tickets, ...existing]);
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(MIGRATED_KEY, "1");
}
migrateLegacy();

export function loadTickets(consultantId?: string): InterventionTicket[] {
  const all = readAll();
  return consultantId ? all.filter((t) => t.consultantId === consultantId) : all;
}

export function getOpenTicketCount(consultantId: string): number {
  return readAll().filter((t) => t.consultantId === consultantId && t.status !== "closed").length;
}

export interface CreateTicketInput {
  consultantId: string;
  category: InterventionTicket["category"];
  title: string;
  description: string;
  owner: string;
  followUpDate?: string;
}

export function createTicket(input: CreateTicketInput): InterventionTicket {
  const t: InterventionTicket = {
    id: uid("INT"),
    consultantId: input.consultantId,
    category: input.category,
    title: input.title,
    description: input.description,
    owner: input.owner,
    followUpDate: input.followUpDate,
    status: "open",
    createdAt: nowISO(),
    updates: [
      {
        id: uid("u"),
        author: input.owner || "Systeem",
        message: `Ticket aangemaakt — ${input.category}`,
        createdAt: nowISO(),
        type: "created",
      },
    ],
  };
  writeAll([t, ...readAll()]);
  if (input.owner) localStorage.setItem(LAST_AUTHOR_KEY, input.owner);
  return t;
}

function updateTicket(id: string, mutator: (t: InterventionTicket) => void) {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return;
  mutator(all[idx]);
  writeAll(all);
}

export function addTicketComment(ticketId: string, author: string, message: string) {
  if (!message.trim()) return;
  updateTicket(ticketId, (t) => {
    t.updates.push({
      id: uid("u"),
      author: author || "—",
      message,
      createdAt: nowISO(),
      type: "comment",
    });
  });
  if (author) localStorage.setItem(LAST_AUTHOR_KEY, author);
}

export function setTicketStatus(ticketId: string, status: TicketStatus, author: string) {
  updateTicket(ticketId, (t) => {
    if (t.status === status) return;
    const from = t.status;
    t.status = status;
    if (status === "closed") t.closedAt = nowISO();
    else t.closedAt = undefined;
    t.updates.push({
      id: uid("u"),
      author: author || "—",
      message: `Status: ${labelStatus(from)} → ${labelStatus(status)}`,
      createdAt: nowISO(),
      type: "status_change",
    });
  });
}

export function setTicketOwner(ticketId: string, owner: string, author: string) {
  updateTicket(ticketId, (t) => {
    if (t.owner === owner) return;
    const from = t.owner || "—";
    t.owner = owner;
    t.updates.push({
      id: uid("u"),
      author: author || "—",
      message: `Eigenaar: ${from} → ${owner || "—"}`,
      createdAt: nowISO(),
      type: "owner_change",
    });
  });
}

export function setTicketFollowUp(ticketId: string, followUpDate: string, author: string) {
  updateTicket(ticketId, (t) => {
    if (t.followUpDate === followUpDate) return;
    const from = t.followUpDate || "—";
    t.followUpDate = followUpDate || undefined;
    t.updates.push({
      id: uid("u"),
      author: author || "—",
      message: `Opvolging: ${from} → ${followUpDate || "—"}`,
      createdAt: nowISO(),
      type: "followup_change",
    });
  });
}

export function getLastAuthor(): string {
  return localStorage.getItem(LAST_AUTHOR_KEY) || "";
}

export function labelStatus(s: TicketStatus): string {
  return s === "open" ? "Open" : s === "in_progress" ? "In behandeling" : "Gesloten";
}

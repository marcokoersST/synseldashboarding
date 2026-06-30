// ─── Call Dashboarding mock data layer ──────────────────────────────────────
// Generates ~35 days of synthetic call activity for the 56 consultants so the
// /calldashboarding page can drive a TV mode, historical period filter and a
// per-consultant call-log drill-down.

export type CallDirection = "in" | "out";
export type CallMatch =
  | "candidate"
  | "organisation"
  | "contact_person"
  | "new";
export type CallOutcome =
  | "connected"
  | "voicemail"
  | "no_answer"
  | "hangup";

export interface CallRecord {
  id: string;
  consultantId: number;
  direction: CallDirection;
  from: string;
  to: string;
  durationSec: number;
  startedAt: number; // ms epoch
  match: CallMatch;
  contactName?: string;
  company?: string;
  connected: boolean;
  outcome: CallOutcome;
}

export interface ConsultantSeed {
  id: number;
  name: string;
  unit: string;
}

export const CONSULTANTS: ConsultantSeed[] = [
  { id: 1, name: "Amer Faraman", unit: "Early Performers" },
  { id: 2, name: "Bart van Vliet", unit: "Monteurs" },
  { id: 3, name: "Bas de Ruiter", unit: "Operators" },
  { id: 4, name: "Christiaan van Krieken", unit: "Operators" },
  { id: 5, name: "Daan Jacobs", unit: "Monteurs" },
  { id: 6, name: "Dees Beeking", unit: "Trainingsunit" },
  { id: 7, name: "Delano Nikkels", unit: "Engineering" },
  { id: 8, name: "Dyon Mäkel", unit: "Early Performers" },
  { id: 9, name: "Elianne van Lohuizen", unit: "Operators" },
  { id: 10, name: "Elmar Koopman", unit: "Monteurs" },
  { id: 11, name: "Emily Huigens", unit: "Trainingsunit" },
  { id: 12, name: "Eric Hutchison", unit: "Engineering" },
  { id: 13, name: "Falco Zegveld", unit: "Engineering" },
  { id: 14, name: "Ian Schaufeli", unit: "Operators" },
  { id: 15, name: "Jelle van Enck", unit: "Early Performers" },
  { id: 16, name: "Joey Pol", unit: "Monteurs" },
  { id: 17, name: "Joey de Vries", unit: "Monteurs" },
  { id: 18, name: "Jonah Waterborg", unit: "Engineering" },
  { id: 19, name: "Joost Kloppers", unit: "Monteurs" },
  { id: 20, name: "Jort Koggel", unit: "Engineering" },
  { id: 21, name: "Kaylee van den Berg", unit: "Monteurs" },
  { id: 22, name: "Lars van Suntenmaartensdijk", unit: "Operators" },
  { id: 23, name: "Mahesh Behari", unit: "Operators" },
  { id: 24, name: "Marco Schaap", unit: "Monteurs" },
  { id: 25, name: "Marnix Miltenburg", unit: "Trainingsunit" },
  { id: 26, name: "Mathijs Oskamp", unit: "Engineering" },
  { id: 27, name: "Miguel Kraaijeveld", unit: "Engineering" },
  { id: 28, name: "Niek Roufs", unit: "Monteurs" },
  { id: 29, name: "Niels Eggens", unit: "Engineering" },
  { id: 30, name: "Niels Florijn", unit: "Engineering" },
  { id: 31, name: "Nino Boot", unit: "Monteurs" },
  { id: 32, name: "Noa Treep", unit: "Trainingsunit" },
  { id: 33, name: "Paul Geers", unit: "Trainingsunit" },
  { id: 34, name: "Rick Karssen", unit: "Early Performers" },
  { id: 35, name: "Robbert Dalhuisen", unit: "Trainingsunit" },
  { id: 36, name: "Robert van Zielhuis", unit: "Operators" },
  { id: 37, name: "Robin Jansen", unit: "Monteurs" },
  { id: 38, name: "Robin van Bruggen", unit: "Monteurs" },
  { id: 39, name: "Roel Linthorst", unit: "Trainingsunit" },
  { id: 40, name: "Ruben Zoet", unit: "Operators" },
  { id: 41, name: "Saleh Akhras", unit: "Trainingsunit" },
  { id: 42, name: "Sander Beckker", unit: "Engineering" },
  { id: 43, name: "Senna Ekkers", unit: "Early Performers" },
  { id: 44, name: "Sijmen Bossenbroek", unit: "Monteurs" },
  { id: 45, name: "Stijn Koldenhoven", unit: "Engineering" },
  { id: 46, name: "Ted Bronkhorst", unit: "Early Performers" },
  { id: 47, name: "Thijs Dirksen", unit: "Engineering" },
  { id: 48, name: "Thijs Pisa", unit: "Trainingsunit" },
  { id: 49, name: "Thijs Udink", unit: "Operators" },
  { id: 50, name: "Thom auf der Masch", unit: "Operators" },
  { id: 51, name: "Ties Ganzevles", unit: "Trainingsunit" },
  { id: 52, name: "Tim Kuik", unit: "Trainingsunit" },
  { id: 53, name: "Toby Bruinier", unit: "Monteurs" },
  { id: 54, name: "Tom Tulen", unit: "Engineering" },
  { id: 55, name: "Tomas Jansen", unit: "Engineering" },
  { id: 56, name: "Xander Blok", unit: "Engineering" },
];

// ─── Seeded RNG ─────────────────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const CANDIDATE_FIRST = [
  "Sven", "Tessa", "Mark", "Lisa", "Pieter", "Sanne", "Bram", "Iris",
  "Tom", "Anne", "Daan", "Eva", "Luuk", "Fleur", "Stijn", "Lotte",
  "Joep", "Maud", "Ruben", "Noor", "Finn", "Roos", "Milan", "Jasmijn",
];
const CANDIDATE_LAST = [
  "de Vries", "Jansen", "Bakker", "Visser", "Smit", "Meijer", "de Boer",
  "Mulder", "de Groot", "Bos", "Vos", "Peters", "Hendriks", "van Dijk",
  "Kuipers", "van Leeuwen", "Dekker", "Brouwer",
];
const COMPANIES = [
  "ASML", "Damen Shipyards", "VDL Groep", "Tata Steel", "Vanderlande",
  "Thales", "Stork", "Heerema", "SBM Offshore", "Sif Group",
  "Hollandia", "IHC", "DAF Trucks", "Boskalis", "Bilfinger",
  "Croon Elektrotechniek", "Strukton", "Heijmans", "BAM Infra",
];
const CONTACT_FIRST = [
  "Jan", "Peter", "Hans", "Karel", "Wouter", "Erik", "Frank", "Marc",
  "Bas", "Joost", "Maarten", "Robert", "Edwin", "Patrick",
];

function pad(n: number) { return String(n).padStart(2, "0"); }

function makeNlNumber(rng: () => number, mobile = true) {
  if (mobile) {
    const block = Math.floor(rng() * 90000000) + 10000000;
    return `+316${String(block).slice(0, 8)}`;
  }
  // landline-ish
  const area = [10, 20, 30, 40, 50, 70, 73, 76, 88][Math.floor(rng() * 9)];
  const rest = Math.floor(rng() * 9000000) + 1000000;
  return `+31${area}${String(rest).slice(0, 7)}`;
}

interface ContactRef {
  kind: CallMatch;
  name?: string;
  company?: string;
  number: string;
}

function buildKnownDirectory(consultantId: number): ContactRef[] {
  const rng = makeRng(consultantId * 9173 + 17);
  const dir: ContactRef[] = [];
  // 8 candidates
  for (let i = 0; i < 8; i++) {
    const f = CANDIDATE_FIRST[Math.floor(rng() * CANDIDATE_FIRST.length)];
    const l = CANDIDATE_LAST[Math.floor(rng() * CANDIDATE_LAST.length)];
    dir.push({ kind: "candidate", name: `${f} ${l}`, number: makeNlNumber(rng, true) });
  }
  // 4 organisations
  for (let i = 0; i < 4; i++) {
    const c = COMPANIES[Math.floor(rng() * COMPANIES.length)];
    dir.push({ kind: "organisation", company: c, number: makeNlNumber(rng, false) });
  }
  // 5 contact persons
  for (let i = 0; i < 5; i++) {
    const f = CONTACT_FIRST[Math.floor(rng() * CONTACT_FIRST.length)];
    const l = CANDIDATE_LAST[Math.floor(rng() * CANDIDATE_LAST.length)];
    const c = COMPANIES[Math.floor(rng() * COMPANIES.length)];
    dir.push({ kind: "contact_person", name: `${f} ${l}`, company: c, number: makeNlNumber(rng, true) });
  }
  return dir;
}

// ─── Generation window ──────────────────────────────────────────────────────
// Pin "now" so the dataset is stable across renders within a session.
export const NOW = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;
const GEN_DAYS = 35;
export const RANGE_START = NOW - GEN_DAYS * DAY_MS;
export const RANGE_END = NOW;

// Hourly weights from 07:30..19:00 in 30-min buckets (23 buckets)
// Index 0 = 07:30-08:00, last = 18:30-19:00. Peaks at 10-12 and 14-16.
const HOUR_WEIGHTS = [
  0.4, 0.7, 1.1, 1.5, 1.9, 2.3, 2.5, 2.2, 1.4, 0.9,
  1.6, 2.1, 2.5, 2.6, 2.3, 1.9, 1.4, 1.1, 0.9, 0.7,
  0.5, 0.35, 0.2,
];
const HOUR_PICKUP = [
  0.42, 0.46, 0.52, 0.58, 0.63, 0.66, 0.62, 0.55, 0.48, 0.45,
  0.5, 0.6, 0.68, 0.72, 0.7, 0.66, 0.6, 0.55, 0.5, 0.46,
  0.4, 0.35, 0.3,
];
export const BUCKET_LABELS = (() => {
  const out: string[] = [];
  for (let i = 0; i < 23; i++) {
    const totalMin = 7 * 60 + 30 + i * 30;
    out.push(`${pad(Math.floor(totalMin / 60))}:${pad(totalMin % 60)}`);
  }
  return out;
})();

function bucketStartMsOfDay(bucketIdx: number) {
  return (7 * 60 + 30 + bucketIdx * 30) * 60 * 1000;
}

function pickBucket(rng: () => number) {
  const totalW = HOUR_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = rng() * totalW;
  for (let i = 0; i < HOUR_WEIGHTS.length; i++) {
    r -= HOUR_WEIGHTS[i];
    if (r <= 0) return i;
  }
  return HOUR_WEIGHTS.length - 1;
}

function startOfDay(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// ─── Generate calls per consultant ──────────────────────────────────────────
function generateForConsultant(c: ConsultantSeed): CallRecord[] {
  const rng = makeRng(c.id * 4099 + 31);
  const dir = buildKnownDirectory(c.id);
  const calls: CallRecord[] = [];
  const todayStart = startOfDay(NOW);

  for (let dayOffset = GEN_DAYS - 1; dayOffset >= 0; dayOffset--) {
    const dayStart = todayStart - dayOffset * DAY_MS;
    const dow = new Date(dayStart).getDay(); // 0 = Sun
    if (dow === 0 || dow === 6) {
      // Light weekend volume
      if (rng() > 0.25) continue;
    }
    // Today: cap calls so far at "now"
    const isToday = dayOffset === 0;

    const perDay = 14 + Math.floor(rng() * 28); // 14..42
    for (let i = 0; i < perDay; i++) {
      const bucket = pickBucket(rng);
      const startInDay = bucketStartMsOfDay(bucket) + Math.floor(rng() * 30 * 60 * 1000);
      const startedAt = dayStart + startInDay;
      if (isToday && startedAt > NOW) continue;

      const direction: CallDirection = rng() < 0.65 ? "out" : "in";

      // Match selection
      const mRoll = rng();
      let match: CallMatch;
      if (mRoll < 0.35) match = "candidate";
      else if (mRoll < 0.55) match = "organisation";
      else if (mRoll < 0.75) match = "contact_person";
      else match = "new";

      let contact: ContactRef | undefined;
      if (match !== "new") {
        const pool = dir.filter((d) => d.kind === match);
        contact = pool[Math.floor(rng() * pool.length)];
      }
      const otherNumber = contact ? contact.number : makeNlNumber(rng, rng() < 0.6);
      const ownNumber = `+318850010${pad(c.id % 100)}`;

      const connected = rng() < HOUR_PICKUP[bucket] * (direction === "in" ? 1.1 : 1);
      const outcome: CallOutcome = connected
        ? "connected"
        : rng() < 0.5
          ? "voicemail"
          : rng() < 0.6
            ? "no_answer"
            : "hangup";

      const durationSec = connected
        ? 45 + Math.floor(rng() * 600) // 45s..10m45s
        : Math.floor(rng() * 35); // 0..35s

      calls.push({
        id: `c${c.id}-${dayOffset}-${i}`,
        consultantId: c.id,
        direction,
        from: direction === "in" ? otherNumber : ownNumber,
        to: direction === "in" ? ownNumber : otherNumber,
        durationSec,
        startedAt,
        match,
        contactName: contact?.name,
        company: contact?.company,
        connected,
        outcome,
      });
    }
  }
  calls.sort((a, b) => a.startedAt - b.startedAt);
  return calls;
}

// Eagerly build the full dataset once.
export const ALL_CALLS: CallRecord[] = CONSULTANTS.flatMap(generateForConsultant);
ALL_CALLS.sort((a, b) => a.startedAt - b.startedAt);

// ─── Period helpers ─────────────────────────────────────────────────────────
export interface Period {
  from: number;
  to: number;
  label: string;
  key: string;
}

function startOfWeekMonday(ms: number) {
  const d = new Date(startOfDay(ms));
  const dow = d.getDay(); // 0..6, Sun=0
  const back = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - back);
  return d.getTime();
}

export function presetPeriods(): Period[] {
  const today = startOfDay(NOW);
  const weekStart = startOfWeekMonday(NOW);
  return [
    { key: "today", label: "Vandaag", from: today, to: NOW },
    { key: "this-week", label: "Deze week (Ma–nu)", from: weekStart, to: NOW },
    { key: "prev-week", label: "Vorige week", from: weekStart - 7 * DAY_MS, to: weekStart - 1 },
    { key: "last-7", label: "Laatste 7 dagen", from: NOW - 7 * DAY_MS, to: NOW },
    { key: "last-30", label: "Laatste 30 dagen", from: NOW - 30 * DAY_MS, to: NOW },
  ];
}

export function defaultPeriod(): Period {
  return presetPeriods()[1];
}

// Previous equal-length window directly before `period`.
export function previousPeriod(p: Period): Period {
  const len = p.to - p.from;
  return { key: `${p.key}-prev`, label: "Vorige periode", from: p.from - len - 1, to: p.from - 1 };
}

export function getCallsInRange(
  from: number,
  to: number,
  consultantIds?: Set<number>,
): CallRecord[] {
  // ALL_CALLS sorted by startedAt — binary-search would help, but linear scan
  // is fast enough at this size and keeps the code simple.
  const out: CallRecord[] = [];
  for (const c of ALL_CALLS) {
    if (c.startedAt < from) continue;
    if (c.startedAt > to) break;
    if (consultantIds && !consultantIds.has(c.consultantId)) continue;
    out.push(c);
  }
  return out;
}

// ─── Aggregators ────────────────────────────────────────────────────────────
export interface ConsultantAgg {
  consultantId: number;
  total: number;
  inbound: number;
  outbound: number;
  durationSec: number;
  connected: number;
  lastCallAt: number | null;
}

export function aggregatePerConsultant(calls: CallRecord[]): Map<number, ConsultantAgg> {
  const out = new Map<number, ConsultantAgg>();
  for (const c of calls) {
    let a = out.get(c.consultantId);
    if (!a) {
      a = {
        consultantId: c.consultantId,
        total: 0,
        inbound: 0,
        outbound: 0,
        durationSec: 0,
        connected: 0,
        lastCallAt: null,
      };
      out.set(c.consultantId, a);
    }
    a.total++;
    if (c.direction === "in") a.inbound++; else a.outbound++;
    a.durationSec += c.durationSec;
    if (c.connected) a.connected++;
    if (a.lastCallAt === null || c.startedAt > a.lastCallAt) a.lastCallAt = c.startedAt;
  }
  return out;
}

export interface OutreachAgg {
  total: number;
  byMatch: Record<CallMatch, number>;
  byOutcome: Record<CallOutcome, number>;
  connected: number;
  known: number; // candidate + organisation + contact_person
  newNumbers: number;
}

const EMPTY_MATCH: Record<CallMatch, number> = {
  candidate: 0, organisation: 0, contact_person: 0, new: 0,
};
const EMPTY_OUTCOME: Record<CallOutcome, number> = {
  connected: 0, voicemail: 0, no_answer: 0, hangup: 0,
};

export function aggregateOutreach(calls: CallRecord[]): OutreachAgg {
  const byMatch = { ...EMPTY_MATCH };
  const byOutcome = { ...EMPTY_OUTCOME };
  let connected = 0;
  for (const c of calls) {
    byMatch[c.match]++;
    byOutcome[c.outcome]++;
    if (c.connected) connected++;
  }
  return {
    total: calls.length,
    byMatch,
    byOutcome,
    connected,
    known: byMatch.candidate + byMatch.organisation + byMatch.contact_person,
    newNumbers: byMatch.new,
  };
}

export interface HourBucket {
  label: string;
  inbound: number;
  outbound: number;
  total: number;
  connected: number;
  pickupRate: number; // 0..1
}

export function aggregateHourly(calls: CallRecord[]): HourBucket[] {
  const buckets: HourBucket[] = BUCKET_LABELS.map((label) => ({
    label, inbound: 0, outbound: 0, total: 0, connected: 0, pickupRate: 0,
  }));
  for (const c of calls) {
    const d = new Date(c.startedAt);
    const mins = d.getHours() * 60 + d.getMinutes();
    const offset = mins - (7 * 60 + 30);
    if (offset < 0) continue;
    const idx = Math.floor(offset / 30);
    if (idx < 0 || idx >= buckets.length) continue;
    const b = buckets[idx];
    b.total++;
    if (c.direction === "in") b.inbound++; else b.outbound++;
    if (c.connected) b.connected++;
  }
  for (const b of buckets) {
    b.pickupRate = b.total === 0 ? 0 : b.connected / b.total;
  }
  return buckets;
}

// ─── Formatters ─────────────────────────────────────────────────────────────
export function formatDurationHMS(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatTimestamp(ms: number) {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatDateTime(ms: number) {
  const d = new Date(ms);
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const MATCH_LABEL: Record<CallMatch, string> = {
  candidate: "Kandidaat",
  organisation: "Organisatie",
  contact_person: "Contactpersoon",
  new: "Nieuw nummer",
};

export const OUTCOME_LABEL: Record<CallOutcome, string> = {
  connected: "Connected",
  voicemail: "Voicemail",
  no_answer: "Geen gehoor",
  hangup: "Opgehangen",
};

export function consultantById(id: number) {
  return CONSULTANTS.find((c) => c.id === id);
}

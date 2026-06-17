// LC-B weekly market data — seeded, deterministic. Used only by /manager-dashboard/LC-B.

import { LCB_DEAL_STAGES, CONTACT_STATUSES, type LcbDealStage, type ContactStatus } from "./lcbDealStages";

// ─── LC-B team roster (from uploaded sheet) ────────────────────────────
export const LCB_UNITS = ["Operators", "Monteurs", "Engineers", "Installatietechniek"] as const;

export const lcbTeam: { id: number; name: string; unit: string }[] = [
  { id: 101, name: "Amer Faraman", unit: "Operators" },
  { id: 102, name: "Bas de Ruiter", unit: "Operators" },
  { id: 103, name: "Dees Beeking", unit: "Operators" },
  { id: 104, name: "Dyon Makel", unit: "Operators" },
  { id: 105, name: "Elmar Koopman", unit: "Monteurs" },
  { id: 106, name: "Emily Huigens", unit: "Operators" },
  { id: 107, name: "Eric Hutchison", unit: "Engineers" },
  { id: 108, name: "Falco Zegveld", unit: "Engineers" },
  { id: 109, name: "Jelle van Enck", unit: "Engineers" },
  { id: 110, name: "Joey de Vries", unit: "Monteurs" },
  { id: 111, name: "Joey Pol", unit: "Installatietechniek" },
  { id: 112, name: "Jort Koggel", unit: "Engineers" },
  { id: 113, name: "Joshua Westendorp", unit: "Operators" },
  { id: 114, name: "Kaylee van den Berg", unit: "Monteurs" },
  { id: 115, name: "Lars van Suntenmaartensdijk", unit: "Operators" },
  { id: 116, name: "Levi van den Brink", unit: "Operators" },
  { id: 117, name: "Marco Schaap", unit: "Installatietechniek" },
  { id: 118, name: "Mart van Offeren", unit: "Operators" },
  { id: 119, name: "Mattijs Gijse", unit: "Operators" },
  { id: 120, name: "Niels Florijn", unit: "Engineers" },
  { id: 121, name: "Nino Boot", unit: "Monteurs" },
  { id: 122, name: "Paul Geers", unit: "Operators" },
  { id: 123, name: "Rens van den Brink", unit: "Operators" },
  { id: 124, name: "Rick Karssen", unit: "Engineers" },
  { id: 125, name: "Robert Zielhuis", unit: "Operators" },
  { id: 126, name: "Robin Jansen", unit: "Operators" },
  { id: 127, name: "Robin van Bruggen", unit: "Monteurs" },
  { id: 128, name: "Senna Ekkers", unit: "Monteurs" },
  { id: 129, name: "Sijmen Bossenbroek", unit: "Monteurs" },
  { id: 130, name: "Thijs Pisa", unit: "Operators" },
  { id: 131, name: "Thijs Udink", unit: "Operators" },
  { id: 132, name: "Thom Auf der Masch", unit: "Operators" },
  { id: 133, name: "Ties Ganzevles", unit: "Operators" },
  { id: 134, name: "Tim Kuik", unit: "Engineers" },
  { id: 135, name: "Toby Bruinier", unit: "Monteurs" },
  { id: 136, name: "Tom Kolkman", unit: "Engineers" },
  { id: 137, name: "Tomas Jansen", unit: "Engineers" },
];

// ─── Funnel steps (round-2 labels) ──────────────────────────────────────
export const lcbFunnelSteps = [
  { key: "toegewezen", label: "Toegewezen", entity: "candidate" },
  { key: "inschrijvingen", label: "Inschrijvingen", entity: "candidate" },
  { key: "acquisities", label: "Acquisities", entity: "candidate" },
  { key: "voorstellen", label: "Voorstellen", entity: "deal" },
  { key: "intakes", label: "Intakes", entity: "candidate" },
  { key: "uitnodiging", label: "Uitnodigingen", entity: "deal" },
  { key: "gesprekken", label: "Gesprekken", entity: "deal" },
  { key: "vervolg", label: "Vervolggesprekken", entity: "deal" },
  { key: "plaatsingen", label: "Plaatsingen", entity: "candidate" },
] as const;

export type LcbStepKey = typeof lcbFunnelSteps[number]["key"];
export type LcbEntity = "candidate" | "deal";

export interface LcbConsultantRow {
  consultantId: number;
  consultantName: string;
  unit: string;
  perf: "good" | "average" | "bad";
  toegewezen: number;
  inschrijvingen: number;
  acquisities: number;
  voorstellen: number;
  intakes: number;
  uitnodiging: number;
  gesprekken: number;
  vervolg: number;
  plaatsingen: number;
}

// ─── seeded RNG (mulberry32) ───────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rint = (rnd: () => number, min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const rfloat = (rnd: () => number, min: number, max: number) => rnd() * (max - min) + min;
const pick = <T,>(rnd: () => number, arr: readonly T[]) => arr[rint(rnd, 0, arr.length - 1)];

// ─── Build deterministic weekly row per consultant ─────────────────────
function buildRow(c: { id: number; name: string; unit: string }): LcbConsultantRow {
  const rnd = mulberry32(c.id * 9973 + 17);
  const r = rnd();
  const perf: LcbConsultantRow["perf"] = r < 0.3 ? "good" : r < 0.8 ? "average" : "bad";
  const invPerProposal = perf === "good" ? 15 : perf === "average" ? 20 : 40;

  const toegewezen = rint(rnd, 10, 25);
  const inschrijvingen = Math.round(toegewezen * rfloat(rnd, 0.9, 1.0));
  const acquisities = Math.round(inschrijvingen * rfloat(rnd, 0.9, 1.0));

  let voorstellen = 0;
  for (let i = 0; i < acquisities; i++) voorstellen += rint(rnd, 20, 65);

  const intakes = Math.round(inschrijvingen * rfloat(rnd, 0.3, 1.0));
  const uitnodiging = Math.max(0, Math.round(voorstellen / invPerProposal));
  const gesprekken = Math.round(uitnodiging * rfloat(rnd, 0.3, 1.0));
  const vervolg = Math.round(gesprekken * rfloat(rnd, 0.1, 0.5));

  const useVervolg = rnd() < 0.5 && vervolg > 0;
  const plaatsingen = useVervolg
    ? Math.round(vervolg * rfloat(rnd, 0.75, 0.9))
    : Math.round(gesprekken * rfloat(rnd, 0, 0.3));

  return {
    consultantId: c.id, consultantName: c.name, unit: c.unit, perf,
    toegewezen, inschrijvingen, acquisities, voorstellen,
    intakes, uitnodiging, gesprekken, vervolg, plaatsingen,
  };
}

export const lcbMarketRows: LcbConsultantRow[] = lcbTeam.map(buildRow);

export const lcbTotals: Record<LcbStepKey, number> = lcbFunnelSteps.reduce((acc, s) => {
  acc[s.key] = lcbMarketRows.reduce((sum, r) => sum + (r[s.key] as number), 0);
  return acc;
}, {} as Record<LcbStepKey, number>);

export function lcbBenchmarks(): Partial<Record<LcbStepKey, number>> {
  const out: Partial<Record<LcbStepKey, number>> = {};
  for (let i = 1; i < lcbFunnelSteps.length; i++) {
    const cur = lcbFunnelSteps[i].key;
    const prev = lcbFunnelSteps[i - 1].key;
    const ratios = lcbMarketRows.filter((r) => (r[prev] as number) > 0).map((r) => (r[cur] as number) / (r[prev] as number));
    out[cur] = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
  }
  return out;
}

// ─── Mock pools ────────────────────────────────────────────────────────
export type CandidateCategory = "A+" | "A" | "B";
export type CandidateStatus =
  | "1 | Inschrijven" | "2 | Acquisitie" | "3 | In procedure" | "Afgewezen"
  | "Geplaatst" | "Lead" | "Niet beschikbaar" | "Niet geplaatst" | "Nieuw"
  | "Vacature aanvraag" | "Verdelen";

const CANDIDATE_NAMES = [
  "Jan de Vries", "Maria van den Berg", "Pieter Jansen", "Anna Bakker",
  "Thomas Visser", "Sophie de Jong", "Lars Mulder", "Emma Bos",
  "Daan Smit", "Lisa van Dijk", "Ruben Meijer", "Eva de Graaf",
  "Luuk Peters", "Julia Hendriks", "Tim van Leeuwen", "Sara Dekker",
  "Niels Eggens", "Femke Vermeer", "Joris Kuiper", "Iris Hofman",
];
const COMPANIES = [
  "Koopmans Meel", "Nedpack / Qimarox", "KME Netherlands BV", "J&W Service B.V.",
  "VDL Steelweld bv", "Tevel Systems", "SafanDarley Lochem B.V.", "Shell",
  "ASML", "Philips", "Vopak", "DSM",
];
const ROLES = [
  "Operator 5-Ploegendienst", "Software Engineer", "Automation Engineer",
  "Design Engineer", "Software Engineer PLC", "Service Monteur",
  "Technisch Project Manager", "Allround Monteur", "Werktuigbouwkundige",
  "Elektromonteur",
];
const CONTACT_PEOPLE = ["Mark Jansen", "Karin de Boer", "Bas van Loon", "Linda Verstegen", "Joost Bakker", "Esther Klein"];
const CATEGORIES: CandidateCategory[] = ["A+", "A", "B"];
const STATUSES: CandidateStatus[] = [
  "1 | Inschrijven", "2 | Acquisitie", "3 | In procedure", "Afgewezen",
  "Geplaatst", "Lead", "Niet beschikbaar", "Niet geplaatst", "Nieuw",
  "Vacature aanvraag", "Verdelen",
];

// ─── Realistic RecruitCRM-style ID generators ──────────────────────────
function makeCandidateId(rnd: () => number): string {
  // 6-digit numeric IDs, e.g. 205070, 133538, 219890
  return String(rint(rnd, 100000, 299999));
}
function makeDealId(rnd: () => number): string {
  // Mixed 5-7 digit numeric IDs, e.g. 1220938, 99981, 31685
  const bucket = rnd();
  if (bucket < 0.45) return String(rint(rnd, 1200000, 1230000));
  if (bucket < 0.8) return String(rint(rnd, 80000, 110000));
  return String(rint(rnd, 30000, 60000));
}
function makeOpdrachtgeverId(rnd: () => number): string {
  return String(rint(rnd, 10000, 99999));
}
function firstName(full: string): string {
  return full.split(" ")[0];
}


export interface CandidateRow {
  name: string;
  id: string;
  consultantId?: number;
  category: CandidateCategory;
  status: CandidateStatus;
  deals: number;
  proposals: number;
  emails: number;
  calls: number;
  lastUpdated: string;          // legacy "12 mrt" — kept for back-compat
  lastUpdatedDate: string;      // "12 mrt 2026"
  lastUpdatedTime: string;      // "14:32"
}

export interface DealRow {
  dealName: string;
  dealId: string;
  dealStatus: LcbDealStage;
  candidateName: string;
  candidateId: string;
  opdrachtgeverName: string;
  opdrachtgeverId: string;
  lastUpdated: string;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
}

const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
function ddmm(rnd: () => number) {
  const d = rint(rnd, 1, 28);
  const m = MONTHS[rint(rnd, 0, 5)];
  return `${d} ${m}`;
}
function fullDate(rnd: () => number) {
  const d = rint(rnd, 1, 28);
  const m = MONTHS[rint(rnd, 0, 11)];
  return `${d} ${m} 2026`;
}
function hhmm(rnd: () => number) {
  const h = String(rint(rnd, 8, 19)).padStart(2, "0");
  const m = String(rint(rnd, 0, 59)).padStart(2, "0");
  return `${h}:${m}`;
}
function hms(rnd: () => number) {
  const h = rint(rnd, 0, 1);
  const m = rint(rnd, 0, 59);
  const s = rint(rnd, 0, 59);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getCandidatesForStep(consultantId: number, step: LcbStepKey): CandidateRow[] {
  const rnd = mulberry32(consultantId * 131 + step.length * 19);
  const row = lcbMarketRows.find((r) => r.consultantId === consultantId);
  const count = row ? Math.min(20, Math.max(1, row[step] as number)) : 8;
  return Array.from({ length: count }, (_, i) => {
    const n = CANDIDATE_NAMES[(consultantId * 3 + i) % CANDIDATE_NAMES.length];
    const date = fullDate(rnd);
    const time = hhmm(rnd);
    return {
      name: n,
      id: makeCandidateId(rnd),
      consultantId,
      category: CATEGORIES[rint(rnd, 0, 2)],
      status: STATUSES[rint(rnd, 0, STATUSES.length - 1)],
      deals: 1 + rint(rnd, 0, 3),
      proposals: rint(rnd, 1, 12),
      emails: rint(rnd, 0, 18),
      calls: rint(rnd, 0, 14),
      lastUpdated: ddmm(rnd),
      lastUpdatedDate: date,
      lastUpdatedTime: time,
    };
  });
}

export function getDealsForStep(consultantId: number, step: LcbStepKey): DealRow[] {
  const rnd = mulberry32(consultantId * 277 + step.length * 53);
  const row = lcbMarketRows.find((r) => r.consultantId === consultantId);
  const consultantFullName = row?.consultantName ?? "";
  const consultantFirst = firstName(consultantFullName);
  const count = row ? Math.min(25, Math.max(1, row[step] as number)) : 10;
  return Array.from({ length: count }, (_, i) => {
    const cand = CANDIDATE_NAMES[(consultantId + i) % CANDIDATE_NAMES.length];
    const candidateId = makeCandidateId(rnd);
    const opdrachtgever = getConsultantOpdrachtgever(consultantId);
    const co = opdrachtgever.name;
    const role = ROLES[(consultantId + i * 3) % ROLES.length];
    const stage = LCB_DEAL_STAGES[rint(rnd, 0, LCB_DEAL_STAGES.length - 1)];
    const date = fullDate(rnd);
    const time = hhmm(rnd);
    return {
      dealName: `${consultantFirst} - ${co} - ${role}`,
      dealId: makeDealId(rnd),
      dealStatus: stage,
      candidateName: cand,
      candidateId,
      opdrachtgeverName: co,
      opdrachtgeverId: opdrachtgever.id,
      lastUpdated: ddmm(rnd),
      lastUpdatedDate: date,
      lastUpdatedTime: time,
    };
  });
}

// ─── Candidate detail: activity, notes, related deals ─────────────────
export type Direction = "in" | "out";

export interface CandidateNote {
  id: string;
  author: string;
  date: string;
  time: string;
  body: string;
}

export interface TranscriptLine {
  t: string; // mm:ss
  speaker: string;
  role: "Ontvanger" | "Beller";
  text: string;
}

export interface ActivityItem {
  id: string;
  kind: "email" | "call" | "note";
  direction: Direction;
  contact: string;
  contactStatus: ContactStatus;
  subject?: string;
  duration?: string; // for calls
  body?: string;     // for notes / emails (long body)
  date: string;
  time: string;
  dealRef?: string;
  callId?: string;            // 6-digit, calls only
  transcript?: TranscriptLine[]; // mock transcript lines, calls only
}


export interface CandidateDealLink {
  dealName: string;
  dealId: string;
  dealStatus: LcbDealStage;
  candidateName: string;
  candidateId: string;
  opdrachtgeverName: string;
  opdrachtgeverId: string;
  proposed: boolean;
  date: string;
  time: string;
}

function seedFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return mulberry32(h);
}

function getCandidateOpdrachtgever(candidateId: string): { name: string; id: string } {
  const rnd = seedFromId(`${candidateId}-opdrachtgever`);
  return {
    name: pick(rnd, COMPANIES),
    id: makeOpdrachtgeverId(rnd),
  };
}

function getConsultantOpdrachtgever(consultantId: number): { name: string; id: string } {
  const rnd = mulberry32(consultantId * 4441 + 29);
  return {
    name: pick(rnd, COMPANIES),
    id: makeOpdrachtgeverId(rnd),
  };
}

export function getCandidateNotes(candidateId: string): CandidateNote[] {
  const rnd = seedFromId(candidateId + "notes");
  const n = rint(rnd, 1, 4);
  const samples = [
    "Wil eerst kennismaken voor commitment.",
    "Liever rol dichter bij huis (max 30 min).",
    "Verwacht salarisindicatie voor volgende stap.",
    "Heeft ervaring met hydrauliek, sterke fit.",
    "Reageerde positief op pitch, vervolg gepland.",
    "Niet bereikbaar deze week, opvolgen maandag.",
  ];
  return Array.from({ length: n }, (_, i) => ({
    id: `${candidateId}-note-${i}`,
    author: pick(rnd, ["Jij", "Eelkje de Boer", "Edo de Boer"]),
    date: fullDate(rnd),
    time: hhmm(rnd),
    body: pick(rnd, samples),
  }));
}

export function getCandidateActivity(candidateId: string): ActivityItem[] {
  const rnd = seedFromId(candidateId + "act");
  const total = rint(rnd, 6, 14);
  const subjects = [
    "Allround werkplaats-/servicemonteur met ervaring",
    "FW: Ervaren servicemonteur — meer dan 30 jaar ervaring",
    "Technisch Project Manager | HBO | 40 jaar",
    "Ervaren technicus beschikbaar | MBO + MTS",
    "Service Monteur | MBO-3 Gas, water en warmte",
  ];
  const callSubjects = [
    "Telefonische intake",
    "Opvolging beschikbaarheid",
    "Pitch nieuwe rol",
    "Salaris- en voorwaarden bespreken",
    "Status update kandidaat",
    "No-show navragen",
    "Terugkoppeling klantgesprek",
    "Bevestiging startdatum",
  ];
  return Array.from({ length: total }, (_, i) => {
    const kindR = rnd();
    const kind: ActivityItem["kind"] = kindR < 0.5 ? "email" : kindR < 0.85 ? "call" : "note";
    const callId = kind === "call" ? String(rint(rnd, 100000, 999999)) : undefined;
    return {
      id: `${candidateId}-act-${i}`,
      kind,
      direction: rnd() < 0.6 ? "out" : "in",
      contact: pick(rnd, CONTACT_PEOPLE),
      contactStatus: pick(rnd, CONTACT_STATUSES),
      subject: kind === "call" ? pick(rnd, callSubjects) : kind === "email" ? pick(rnd, subjects) : undefined,
      duration: kind === "call" ? hms(rnd) : undefined,
      body: kind === "note"
        ? pick(rnd, ["Kort gesprek, follow-up gepland.", "Klant wil tweede gesprek inplannen."])
        : kind === "email"
          ? pick(rnd, EMAIL_BODIES)
          : undefined,
      date: fullDate(rnd),
      time: hhmm(rnd),
      dealRef: rnd() < 0.6 ? makeDealId(rnd) : undefined,
      callId,
      transcript: kind === "call" ? buildTranscript(rnd) : undefined,
    };
  });
}


export function getCandidateDealLinks(candidateId: string, dealsCount: number, consultantId?: number): CandidateDealLink[] {
  const rnd = seedFromId(candidateId + "deals");
  const n = Math.max(1, Math.min(dealsCount + 2, 8));
  const opdrachtgever = consultantId ? getConsultantOpdrachtgever(consultantId) : getCandidateOpdrachtgever(candidateId);
  return Array.from({ length: n }, (_, i) => {
    const role = pick(rnd, ROLES);
    return {
      dealName: `Kandidaat ${candidateId} - ${opdrachtgever.name} - ${role}`,
      dealId: makeDealId(rnd),
      dealStatus: pick(rnd, LCB_DEAL_STAGES),
      candidateName: "—",
      candidateId,
      opdrachtgeverName: opdrachtgever.name,
      opdrachtgeverId: opdrachtgever.id,
      proposed: rnd() < 0.6,
      date: fullDate(rnd),
      time: hhmm(rnd),
    };
  });
}

// ─── Deal detail: notes, tasks, meetings ──────────────────────────────
export interface DealNote { id: string; author: string; date: string; time: string; body: string }
export interface DealTask { id: string; title: string; done: boolean; due: string }
export interface DealMeeting { id: string; title: string; date: string; time: string; with: string }

export function getDealNotes(dealId: string): DealNote[] {
  const rnd = seedFromId(dealId + "n");
  return Array.from({ length: rint(rnd, 1, 4) }, (_, i) => ({
    id: `${dealId}-n-${i}`,
    author: pick(rnd, ["Jij", "Eelkje de Boer"]),
    date: fullDate(rnd),
    time: hhmm(rnd),
    body: pick(rnd, [
      "Opdrachtgever vroeg om referenties.",
      "Tweede gesprek gepland, kandidaat enthousiast.",
      "Tarief onderhandeling loopt, akkoord verwacht.",
      "Wacht op feedback na vervolggesprek.",
    ]),
  }));
}
export function getDealTasks(dealId: string): DealTask[] {
  const rnd = seedFromId(dealId + "t");
  return Array.from({ length: rint(rnd, 1, 3) }, (_, i) => ({
    id: `${dealId}-t-${i}`,
    title: pick(rnd, ["Bel opdrachtgever voor terugkoppeling", "Stuur contract concept", "Plan vervolggesprek", "Verstuur CV"]),
    done: rnd() < 0.4,
    due: `${ddmm(rnd)} ${hhmm(rnd)}`,
  }));
}
export function getDealMeetings(dealId: string): DealMeeting[] {
  const rnd = seedFromId(dealId + "m");
  return Array.from({ length: rint(rnd, 0, 3) }, (_, i) => ({
    id: `${dealId}-m-${i}`,
    title: pick(rnd, ["Intake gesprek", "Vervolggesprek", "Onderhandeling", "Contract bespreking"]),
    date: fullDate(rnd),
    time: hhmm(rnd),
    with: pick(rnd, CONTACT_PEOPLE),
  }));
}
export function getDealActivity(dealId: string): ActivityItem[] {
  const rnd = seedFromId(dealId + "a");
  return Array.from({ length: rint(rnd, 3, 8) }, (_, i) => {
    const kind: ActivityItem["kind"] = rnd() < 0.55 ? "email" : "call";
    const callId = kind === "call" ? String(rint(rnd, 100000, 999999)) : undefined;
    return {
      id: `${dealId}-a-${i}`,
      kind,
      direction: rnd() < 0.55 ? "out" : "in",
      contact: pick(rnd, CONTACT_PEOPLE),
      contactStatus: pick(rnd, CONTACT_STATUSES),
      subject: kind === "email" ? pick(rnd, ["Voorstel kandidaat", "Reminder voorstel", "Bevestiging intake", "Update procedure"]) : undefined,
      duration: kind === "call" ? hms(rnd) : undefined,
      body: kind === "email" ? pick(rnd, EMAIL_BODIES) : undefined,
      date: fullDate(rnd),
      time: hhmm(rnd),
      dealRef: dealId,
      callId,
      transcript: kind === "call" ? buildTranscript(rnd) : undefined,
    };
  });
}

// ─── Mock bodies & transcripts ───────────────────────────────────────
const EMAIL_BODIES = [
  "Beste,\n\nBedankt voor het snelle contact. Zoals besproken stuur ik bij deze het CV en de motivatie van de kandidaat. Laat het me weten als er nog aanvullende informatie nodig is voor de volgende stap.\n\nMet vriendelijke groet",
  "Hi,\n\nIn navolging op ons telefoongesprek hierbij een korte samenvatting van de afspraken: kandidaat is beschikbaar per de eerste van de maand, bruto maandsalaris in lijn met functieprofiel, en gesprek graag uiterlijk komende week.\n\nGroet",
  "Beste,\n\nKun je een terugkoppeling geven op het laatste voorstel? Kandidaat heeft inmiddels een tweede gesprek elders staan en wil graag weten of jullie verder gaan in de procedure.\n\nDank!",
  "Hoi,\n\nKleine update: contract is verstuurd, kandidaat heeft bevestigd dat de startdatum haalbaar is. Ik plan een korte check-in voor de eerste werkweek.\n\nGroet",
];

const CONSULTANT_POOL = [
  "Robin van Bruggen", "Eelkje de Boer", "Edo de Boer", "Joey de Vries",
  "Marco Schaap", "Senna Ekkers", "Rick Karssen", "Tom Kolkman",
];

const UTTERANCES_GREETING_RECEIVER = [
  (other: string, self: string) => `${other}. Hey ${other.split(" ")[0]}, goedemorgen, met ${self} van Synsel Techniek.`,
  (other: string, self: string) => `Goedemiddag, je spreekt met ${self}.`,
  (_o: string, self: string) => `Met ${self}, goedemiddag.`,
];
const UTTERANCES_GREETING_CALLER = [
  () => "Hey.",
  () => "Hoi, goedemorgen.",
  () => "Ja, hallo.",
];
const UTTERANCES_SMALL = [
  "Ja, zeker. Met jou ook?",
  "Goeiedag. Alles goed?",
  "Ja prima, druk weekje weer.",
  "Ja hoor, met mij ook goed.",
];
const UTTERANCES_BODY = [
  "Even over het voorstel dat we vorige week stuurden — heb je daar al naar kunnen kijken?",
  "Jullie hadden een voorstel gedaan waar ik op had gereageerd. Ben je daar nog uitgekomen?",
  "Ik bel even kort over de openstaande functie waar we eerder over mailden.",
  "Klopt, ik ben zeker geïnteresseerd. Wat is de volgende stap?",
  "Ja, in juli gaan we over.",
  "Oké, dat is ook al geregeld. Heb je dat al kort doorgegeven of nog niet?",
  "Volgens mij had ik dat al kort doorgegeven, maar ik bel net op werk, dus ik bel even voor de zekerheid.",
  "We willen graag een eerste kennismaking inplannen, kan je deze week?",
  "Donderdag of vrijdag werkt voor mij.",
  "Oké, dus per 1 juli wordt die overgenomen zoals we hebben afgesproken met de vier?",
  "Klopt. Ik geef het hier nog even door als dat nog niet bekend is.",
];
const UTTERANCES_SHORT = ["Ja.", "Ja?", "Oké.", "Klopt.", "Duidelijk."];
const UTTERANCES_CLOSE_RECEIVER = [
  "Top, dan stuur ik vandaag nog een uitnodiging. Bedankt voor je tijd!",
  "Helemaal goed, dan hoor ik het wel. Fijne dag verder.",
  "Oké, super. Bedankt voor het bellen. Tot ziens.",
];
const UTTERANCES_CLOSE_CALLER = [
  "Ah, oké, top. Helemaal goed. Is goed, dankjewel. Tot ziens.",
  "Goed, dankjewel. Doei.",
  "Prima, tot dan!",
];

function fmtSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function buildTranscript(rnd: () => number, contact: string): TranscriptLine[] {
  const consultant = pick(rnd, CONSULTANT_POOL);
  // Inbound call: contact calls in → contact is Beller, consultant is Ontvanger.
  // Outbound: consultant is Beller. We pick at random per build for variation.
  const consultantIsReceiver = rnd() < 0.6;
  const receiver = consultantIsReceiver ? consultant : contact;
  const caller = consultantIsReceiver ? contact : consultant;

  const lines: TranscriptLine[] = [];
  let t = 0;
  const push = (role: "Ontvanger" | "Beller", text: string) => {
    lines.push({
      t: fmtSec(t),
      speaker: role === "Ontvanger" ? receiver : caller,
      role,
      text,
    });
    t += rint(rnd, 1, 8);
  };

  push("Ontvanger", pick(rnd, UTTERANCES_GREETING_RECEIVER)(caller, receiver));
  push("Beller", pick(rnd, UTTERANCES_GREETING_CALLER)());
  push("Ontvanger", pick(rnd, UTTERANCES_SMALL));
  push("Beller", pick(rnd, UTTERANCES_SMALL));

  const bodyTurns = rint(rnd, 4, 8);
  for (let i = 0; i < bodyTurns; i++) {
    const role: "Ontvanger" | "Beller" = i % 2 === 0 ? "Ontvanger" : "Beller";
    const text = rnd() < 0.25 ? pick(rnd, UTTERANCES_SHORT) : pick(rnd, UTTERANCES_BODY);
    push(role, text);
  }

  push("Ontvanger", pick(rnd, UTTERANCES_CLOSE_RECEIVER));
  push("Beller", pick(rnd, UTTERANCES_CLOSE_CALLER));

  return lines;
}

export function formatCallLinkLabel(callId: string): string {
  return `link to call [${callId}]`;
}

// ─── End-stage helper ─────────────────────────────────────────────────
const END_STAGE_PREFIXES = ["4.", "5 ", "6 ", "Overgenomen", "Detacheringstermijn"];
const END_STAGE_LITERAL = new Set<string>([
  "Won", "Lost", "Niet begonnen",
  "Afgewezen na telefonisch voorstellen", "Afgewezen na voorstelmail",
  "Afgevallen tijdens detacheringsperiode", "Kandidaat teruggetrokken",
  "Na sollicitatiegesprek heeft KDD geen interesse",
  "Na sollicitatiegesprek is KDD afgewezen",
]);
export function isEndStage(stage: string): boolean {
  if (END_STAGE_LITERAL.has(stage)) return true;
  return END_STAGE_PREFIXES.some((p) => stage.startsWith(p));
}
export function isGeplaatstStage(stage: string): boolean {
  return stage === "Won" || stage.startsWith("4.") || stage.startsWith("5 ") || stage.startsWith("6 ") || stage.startsWith("Overgenomen");
}

// ─── Evidence (AI step checks) ───────────────────────────────────────
export interface DealEvidence {
  hasMatch: boolean;
  hasOwnerMailProof: boolean;
  hasOwnerCallProof: boolean;
  intakeMeeting?: DealMeeting;
  sollicitatieMeeting?: DealMeeting;
  vervolgMeeting?: DealMeeting;
  isGeplaatst: boolean;
  lastMail?: ActivityItem;
  lastCall?: ActivityItem;
  lopendeZaakStale?: boolean;
}
export function getDealEvidence(deal: DealRow): DealEvidence {
  const meetings = getDealMeetings(deal.dealId);
  const activity = getDealActivity(deal.dealId);
  const mails = activity.filter((a) => a.kind === "email");
  const calls = activity.filter((a) => a.kind === "call");
  const hasOwnerMailProof = mails.some((m) => m.direction === "out");
  const hasOwnerCallProof = calls.some((m) => m.direction === "out");
  const intakeMeeting = meetings.find((m) => /intake/i.test(m.title));
  const sollicitatieMeeting = meetings.find((m) => /sollicitatie/i.test(m.title));
  const vervolgMeeting = meetings.find((m) => /vervolg/i.test(m.title));
  const isGeplaatst = isGeplaatstStage(deal.dealStatus);
  const lopendeZaakStale = deal.dealStatus === "2.3 | Lopende zaak"
    ? !activity.some((a) => /2026/.test(a.date)) // crude staleness check
    : undefined;
  return {
    hasMatch: !!deal.candidateId && !!deal.opdrachtgeverId,
    hasOwnerMailProof, hasOwnerCallProof,
    intakeMeeting, sollicitatieMeeting, vervolgMeeting,
    isGeplaatst,
    lastMail: mails[0], lastCall: calls[0],
    lopendeZaakStale,
  };
}

export interface CandidateEvidence {
  approached: { viaMail: boolean; viaCall: boolean; success: boolean };
  matched: { matched: boolean; dealCount: number };
  endStage: { notEndStage: number; total: number };
  intakeDone: boolean;
}
export function getCandidateEvidence(candidateId: string, dealsCount: number): CandidateEvidence {
  const activity = getCandidateActivity(candidateId);
  const dealLinks = getCandidateDealLinks(candidateId, dealsCount);
  const mails = activity.filter((a) => a.kind === "email" && a.direction === "out");
  const calls = activity.filter((a) => a.kind === "call" && a.direction === "out");
  const success = activity.some((a) => a.direction === "in" || a.contactStatus === "In dienst");
  const total = dealLinks.length;
  const notEnd = dealLinks.filter((d) => !isEndStage(d.dealStatus)).length;
  const intakeDone = dealLinks.length > 0 && activity.some((a) => a.kind === "call" && /intake/i.test(a.subject ?? ""));
  return {
    approached: { viaMail: mails.length > 0, viaCall: calls.length > 0, success },
    matched: { matched: total > 0, dealCount: total },
    endStage: { notEndStage: notEnd, total },
    intakeDone,
  };
}


// ─── Performance perspective: financial consequences per consultant ────
export interface LcbFinancePerfRow {
  consultantId: number;
  consultantName: string;
  activeCandidates: number;
  activeMonthlyRevenue: number;
  soonToStart: number;
  soonToStartRevenue: number;
  expectedStoppers: number;
  stopperRiskRevenue: number;
  likelyExtensions: number;
  likelyExtensionRevenue: number;
  placementsYTD: number;
  avgMarginPerCandidate: number;
  netImpact: number;
  topOpdrachtgevers: string[];
  totalOpdrachtgevers: number;
}

export function buildFinancePerfRow(consultantId: number, consultantName: string): LcbFinancePerfRow {
  const rnd = mulberry32(consultantId * 7919 + 31);
  const active = rint(rnd, 2, 7);
  const activeRev = active * rint(rnd, 8, 16);
  const soon = rint(rnd, 0, 3);
  const soonRev = soon * rint(rnd, 8, 14);
  const stoppers = rint(rnd, 0, 4);
  const stopperRev = stoppers * rint(rnd, 4, 12);
  const likely = stoppers > 0 ? Math.floor(stoppers * rfloat(rnd, 0.3, 0.7)) : 0;
  const likelyRev = likely * rint(rnd, 4, 10);
  const placements = rint(rnd, 3, 18);
  const avgMargin = rint(rnd, 1800, 4200);
  const netImpact = activeRev + soonRev - stopperRev;
  const opdrachtgever = getConsultantOpdrachtgever(consultantId);
  return {
    consultantId, consultantName,
    activeCandidates: active, activeMonthlyRevenue: activeRev,
    soonToStart: soon, soonToStartRevenue: soonRev,
    expectedStoppers: stoppers, stopperRiskRevenue: stopperRev,
    likelyExtensions: likely, likelyExtensionRevenue: likelyRev,
    placementsYTD: placements, avgMarginPerCandidate: avgMargin,
    netImpact, topOpdrachtgevers: [opdrachtgever.name], totalOpdrachtgevers: 1,
  };
}

export const lcbFinancePerfRows: LcbFinancePerfRow[] = lcbTeam.map((c) =>
  buildFinancePerfRow(c.id, c.name),
);

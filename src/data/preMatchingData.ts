// Pre-Matching Engine — statische demo data
// 5 vaste funnelstappen; elke match heeft een verst bereikte stap.

export const FUNNEL_STEPS = [
  "Match gegenereerd",
  "Voorgesteld aan consultant",
  "Voorgesteld aan kandidaat",
  "Voorgesteld aan klant",
  "Plaatsing",
] as const;

export type FunnelStepIndex = 0 | 1 | 2 | 3 | 4;

export const CRM_STATUSSEN = [
  "Nieuw",
  "Verdelen",
  "Inschrijven",
  "Acquisitie",
  "In Procedure",
  "Geplaatst",
  "Niet Beschikbaar",
  "Niet Geplaatst",
  "Lead",
] as const;

export type CrmStatus = (typeof CRM_STATUSSEN)[number];

export interface PreMatch {
  id: string;
  vacatureId: string;
  candidateId: string;
  candidateName: string;
  matchScore: number; // 0-100
  reachedStep: FunnelStepIndex; // verst bereikte stap
  status: "doorgezet" | "afgevallen";
  crmStatus: CrmStatus; // kandidaatstatus in RecruitCRM
  dropReason?: string;
  date: Date; // datum match gegenereerd
}

export interface PreVacature {
  id: string;
  titel: string;
  klant: string;
  functiegroep: string;
  consultant: string;
  status: "actief" | "gesloten";
  geopend: Date;
}

export const CONSULTANTS = [
  "Sanne de Groot",
  "Rick van Dijk",
  "Melissa Peters",
  "Joost Bakker",
  "Fatima El Amrani",
  "Bram Hendriks",
  "Nina Vermeulen",
  "Daan Willems",
];

export const FUNCTIEGROEPEN = [
  "Verpleegkunde",
  "Techniek",
  "Logistiek",
  "Administratief",
  "Zorgondersteuning",
  "Facilitair",
];

export const KLANTEN = [
  "Zorggroep Noord",
  "Van Berkel Techniek",
  "MediCare Zuid",
  "Logistiek Centraal",
  "Stadsziekenhuis West",
  "Bouwgroep Rijnland",
  "Thuiszorg Vitaal",
  "Industrie Partners BV",
];

const TITELS: Record<string, string[]> = {
  Verpleegkunde: ["Verpleegkundige IC", "Wijkverpleegkundige", "OK-assistent", "Verpleegkundige SEH"],
  Techniek: ["Elektromonteur", "Onderhoudsmonteur", "Werkvoorbereider", "Servicetechnicus"],
  Logistiek: ["Orderpicker", "Heftruckchauffeur", "Teamleider magazijn"],
  Administratief: ["Administratief medewerker", "Planner", "Financieel medewerker"],
  Zorgondersteuning: ["Verzorgende IG", "Helpende zorg & welzijn", "Begeleider gehandicaptenzorg"],
  Facilitair: ["Facilitair medewerker", "Schoonmaakmedewerker", "Kok"],
};

const VOORNAMEN = ["Lisa", "Mark", "Anouk", "Tim", "Sara", "Peter", "Fenna", "Jeroen", "Iris", "Youssef", "Karin", "Bas", "Noor", "Dennis", "Esmee", "Ruben", "Layla", "Sven", "Maud", "Kevin"];
const ACHTERNAMEN = ["Jansen", "de Vries", "Bakker", "Visser", "Smit", "Meijer", "Mulder", "Bos", "Vos", "Peters", "Hendriks", "van Loon", "Willems", "Kramer", "de Wit"];

const DROP_REASONS = [
  "Kandidaat niet bereikbaar",
  "Kandidaat niet geïnteresseerd",
  "Beschikbaarheid komt niet overeen",
  "Reisafstand te groot",
  "Klant koos andere kandidaat",
  "Salarisindicatie te hoog",
  "Diploma/BIG niet passend",
  "Geen opvolging door consultant",
];

// Deterministische PRNG
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rng = makeRng(20260731);
const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

const TODAY = new Date(2026, 6, 31);
const daysAgo = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - n);

export const vacatures: PreVacature[] = Array.from({ length: 42 }, (_, i) => {
  const functiegroep = FUNCTIEGROEPEN[i % FUNCTIEGROEPEN.length];
  const titels = TITELS[functiegroep];
  return {
    id: `VAC-${1000 + i}`,
    titel: titels[i % titels.length],
    klant: KLANTEN[(i * 3 + 1) % KLANTEN.length],
    functiegroep,
    consultant: CONSULTANTS[(i * 5 + 2) % CONSULTANTS.length],
    status: rng() > 0.32 ? "actief" : "gesloten",
    geopend: daysAgo(randInt(15, 160)),
  };
});

// Per-consultant "skill" beïnvloedt de doorzetkans per stap
const consultantSkill: Record<string, number> = {};
CONSULTANTS.forEach((c, i) => {
  consultantSkill[c] = 0.72 + ((i * 7) % 5) * 0.06; // 0.72 - 0.96
});

function buildMatches(): PreMatch[] {
  const out: PreMatch[] = [];
  let n = 0;
  for (const vac of vacatures) {
    const count = randInt(8, 26);
    const skill = consultantSkill[vac.consultant];
    for (let i = 0; i < count; i++) {
      const matchScore = Math.min(99, Math.max(38, Math.round(55 + rng() * 45)));
      const scoreBoost = (matchScore - 60) / 200; // hogere score -> iets hogere kans
      const stepProb = [
        Math.min(0.95, 0.45 * skill + scoreBoost + 0.15),
        Math.min(0.92, 0.6 * skill + scoreBoost),
        Math.min(0.85, 0.5 * skill + scoreBoost),
        Math.min(0.7, 0.4 * skill + scoreBoost),
      ];
      let reached = 0 as FunnelStepIndex;
      for (let s = 0; s < 4; s++) {
        if (rng() < stepProb[s]) reached = (s + 1) as FunnelStepIndex;
        else break;
      }
      const isPlaced = reached === 4;
      // Bij niet-geplaatst: afgevallen of nog doorlopend (doorgezet)
      const afgevallen = !isPlaced && rng() < 0.72;
      const openStatus: CrmStatus[][] = [
        ["Nieuw", "Verdelen", "Lead"],
        ["Inschrijven"],
        ["Acquisitie"],
        ["In Procedure"],
      ];
      const crmStatus: CrmStatus = isPlaced
        ? "Geplaatst"
        : afgevallen
          ? pick<CrmStatus>(["Niet Beschikbaar", "Niet Geplaatst"])
          : pick<CrmStatus>(openStatus[reached]);
      out.push({
        id: `M-${n++}`,
        vacatureId: vac.id,
        candidateId: `CAND-${20000 + n}`,
        candidateName: `${pick(VOORNAMEN)} ${pick(ACHTERNAMEN)}`,
        matchScore,
        reachedStep: reached,
        status: afgevallen ? "afgevallen" : "doorgezet",
        crmStatus,
        dropReason: afgevallen ? pick(DROP_REASONS) : undefined,

        date: daysAgo(randInt(0, 120)),
      });
    }
  }
  return out;
}

export const matches: PreMatch[] = buildMatches();

// ---------- Filters ----------

export interface PreMatchingFilters {
  from?: Date;
  to?: Date;
  consultants: string[];
  functiegroepen: string[];
  klanten: string[];
  vacatureStatus: "alle" | "actief" | "gesloten";
}

export const emptyFilters: PreMatchingFilters = {
  consultants: [],
  functiegroepen: [],
  klanten: [],
  vacatureStatus: "alle",
};

export function filterVacatures(f: PreMatchingFilters): PreVacature[] {
  return vacatures.filter((v) => {
    if (f.vacatureStatus !== "alle" && v.status !== f.vacatureStatus) return false;
    if (f.consultants.length && !f.consultants.includes(v.consultant)) return false;
    if (f.functiegroepen.length && !f.functiegroepen.includes(v.functiegroep)) return false;
    if (f.klanten.length && !f.klanten.includes(v.klant)) return false;
    return true;
  });
}

export function filterMatches(f: PreMatchingFilters, vacs?: PreVacature[]): PreMatch[] {
  const allowed = new Set((vacs ?? filterVacatures(f)).map((v) => v.id));
  return matches.filter((m) => {
    if (!allowed.has(m.vacatureId)) return false;
    if (f.from && m.date < startOfDay(f.from)) return false;
    if (f.to && m.date > endOfDay(f.to)) return false;
    return true;
  });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// ---------- Aggregaties ----------

export interface FunnelAgg {
  step: string;
  count: number;
  conversion: number | null; // % t.o.v. vorige stap
  fromStart: number; // % t.o.v. stap 1
}

export function aggregateFunnel(ms: PreMatch[]): FunnelAgg[] {
  const counts = FUNNEL_STEPS.map((_, idx) => ms.filter((m) => m.reachedStep >= idx).length);
  return FUNNEL_STEPS.map((step, idx) => ({
    step,
    count: counts[idx],
    conversion: idx === 0 ? null : counts[idx - 1] > 0 ? (counts[idx] / counts[idx - 1]) * 100 : 0,
    fromStart: counts[0] > 0 ? (counts[idx] / counts[0]) * 100 : 0,
  }));
}

/** Gemiste kansen: matchscore > 80% die stap 2 (voorgesteld aan consultant) nooit bereikten. */
export function missedOpportunities(ms: PreMatch[]): PreMatch[] {
  return ms.filter((m) => m.matchScore > 80 && m.reachedStep < 1);
}

export interface VacatureRow {
  vacature: PreVacature;
  matches: number;
  plaatsingen: number;
  conversie: number; // % matches -> plaatsing
  gemisteKansen: number;
}

export function vacatureRows(f: PreMatchingFilters): VacatureRow[] {
  const vacs = filterVacatures(f);
  const ms = filterMatches(f, vacs);
  const byVac = new Map<string, PreMatch[]>();
  ms.forEach((m) => {
    const arr = byVac.get(m.vacatureId) ?? [];
    arr.push(m);
    byVac.set(m.vacatureId, arr);
  });
  return vacs.map((v) => {
    const list = byVac.get(v.id) ?? [];
    const plaatsingen = list.filter((m) => m.reachedStep === 4).length;
    return {
      vacature: v,
      matches: list.length,
      plaatsingen,
      conversie: list.length ? (plaatsingen / list.length) * 100 : 0,
      gemisteKansen: missedOpportunities(list).length,
    };
  });
}

export interface TrendPoint {
  week: string;
  s1: number; // conversie stap1->2
  s2: number;
  s3: number;
  s4: number;
  e2e: number; // match -> plaatsing
  matches: number;
}

function isoWeekKey(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `wk ${week}`;
}

export function trendByWeek(ms: PreMatch[]): TrendPoint[] {
  const groups = new Map<string, { order: number; list: PreMatch[] }>();
  ms.forEach((m) => {
    const key = isoWeekKey(m.date);
    const g = groups.get(key) ?? { order: m.date.getTime(), list: [] };
    g.order = Math.min(g.order, m.date.getTime());
    g.list.push(m);
    groups.set(key, g);
  });
  return Array.from(groups.entries())
    .sort((a, b) => a[1].order - b[1].order)
    .map(([week, g]) => {
      const f = aggregateFunnel(g.list);
      return {
        week,
        matches: f[0].count,
        s1: Math.round(f[1].conversion ?? 0),
        s2: Math.round(f[2].conversion ?? 0),
        s3: Math.round(f[3].conversion ?? 0),
        s4: Math.round(f[4].conversion ?? 0),
      };
    });
}

export interface ConsultantRow {
  consultant: string;
  matches: number;
  actieveVacatures: number;
  plaatsingen: number;
  steps: (number | null)[]; // conversie per stap (index 1..4)
}

export function consultantRows(f: PreMatchingFilters): ConsultantRow[] {
  const vacs = filterVacatures(f);
  const ms = filterMatches(f, vacs);
  const vacById = new Map(vacs.map((v) => [v.id, v]));
  const names = Array.from(new Set(vacs.map((v) => v.consultant))).sort();
  return names.map((name) => {
    const list = ms.filter((m) => vacById.get(m.vacatureId)?.consultant === name);
    const f2 = aggregateFunnel(list);
    return {
      consultant: name,
      matches: list.length,
      actieveVacatures: vacs.filter((v) => v.consultant === name && v.status === "actief").length,
      plaatsingen: list.filter((m) => m.reachedStep === 4).length,
      steps: [null, f2[1].conversion, f2[2].conversion, f2[3].conversion, f2[4].conversion],
    };
  });
}

export function teamFunnel(f: PreMatchingFilters): FunnelAgg[] {
  return aggregateFunnel(filterMatches(f));
}

export function rcrmCandidateProfileUrl(id: string) {
  return `https://app.recruitcrm.io/candidate/${id}`;
}

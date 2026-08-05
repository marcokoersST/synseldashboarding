// Statische demo data voor de Funnel KPI deep-dive (Reverse Matching Analytics).
// Deterministische generator zodat aantallen 1:1 matchen met reverseFunnelKpis.

export const REVERSE_FUNNEL_STEPS = [
  "Vacature opgepakt",
  "Kandidaat gematched",
  "Kandidaat doorgezet",
  "Voorgesteld bij bedrijf",
  "Op gesprek",
  "Geplaatst",
] as const;

export type ReverseStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** KPI key -> funnelstap-index */
export const KPI_STEP_INDEX: Record<string, ReverseStepIndex> = {
  vacatures: 0,
  matched: 1,
  doorgezet: 2,
  voorgesteld: 3,
  opGesprek: 4,
  geplaatst: 5,
};

export interface ReverseCandidate {
  id: string;
  candidateId: string;
  name: string;
  vacatureId: string;
  vacature: string;
  bedrijf: string;
  consultant: string;
  functiegroep: string;
  reachedStep: ReverseStepIndex; // verst bereikte stap (>=1 voor kandidaten)
  /** datum waarop stap i bereikt is (index 1..5), undefined als niet bereikt */
  stepDates: (Date | undefined)[];
  status: "doorlopend" | "afgevallen" | "geplaatst";
}

export interface ReverseVacature {
  id: string;
  titel: string;
  bedrijf: string;
  consultant: string;
  functiegroep: string;
  geopend: Date;
}

const FIRST = ["Jasper","Lotte","Daan","Sanne","Tim","Eva","Mark","Iris","Ruben","Noa","Bas","Fleur","Sven","Lieke","Joris","Marit","Pim","Anouk","Wout","Britt","Roel","Esther","Tom","Maud","Niels","Sophie","Koen","Janneke","Stijn","Mila","Bram","Lara","Gijs","Yara","Mees","Roos","Cas","Tess","Luuk","Demi","Finn","Sara","Jens","Nina","Thijs","Femke","Jelle","Maaike","Hugo","Anne"];
const LAST = ["de Vries","Jansen","van den Berg","Bakker","Visser","Smit","Meijer","de Boer","Mulder","de Groot","Bos","Vos","Peters","Hendriks","van Dijk","Dekker","Brouwer","de Wit","Dijkstra","Kuipers","Willems","Verhoeven","Maas","Bosman","Koning"];

export const BEDRIJVEN = [
  "ABN AMRO","Bol.com","Coolblue","ING","KPN","Rabobank","Adyen","Picnic",
  "Philips","Booking.com","NS","Achmea","Aegon","Vodafone",
];

const TITELS: Record<string, string[]> = {
  IT: ["Senior Java Developer", "Cloud Architect", "Data Engineer", "DevOps Engineer", "Full-stack Developer", "React Lead", "Test Automation Engineer"],
  Agile: ["Scrum Master", "Product Owner", "Business Analyst", "Project Manager"],
  Security: ["Security Specialist", "Network Engineer"],
  ERP: ["SAP Consultant", "Functioneel Beheerder"],
};
export const FUNCTIEGROEPEN = Object.keys(TITELS);

export const CONSULTANTS = [
  "Pieter de Wit","Mariska Bos","Hendrik van Loon","Lisa Kramer","Tom de Bruin",
  "Sanne Hofman","Bart Meijer","Eline Vos","Ruben Smit","Femke de Lange",
];

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rng = makeRng(770425);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];
const randInt = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1));

export const TODAY = new Date(2026, 7, 5);
const daysAgo = (n: number) =>
  new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - n);

// ---------- Vacatures (174, komt overeen met KPI "Vacatures opgepakt") ----------
export const reverseVacatures: ReverseVacature[] = Array.from({ length: 174 }, (_, i) => {
  const fg = FUNCTIEGROEPEN[i % FUNCTIEGROEPEN.length];
  const titels = TITELS[fg];
  return {
    id: `VAC-${3000 + i}`,
    titel: titels[i % titels.length],
    bedrijf: BEDRIJVEN[(i * 5 + 3) % BEDRIJVEN.length],
    consultant: CONSULTANTS[(i * 7 + 2) % CONSULTANTS.length],
    functiegroep: fg,
    geopend: daysAgo(randInt(1, 120)),
  };
});

// Doelaantallen per stap (index 1..5) — sluit aan op reverseFunnelKpis.
const STEP_TARGETS = [2104, 488, 286, 124, 38];

function buildCandidates(): ReverseCandidate[] {
  const total = STEP_TARGETS[0];
  // Verdeel verst-bereikte-stap zodat cumulatieve aantallen exact kloppen.
  const reachedCounts = [
    STEP_TARGETS[0] - STEP_TARGETS[1],
    STEP_TARGETS[1] - STEP_TARGETS[2],
    STEP_TARGETS[2] - STEP_TARGETS[3],
    STEP_TARGETS[3] - STEP_TARGETS[4],
    STEP_TARGETS[4],
  ]; // aantal met reachedStep = 1,2,3,4,5

  const pool: ReverseStepIndex[] = [];
  reachedCounts.forEach((n, idx) => {
    for (let i = 0; i < n; i++) pool.push((idx + 1) as ReverseStepIndex);
  });
  // deterministische shuffle
  for (let i = pool.length - 1 > 0 ? pool.length - 1 : 0; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const out: ReverseCandidate[] = [];
  for (let i = 0; i < total; i++) {
    const vac = reverseVacatures[i % reverseVacatures.length];
    const reached = pool[i];
    const startDaysAgo = randInt(0, 118);
    const stepDates: (Date | undefined)[] = [undefined, undefined, undefined, undefined, undefined, undefined];
    let cursor = startDaysAgo;
    for (let s = 1; s <= reached; s++) {
      stepDates[s] = daysAgo(Math.max(0, cursor));
      cursor -= randInt(1, 6);
    }
    const isPlaced = reached === 5;
    const afgevallen = !isPlaced && rng() < 0.62;
    out.push({
      id: `RM-${i}`,
      candidateId: `CAND-${41000 + i}`,
      name: `${pick(FIRST)} ${pick(LAST)}`,
      vacatureId: vac.id,
      vacature: vac.titel,
      bedrijf: vac.bedrijf,
      consultant: vac.consultant,
      functiegroep: vac.functiegroep,
      reachedStep: reached,
      stepDates,
      status: isPlaced ? "geplaatst" : afgevallen ? "afgevallen" : "doorlopend",
    });
  }
  return out;
}

export const reverseCandidates: ReverseCandidate[] = buildCandidates();

// ---------- Filters ----------

export interface DeepDiveFilters {
  from?: Date;
  to?: Date;
  consultants: string[];
  bedrijven: string[];
  vacatures: string[]; // titels
}

export const emptyDeepDiveFilters: DeepDiveFilters = {
  consultants: [],
  bedrijven: [],
  vacatures: [],
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function matchDims(
  f: DeepDiveFilters,
  x: { consultant: string; bedrijf: string; vacature?: string; titel?: string }
) {
  if (f.consultants.length && !f.consultants.includes(x.consultant)) return false;
  if (f.bedrijven.length && !f.bedrijven.includes(x.bedrijf)) return false;
  const titel = x.vacature ?? x.titel ?? "";
  if (f.vacatures.length && !f.vacatures.includes(titel)) return false;
  return true;
}

/** Kandidaten die stap `step` (1..5) bereikt hebben, gefilterd op dimensies + datum van die stap. */
export function candidatesAtStep(step: ReverseStepIndex, f: DeepDiveFilters): ReverseCandidate[] {
  return reverseCandidates.filter((c) => {
    if (c.reachedStep < step) return false;
    if (!matchDims(f, c)) return false;
    const d = c.stepDates[step];
    if (f.from && (!d || d < startOfDay(f.from))) return false;
    if (f.to && (!d || d > endOfDay(f.to))) return false;
    return true;
  });
}

/** Vacatures voor stap 0 ("Vacatures opgepakt"). */
export function vacaturesAtStep(f: DeepDiveFilters): ReverseVacature[] {
  return reverseVacatures.filter((v) => {
    if (!matchDims(f, v)) return false;
    if (f.from && v.geopend < startOfDay(f.from)) return false;
    if (f.to && v.geopend > endOfDay(f.to)) return false;
    return true;
  });
}

export function matchesPerVacature(vacatureId: string) {
  const list = reverseCandidates.filter((c) => c.vacatureId === vacatureId);
  const furthest = list.reduce<ReverseStepIndex>((m, c) => (c.reachedStep > m ? c.reachedStep : m), 1);
  return { count: list.length, furthest: list.length ? furthest : (0 as ReverseStepIndex) };
}

export interface StepDistributionRow {
  step: string;
  index: ReverseStepIndex;
  count: number;
  share: number;
}

/** Verdeling van verst bereikte stap binnen een set kandidaten. */
export function stepDistribution(list: ReverseCandidate[]): StepDistributionRow[] {
  const total = list.length || 1;
  return ([1, 2, 3, 4, 5] as ReverseStepIndex[]).map((idx) => {
    const count = list.filter((c) => c.reachedStep === idx).length;
    return { step: REVERSE_FUNNEL_STEPS[idx], index: idx, count, share: (count / total) * 100 };
  });
}

export const vacatureTitelOptions = Array.from(new Set(reverseVacatures.map((v) => v.titel))).sort();

export function rcrmCandidateUrl(id: string) {
  return `https://app.recruitcrm.io/candidate/${id}`;
}
export function synselCandidateUrl(id: string) {
  return `https://ai.synsel.nl/kandidaat/${id}`;
}

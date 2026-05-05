// Funnel Operations Dashboard — deterministic mock data
// Single source of truth for all 7 tabs. Read-only.

export type Tier = "85+" | "70-85" | "50-70" | "30-50" | "0-30";
export type CandidateStatus =
  | "nieuw"
  | "toegewezen"
  | "in_te_schrijven"
  | "ingeschreven"
  | "geplaatst"
  | "afgesloten";
export type CandidateType = "nieuw" | "bestaand";
export type BusinessUnit = "Industrie" | "Installatietechniek" | "Utiliteit" | "Maritiem";
export type SourceTopLevel =
  | "paid_jobboard"
  | "organic_jobboard"
  | "paid_social"
  | "organic_social"
  | "reactivation"
  | "direct"
  | "cv_database"
  | "recruiter";

export const SOURCE_LABELS: Record<SourceTopLevel, string> = {
  paid_jobboard: "Jobboards paid",
  organic_jobboard: "Jobboards organic",
  paid_social: "Paid social",
  organic_social: "Organic social",
  reactivation: "Reactivation",
  direct: "Direct",
  cv_database: "CV databases",
  recruiter: "LinkedIn recruiter",
};

export interface Recruiter { id: string; naam: string; }
export interface Consultant { id: string; naam: string; }

export interface Candidate {
  id: string;
  naam: string;
  type: CandidateType;
  score: number;
  tier: Tier;
  unit: BusinessUnit;
  functiegroep: string;
  bron: SourceTopLevel;
  subBron: string;
  status: CandidateStatus;
  recruiterId: string;
  consultantId: string | null;
  toegewezenOp: number;        // ms timestamp
  eersteContactOp: number | null;
  eersteGesprekOp: number | null;
  ingeschrevenOp: number | null;
}

export interface CallAttempt {
  candidateId: string;
  recruiterId: string;
  dagdeel: "ochtend" | "middag" | "avond";
  dagOffset: 1 | 2;
  uitgevoerd: boolean;
  succesvol: boolean;
  whatsapp: boolean;
  voicemail: boolean;
}

// ---------- SLA matrix ----------
export const SLA_MATRIX: Record<Tier, { toewijzenH: number; contactH: number; gesprekH: number }> = {
  "85+":  { toewijzenH: 1, contactH: 2, gesprekH: 24 },
  "70-85": { toewijzenH: 4, contactH: 8, gesprekH: 48 },
  "50-70": { toewijzenH: 24, contactH: 48, gesprekH: 24 * 5 },
  "30-50": { toewijzenH: 24 * 3, contactH: 24 * 5, gesprekH: 24 * 10 },
  "0-30":  { toewijzenH: 24 * 7, contactH: 24 * 10, gesprekH: 24 * 14 },
};

export const TIER_COLOR: Record<Tier, string> = {
  "85+":   "hsl(var(--destructive))",
  "70-85": "hsl(25 90% 55%)",
  "50-70": "hsl(210 80% 55%)",
  "30-50": "hsl(var(--success))",
  "0-30":  "hsl(var(--muted-foreground))",
};

// ---------- Deterministic PRNG ----------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(1729);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const weighted = <T,>(items: readonly { v: T; w: number }[]): T => {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = rng() * total;
  for (const it of items) { r -= it.w; if (r <= 0) return it.v; }
  return items[items.length - 1].v;
};

// ---------- Reference data ----------
const FIRST_NAMES = ["Jan","Pieter","Daan","Lars","Sven","Bas","Ruben","Tim","Tom","Niels","Jelle","Mark","Kevin","Robin","Joris","Wouter","Stef","Maarten","Erik","Roy","Sanne","Lotte","Emma","Eva","Anne","Lisa","Iris","Noa","Femke","Romy","Yara","Mila","Lars","Floor","Roos","Sara","Julia","Loes","Britt","Maud"];
const LAST_NAMES = ["de Vries","Jansen","Bakker","Visser","Smit","Mulder","Bos","Peters","Hendriks","Dekker","van Dijk","Vermeer","de Boer","Kok","Brouwer","Meijer","de Jong","de Wit","Hoekstra","Koster","Willems","van Beek","Maas","Verhoeven","Prins","Huisman","Veenstra","Postma","Kuipers","de Graaf"];
const FUNCTIEGROEPEN = ["Operator","Monteur","Engineer","Werkvoorbereider","Servicemonteur","Lasser","Elektromonteur","Pijpfitter","Projectleider","Tekenaar"];
const UNITS: BusinessUnit[] = ["Industrie","Installatietechniek","Utiliteit","Maritiem"];

const naamGen = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

// ---------- Recruiters & consultants ----------
export const recruiters: Recruiter[] = Array.from({ length: 30 }, (_, i) => ({
  id: `r${1000 + i}`, naam: naamGen(),
}));
export const consultants: Consultant[] = Array.from({ length: 25 }, (_, i) => ({
  id: `c${2000 + i}`, naam: naamGen(),
}));

// ---------- Candidates (5000) ----------
const SCORE_DIST: { v: Tier; w: number }[] = [
  { v: "0-30", w: 5 }, { v: "30-50", w: 15 }, { v: "50-70", w: 30 }, { v: "70-85", w: 35 }, { v: "85+", w: 15 },
];
const SOURCE_DIST: { v: SourceTopLevel; w: number }[] = [
  { v: "paid_jobboard", w: 18 },
  { v: "organic_jobboard", w: 12 },
  { v: "paid_social", w: 14 },
  { v: "organic_social", w: 8 },
  { v: "reactivation", w: 20 },
  { v: "direct", w: 6 },
  { v: "cv_database", w: 14 },
  { v: "recruiter", w: 8 },
];
const SUB_BRONNEN: Record<SourceTopLevel, string[]> = {
  paid_jobboard: ["Indeed Sponsored","Monsterboard Premium","Nationale Vacaturebank Promo"],
  organic_jobboard: ["Indeed Free","Werkzoeken.nl","Jobbird"],
  paid_social: ["Meta Ads","TikTok Ads","LinkedIn Ads"],
  organic_social: ["LinkedIn Post","Instagram Post","Facebook Post"],
  reactivation: ["App push","Mail campagne Q1","Mail campagne Q2"],
  direct: ["Direct mail","Direct telefoon"],
  cv_database: ["Indeed CV","Monsterboard CV","Jobbird CV"],
  recruiter: ["LinkedIn Recruiter","Sales Navigator","Inmail"],
};

function tierToScore(t: Tier): number {
  switch (t) {
    case "85+": return 90 + Math.floor(rng() * 11);
    case "70-85":  return 75 + Math.floor(rng() * 15);
    case "50-70":  return 55 + Math.floor(rng() * 20);
    case "30-50":  return 35 + Math.floor(rng() * 20);
    case "0-30":  return Math.floor(rng() * 35);
  }
}

export const NOW = Date.UTC(2026, 4, 4, 9, 0, 0); // 2026-05-04 09:00 UTC (matches "Today" in app)
export const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

function genCandidate(i: number): Candidate {
  const tier = weighted(SCORE_DIST);
  const score = tierToScore(tier);
  const type: CandidateType = rng() < 0.6 ? "nieuw" : "bestaand";
  const unit = pick(UNITS);
  const functiegroep = pick(FUNCTIEGROEPEN);
  const bron: SourceTopLevel = type === "bestaand" && rng() < 0.55 ? "reactivation" : weighted(SOURCE_DIST);
  const subBron = pick(SUB_BRONNEN[bron]);
  const recruiter = pick(recruiters);

  // Spread evenly over ~4 weeks (28 days) so weekly volume stays vergelijkbaar
  const ageHours = rng() * 28 * 24;
  const toegewezenOp = NOW - ageHours * HOUR;

  // Status progression
  let status: CandidateStatus = "toegewezen";
  let eersteContactOp: number | null = null;
  let eersteGesprekOp: number | null = null;
  let ingeschrevenOp: number | null = null;
  let consultantId: string | null = null;

  const sla = SLA_MATRIX[tier];
  // ~78% get contacted within SLA (varies by tier)
  const contactBaseRate = tier === "85+" ? 0.65 : tier === "70-85" ? 0.78 : tier === "50-70" ? 0.82 : 0.85;
  if (rng() < contactBaseRate * 0.95) {
    const overshoot = rng() < 0.7 ? rng() * sla.contactH : sla.contactH * (1 + rng() * 1.5);
    eersteContactOp = toegewezenOp + overshoot * HOUR;
    if (eersteContactOp > NOW) eersteContactOp = null;
    if (eersteContactOp) status = "in_te_schrijven";
  }
  if (eersteContactOp && rng() < 0.7) {
    const overshoot = rng() * sla.gesprekH;
    eersteGesprekOp = eersteContactOp + overshoot * HOUR;
    if (eersteGesprekOp > NOW) eersteGesprekOp = null;
  }
  if (eersteGesprekOp && rng() < 0.55) {
    ingeschrevenOp = eersteGesprekOp + rng() * 2 * DAY;
    if (ingeschrevenOp > NOW) ingeschrevenOp = null;
    if (ingeschrevenOp) {
      status = "ingeschreven";
      consultantId = pick(consultants).id;
      if (rng() < 0.18) status = "geplaatst";
    }
  }

  return {
    id: `k${10000 + i}`,
    naam: naamGen(),
    type, score, tier, unit, functiegroep, bron, subBron,
    status, recruiterId: recruiter.id, consultantId,
    toegewezenOp, eersteContactOp, eersteGesprekOp, ingeschrevenOp,
  };
}

export const candidates: Candidate[] = Array.from({ length: 2740 }, (_, i) => genCandidate(i));

// ---------- Call attempts: ~70% complete 6/6 ----------
const DAG_DELEN: ("ochtend" | "middag" | "avond")[] = ["ochtend", "middag", "avond"];

export const callAttempts: CallAttempt[] = (() => {
  const out: CallAttempt[] = [];
  for (const c of candidates) {
    if (c.status === "nieuw") continue;
    const fullSix = rng() < 0.70;
    const partial = fullSix ? 6 : Math.floor(rng() * 6); // 0-5
    let count = 0;
    for (const dagOffset of [1, 2] as const) {
      for (const dagdeel of DAG_DELEN) {
        const uitgevoerd = count < partial;
        const succesvol = uitgevoerd && rng() < 0.35;
        const isFirst = dagOffset === 1 && dagdeel === "ochtend";
        out.push({
          candidateId: c.id,
          recruiterId: c.recruiterId,
          dagdeel, dagOffset, uitgevoerd, succesvol,
          whatsapp: isFirst && uitgevoerd && rng() < 0.6,
          voicemail: isFirst && uitgevoerd && !succesvol && rng() < 0.5,
        });
        count++;
      }
    }
  }
  return out;
})();

// ---------- Helpers ----------
export const recruiterById = (id: string) => recruiters.find(r => r.id === id);
export const consultantById = (id: string | null) => id ? consultants.find(c => c.id === id) : undefined;

export function rcrmCandidateUrl(id: string) { return `https://app.recruitcrm.io/candidates/${id}`; }
export function rcrmUserUrl(id: string) { return `https://app.recruitcrm.io/users/${id}`; }

export type SLAStatus = "binnen" | "dreigend" | "verlopen" | "n/a";

export interface SLAState {
  status: SLAStatus;
  label: string;        // e.g. "nog 23 min" or "verlopen 1u 14m"
  pctElapsed: number;   // 0..>1
}

function fmtDuration(ms: number) {
  const m = Math.round(Math.abs(ms) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); const mm = m % 60;
  if (h < 24) return mm ? `${h}u ${mm}m` : `${h}u`;
  const d = Math.floor(h / 24); const hh = h % 24;
  return hh ? `${d}d ${hh}u` : `${d}d`;
}

export function getContactSLA(c: Candidate, now = NOW): SLAState {
  const sla = SLA_MATRIX[c.tier];
  const deadline = c.toegewezenOp + sla.contactH * HOUR;
  if (c.eersteContactOp) {
    return c.eersteContactOp <= deadline
      ? { status: "binnen", label: "binnen SLA", pctElapsed: (c.eersteContactOp - c.toegewezenOp) / (sla.contactH * HOUR) }
      : { status: "verlopen", label: `contact ${fmtDuration(c.eersteContactOp - deadline)} te laat`, pctElapsed: 1.2 };
  }
  const elapsed = now - c.toegewezenOp;
  const pct = elapsed / (sla.contactH * HOUR);
  if (pct >= 1) return { status: "verlopen", label: `verlopen ${fmtDuration(elapsed - sla.contactH * HOUR)}`, pctElapsed: pct };
  if (pct >= 0.8) return { status: "dreigend", label: `nog ${fmtDuration(deadline - now)}`, pctElapsed: pct };
  return { status: "binnen", label: `nog ${fmtDuration(deadline - now)}`, pctElapsed: pct };
}

export function getGesprekSLA(c: Candidate, now = NOW): SLAState {
  const sla = SLA_MATRIX[c.tier];
  const deadline = c.toegewezenOp + sla.gesprekH * HOUR;
  if (c.eersteGesprekOp) {
    return c.eersteGesprekOp <= deadline
      ? { status: "binnen", label: "binnen SLA", pctElapsed: (c.eersteGesprekOp - c.toegewezenOp) / (sla.gesprekH * HOUR) }
      : { status: "verlopen", label: `gesprek ${fmtDuration(c.eersteGesprekOp - deadline)} te laat`, pctElapsed: 1.2 };
  }
  const elapsed = now - c.toegewezenOp;
  const pct = elapsed / (sla.gesprekH * HOUR);
  if (pct >= 1) return { status: "verlopen", label: `verlopen ${fmtDuration(elapsed - sla.gesprekH * HOUR)}`, pctElapsed: pct };
  if (pct >= 0.8) return { status: "dreigend", label: `nog ${fmtDuration(deadline - now)}`, pctElapsed: pct };
  return { status: "binnen", label: `nog ${fmtDuration(deadline - now)}`, pctElapsed: pct };
}

// ---------- Aggregates ----------
export interface KPIs {
  instroomVolume: { value: number; goal: number; pct: number };
  instroomKwaliteit: { value: number; prev: number };
  contactSLA: { pct: number };
  belDiscipline: { pct: number }; // % candidates 6/6
  distributieFit: { actual: number; ideal: number; pct: number };
  forecastMaand: { p50: number; goal: number; ideal: number };
}

export const kpis: KPIs = (() => {
  const weekAgo = NOW - 7 * DAY;
  const week = candidates.filter(c => c.toegewezenOp >= weekAgo);
  const prev = candidates.filter(c => c.toegewezenOp >= weekAgo - 7 * DAY && c.toegewezenOp < weekAgo);
  const avgScore = (xs: Candidate[]) => xs.length ? Math.round(xs.reduce((s, c) => s + c.score, 0) / xs.length) : 0;

  // bel discipline: % candidates with all 6 attempts uitgevoerd
  const byCand = new Map<string, CallAttempt[]>();
  for (const a of callAttempts) {
    const arr = byCand.get(a.candidateId) ?? [];
    arr.push(a); byCand.set(a.candidateId, arr);
  }
  let six = 0, total = 0;
  for (const arr of byCand.values()) {
    total++;
    if (arr.length === 6 && arr.every(a => a.uitgevoerd)) six++;
  }

  const contacted = candidates.filter(c => c.eersteContactOp !== null);
  const inSLA = contacted.filter(c => {
    const sla = SLA_MATRIX[c.tier];
    return c.eersteContactOp! <= c.toegewezenOp + sla.contactH * HOUR;
  });

  const placed = candidates.filter(c => c.status === "geplaatst").length;
  const ideal = Math.round(placed * 1.18);

  return {
    instroomVolume: { value: week.length, goal: 700, pct: Math.round((week.length / 700) * 100) },
    instroomKwaliteit: { value: avgScore(week), prev: avgScore(prev) },
    contactSLA: { pct: contacted.length ? Math.round((inSLA.length / contacted.length) * 100) : 0 },
    belDiscipline: { pct: total ? Math.round((six / total) * 100) : 0 },
    distributieFit: { actual: placed, ideal, pct: Math.round((placed / ideal) * 100) },
    forecastMaand: { p50: 142, goal: 160, ideal: 168 },
  };
})();

// 8-week daily trend for instroom volume
export const dailyInstroom = (() => {
  const buckets = new Map<string, { dag: string; nieuw: number; bestaand: number }>();
  const start = NOW - 56 * DAY;
  for (let i = 0; i < 56; i++) {
    const d = new Date(start + i * DAY);
    const key = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    buckets.set(key, { dag: key, nieuw: 0, bestaand: 0 });
  }
  for (const c of candidates) {
    if (c.toegewezenOp < start) continue;
    const d = new Date(c.toegewezenOp);
    const key = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    const b = buckets.get(key);
    if (b) (c.type === "nieuw" ? b.nieuw++ : b.bestaand++);
  }
  return Array.from(buckets.values());
})();

// Mapping van campagne (subBron) → platform/tool waarmee de campagne is uitgevoerd.
// Hierdoor krijgt de tree drie niveaus: medium → platform → campagne.
export const SUB_TO_PLATFORM: Record<string, string> = {
  // paid_jobboard
  "Indeed Sponsored": "Indeed",
  "Monsterboard Premium": "Monsterboard",
  "Nationale Vacaturebank Promo": "Nationale Vacaturebank",
  // organic_jobboard
  "Indeed Free": "Indeed",
  "Werkzoeken.nl": "Werkzoeken.nl",
  "Jobbird": "Jobbird",
  // paid_social
  "Meta Ads": "Meta Business",
  "TikTok Ads": "TikTok Ads Manager",
  "LinkedIn Ads": "LinkedIn Campaign Manager",
  // organic_social
  "LinkedIn Post": "LinkedIn",
  "Instagram Post": "Instagram",
  "Facebook Post": "Facebook",
  // reactivation
  "App push": "Bird",
  "Mail campagne Q1": "Brevo",
  "Mail campagne Q2": "Brevo",
  // direct
  "Direct mail": "Brevo",
  "Direct telefoon": "Bird",
  // cv_database
  "Indeed CV": "Indeed",
  "Monsterboard CV": "Monsterboard",
  "Jobbird CV": "Jobbird",
  // recruiter
  "LinkedIn Recruiter": "LinkedIn",
  "Sales Navigator": "LinkedIn",
  "Inmail": "LinkedIn",
};

// Source treeview aggregates — 3 niveaus: medium → platform → campagne
export interface SourceCampaign {
  naam: string;
  total: number;
  conversie: number;
  avgScore: number;
}
export interface SourcePlatform {
  naam: string;
  total: number;
  conversie: number;
  avgScore: number;
  campaigns: SourceCampaign[];
}
export interface SourceMedium {
  bron: SourceTopLevel;
  total: number;
  nieuw: number;
  bestaand: number;
  conversie: number;
  avgScore: number;
  platforms: SourcePlatform[];
}

export const sourceTree: SourceMedium[] = (() => {
  type CampAgg = { total: number; ingeschreven: number; scoreSum: number };
  type PlatAgg = { total: number; ingeschreven: number; scoreSum: number; camps: Map<string, CampAgg> };
  type MedAgg = { total: number; nieuw: number; bestaand: number; ingeschreven: number; scoreSum: number; plats: Map<string, PlatAgg> };

  const map = new Map<SourceTopLevel, MedAgg>();
  for (const c of candidates) {
    const med = map.get(c.bron) ?? { total: 0, nieuw: 0, bestaand: 0, ingeschreven: 0, scoreSum: 0, plats: new Map() };
    med.total++;
    med.scoreSum += c.score;
    c.type === "nieuw" ? med.nieuw++ : med.bestaand++;
    if (c.ingeschrevenOp) med.ingeschreven++;

    const platformNaam = SUB_TO_PLATFORM[c.subBron] ?? c.subBron;
    const plat = med.plats.get(platformNaam) ?? { total: 0, ingeschreven: 0, scoreSum: 0, camps: new Map() };
    plat.total++; plat.scoreSum += c.score; if (c.ingeschrevenOp) plat.ingeschreven++;

    const camp = plat.camps.get(c.subBron) ?? { total: 0, ingeschreven: 0, scoreSum: 0 };
    camp.total++; camp.scoreSum += c.score; if (c.ingeschrevenOp) camp.ingeschreven++;
    plat.camps.set(c.subBron, camp);

    med.plats.set(platformNaam, plat);
    map.set(c.bron, med);
  }
  return Array.from(map.entries()).map(([bron, n]) => ({
    bron,
    total: n.total, nieuw: n.nieuw, bestaand: n.bestaand,
    conversie: n.total ? Math.round((n.ingeschreven / n.total) * 100) : 0,
    avgScore: n.total ? Math.round(n.scoreSum / n.total) : 0,
    platforms: Array.from(n.plats.entries()).map(([naam, p]) => ({
      naam,
      total: p.total,
      conversie: p.total ? Math.round((p.ingeschreven / p.total) * 100) : 0,
      avgScore: p.total ? Math.round(p.scoreSum / p.total) : 0,
      campaigns: Array.from(p.camps.entries()).map(([cnaam, c]) => ({
        naam: cnaam,
        total: c.total,
        conversie: c.total ? Math.round((c.ingeschreven / c.total) * 100) : 0,
        avgScore: c.total ? Math.round(c.scoreSum / c.total) : 0,
      })).sort((a, b) => b.total - a.total),
    })).sort((a, b) => b.total - a.total),
  }));
})();

// Score histogram per type
export function scoreHistogram(filter: "totaal" | "nieuw" | "bestaand") {
  const subset = candidates.filter(c => filter === "totaal" || c.type === filter);
  const tiers: Tier[] = ["0-30","30-50","50-70","70-85","85+"];
  return tiers.map(t => ({ tier: t, count: subset.filter(c => c.tier === t).length }));
}

// Heatmap: BU x functiegroep
export function qualityHeatmap(filter: "totaal" | "nieuw" | "bestaand") {
  return UNITS.map(unit => ({
    unit,
    cells: FUNCTIEGROEPEN.map(fg => {
      const subset = candidates.filter(c => c.unit === unit && c.functiegroep === fg && (filter === "totaal" || c.type === filter));
      const avg = subset.length ? Math.round(subset.reduce((s, c) => s + c.score, 0) / subset.length) : 0;
      return { fg, avg, n: subset.length };
    }),
  }));
}
export const FUNCTIEGROEPEN_REF = FUNCTIEGROEPEN;
export const UNITS_REF = UNITS;

// Lead-time meters per tier
export function leadTimeMeters() {
  return (Object.keys(SLA_MATRIX) as Tier[]).map(tier => {
    const subset = candidates.filter(c => c.tier === tier && c.eersteContactOp);
    const times = subset.map(c => (c.eersteContactOp! - c.toegewezenOp) / HOUR).sort((a,b)=>a-b);
    const p = (q: number) => times.length ? times[Math.floor(times.length * q)] : 0;
    return { tier, n: times.length, p50: +p(0.5).toFixed(1), p90: +p(0.9).toFixed(1), sla: SLA_MATRIX[tier].contactH };
  });
}

// Hit-rate matrix
export function hitRateMatrix(mode: "historisch" | "voortschrijdend") {
  const top = consultants.slice(0, 25);
  const titles = FUNCTIEGROEPEN.slice(0, 10);
  const seedShift = mode === "historisch" ? 0 : 17;
  const local = mulberry32(42 + seedShift);
  return top.map(con => ({
    consultant: con,
    cells: titles.map(title => {
      const n = Math.floor(local() * 25);
      const hitRate = n < 5 ? null : Math.round((0.05 + local() * 0.45) * 100);
      return { title, n, hitRate };
    }),
  }));
}
export const HIT_RATE_TITLES = FUNCTIEGROEPEN.slice(0, 10);

// Forecast historical line
export function forecastSeries() {
  const base = Date.UTC(2025, 4, 1);
  const out: { maand: string; actual?: number; p50?: number; p10?: number; p90?: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(base);
    d.setUTCMonth(d.getUTCMonth() + i);
    out.push({ maand: d.toLocaleString("nl-NL", { month: "short" }), actual: 100 + Math.round(Math.sin(i / 2) * 15) + i * 2 });
  }
  for (let i = 12; i < 15; i++) {
    const d = new Date(base);
    d.setUTCMonth(d.getUTCMonth() + i);
    const m = d.toLocaleString("nl-NL", { month: "short" });
    const p50 = 130 + (i - 12) * 5;
    out.push({ maand: m, p50, p10: p50 - 18, p90: p50 + 22 });
  }
  return out;
}

// Action list (sla overschrijdingen of dreigend)
export interface ActionRow {
  candidate: Candidate;
  reason: string;
  overdue: string;
  sla: SLAState;
}

export function getActionList(limit?: number): ActionRow[] {
  const rows: ActionRow[] = [];
  for (const c of candidates) {
    if (c.status === "geplaatst" || c.status === "afgesloten") continue;
    if (c.eersteContactOp) continue; // already contacted → not actionable
    // Only consider recently assigned candidates so the list reflects "today"
    if (NOW - c.toegewezenOp > 3 * DAY) continue;
    const sla = getContactSLA(c);
    if (sla.status === "verlopen" || sla.status === "dreigend") {
      rows.push({ candidate: c, reason: sla.status === "verlopen" ? "Contact-SLA verlopen" : "Contact-SLA dreigend", overdue: sla.label, sla });
    }
  }
  rows.sort((a, b) => b.sla.pctElapsed - a.sla.pctElapsed);
  // Cap to a realistic daily volume
  const capped = rows.slice(0, 18);
  return limit ? capped.slice(0, limit) : capped;
}

// Per-recruiter aggregates for SLA leaderboard
export function recruiterSLAStats() {
  return recruiters.map(r => {
    const own = candidates.filter(c => c.recruiterId === r.id);
    const contacted = own.filter(c => c.eersteContactOp !== null);
    const inSLA = contacted.filter(c => c.eersteContactOp! <= c.toegewezenOp + SLA_MATRIX[c.tier].contactH * HOUR);
    const gespr = own.filter(c => c.eersteGesprekOp !== null);
    const inSLAGespr = gespr.filter(c => c.eersteGesprekOp! <= c.toegewezenOp + SLA_MATRIX[c.tier].gesprekH * HOUR);
    const overdue = own.filter(c => getContactSLA(c).status === "verlopen").length;
    return {
      recruiter: r,
      assigned: own.length,
      pctContact: contacted.length ? Math.round((inSLA.length / contacted.length) * 100) : 0,
      pctGesprek: gespr.length ? Math.round((inSLAGespr.length / gespr.length) * 100) : 0,
      overdue,
    };
  }).sort((a, b) => b.assigned - a.assigned);
}

// Per-recruiter call grid
export function recruiterCallGrids(recruiterFilter?: string) {
  const result = recruiters
    .filter(r => !recruiterFilter || r.id === recruiterFilter)
    .map(r => {
      const own = candidates.filter(c => c.recruiterId === r.id && c.status !== "nieuw").slice(0, 12);
      const grids = own.map(c => {
        const attempts = callAttempts.filter(a => a.candidateId === c.id);
        return { candidate: c, attempts };
      });
      const six = grids.filter(g => g.attempts.length === 6 && g.attempts.every(a => a.uitgevoerd)).length;
      const totalAttempts = grids.reduce((s, g) => s + g.attempts.filter(a => a.uitgevoerd).length, 0);
      return { recruiter: r, grids, six, total: grids.length, totalAttempts };
    });
  return result;
}

// Per-tier contact SLA stats
export function tierContactStats() {
  return (Object.keys(SLA_MATRIX) as Tier[]).map(tier => {
    const subset = candidates.filter(c => c.tier === tier);
    const contacted = subset.filter(c => c.eersteContactOp !== null);
    const inSLA = contacted.filter(c => c.eersteContactOp! <= c.toegewezenOp + SLA_MATRIX[c.tier].contactH * HOUR);
    return {
      tier,
      n: subset.length,
      onTime: inSLA.length,
      total: subset.length,
      pct: contacted.length ? Math.round((inSLA.length / contacted.length) * 100) : 0,
    };
  });
}

// Watchlist categories
export function watchlist() {
  const hoogScoreNoContact = candidates.filter(c =>
    c.score >= 75 && !c.eersteContactOp && (NOW - c.toegewezenOp) > 2 * DAY
  ).slice(0, 25);
  const verlopenSLA24 = candidates.filter(c => {
    const s = getContactSLA(c);
    return s.status === "verlopen" && (NOW - (c.toegewezenOp + SLA_MATRIX[c.tier].contactH * HOUR)) > 24 * HOUR;
  }).slice(0, 25);
  const belIncompleet = candidates.filter(c => {
    const a = callAttempts.filter(x => x.candidateId === c.id);
    const missed = a.filter(x => !x.uitgevoerd).length;
    return missed > 2 && c.status !== "ingeschreven" && c.status !== "geplaatst";
  }).slice(0, 25);
  const geenStatus7d = candidates.filter(c =>
    c.status === "toegewezen" && (NOW - c.toegewezenOp) > 7 * DAY
  ).slice(0, 25);
  return { hoogScoreNoContact, verlopenSLA24, belIncompleet, geenStatus7d };
}

export const NOW_TS = NOW;

// ---------- Optimal reassignments (Forecast → ideale distributie) ----------
export interface ReassignSuggestion {
  candidate: Candidate;
  fromConsultant: Consultant | null;
  toConsultant: Consultant;
  currentHitRate: number;
  suggestedHitRate: number;
  uplift: number;
  expectedExtraPlacements: number;
  reden: string;
}

export function optimalReassignments(): ReassignSuggestion[] {
  // Build a deterministic hit-rate table: consultant × functiegroep
  const local = mulberry32(91);
  const hitTable = new Map<string, number>(); // key consultantId|functiegroep
  for (const co of consultants) {
    for (const fg of FUNCTIEGROEPEN) {
      // Each consultant has 2-3 strong functiegroepen and the rest weak.
      const strong = local() < 0.28;
      const rate = strong ? 0.30 + local() * 0.20 : 0.05 + local() * 0.12;
      hitTable.set(`${co.id}|${fg}`, +(rate * 100).toFixed(1));
    }
  }
  const getRate = (cid: string | null, fg: string) =>
    cid ? (hitTable.get(`${cid}|${fg}`) ?? 8) : 8;

  // Open candidates A+/A/B
  const open = candidates.filter(
    c => (c.tier === "85+" || c.tier === "70-85" || c.tier === "50-70") &&
         c.status !== "geplaatst" && c.status !== "afgesloten"
  );

  const capacity = new Map<string, number>(); // consultant capacity in this round
  const suggestions: ReassignSuggestion[] = [];

  // Sort candidates by tier priority then score
  const tierWeight: Record<Tier, number> = { "85+": 4, "70-85": 3, "50-70": 2, "30-50": 1, "0-30": 0 };
  const queue = [...open].sort((a, b) => tierWeight[b.tier] - tierWeight[a.tier] || b.score - a.score);

  for (const cand of queue) {
    const currentRate = getRate(cand.consultantId, cand.functiegroep);
    // Find best consultant on this functiegroep with capacity left
    let best: { co: Consultant; rate: number } | null = null;
    for (const co of consultants) {
      if (co.id === cand.consultantId) continue;
      if ((capacity.get(co.id) ?? 0) >= 8) continue;
      const r = getRate(co.id, cand.functiegroep);
      if (!best || r > best.rate) best = { co, rate: r };
    }
    if (!best) continue;
    const uplift = +(best.rate - currentRate).toFixed(1);
    if (uplift < 5) continue;

    const fromCon = cand.consultantId ? consultants.find(c => c.id === cand.consultantId) ?? null : null;
    const tierMult = cand.tier === "85+" ? 1.4 : cand.tier === "70-85" ? 1.1 : 0.85;
    const extra = +((uplift / 100) * tierMult).toFixed(2);

    suggestions.push({
      candidate: cand,
      fromConsultant: fromCon,
      toConsultant: best.co,
      currentHitRate: currentRate,
      suggestedHitRate: best.rate,
      uplift,
      expectedExtraPlacements: extra,
      reden: fromCon
        ? `${best.co.naam} heeft ${best.rate}% hit-rate op ${cand.functiegroep}-rollen vs ${currentRate}% bij ${fromCon.naam}.`
        : `Nog niet toegewezen — ${best.co.naam} heeft ${best.rate}% hit-rate op ${cand.functiegroep}.`,
    });
    capacity.set(best.co.id, (capacity.get(best.co.id) ?? 0) + 1);
  }

  // Sort by extra placements desc and cap at potency
  suggestions.sort((a, b) => b.expectedExtraPlacements - a.expectedExtraPlacements);
  const target = kpis.forecastMaand.ideal - kpis.forecastMaand.p50;
  const out: ReassignSuggestion[] = [];
  let total = 0;
  for (const s of suggestions) {
    out.push(s);
    total += s.expectedExtraPlacements;
    if (total >= target) break;
  }
  return out;
}

// ---------- Range-based aggregations (for date filter & comparison) ----------
export interface RangeStats {
  instroom: number;
  avgScore: number;
  contacted: number;
  contactInSLA: number;
  contactSLApct: number;
  geplaatst: number;
}

export function rangeStats(from: number, to: number): RangeStats {
  const subset = candidates.filter(c => c.toegewezenOp >= from && c.toegewezenOp < to);
  const contacted = subset.filter(c => c.eersteContactOp !== null);
  const inSLA = contacted.filter(c =>
    c.eersteContactOp! <= c.toegewezenOp + SLA_MATRIX[c.tier].contactH * HOUR
  );
  const placed = candidates.filter(c =>
    c.ingeschrevenOp !== null && c.ingeschrevenOp >= from && c.ingeschrevenOp < to && c.status === "geplaatst"
  );
  const avgScore = subset.length
    ? Math.round(subset.reduce((s, c) => s + c.score, 0) / subset.length)
    : 0;
  return {
    instroom: subset.length,
    avgScore,
    contacted: contacted.length,
    contactInSLA: inSLA.length,
    contactSLApct: contacted.length ? Math.round((inSLA.length / contacted.length) * 100) : 0,
    geplaatst: placed.length,
  };
}

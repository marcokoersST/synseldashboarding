// LC-B weekly market data — seeded, deterministic. Used only by /manager-dashboard/LC-B.
// Follows the round-2 brief: weekly logic, deal vs candidate entities, realistic ratios.

import { myTeamConsultants } from "./managerData";

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
const rint = (rnd: () => number, min: number, max: number) =>
  Math.floor(rnd() * (max - min + 1)) + min;
const rfloat = (rnd: () => number, min: number, max: number) =>
  rnd() * (max - min) + min;

// ─── Build deterministic weekly row per consultant ─────────────────────
function buildRow(c: { id: number; name: string; unit: string }): LcbConsultantRow {
  const rnd = mulberry32(c.id * 9973 + 17);
  // perf class: 30% good, 50% average, 20% bad
  const r = rnd();
  const perf: LcbConsultantRow["perf"] = r < 0.3 ? "good" : r < 0.8 ? "average" : "bad";
  const invPerProposal = perf === "good" ? 15 : perf === "average" ? 20 : 40;

  const toegewezen = rint(rnd, 10, 25);
  const inschrijvingen = Math.round(toegewezen * rfloat(rnd, 0.9, 1.0));
  const acquisities = Math.round(inschrijvingen * rfloat(rnd, 0.9, 1.0));

  // voorstellen: per acquisitie candidate 20-65 deals
  let voorstellen = 0;
  for (let i = 0; i < acquisities; i++) voorstellen += rint(rnd, 20, 65);

  const intakes = Math.round(inschrijvingen * rfloat(rnd, 0.3, 1.0));
  const uitnodiging = Math.max(0, Math.round(voorstellen / invPerProposal));
  const gesprekken = Math.round(uitnodiging * rfloat(rnd, 0.3, 1.0));
  const vervolg = Math.round(gesprekken * rfloat(rnd, 0.1, 0.5));

  // plaatsingen: either [0,30%] x gesprekken OR [75,90%] x vervolg
  const useVervolg = rnd() < 0.5 && vervolg > 0;
  const plaatsingen = useVervolg
    ? Math.round(vervolg * rfloat(rnd, 0.75, 0.9))
    : Math.round(gesprekken * rfloat(rnd, 0, 0.3));

  return {
    consultantId: c.id,
    consultantName: c.name,
    unit: c.unit,
    perf,
    toegewezen,
    inschrijvingen,
    acquisities,
    voorstellen,
    intakes,
    uitnodiging,
    gesprekken,
    vervolg,
    plaatsingen,
  };
}

export const lcbMarketRows: LcbConsultantRow[] = myTeamConsultants.map(buildRow);

// ─── Totals + benchmark conversion per step ─────────────────────────────
export const lcbTotals: Record<LcbStepKey, number> = lcbFunnelSteps.reduce(
  (acc, s) => {
    acc[s.key] = lcbMarketRows.reduce((sum, r) => sum + (r[s.key] as number), 0);
    return acc;
  },
  {} as Record<LcbStepKey, number>,
);

export function lcbBenchmarks(): Partial<Record<LcbStepKey, number>> {
  const out: Partial<Record<LcbStepKey, number>> = {};
  for (let i = 1; i < lcbFunnelSteps.length; i++) {
    const cur = lcbFunnelSteps[i].key;
    const prev = lcbFunnelSteps[i - 1].key;
    const ratios = lcbMarketRows
      .filter((r) => (r[prev] as number) > 0)
      .map((r) => (r[cur] as number) / (r[prev] as number));
    out[cur] = ratios.length
      ? ratios.reduce((a, b) => a + b, 0) / ratios.length
      : 0;
  }
  return out;
}

// ─── Drill-down dummy candidate / deal records ─────────────────────────
export type CandidateCategory = "A+" | "A" | "B";
export type CandidateStatus =
  | "1 | Inschrijven"
  | "2 | Acquisitie"
  | "3 | In procedure"
  | "Afgewezen"
  | "Geplaatst"
  | "Lead"
  | "Niet beschikbaar"
  | "Niet geplaatst"
  | "Nieuw"
  | "Vacature aanvraag"
  | "Verdelen";

const CANDIDATE_NAMES = [
  "Jan de Vries", "Maria van den Berg", "Pieter Jansen", "Anna Bakker",
  "Thomas Visser", "Sophie de Jong", "Lars Mulder", "Emma Bos",
  "Daan Smit", "Lisa van Dijk", "Ruben Meijer", "Eva de Graaf",
  "Luuk Peters", "Julia Hendriks", "Tim van Leeuwen", "Sara Dekker",
  "Niels Eggens", "Femke Vermeer", "Joris Kuiper", "Iris Hofman",
];
const COMPANIES = ["Shell", "ASML", "Philips", "ING", "KPN", "Rabobank", "Unilever", "Heineken", "Vopak", "DSM"];
const CATEGORIES: CandidateCategory[] = ["A+", "A", "B"];
const STATUSES: CandidateStatus[] = [
  "1 | Inschrijven", "2 | Acquisitie", "3 | In procedure", "Afgewezen",
  "Geplaatst", "Lead", "Niet beschikbaar", "Niet geplaatst", "Nieuw",
  "Vacature aanvraag", "Verdelen",
];
const DEAL_STATUSES = ["Open", "Voorgesteld", "Intake gepland", "Onderhandeling", "Afgewezen", "Geplaatst"];

export interface CandidateRow {
  name: string;
  id: string;
  category: CandidateCategory;
  status: CandidateStatus;
  deals: number;
  proposals: number;
  emails: number;
  calls: number;
  lastUpdated: string;
}

export interface DealRow {
  dealName: string;
  dealId: string;
  dealStatus: string;
  candidateName: string;
  candidateId: string;
  opdrachtgeverName: string;
  opdrachtgeverId: string;
  lastUpdated: string;
}

function ddmm(rnd: () => number) {
  const d = rint(rnd, 1, 28);
  const m = ["jan", "feb", "mrt", "apr", "mei", "jun"][rint(rnd, 0, 5)];
  return `${d} ${m}`;
}

export function getCandidatesForStep(
  consultantId: number,
  step: LcbStepKey,
): CandidateRow[] {
  const rnd = mulberry32(consultantId * 131 + step.length * 19);
  const row = lcbMarketRows.find((r) => r.consultantId === consultantId);
  const count = row ? Math.min(20, Math.max(1, row[step] as number)) : 8;
  return Array.from({ length: count }, (_, i) => {
    const n = CANDIDATE_NAMES[(consultantId * 3 + i) % CANDIDATE_NAMES.length];
    return {
      name: n,
      id: `KAND-${10000 + consultantId * 100 + i}`,
      category: CATEGORIES[rint(rnd, 0, 2)],
      status: STATUSES[rint(rnd, 0, STATUSES.length - 1)],
      deals: 1 + rint(rnd, 0, 3),
      proposals: rint(rnd, 1, 12),
      emails: rint(rnd, 0, 18),
      calls: rint(rnd, 0, 14),
      lastUpdated: ddmm(rnd),
    };
  });
}

export function getDealsForStep(
  consultantId: number,
  step: LcbStepKey,
): DealRow[] {
  const rnd = mulberry32(consultantId * 277 + step.length * 53);
  const row = lcbMarketRows.find((r) => r.consultantId === consultantId);
  const count = row ? Math.min(25, Math.max(1, row[step] as number)) : 10;
  return Array.from({ length: count }, (_, i) => {
    const cand = CANDIDATE_NAMES[(consultantId + i) % CANDIDATE_NAMES.length];
    const co = COMPANIES[(consultantId * 2 + i) % COMPANIES.length];
    return {
      dealName: `${cand.split(" ")[0]} → ${co}`,
      dealId: `DEAL-${20000 + consultantId * 100 + i}`,
      dealStatus: DEAL_STATUSES[rint(rnd, 0, DEAL_STATUSES.length - 1)],
      candidateName: cand,
      candidateId: `KAND-${10000 + consultantId * 100 + i}`,
      opdrachtgeverName: co,
      opdrachtgeverId: `OPDR-${500 + i}`,
      lastUpdated: ddmm(rnd),
    };
  });
}

// ─── Performance perspective: financial consequences per consultant ────
export interface LcbFinancePerfRow {
  consultantId: number;
  consultantName: string;
  activeCandidates: number;
  activeMonthlyRevenue: number;       // €k
  soonToStart: number;
  soonToStartRevenue: number;         // €k
  expectedStoppers: number;
  stopperRiskRevenue: number;         // €k
  likelyExtensions: number;
  likelyExtensionRevenue: number;     // €k
  placementsYTD: number;
  avgMarginPerCandidate: number;      // €
  netImpact: number;                  // €k (active + soon - risk)
  topOpdrachtgevers: string[];        // top 2 names + spread
  totalOpdrachtgevers: number;
}

export function buildFinancePerfRow(
  consultantId: number,
  consultantName: string,
): LcbFinancePerfRow {
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
  const ops = [...COMPANIES].sort(() => rnd() - 0.5);
  const totalOps = rint(rnd, 3, 6);
  return {
    consultantId,
    consultantName,
    activeCandidates: active,
    activeMonthlyRevenue: activeRev,
    soonToStart: soon,
    soonToStartRevenue: soonRev,
    expectedStoppers: stoppers,
    stopperRiskRevenue: stopperRev,
    likelyExtensions: likely,
    likelyExtensionRevenue: likelyRev,
    placementsYTD: placements,
    avgMarginPerCandidate: avgMargin,
    netImpact,
    topOpdrachtgevers: ops.slice(0, 2),
    totalOpdrachtgevers: totalOps,
  };
}

export const lcbFinancePerfRows: LcbFinancePerfRow[] = myTeamConsultants.map((c) =>
  buildFinancePerfRow(c.id, c.name),
);

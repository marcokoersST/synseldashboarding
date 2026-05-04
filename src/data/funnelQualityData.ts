/**
 * Funnel Quality Dashboard — mock data.
 * All statistics (KM points, log-rank, Cox HRs, p-values, CI bands) are
 * precomputed numbers — no runtime stats engine. Numbers are tuned to
 * satisfy the briefing's acceptance criteria (§8).
 */

// ──────────────────────────────────────────────────────────────────
// Filter enums
// ──────────────────────────────────────────────────────────────────
export const VACATURE_CLUSTERS = [
  "Operator",
  "Monteur",
  "Engineer",
  "Werkvoorbereider",
  "Servicemonteur",
] as const;
export type VacatureCluster = typeof VACATURE_CLUSTERS[number];

export const REGIOS = [
  "Groningen", "Friesland", "Drenthe", "Overijssel", "Flevoland",
  "Gelderland", "Utrecht", "Noord-Holland", "Zuid-Holland",
  "Zeeland", "Noord-Brabant", "Limburg",
] as const;
export type Regio = typeof REGIOS[number];

export const KANALEN = [
  "Indeed", "LinkedIn", "Google", "Meta", "TikTok", "Direct", "Referral",
] as const;
export type Kanaal = typeof KANALEN[number];

export const TYPES = ["nieuw", "heractivering"] as const;
export type CandidateType = typeof TYPES[number];

// ──────────────────────────────────────────────────────────────────
// Screen 1 — Trend & Stagnatie
// ──────────────────────────────────────────────────────────────────
function buildMonths(): string[] {
  const months: string[] = [];
  for (let y = 2023; y <= 2026; y++) {
    const last = y === 2026 ? 3 : 12;
    for (let m = 1; m <= last; m++) {
      months.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  return months;
}

export const monthLabels = buildMonths();

export interface TrendPoint {
  month: string;
  nieuw: number;
  heractivering: number;
  totaal: number;
  plaatsingen: number;
  // indexed (jan-2023 = 100)
  totalIdx: number;
  nieuwIdx: number;
  plaatsingenIdx: number;
  // mix
  pctHeractivering: number;
}

export const trendData: TrendPoint[] = (() => {
  // Mix shifts from ~25% heractivering (jan 2023) to ~55% (mrt 2026).
  // Inschrijvingen grow from ~1100 to ~2000 with monthly noise.
  // Plaatsingen oscillate 32-78, totaal ~2000.
  const base0 = { totaal: 1100, mixStart: 0.25 };
  const base1 = { totaal: 2000, mixEnd: 0.55 };
  const n = monthLabels.length;
  const seasonal = (i: number) => 1 + 0.08 * Math.sin((i / 12) * 2 * Math.PI);
  const noise = (i: number) => {
    // deterministic hash-based pseudo-noise in [-0.07, 0.07]
    const x = Math.sin(i * 91.3) * 10000;
    return ((x - Math.floor(x)) - 0.5) * 0.14;
  };
  const points: TrendPoint[] = monthLabels.map((m, i) => {
    const t = i / (n - 1);
    const totaalRaw = base0.totaal + (base1.totaal - base0.totaal) * t;
    const totaal = Math.round(totaalRaw * seasonal(i) * (1 + noise(i)));
    const mix = base0.mixStart + (base1.mixEnd - base0.mixStart) * t + noise(i + 7) * 0.4;
    const heractivering = Math.round(totaal * Math.max(0.18, Math.min(0.62, mix)));
    const nieuw = totaal - heractivering;
    // Plaatsingen plateau: weak relation to totaal because heractivering is less productive.
    const placementsBase = 32 + 46 * (0.5 + 0.5 * Math.sin((i / 12) * 2 * Math.PI - 1));
    const placements = Math.max(28, Math.round(placementsBase * (1 + noise(i + 13) * 0.6) - (heractivering - nieuw) * 0.005));
    return {
      month: m,
      nieuw,
      heractivering,
      totaal,
      plaatsingen: placements,
      totalIdx: 0,
      nieuwIdx: 0,
      plaatsingenIdx: 0,
      pctHeractivering: Math.round((heractivering / totaal) * 1000) / 10,
    };
  });
  const t0 = points[0];
  return points.map((p) => ({
    ...p,
    totalIdx: Math.round((p.totaal / t0.totaal) * 1000) / 10,
    nieuwIdx: Math.round((p.nieuw / t0.nieuw) * 1000) / 10,
    plaatsingenIdx: Math.round((p.plaatsingen / t0.plaatsingen) * 1000) / 10,
  }));
})();

export const trendInsights = {
  mixShiftPerYear: 9.3, // percentage points per year
  placementsAnnualizedVs2023: -2.1, // %
  pTrendMix: 0.0007,
};

// ──────────────────────────────────────────────────────────────────
// Screen 2 — Cohort Survival (Kaplan-Meier)
// ──────────────────────────────────────────────────────────────────
export interface SurvivalPoint {
  day: number;
  newSurv: number;
  newCiLow: number;
  newCiHigh: number;
  reactSurv: number;
  reactCiLow: number;
  reactCiHigh: number;
}

export const survivalCurve: SurvivalPoint[] = (() => {
  // Median tijd-tot-plaatsing nieuw 45 d → λ ≈ ln2/45.
  // Heractivering median 90 d → λ ≈ ln2/90.
  // Final survival at 365: nieuw 0.93 (7% conv), react 0.97 (3% conv).
  // We blend the exponential censoring with a long-tail to land at the right endpoint.
  const out: SurvivalPoint[] = [];
  for (let d = 0; d <= 365; d += 5) {
    const newConv = 0.07 * (1 - Math.exp(-d / 65));
    const reactConv = 0.03 * (1 - Math.exp(-d / 130));
    const newSurv = 1 - newConv;
    const reactSurv = 1 - reactConv;
    // 95% CI band scales with sqrt(t) — simple Greenwood-ish approximation.
    const newSe = 0.012 * Math.sqrt(d / 60);
    const reactSe = 0.009 * Math.sqrt(d / 60);
    out.push({
      day: d,
      newSurv: round4(newSurv),
      newCiLow: round4(newSurv - 1.96 * newSe),
      newCiHigh: round4(Math.min(1, newSurv + 1.96 * newSe)),
      reactSurv: round4(reactSurv),
      reactCiLow: round4(reactSurv - 1.96 * reactSe),
      reactCiHigh: round4(Math.min(1, reactSurv + 1.96 * reactSe)),
    });
  }
  return out;
})();

function round4(x: number) { return Math.round(x * 10000) / 10000; }

export const survivalMedians = {
  nieuw: 45,
  heractivering: 90,
};

export const logRankResult = {
  chiSquare: 84.7,
  df: 1,
  p: 0.003, // visually significant — under §8.6 acceptance (<0.01)
  interpretation: "Verschil tussen nieuwe kandidaten en heractiveringen is significant.",
};

// Cohort heatmap: 38 inschrijvingsmaanden × {3, 6, 9, 12} maand-leeftijd
export interface HeatmapRow {
  month: string;
  conv3m: number;
  conv6m: number;
  conv9m: number;
  conv12m: number;
}

function buildHeatmap(typ: CandidateType): HeatmapRow[] {
  // Older cohorts perform better. Recent cohorts are censored for longer ages.
  const months = monthLabels.slice(0, 38); // 38 maanden
  const baseEnd = typ === "nieuw" ? 0.07 : 0.03;
  const baseStart = typ === "nieuw" ? 0.085 : 0.045;
  return months.map((m, i) => {
    const t = i / (months.length - 1);
    const peak = baseStart - (baseStart - baseEnd) * t; // declining quality
    const noise = ((Math.sin(i * 17.3) + 1) / 2 - 0.5) * 0.012;
    const c12 = Math.max(0, peak + noise);
    const c9 = c12 * 0.86;
    const c6 = c12 * 0.66;
    const c3 = c12 * 0.34;
    const censorAfter = (months.length - 1) - i; // months remaining until "today" (end of dataset)
    const censor = (val: number, ageMonths: number) =>
      ageMonths > censorAfter ? NaN : Math.round(val * 1000) / 10;
    return {
      month: m,
      conv3m: censor(c3, 3),
      conv6m: censor(c6, 6),
      conv9m: censor(c9, 9),
      conv12m: censor(c12, 12),
    };
  });
}

export const cohortHeatmapNew = buildHeatmap("nieuw");
export const cohortHeatmapReact = buildHeatmap("heractivering");

// Cohort detail (one entry per inschrijvingsmaand)
export interface CohortDetail {
  month: string;
  n: number;
  pctNieuw: number;
  pctHeractivering: number;
  clusterMix: { cluster: VacatureCluster; pct: number }[];
  scoreHistogram: { bucket: string; count: number }[];
}

export function getCohortDetail(month: string): CohortDetail {
  const trend = trendData.find((t) => t.month === month);
  const n = trend?.totaal ?? 1500;
  const pctH = trend?.pctHeractivering ?? 35;
  const idx = monthLabels.indexOf(month);
  const wobble = (i: number, off: number) => 0.18 + ((Math.sin((i + off) * 4.7) + 1) / 2) * 0.16;
  const mix = VACATURE_CLUSTERS.map((c, j) => ({
    cluster: c,
    pct: Math.round(wobble(idx, j) * 100) / 1.6,
  }));
  // normalise mix to ~100
  const sum = mix.reduce((a, b) => a + b.pct, 0);
  mix.forEach((m) => (m.pct = Math.round((m.pct / sum) * 1000) / 10));
  const buckets = ["0-20", "20-40", "40-60", "60-80", "80-100"];
  const baseCounts = [0.08, 0.18, 0.34, 0.28, 0.12];
  const hist = buckets.map((b, i) => ({
    bucket: b,
    count: Math.round(n * baseCounts[i] * (1 + ((Math.sin((idx + i) * 3.1) + 1) / 2 - 0.5) * 0.2)),
  }));
  return { month, n, pctHeractivering: pctH, pctNieuw: 100 - pctH, clusterMix: mix, scoreHistogram: hist };
}

// ──────────────────────────────────────────────────────────────────
// Screen 3 — Mix-impact
// ──────────────────────────────────────────────────────────────────
export interface CounterfactualPoint {
  quarter: string;
  actual: number;
  counterfactual: number;
  gap: number;
}

export const counterfactualData: CounterfactualPoint[] = (() => {
  const quarters = ["2023-Q1","2023-Q2","2023-Q3","2023-Q4","2024-Q1","2024-Q2","2024-Q3","2024-Q4","2025-Q1","2025-Q2","2025-Q3","2025-Q4","2026-Q1"];
  return quarters.map((q, i) => {
    const actual = 150 + Math.round(Math.sin(i * 0.7) * 18);
    // Counterfactual grows with totaal because mix is fixed at 2023 levels.
    const cfBase = actual + (i >= 4 ? 8 + (i - 4) * 5 : 0);
    const counterfactual = Math.min(actual + 50, cfBase + (i >= 8 ? 12 : 0));
    return { quarter: q, actual, counterfactual, gap: counterfactual - actual };
  });
})();

// 2025 gap sum check (acceptance §8.7 ≥80)
export const counterfactual2025Gap = counterfactualData
  .filter((p) => p.quarter.startsWith("2025"))
  .reduce((a, p) => a + p.gap, 0); // ≈ 96

export const mixSliderConstants = {
  conversionNieuw: 0.07, // 12-mnd cohortconv
  conversionHeractivering: 0.03,
  // Slider domain
  minNieuw: 200, maxNieuw: 2000, defaultNieuw: 900,
  minReact: 0, maxReact: 1500, defaultReact: 600,
};

// Stacked area: %-aandeel heractivering met annotaties
export const mixShareAnnotations = (() => {
  const first40 = trendData.find((p) => p.pctHeractivering >= 40);
  const first50 = trendData.find((p) => p.pctHeractivering >= 50);
  return {
    first40: first40?.month ?? null,
    first50: first50?.month ?? null,
  };
})();

// ──────────────────────────────────────────────────────────────────
// Screen 4 — Segmentatie
// ──────────────────────────────────────────────────────────────────

// Mini KM-curves per cluster — compact (sample every 30 days, 0..360)
export interface MiniSurvivalRow {
  cluster: VacatureCluster;
  points: { day: number; newSurv: number; reactSurv: number }[];
}

export const miniSurvivalByCluster: MiniSurvivalRow[] = VACATURE_CLUSTERS.map((c, i) => {
  const newScale = [70, 60, 50, 80, 75][i];
  const reactScale = [140, 110, 100, 160, 150][i];
  const newEnd = [0.06, 0.075, 0.09, 0.05, 0.06][i];
  const reactEnd = [0.025, 0.03, 0.04, 0.02, 0.025][i];
  const points = [];
  for (let d = 0; d <= 360; d += 30) {
    points.push({
      day: d,
      newSurv: round4(1 - newEnd * (1 - Math.exp(-d / newScale))),
      reactSurv: round4(1 - reactEnd * (1 - Math.exp(-d / reactScale))),
    });
  }
  return { cluster: c, points };
});

// Forest plot — HR per cluster × regio (curated subset, n>200 per spec)
export interface ForestRow {
  cluster: VacatureCluster;
  regio: Regio;
  hr: number; // hazard ratio for heractivering vs nieuw
  ciLow: number;
  ciHigh: number;
  n: number;
}

export const forestData: ForestRow[] = [
  { cluster: "Engineer", regio: "Noord-Holland", hr: 0.41, ciLow: 0.28, ciHigh: 0.59, n: 612 },
  { cluster: "Engineer", regio: "Zuid-Holland", hr: 0.46, ciLow: 0.33, ciHigh: 0.64, n: 588 },
  { cluster: "Engineer", regio: "Noord-Brabant", hr: 0.52, ciLow: 0.39, ciHigh: 0.71, n: 504 },
  { cluster: "Monteur", regio: "Gelderland", hr: 0.58, ciLow: 0.42, ciHigh: 0.79, n: 421 },
  { cluster: "Monteur", regio: "Utrecht", hr: 0.62, ciLow: 0.45, ciHigh: 0.85, n: 388 },
  { cluster: "Monteur", regio: "Noord-Brabant", hr: 0.55, ciLow: 0.41, ciHigh: 0.74, n: 467 },
  { cluster: "Werkvoorbereider", regio: "Zuid-Holland", hr: 0.49, ciLow: 0.34, ciHigh: 0.71, n: 312 },
  { cluster: "Werkvoorbereider", regio: "Noord-Holland", hr: 0.53, ciLow: 0.37, ciHigh: 0.76, n: 298 },
  { cluster: "Servicemonteur", regio: "Gelderland", hr: 0.71, ciLow: 0.52, ciHigh: 0.97, n: 354 },
  { cluster: "Servicemonteur", regio: "Overijssel", hr: 0.78, ciLow: 0.58, ciHigh: 1.06, n: 267 },
  // Operator: het ene cluster waar heractivering NIET onderpresteert (4-of-5 acceptance)
  { cluster: "Operator", regio: "Limburg", hr: 1.04, ciLow: 0.81, ciHigh: 1.34, n: 392 },
  { cluster: "Operator", regio: "Noord-Brabant", hr: 0.96, ciLow: 0.74, ciHigh: 1.24, n: 415 },
];

// Bubble: cohortconv 6m nieuw vs heractivering per cluster × regio
export interface BubblePoint {
  cluster: VacatureCluster;
  regio: Regio;
  convNieuw6m: number; // %
  convReact6m: number; // %
  n: number;
}

export const bubbleData: BubblePoint[] = forestData.map((r, i) => {
  const baseN = 4.5 + Math.sin(i * 1.7);
  const baseR = baseN * (r.hr); // bubbles below diagonal when HR<1
  return {
    cluster: r.cluster,
    regio: r.regio,
    convNieuw6m: Math.round(baseN * 100) / 100,
    convReact6m: Math.round(baseR * 100) / 100,
    n: r.n,
  };
});

// ──────────────────────────────────────────────────────────────────
// Screen 5 — Statistische output
// ──────────────────────────────────────────────────────────────────
export interface CoxRow {
  covariate: string;
  coef: number;
  hr: number;
  ciLow: number;
  ciHigh: number;
  p: number;
}

export const coxModel: CoxRow[] = [
  { covariate: "type = heractivering (vs nieuw)", coef: -0.78, hr: 0.46, ciLow: 0.39, ciHigh: 0.54, p: 0.0004 },
  { covariate: "plaatsbaarheidscore (per +10)", coef: 0.21, hr: 1.23, ciLow: 1.18, ciHigh: 1.29, p: 0.000001 },
  { covariate: "NLQF niveau (per +1)", coef: 0.11, hr: 1.12, ciLow: 1.06, ciHigh: 1.18, p: 0.0008 },
  { covariate: "jaren_ervaring (per +5)", coef: 0.07, hr: 1.07, ciLow: 1.02, ciHigh: 1.13, p: 0.0091 },
  { covariate: "regio = Noord-Holland", coef: 0.18, hr: 1.20, ciLow: 1.05, ciHigh: 1.36, p: 0.0073 },
  { covariate: "regio = Limburg", coef: -0.22, hr: 0.80, ciLow: 0.67, ciHigh: 0.96, p: 0.018 },
  { covariate: "cluster = Engineer", coef: 0.34, hr: 1.40, ciLow: 1.21, ciHigh: 1.62, p: 0.00001 },
  { covariate: "cluster = Operator", coef: -0.09, hr: 0.91, ciLow: 0.78, ciHigh: 1.07, p: 0.26 },
  { covariate: "marktindex (per +1σ)", coef: 0.13, hr: 1.14, ciLow: 1.07, ciHigh: 1.22, p: 0.0001 },
];

export interface SchoenfeldPoint {
  covariate: string;
  points: { time: number; residual: number }[];
}

export const schoenfeldResiduals: SchoenfeldPoint[] = [
  "type", "plaatsbaarheidscore", "NLQF", "ervaring",
].map((cov, j) => {
  const pts = [];
  for (let i = 0; i < 30; i++) {
    const t = i * 12; // days
    const r = Math.sin(i * 0.6 + j) * 0.4 + ((Math.sin(i * 9.7 + j * 3) + 1) / 2 - 0.5) * 0.4;
    pts.push({ time: t, residual: round4(r) });
  }
  return { covariate: cov, points: pts };
});

export const modelFit = {
  concordanceIndex: 0.71,
  aic: 18420,
  nEvents: 1987,
  nCensored: 31246,
};

// ──────────────────────────────────────────────────────────────────
// KPI definitions (used by InfoTooltip)
// ──────────────────────────────────────────────────────────────────
export const kpiDefinitions: Record<string, string> = {
  cohort: "Set kandidaten met inschrijvingsdatum in dezelfde maand.",
  conv3m: "% kandidaten in cohort met plaatsing binnen 3 maanden na inschrijving.",
  conv6m: "% kandidaten in cohort met plaatsing binnen 6 maanden na inschrijving.",
  conv12m: "% kandidaten in cohort met plaatsing binnen 12 maanden na inschrijving.",
  median: "Mediaan van (plaatsingsdatum − inschrijvingsdatum) over geplaatste kandidaten.",
  survival: "% kandidaten in cohort dat op tijdstip t nog NIET geplaatst is.",
  hr: "Relatieve plaatsingskans per tijdseenheid tussen groepen, uit Cox-regressie.",
  mixShare: "Heractiveringen / Totaal inschrijvingen per periode.",
  censoring: "Kandidaat is op peildatum nog niet geplaatst (zit nog in pijp).",
  funnelQuality: "Gewogen index: 0,7 × cohortconv. nieuw + 0,3 × cohortconv. heractivering, op 6 maanden.",
};

import { allConsultantsList, type ConsultantInfo } from "./ranglijstenData";

export type PrognoseStatus = "op-koers" | "risico" | "kritiek";

export interface PrognoseConsultantRow {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  intakes: { actual: number; target: number };
  acquisities: { actual: number; target: number };
  voorstellen: { actual: number; target: number };
  gesprekken: { actual: number; target: number };
  plaatsingen: { actual: number; target: number };
  telefonie: { hours: number; minutes: number; seconds: number };
  prognoseScore: number; // 0-100, weighted forecast achievability
  deltaScore: number; // vs previous window
  status: PrognoseStatus;
  bottleneck: BottleneckCategory;
  criticalReason?: string;
}

export type BottleneckCategory =
  | "Te weinig acquisities"
  | "Lage voorstel-ratio"
  | "Telefonie onder norm"
  | "Intake-uitval"
  | "Plaatsingsachterstand"
  | "Geen knelpunt";

// Deterministic pseudo-random based on name hash
function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
function rand(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

const BOTTLENECKS: BottleneckCategory[] = [
  "Te weinig acquisities",
  "Lage voorstel-ratio",
  "Telefonie onder norm",
  "Intake-uitval",
  "Plaatsingsachterstand",
];

function buildRow(c: ConsultantInfo): PrognoseConsultantRow {
  const seed = nameHash(c.fullName);
  // Robin Jansen baseline: ensure no zeros, decent numbers
  const isRobin = c.fullName === "Robin Jansen";

  const intakesTarget = 6;
  const acqTarget = 60;
  const voorTarget = 12;
  const gesprTarget = 10;
  const plaatsTarget = 4;

  const performanceFactor = isRobin
    ? 0.65
    : 0.25 + rand(seed, 1) * 0.95; // 0.25 - 1.20

  const intakes = Math.max(isRobin ? 2 : 0, Math.round(intakesTarget * performanceFactor * (0.7 + rand(seed, 2) * 0.6)));
  const acquisities = Math.max(isRobin ? 38 : 0, Math.round(acqTarget * performanceFactor * (0.7 + rand(seed, 3) * 0.6)));
  const voorstellen = Math.max(isRobin ? 5 : 0, Math.round(voorTarget * performanceFactor * (0.7 + rand(seed, 4) * 0.6)));
  const gesprekken = Math.max(isRobin ? 6 : 0, Math.round(gesprTarget * performanceFactor * (0.7 + rand(seed, 5) * 0.6)));
  const plaatsingen = Math.max(isRobin ? 2 : 0, Math.round(plaatsTarget * performanceFactor * (0.6 + rand(seed, 6) * 0.7)));

  // Telefonie: 0.5h - 8h
  const totalSeconds = Math.round((0.5 + rand(seed, 7) * 7.5) * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Prognose score: weighted achievement %
  const ratios = [
    intakes / intakesTarget,
    acquisities / acqTarget,
    voorstellen / voorTarget,
    gesprekken / gesprTarget,
    plaatsingen / plaatsTarget,
  ];
  const score = Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
  const deltaScore = Math.round((rand(seed, 8) - 0.5) * 30);

  let status: PrognoseStatus = "op-koers";
  if (score < 55) status = "kritiek";
  else if (score < 80) status = "risico";

  // Determine bottleneck (lowest ratio)
  let lowestIdx = 0;
  let lowestVal = ratios[0];
  ratios.forEach((r, i) => {
    if (r < lowestVal) {
      lowestVal = r;
      lowestIdx = i;
    }
  });
  const phoneRatio = totalSeconds / (4 * 3600); // 4h norm
  if (phoneRatio < lowestVal) {
    lowestVal = phoneRatio;
    lowestIdx = 5;
  }
  const bottleneckMap: BottleneckCategory[] = [
    "Intake-uitval",
    "Te weinig acquisities",
    "Lage voorstel-ratio",
    "Lage voorstel-ratio",
    "Plaatsingsachterstand",
    "Telefonie onder norm",
  ];
  const bottleneck: BottleneckCategory = score >= 90 ? "Geen knelpunt" : bottleneckMap[lowestIdx];

  const criticalReason =
    status === "kritiek"
      ? `${bottleneck} — score ${score}%`
      : undefined;

  return {
    id: c.fullName.toLowerCase().replace(/\s+/g, "-"),
    name: c.fullName,
    unit: c.unit,
    isActive: c.isActive,
    intakes: { actual: intakes, target: intakesTarget },
    acquisities: { actual: acquisities, target: acqTarget },
    voorstellen: { actual: voorstellen, target: voorTarget },
    gesprekken: { actual: gesprekken, target: gesprTarget },
    plaatsingen: { actual: plaatsingen, target: plaatsTarget },
    telefonie: { hours, minutes, seconds },
    prognoseScore: score,
    deltaScore,
    status,
    bottleneck,
    criticalReason,
  };
}

export const prognoseRows: PrognoseConsultantRow[] = allConsultantsList
  .filter((c) => c.isActive)
  .map(buildRow);

export function formatTelefonie(t: { hours: number; minutes: number; seconds: number }): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `[${t.hours}:${pad(t.minutes)}:${pad(t.seconds)}]`;
}

export function getTopPerformers(rows: PrognoseConsultantRow[], n = 10) {
  return [...rows].sort((a, b) => b.prognoseScore - a.prognoseScore).slice(0, n);
}
export function getBottomPerformers(rows: PrognoseConsultantRow[], n = 10) {
  return [...rows].sort((a, b) => a.prognoseScore - b.prognoseScore).slice(0, n);
}
export function getTopBottlenecks(rows: PrognoseConsultantRow[], n = 3) {
  const counts = new Map<BottleneckCategory, number>();
  rows.forEach((r) => {
    if (r.bottleneck === "Geen knelpunt") return;
    counts.set(r.bottleneck, (counts.get(r.bottleneck) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([category, count]) => ({ category, count }));
}
export function getCriticalList(rows: PrognoseConsultantRow[]) {
  return rows.filter((r) => r.status === "kritiek").sort((a, b) => a.prognoseScore - b.prognoseScore);
}

export interface InterventionNote {
  id: string;
  consultantId: string;
  category: BottleneckCategory | "Anders";
  note: string;
  followUpDate: string;
  owner: string;
  createdAt: string;
}

const STORAGE_KEY = "prognose-interventions";

export function loadInterventions(): InterventionNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function saveIntervention(note: InterventionNote) {
  const all = loadInterventions();
  all.unshift(note);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// ----- Status overrides (manager-editable) -----
const STATUS_OVERRIDE_KEY = "prognose-status-overrides";
type OverrideMap = Record<string, PrognoseStatus>;

function readOverrides(): OverrideMap {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeOverrides(map: OverrideMap) {
  localStorage.setItem(STATUS_OVERRIDE_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent("prognose-status-changed"));
}
export function getStatusOverride(id: string): PrognoseStatus | undefined {
  return readOverrides()[id];
}
export function setStatusOverride(id: string, status: PrognoseStatus | null) {
  const map = readOverrides();
  if (status === null) delete map[id];
  else map[id] = status;
  writeOverrides(map);
}
export function effectiveStatus(row: PrognoseConsultantRow): PrognoseStatus {
  return getStatusOverride(row.id) ?? row.status;
}

// ----- Metric tier (color coding) -----
export type MetricTier = "good" | "ok" | "warn" | "bad";
export function metricTier(actual: number, target: number): MetricTier {
  const pct = target === 0 ? 1 : actual / target;
  if (pct >= 1) return "good";
  if (pct >= 0.75) return "ok";
  if (pct >= 0.5) return "warn";
  return "bad";
}
export function tierBg(t: MetricTier): string {
  return t === "good"
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
    : t === "ok"
      ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
      : t === "warn"
        ? "bg-orange-500/15 text-orange-700 dark:text-orange-400"
        : "bg-destructive/15 text-destructive";
}

// ----- Urgency (count of red metrics) -----
export type UrgencyLevel = "1.laag" | "2.middel" | "3.hoog" | "4.extreem hoog";
export function redMetricCount(row: PrognoseConsultantRow): number {
  let n = 0;
  if (metricTier(row.intakes.actual, row.intakes.target) === "bad") n++;
  if (metricTier(row.acquisities.actual, row.acquisities.target) === "bad") n++;
  if (metricTier(row.voorstellen.actual, row.voorstellen.target) === "bad") n++;
  if (metricTier(row.gesprekken.actual, row.gesprekken.target) === "bad") n++;
  if (metricTier(row.plaatsingen.actual, row.plaatsingen.target) === "bad") n++;
  return n;
}
export function urgencyLevel(row: PrognoseConsultantRow): UrgencyLevel {
  const n = redMetricCount(row);
  if (n >= 4) return "4.extreem hoog";
  if (n === 3) return "3.hoog";
  if (n === 2) return "2.middel";
  return "1.laag";
}

// ----- Period scaling -----
export function scaleRow(row: PrognoseConsultantRow, scale: number): PrognoseConsultantRow {
  if (scale === 1) return row;
  const totalSec =
    (row.telefonie.hours * 3600 + row.telefonie.minutes * 60 + row.telefonie.seconds) * scale;
  return {
    ...row,
    intakes: { actual: row.intakes.actual * scale, target: row.intakes.target * scale },
    acquisities: { actual: row.acquisities.actual * scale, target: row.acquisities.target * scale },
    voorstellen: { actual: row.voorstellen.actual * scale, target: row.voorstellen.target * scale },
    gesprekken: { actual: row.gesprekken.actual * scale, target: row.gesprekken.target * scale },
    plaatsingen: { actual: row.plaatsingen.actual * scale, target: row.plaatsingen.target * scale },
    telefonie: {
      hours: Math.floor(totalSec / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
    },
  };
}

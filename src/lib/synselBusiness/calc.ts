/**
 * Rekenmodule "Bouw je eigen business".
 * Pure functies, los van de UI. Intern volledige precisie, afronden pas bij weergave.
 */

export interface Assumptions {
  /** Verwachte factureerbare uren per kalenderweek */
  hoursPerWeek: number;
  /** Brutomarge per uur */
  marginPerHour: number;
  /** Looptijd opdracht in weken */
  durationWeeks: number;
  /** Annualisatiehorizon in weken */
  annualWeeks: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  hoursPerWeek: 34,
  marginPerHour: 21.5,
  durationWeeks: 30,
  annualWeeks: 52,
};

export const MILESTONES = [3, 5, 8, 10, 13, 20, 26];

export type EvidenceState = "waargenomen" | "bevestigd" | "geschat";

export interface AssignmentEpisode {
  id: string;
  professional: string;
  employer: string;
  owner: string;
  /** Werkelijke startdatum (ISO) */
  actualStart: string | null;
  /** Geplande startdatum voor toekomstige starts (ISO) */
  plannedStart?: string | null;
  /** Verwachte einddatum (ISO) of null bij geldig open einde */
  expectedEnd: string | null;
  /** Werkelijke einddatum (ISO) */
  actualEnd: string | null;
  status: "actief" | "bevestigde-start" | "afgerond" | "geannuleerd" | "no-show";
  openEnded: boolean;
  hoursPerWeek: number;
  marginPerHour: number;
  evidence: EvidenceState;
  sourceStatus: string;
}

/** Weekmarge per professional volgens de aannames */
export function weeklyMargin(a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return a.hoursPerWeek * a.marginPerHour;
}

/** Geannualiseerde marge per professional (constant-niveau scenario) */
export function annualizedMarginPerProfessional(a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return weeklyMargin(a) * a.annualWeeks;
}

/** Potentiële marge over de volledige looptijd van één plaatsing */
export function potentialMarginPerPlacement(a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return weeklyMargin(a) * a.durationWeeks;
}

/** Equivalent gemiddeld aantal actieve professionals voor een margedoel */
export function equivalentActiveCount(target: number, a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return target / annualizedMarginPerProfessional(a);
}

/** Benodigd aantal hele professionals om de financiële drempel te halen */
export function requiredWholeActiveCount(target: number, a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return Math.ceil(equivalentActiveCount(target, a));
}

/** Onderhoudsstarts per jaar in een expliciet steady-state model */
export function maintenanceStartsPerYear(target: number, a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return target / potentialMarginPerPlacement(a);
}

/** Onderhoudsstarts per week in een expliciet steady-state model */
export function maintenanceStartsPerWeek(target: number, a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return maintenanceStartsPerYear(target, a) / a.annualWeeks;
}

/** Continue opbouwbenadering vanaf nul: gerealiseerde marge in het eerste jaar */
export function buildUpFirstYearMargin(startsPerWeek: number, a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  const { annualWeeks: T, durationWeeks: L } = a;
  const w = weeklyMargin(a);
  if (T <= L) return (w * startsPerWeek * T * T) / 2;
  return w * startsPerWeek * (L * T - (L * L) / 2);
}

/** Benodigde continue starts per week voor een gerealiseerd eerstejaarsdoel */
export function buildUpRequiredStartsPerWeek(target: number, a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  const perUnit = buildUpFirstYearMargin(1, a);
  return target / perUnit;
}

export interface BuildUpScenario {
  startsPerWeek: number;
  startsPerYear: number;
  startsPerCalendarMonth: number;
  activeAtYearEnd: number;
  annualizedMarginAtYearEnd: number;
}

/** Volledig opbouwscenario voor een gerealiseerd eerstejaarsdoel */
export function buildUpScenario(target: number, a: Assumptions = DEFAULT_ASSUMPTIONS): BuildUpScenario {
  const s = buildUpRequiredStartsPerWeek(target, a);
  const activeAtYearEnd = s * Math.min(a.durationWeeks, a.annualWeeks);
  return {
    startsPerWeek: s,
    startsPerYear: s * a.annualWeeks,
    startsPerCalendarMonth: (s * a.annualWeeks) / 12,
    activeAtYearEnd,
    annualizedMarginAtYearEnd: activeAtYearEnd * annualizedMarginPerProfessional(a),
  };
}

/** Volgende mijlpaal in de configureerbare reeks */
export function nextMilestone(active: number, milestones: number[] = MILESTONES): number | null {
  return milestones.find((m) => m > active) ?? null;
}

/** Benodigde extra starts voor een gedateerd doel, minimaal 0 */
export function requiredStarts(input: {
  targetActive: number;
  currentActive: number;
  exitsBeforeTarget: number;
  confirmedStartsBeforeTarget: number;
}): number {
  const raw =
    input.targetActive - input.currentActive + input.exitsBeforeTarget - input.confirmedStartsBeforeTarget;
  return Math.max(0, raw);
}

/** Netto commerciële groei: werkelijke starts minus werkelijke uitstroom */
export function netCommercialGrowth(actualStarts: number, actualExits: number): number {
  return actualStarts - actualExits;
}

/** Portefeuillemutatie inclusief eigendomsoverdrachten */
export function portfolioBalanceChange(
  actualStarts: number,
  actualExits: number,
  transfersIn: number,
  transfersOut: number,
): number {
  return netCommercialGrowth(actualStarts, actualExits) + transfersIn - transfersOut;
}

/** Aantal actieve professionals op een datum (exclusieve einddatumconventie) */
export function activeProfessionalsOn(episodes: AssignmentEpisode[], date: Date): number {
  const t = date.getTime();
  const ids = new Set<string>();
  for (const e of episodes) {
    if (!e.actualStart) continue;
    if (new Date(e.actualStart).getTime() > t) continue;
    const end = e.actualEnd ?? null;
    if (end && new Date(end).getTime() <= t) continue;
    ids.add(e.professional);
  }
  return ids.size;
}

/** Geplande weekmarge van een set actieve opdrachten */
export function weeklyPlannedMargin(episodes: AssignmentEpisode[]): number {
  return episodes
    .filter((e) => e.status === "actief")
    .reduce((sum, e) => sum + e.hoursPerWeek * e.marginPerHour, 0);
}

/** Geannualiseerde huidige marge, expliciet een constant-niveau scenario */
export function annualizedCurrentMargin(
  episodes: AssignmentEpisode[],
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): number {
  return weeklyPlannedMargin(episodes) * a.annualWeeks;
}

// ---------- Weergave ----------

export function formatEuro(value: number, decimals = 0): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(iso: string | null, fallback = "Open einde"): string {
  if (!iso) return fallback;
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Amsterdam",
  });
}

export const FINANCIAL_TARGETS = [500000, 750000, 1000000, 1250000, 1500000, 1750000, 2000000];

import { aggregateQualityScore } from "@/marketing-dashboard/lib/marketingQuality";

// Marketing Hub — centralised data, types, and aggregation helpers

// ──────────────────── Shared types ────────────────────

export interface MarketingKPI {
  label: string;
  value: number;
  previousValue: number;
  format?: "number" | "currency";
}

export interface PaidChannelRow {
  source: string;
  conversions: number;
  registrations: number;
  spend: number;
  qualityScore: number;
  unit: "Operators" | "Monteurs" | "Engineering";
  functiegroep: string;
}

export interface JobboardRow {
  board: string;
  category: string;
  conversions: number;
  registrations: number;
  spend: number;
  qualityScore: number;
  unit: "Operators" | "Monteurs" | "Engineering";
}

export interface PaidSocialRow {
  platform: string;
  segment: string;
  conversions: number;
  registrations: number;
  spend: number;
  qualityScore: number;
  unit: "Operators" | "Monteurs" | "Engineering";
}

export interface AdLevelRow {
  adType: string;
  platform: string;
  conversions: number;
  registrations: number;
  spend: number;
  qualityScore: number;
  unit: "Operators" | "Monteurs" | "Engineering";
  functiegroep: string;
}

export interface ReverseMatchingRow {
  step: string;
  volume: number;
  units?: { unit: string; volume: number }[];
}

// High-contrast color palette for Marketing Hub charts
export const MARKETING_COLORS = [
  "#B8860B", // dark gold
  "#0E7C6B", // teal
  "#2563EB", // blue
  "#E85D04", // orange
  "#7C3AED", // violet
  "#DC2626", // red
];

// ──────────────────── Demo data ────────────────────

const unitToFG: Record<string, string> = {
  Operators: "Operator",
  Monteurs: "Monteur",
  Engineering: "Engineer",
};

const paidChannelBaseData: PaidChannelRow[] = [
  { source: "Indeed", conversions: 142, registrations: 98, spend: 4200, qualityScore: 74, unit: "Operators", functiegroep: "Operator" },
  { source: "Indeed", conversions: 118, registrations: 82, spend: 3600, qualityScore: 77, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "Indeed", conversions: 67, registrations: 45, spend: 2100, qualityScore: 87, unit: "Engineering", functiegroep: "Engineer" },
  { source: "Werkzoeken.nl", conversions: 89, registrations: 61, spend: 2800, qualityScore: 69, unit: "Operators", functiegroep: "Operator" },
  { source: "Werkzoeken.nl", conversions: 72, registrations: 48, spend: 2200, qualityScore: 81, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "Werkzoeken.nl", conversions: 34, registrations: 22, spend: 1400, qualityScore: 89, unit: "Engineering", functiegroep: "Engineer" },
  { source: "Technicus.nl", conversions: 45, registrations: 31, spend: 1500, qualityScore: 90, unit: "Engineering", functiegroep: "Engineer" },
  { source: "Technicus.nl", conversions: 28, registrations: 18, spend: 900, qualityScore: 77, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "Technicus.nl", conversions: 15, registrations: 10, spend: 600, qualityScore: 74, unit: "Operators", functiegroep: "Operator" },
  { source: "Jobster", conversions: 52, registrations: 36, spend: 0, qualityScore: 68, unit: "Operators", functiegroep: "Operator" },
  { source: "Jobster", conversions: 38, registrations: 25, spend: 0, qualityScore: 77, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "Jobster", conversions: 21, registrations: 14, spend: 0, qualityScore: 84, unit: "Engineering", functiegroep: "Engineer" },
  { source: "Meta", conversions: 96, registrations: 64, spend: 3200, qualityScore: 73, unit: "Operators", functiegroep: "Operator" },
  { source: "Meta", conversions: 78, registrations: 52, spend: 2600, qualityScore: 85, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "Meta", conversions: 43, registrations: 28, spend: 1600, qualityScore: 91, unit: "Engineering", functiegroep: "Engineer" },
  { source: "Google Ads", conversions: 110, registrations: 74, spend: 3800, qualityScore: 70, unit: "Operators", functiegroep: "Operator" },
  { source: "Google Ads", conversions: 85, registrations: 56, spend: 2900, qualityScore: 79, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "Google Ads", conversions: 55, registrations: 37, spend: 2000, qualityScore: 86, unit: "Engineering", functiegroep: "Engineer" },
  { source: "TikTok", conversions: 64, registrations: 42, spend: 2100, qualityScore: 71, unit: "Operators", functiegroep: "Operator" },
  { source: "TikTok", conversions: 48, registrations: 31, spend: 1600, qualityScore: 84, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "TikTok", conversions: 22, registrations: 14, spend: 900, qualityScore: 84, unit: "Engineering", functiegroep: "Engineer" },
  { source: "Bing", conversions: 31, registrations: 20, spend: 1100, qualityScore: 70, unit: "Operators", functiegroep: "Operator" },
  { source: "Bing", conversions: 24, registrations: 15, spend: 850, qualityScore: 85, unit: "Monteurs", functiegroep: "Monteur" },
  { source: "Bing", conversions: 12, registrations: 8, spend: 500, qualityScore: 89, unit: "Engineering", functiegroep: "Engineer" },
];

// Split existing demo totals into detailed groups without increasing volumes or spend.
const demoFunctionGroups: Record<PaidChannelRow["unit"], string[]> = {
  Operators: ["Procesoperator", "Machineoperator", "Productieoperator", "Allround operator", "Chemisch operator", "Voedingsmiddelenoperator", "Verpakkingsoperator", "CNC operator", "Extrusieoperator", "Mengoperator", "Drukkerijoperator", "Logistiek operator"],
  Monteurs: ["Onderhoudsmonteur", "Storingsmonteur", "Elektromonteur", "Assemblagemonteur", "Servicemonteur", "Installatiemonteur", "Mechanisch monteur", "Mechatronica monteur", "Koeltechnisch monteur", "Werkplaatsmonteur", "Hydrauliekmonteur", "Monteur technische dienst"],
  Engineering: ["Mechanical engineer", "Electrical engineer", "Software engineer", "Process engineer", "Project engineer", "Automation engineer", "Quality engineer", "Manufacturing engineer", "R&D engineer", "Maintenance engineer", "Sales engineer", "Design engineer"],
};
export const paidChannelData: PaidChannelRow[] = paidChannelBaseData.flatMap((row, index) =>
  Array.from({ length: 4 }, (_, part) => ({
    ...row,
    functiegroep: demoFunctionGroups[row.unit][(Math.floor(index / 3) * 4 + part) % 12] ?? row.functiegroep,
    conversions: Math.floor(row.conversions * (part + 1) / 4) - Math.floor(row.conversions * part / 4),
    registrations: Math.floor(row.registrations * (part + 1) / 4) - Math.floor(row.registrations * part / 4),
    spend: row.spend / 4,
  }))
);

const jobboardBaseData: JobboardRow[] = [
  // Indeed
  { board: "Indeed", category: "Assemblage Monteur", conversions: 52, registrations: 36, spend: 1500, qualityScore: 83, unit: "Monteurs" },
  { board: "Indeed", category: "Monteur", conversions: 66, registrations: 44, spend: 2100, qualityScore: 80, unit: "Monteurs" },
  { board: "Indeed", category: "Engineer", conversions: 67, registrations: 45, spend: 2100, qualityScore: 87, unit: "Engineering" },
  { board: "Indeed", category: "Operator", conversions: 142, registrations: 98, spend: 4200, qualityScore: 74, unit: "Operators" },
  // Werkzoeken.nl
  { board: "Werkzoeken.nl", category: "Assemblage Monteur", conversions: 28, registrations: 18, spend: 900, qualityScore: 77, unit: "Monteurs" },
  { board: "Werkzoeken.nl", category: "Monteur", conversions: 44, registrations: 30, spend: 1300, qualityScore: 81, unit: "Monteurs" },
  { board: "Werkzoeken.nl", category: "Engineer", conversions: 34, registrations: 22, spend: 1400, qualityScore: 89, unit: "Engineering" },
  { board: "Werkzoeken.nl", category: "Operator", conversions: 89, registrations: 61, spend: 2800, qualityScore: 69, unit: "Operators" },
  // Technicus.nl
  { board: "Technicus.nl", category: "Engineer", conversions: 45, registrations: 31, spend: 1500, qualityScore: 90, unit: "Engineering" },
  { board: "Technicus.nl", category: "Monteur", conversions: 28, registrations: 18, spend: 900, qualityScore: 77, unit: "Monteurs" },
  { board: "Technicus.nl", category: "Operator", conversions: 15, registrations: 10, spend: 600, qualityScore: 74, unit: "Operators" },
  // Jobster
  { board: "Jobster", category: "Monteur", conversions: 38, registrations: 25, spend: 0, qualityScore: 77, unit: "Monteurs" },
  { board: "Jobster", category: "Operator", conversions: 52, registrations: 36, spend: 0, qualityScore: 68, unit: "Operators" },
  { board: "Jobster", category: "Engineer", conversions: 21, registrations: 14, spend: 0, qualityScore: 84, unit: "Engineering" },
];

const paidSocialBaseData: PaidSocialRow[] = [
  // Facebook/Meta
  { platform: "Facebook", segment: "Monteur", conversions: 42, registrations: 28, spend: 1400, qualityScore: 82, unit: "Monteurs" },
  { platform: "Facebook", segment: "Engineer", conversions: 24, registrations: 16, spend: 900, qualityScore: 84, unit: "Engineering" },
  { platform: "Facebook", segment: "Operator", conversions: 54, registrations: 36, spend: 1800, qualityScore: 68, unit: "Operators" },
  { platform: "Facebook", segment: "General", conversions: 30, registrations: 20, spend: 1000, qualityScore: 69, unit: "Operators" },
  // Google Ads
  { platform: "Google Ads", segment: "Monteur", conversions: 48, registrations: 32, spend: 1600, qualityScore: 84, unit: "Monteurs" },
  { platform: "Google Ads", segment: "Engineer", conversions: 31, registrations: 21, spend: 1100, qualityScore: 86, unit: "Engineering" },
  { platform: "Google Ads", segment: "Operator", conversions: 62, registrations: 42, spend: 2100, qualityScore: 71, unit: "Operators" },
  { platform: "Google Ads", segment: "General", conversions: 24, registrations: 16, spend: 800, qualityScore: 76, unit: "Operators" },
  // TikTok
  { platform: "TikTok", segment: "Monteur", conversions: 28, registrations: 18, spend: 900, qualityScore: 77, unit: "Monteurs" },
  { platform: "TikTok", segment: "Engineer", conversions: 12, registrations: 8, spend: 500, qualityScore: 89, unit: "Engineering" },
  { platform: "TikTok", segment: "Operator", conversions: 38, registrations: 25, spend: 1300, qualityScore: 72, unit: "Operators" },
  { platform: "TikTok", segment: "General", conversions: 18, registrations: 12, spend: 600, qualityScore: 74, unit: "Operators" },
  // Bing
  { platform: "Bing", segment: "Monteur", conversions: 14, registrations: 9, spend: 500, qualityScore: 82, unit: "Monteurs" },
  { platform: "Bing", segment: "Engineer", conversions: 8, registrations: 5, spend: 300, qualityScore: 87, unit: "Engineering" },
  { platform: "Bing", segment: "Operator", conversions: 18, registrations: 12, spend: 650, qualityScore: 74, unit: "Operators" },
  { platform: "Bing", segment: "General", conversions: 10, registrations: 6, spend: 350, qualityScore: 71, unit: "Operators" },
];

const adLevelBaseData: AdLevelRow[] = [
  // Go Video
  { adType: "Go Video", platform: "Facebook", conversions: 62, registrations: 41, spend: 2100, qualityScore: 71, unit: "Operators", functiegroep: "Operator" },
  { adType: "Go Video", platform: "Google Ads", conversions: 48, registrations: 32, spend: 1600, qualityScore: 84, unit: "Monteurs", functiegroep: "Monteur" },
  { adType: "Go Video", platform: "TikTok", conversions: 55, registrations: 36, spend: 1800, qualityScore: 68, unit: "Operators", functiegroep: "Operator" },
  { adType: "Go Video", platform: "Bing", conversions: 18, registrations: 12, spend: 650, qualityScore: 90, unit: "Engineering", functiegroep: "Engineer" },
  // Go Static
  { adType: "Go Static", platform: "Facebook", conversions: 38, registrations: 25, spend: 1300, qualityScore: 81, unit: "Monteurs", functiegroep: "Monteur" },
  { adType: "Go Static", platform: "Google Ads", conversions: 52, registrations: 35, spend: 1800, qualityScore: 68, unit: "Operators", functiegroep: "Operator" },
  { adType: "Go Static", platform: "TikTok", conversions: 22, registrations: 14, spend: 700, qualityScore: 91, unit: "Engineering", functiegroep: "Engineer" },
  { adType: "Go Static", platform: "Bing", conversions: 14, registrations: 9, spend: 450, qualityScore: 81, unit: "Monteurs", functiegroep: "Monteur" },
  // Frame Animation Static
  { adType: "Frame Animation Static", platform: "Facebook", conversions: 28, registrations: 18, spend: 900, qualityScore: 84, unit: "Engineering", functiegroep: "Engineer" },
  { adType: "Frame Animation Static", platform: "Google Ads", conversions: 35, registrations: 23, spend: 1200, qualityScore: 71, unit: "Operators", functiegroep: "Operator" },
  { adType: "Frame Animation Static", platform: "TikTok", conversions: 15, registrations: 10, spend: 500, qualityScore: 82, unit: "Monteurs", functiegroep: "Monteur" },
  { adType: "Frame Animation Static", platform: "Bing", conversions: 8, registrations: 5, spend: 300, qualityScore: 87, unit: "Engineering", functiegroep: "Engineer" },
  // Frame Animation Video
  { adType: "Frame Animation Video", platform: "Facebook", conversions: 45, registrations: 30, spend: 1500, qualityScore: 74, unit: "Operators", functiegroep: "Operator" },
  { adType: "Frame Animation Video", platform: "Google Ads", conversions: 38, registrations: 25, spend: 1300, qualityScore: 81, unit: "Monteurs", functiegroep: "Monteur" },
  { adType: "Frame Animation Video", platform: "TikTok", conversions: 32, registrations: 21, spend: 1100, qualityScore: 86, unit: "Engineering", functiegroep: "Engineer" },
  { adType: "Frame Animation Video", platform: "Bing", conversions: 12, registrations: 8, spend: 400, qualityScore: 72, unit: "Operators", functiegroep: "Operator" },
];

/** Reuse the same detailed groups across tabs, preserving every original row total. */
function expandDemoGroups<T extends { unit: PaidChannelRow["unit"]; conversions: number; registrations: number; spend: number }>(
  data: T[], label: (name: string) => Partial<T>,
): T[] {
  const positions = new Map<string, number>();
  return data.flatMap(row => {
    const position = positions.get(row.unit) ?? 0;
    positions.set(row.unit, position + 4);
    return Array.from({ length: 4 }, (_, part) => {
      const allocate = (value: number) => Math.floor(value * (part + 1) / 4) - Math.floor(value * part / 4);
      const registrations = allocate(row.registrations);
      return { ...row, ...label(demoFunctionGroups[row.unit][(position + part) % 12] ?? row.unit),
        registrations, conversions: registrations + allocate(row.conversions - row.registrations), spend: row.spend / 4 };
    });
  });
}
export const jobboardData: JobboardRow[] = expandDemoGroups(jobboardBaseData, category => ({ category }));
export const paidSocialData: PaidSocialRow[] = expandDemoGroups(paidSocialBaseData, segment => ({ segment }));
export const adLevelData: AdLevelRow[] = expandDemoGroups(adLevelBaseData, functiegroep => ({ functiegroep }));

export const reverseMatchingSteps: ReverseMatchingRow[] = [
  { step: "Benaderd", volume: 480, units: [{ unit: "Operators", volume: 210 }, { unit: "Monteurs", volume: 165 }, { unit: "Engineering", volume: 105 }] },
  { step: "Vacature Aanvraag", volume: 312, units: [{ unit: "Operators", volume: 138 }, { unit: "Monteurs", volume: 104 }, { unit: "Engineering", volume: 70 }] },
  { step: "Voorgesteld", volume: 234, units: [{ unit: "Operators", volume: 102 }, { unit: "Monteurs", volume: 78 }, { unit: "Engineering", volume: 54 }] },
  { step: "Op Gesprek", volume: 156, units: [{ unit: "Operators", volume: 68 }, { unit: "Monteurs", volume: 52 }, { unit: "Engineering", volume: 36 }] },
  { step: "2e Gesprek", volume: 89, units: [{ unit: "Operators", volume: 39 }, { unit: "Monteurs", volume: 30 }, { unit: "Engineering", volume: 20 }] },
  { step: "Geplaatst", volume: 52, units: [{ unit: "Operators", volume: 23 }, { unit: "Monteurs", volume: 17 }, { unit: "Engineering", volume: 12 }] },
];

// ──────────────────── Aggregation helpers ────────────────────

export function aggregatePaidChannels(data: PaidChannelRow[]) {
  const grouped = new Map<string, { conversions: number; registrations: number; spend: number }>();
  for (const row of data) {
    const existing = grouped.get(row.source) || { conversions: 0, registrations: 0, spend: 0 };
    existing.conversions += row.conversions;
    existing.registrations += row.registrations;
    existing.spend += row.spend;
    grouped.set(row.source, existing);
  }
  return Array.from(grouped.entries()).map(([source, vals]) => ({
    source,
    ...vals,
    qualityScore: aggregateQualityScore(data.filter(row => row.source === source)),
    cpr: vals.registrations > 0 ? vals.spend / vals.registrations : 0,
  }));
}

export function aggregateByUnit(data: { unit: string; registrations: number; conversions: number }[]) {
  const grouped = new Map<string, { registrations: number; acquisitions: number }>();
  for (const row of data) {
    const existing = grouped.get(row.unit) || { registrations: 0, acquisitions: 0 };
    existing.registrations += row.registrations;
    existing.acquisitions += row.conversions;
    grouped.set(row.unit, existing);
  }
  return Array.from(grouped.entries()).map(([unit, vals]) => ({ unit, ...vals }));
}

/** Aggregate by functiegroep field (paid channels, ad level) or segment/category */
export function aggregateByFunctiegroep(data: { functiegroep?: string; segment?: string; category?: string; registrations: number; conversions: number }[]) {
  const grouped = new Map<string, { registrations: number; acquisitions: number }>();
  for (const row of data) {
    const key = (row as any).functiegroep || (row as any).segment || (row as any).category || "Overig";
    const existing = grouped.get(key) || { registrations: 0, acquisitions: 0 };
    existing.registrations += row.registrations;
    existing.acquisitions += row.conversions;
    grouped.set(key, existing);
  }
  return Array.from(grouped.entries()).map(([unit, vals]) => ({ unit, ...vals }));
}

export function totals(data: { conversions: number; registrations: number; spend: number; qualityScore?: number }[]) {
  const sum = data.reduce(
    (acc, r) => ({
      conversions: acc.conversions + r.conversions,
      registrations: acc.registrations + r.registrations,
      spend: acc.spend + r.spend,
    }),
    { conversions: 0, registrations: 0, spend: 0 }
  );
  return { ...sum, qualityScore: aggregateQualityScore(data) };
}

export function formatCurrency(value: number): string {
  return `€${value.toLocaleString("nl-NL")}`;
}

export function safeDivide(a: number, b: number): number | null {
  return b === 0 ? null : a / b;
}

export function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Previous period mock multiplier (simulates ~15% lower previous period)
export function previousPeriodValue(current: number): number {
  return Math.round(current * (0.78 + Math.random() * 0.14));
}

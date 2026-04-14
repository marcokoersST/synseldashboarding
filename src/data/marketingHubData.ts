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
  unit: "Operators" | "Monteurs" | "Engineering";
}

export interface JobboardRow {
  board: string;
  category: string;
  conversions: number;
  registrations: number;
  spend: number;
  unit: "Operators" | "Monteurs" | "Engineering";
}

export interface PaidSocialRow {
  platform: string;
  segment: string;
  conversions: number;
  registrations: number;
  spend: number;
  unit: "Operators" | "Monteurs" | "Engineering";
}

export interface AdLevelRow {
  adType: string;
  platform: string;
  conversions: number;
  registrations: number;
  spend: number;
  unit: "Operators" | "Monteurs" | "Engineering";
}

export interface ReverseMatchingRow {
  step: string;
  volume: number;
}

// ──────────────────── Demo data ────────────────────

export const paidChannelData: PaidChannelRow[] = [
  { source: "Indeed", conversions: 142, registrations: 98, spend: 4200, unit: "Operators" },
  { source: "Indeed", conversions: 118, registrations: 82, spend: 3600, unit: "Monteurs" },
  { source: "Indeed", conversions: 67, registrations: 45, spend: 2100, unit: "Engineering" },
  { source: "Werkzoeken.nl", conversions: 89, registrations: 61, spend: 2800, unit: "Operators" },
  { source: "Werkzoeken.nl", conversions: 72, registrations: 48, spend: 2200, unit: "Monteurs" },
  { source: "Werkzoeken.nl", conversions: 34, registrations: 22, spend: 1400, unit: "Engineering" },
  { source: "Technicus.nl", conversions: 45, registrations: 31, spend: 1500, unit: "Engineering" },
  { source: "Technicus.nl", conversions: 28, registrations: 18, spend: 900, unit: "Monteurs" },
  { source: "Technicus.nl", conversions: 15, registrations: 10, spend: 600, unit: "Operators" },
  { source: "Jobster", conversions: 52, registrations: 36, spend: 1800, unit: "Operators" },
  { source: "Jobster", conversions: 38, registrations: 25, spend: 1300, unit: "Monteurs" },
  { source: "Jobster", conversions: 21, registrations: 14, spend: 800, unit: "Engineering" },
  { source: "Meta", conversions: 96, registrations: 64, spend: 3200, unit: "Operators" },
  { source: "Meta", conversions: 78, registrations: 52, spend: 2600, unit: "Monteurs" },
  { source: "Meta", conversions: 43, registrations: 28, spend: 1600, unit: "Engineering" },
  { source: "Google Ads", conversions: 110, registrations: 74, spend: 3800, unit: "Operators" },
  { source: "Google Ads", conversions: 85, registrations: 56, spend: 2900, unit: "Monteurs" },
  { source: "Google Ads", conversions: 55, registrations: 37, spend: 2000, unit: "Engineering" },
  { source: "TikTok", conversions: 64, registrations: 42, spend: 2100, unit: "Operators" },
  { source: "TikTok", conversions: 48, registrations: 31, spend: 1600, unit: "Monteurs" },
  { source: "TikTok", conversions: 22, registrations: 14, spend: 900, unit: "Engineering" },
  { source: "Bing", conversions: 31, registrations: 20, spend: 1100, unit: "Operators" },
  { source: "Bing", conversions: 24, registrations: 15, spend: 850, unit: "Monteurs" },
  { source: "Bing", conversions: 12, registrations: 8, spend: 500, unit: "Engineering" },
];

export const jobboardData: JobboardRow[] = [
  // Indeed
  { board: "Indeed", category: "Assemblage Monteur", conversions: 52, registrations: 36, spend: 1500, unit: "Monteurs" },
  { board: "Indeed", category: "Monteur", conversions: 66, registrations: 44, spend: 2100, unit: "Monteurs" },
  { board: "Indeed", category: "Engineer", conversions: 67, registrations: 45, spend: 2100, unit: "Engineering" },
  { board: "Indeed", category: "Operator", conversions: 142, registrations: 98, spend: 4200, unit: "Operators" },
  // Werkzoeken.nl
  { board: "Werkzoeken.nl", category: "Assemblage Monteur", conversions: 28, registrations: 18, spend: 900, unit: "Monteurs" },
  { board: "Werkzoeken.nl", category: "Monteur", conversions: 44, registrations: 30, spend: 1300, unit: "Monteurs" },
  { board: "Werkzoeken.nl", category: "Engineer", conversions: 34, registrations: 22, spend: 1400, unit: "Engineering" },
  { board: "Werkzoeken.nl", category: "Operator", conversions: 89, registrations: 61, spend: 2800, unit: "Operators" },
  // Technicus.nl
  { board: "Technicus.nl", category: "Engineer", conversions: 45, registrations: 31, spend: 1500, unit: "Engineering" },
  { board: "Technicus.nl", category: "Monteur", conversions: 28, registrations: 18, spend: 900, unit: "Monteurs" },
  { board: "Technicus.nl", category: "Operator", conversions: 15, registrations: 10, spend: 600, unit: "Operators" },
  // Jobster
  { board: "Jobster", category: "Monteur", conversions: 38, registrations: 25, spend: 1300, unit: "Monteurs" },
  { board: "Jobster", category: "Operator", conversions: 52, registrations: 36, spend: 1800, unit: "Operators" },
  { board: "Jobster", category: "Engineer", conversions: 21, registrations: 14, spend: 800, unit: "Engineering" },
];

export const paidSocialData: PaidSocialRow[] = [
  // Facebook/Meta
  { platform: "Facebook", segment: "Monteur", conversions: 42, registrations: 28, spend: 1400, unit: "Monteurs" },
  { platform: "Facebook", segment: "Engineer", conversions: 24, registrations: 16, spend: 900, unit: "Engineering" },
  { platform: "Facebook", segment: "Operator", conversions: 54, registrations: 36, spend: 1800, unit: "Operators" },
  { platform: "Facebook", segment: "General", conversions: 30, registrations: 20, spend: 1000, unit: "Operators" },
  // Google Ads
  { platform: "Google Ads", segment: "Monteur", conversions: 48, registrations: 32, spend: 1600, unit: "Monteurs" },
  { platform: "Google Ads", segment: "Engineer", conversions: 31, registrations: 21, spend: 1100, unit: "Engineering" },
  { platform: "Google Ads", segment: "Operator", conversions: 62, registrations: 42, spend: 2100, unit: "Operators" },
  { platform: "Google Ads", segment: "General", conversions: 24, registrations: 16, spend: 800, unit: "Operators" },
  // TikTok
  { platform: "TikTok", segment: "Monteur", conversions: 28, registrations: 18, spend: 900, unit: "Monteurs" },
  { platform: "TikTok", segment: "Engineer", conversions: 12, registrations: 8, spend: 500, unit: "Engineering" },
  { platform: "TikTok", segment: "Operator", conversions: 38, registrations: 25, spend: 1300, unit: "Operators" },
  { platform: "TikTok", segment: "General", conversions: 18, registrations: 12, spend: 600, unit: "Operators" },
  // Bing
  { platform: "Bing", segment: "Monteur", conversions: 14, registrations: 9, spend: 500, unit: "Monteurs" },
  { platform: "Bing", segment: "Engineer", conversions: 8, registrations: 5, spend: 300, unit: "Engineering" },
  { platform: "Bing", segment: "Operator", conversions: 18, registrations: 12, spend: 650, unit: "Operators" },
  { platform: "Bing", segment: "General", conversions: 10, registrations: 6, spend: 350, unit: "Operators" },
];

export const adLevelData: AdLevelRow[] = [
  // Go Video
  { adType: "Go Video", platform: "Facebook", conversions: 62, registrations: 41, spend: 2100, unit: "Operators" },
  { adType: "Go Video", platform: "Google Ads", conversions: 48, registrations: 32, spend: 1600, unit: "Monteurs" },
  { adType: "Go Video", platform: "TikTok", conversions: 55, registrations: 36, spend: 1800, unit: "Operators" },
  { adType: "Go Video", platform: "Bing", conversions: 18, registrations: 12, spend: 650, unit: "Engineering" },
  // Go Static
  { adType: "Go Static", platform: "Facebook", conversions: 38, registrations: 25, spend: 1300, unit: "Monteurs" },
  { adType: "Go Static", platform: "Google Ads", conversions: 52, registrations: 35, spend: 1800, unit: "Operators" },
  { adType: "Go Static", platform: "TikTok", conversions: 22, registrations: 14, spend: 700, unit: "Engineering" },
  { adType: "Go Static", platform: "Bing", conversions: 14, registrations: 9, spend: 450, unit: "Monteurs" },
  // Frame Animation Static
  { adType: "Frame Animation Static", platform: "Facebook", conversions: 28, registrations: 18, spend: 900, unit: "Engineering" },
  { adType: "Frame Animation Static", platform: "Google Ads", conversions: 35, registrations: 23, spend: 1200, unit: "Operators" },
  { adType: "Frame Animation Static", platform: "TikTok", conversions: 15, registrations: 10, spend: 500, unit: "Monteurs" },
  { adType: "Frame Animation Static", platform: "Bing", conversions: 8, registrations: 5, spend: 300, unit: "Engineering" },
  // Frame Animation Video
  { adType: "Frame Animation Video", platform: "Facebook", conversions: 45, registrations: 30, spend: 1500, unit: "Operators" },
  { adType: "Frame Animation Video", platform: "Google Ads", conversions: 38, registrations: 25, spend: 1300, unit: "Monteurs" },
  { adType: "Frame Animation Video", platform: "TikTok", conversions: 32, registrations: 21, spend: 1100, unit: "Engineering" },
  { adType: "Frame Animation Video", platform: "Bing", conversions: 12, registrations: 8, spend: 400, unit: "Operators" },
];

export const reverseMatchingSteps: ReverseMatchingRow[] = [
  { step: "Benaderd", volume: 480 },
  { step: "Vacature Aanvraag", volume: 312 },
  { step: "Voorgesteld", volume: 234 },
  { step: "Op Gesprek", volume: 156 },
  { step: "2e Gesprek", volume: 89 },
  { step: "Geplaatst", volume: 52 },
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

export function totals(data: { conversions: number; registrations: number; spend: number }[]) {
  return data.reduce(
    (acc, r) => ({
      conversions: acc.conversions + r.conversions,
      registrations: acc.registrations + r.registrations,
      spend: acc.spend + r.spend,
    }),
    { conversions: 0, registrations: 0, spend: 0 }
  );
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

// Omzet per consultant per periode, uitgesplitst naar type omzet (concept "Omzet dashboard - vernieuwde versie").
// Bouwt voort op de periodetotalen van het originele omzetdashboard; die data blijft ongewijzigd.
import { omzetConsultants } from "@/data/omzetDashboardData";

export const omzetTypes = [
  { key: "jigler", label: "Jigler" },
  { key: "please", label: "Please" },
  { key: "ws", label: "W&S" },
  { key: "margefacturatie", label: "Margefacturatie" },
  { key: "overnamefee", label: "Overname fee" },
] as const;

export type OmzetType = (typeof omzetTypes)[number]["key"];
export type ConsultantStatus = "actief" | "inactief";

export const alleOmzetTypes: OmzetType[] = omzetTypes.map((t) => t.key);

export interface ConsultantOmzetPerType {
  name: string;
  unit: string;
  status: ConsultantStatus;
  periodes: Record<string, Record<OmzetType, number>>; // e.g. { P1: { jigler: 25000, please: 8000, ... } }
}

const inactieveConsultants = new Set(["Mathijs van Dijk", "Jort Koggel"]);

/** Verdeel een periodetotaal vast (niet willekeurig) over de omzettypes; de som blijft gelijk aan het totaal. */
function splitPeriode(totaal: number, consultantIdx: number, periodeIdx: number): Record<OmzetType, number> {
  const variatie = (n: number) => ((consultantIdx * 37 + periodeIdx * 11 + n * 7) % 10) / 100;
  const overnamefee = (consultantIdx + periodeIdx) % 5 === 0 ? Math.round(totaal * (0.04 + variatie(4))) : 0;
  const ws = Math.round(totaal * (0.06 + variatie(2)));
  const margefacturatie = Math.round(totaal * (0.03 + variatie(3) / 2));
  const please = Math.round(totaal * (0.15 + variatie(1)));
  const jigler = totaal - please - ws - margefacturatie - overnamefee;
  return { jigler, please, ws, margefacturatie, overnamefee };
}

export const omzetConsultantsPerType: ConsultantOmzetPerType[] = omzetConsultants.map(
  (c, consultantIdx): ConsultantOmzetPerType => ({
    name: c.name,
    unit: c.unit,
    status: inactieveConsultants.has(c.name) ? "inactief" : "actief",
    periodes: Object.fromEntries(
      Object.entries(c.periodes).map(
        ([periode, totaal], periodeIdx): [string, Record<OmzetType, number>] => [
          periode,
          splitPeriode(totaal, consultantIdx, periodeIdx),
        ]
      )
    ),
  })
);

// Mock: omzet van eerdere jaren als vast deel van het huidige jaar (index 0 = huidig jaar)
const jaarFactoren = [1, 0.91, 0.84];

/** Kiesbare jaren, nieuwste eerst; schuift automatisch mee met de datum van vandaag */
export function beschikbareJaren(vandaag = new Date()): string[] {
  return jaarFactoren.map((_, i) => String(vandaag.getFullYear() - i));
}

export function jaarFactor(jaar: string, vandaag = new Date()): number {
  return jaarFactoren[vandaag.getFullYear() - Number(jaar)] ?? 1;
}

/** Som van de gekozen omzettypes over de gekozen periodes voor één consultant, per bedrag geschaald met de jaarfactor */
export function omzetVoorTypes(c: ConsultantOmzetPerType, periodes: string[], types: OmzetType[], factor = 1) {
  return periodes.reduce(
    (som, p) => som + types.reduce((s, type) => s + Math.round((c.periodes[p]?.[type] ?? 0) * factor), 0),
    0
  );
}

/** Sum multiple periods for each consultant (only the chosen revenue types), compare two groups, sort by verschil */
export function getOmzetPerTypeForPeriodeGroups(
  data: ConsultantOmzetPerType[],
  groep1: string[],
  groep2: string[],
  types: OmzetType[],
  factor1 = 1,
  factor2 = 1
) {
  return data
    .map((c) => {
      const sum1 = omzetVoorTypes(c, groep1, types, factor1);
      const sum2 = omzetVoorTypes(c, groep2, types, factor2);
      return { name: c.name, unit: c.unit, status: c.status, periode1: sum1, periode2: sum2, verschil: sum2 - sum1 };
    })
    .sort((a, b) => b.verschil - a.verschil);
}

/** Totaal per omzettype over alle meegegeven consultants, voor beide periodegroepen */
export function getUitsplitsingPerType(
  data: ConsultantOmzetPerType[],
  groep1: string[],
  groep2: string[],
  types: OmzetType[],
  factor1 = 1,
  factor2 = 1
) {
  return omzetTypes
    .filter((t) => types.includes(t.key))
    .map((t) => {
      const sum1 = data.reduce((s, c) => s + omzetVoorTypes(c, groep1, [t.key], factor1), 0);
      const sum2 = data.reduce((s, c) => s + omzetVoorTypes(c, groep2, [t.key], factor2), 0);
      return { key: t.key, label: t.label, periode1: sum1, periode2: sum2, verschil: sum2 - sum1 };
    });
}

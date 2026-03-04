// Omzet per consultant per periode (detachering omzet)

export interface ConsultantOmzet {
  name: string;
  unit: string;
  periodes: Record<string, number>; // e.g. { "P1": 60467, "P2": 80000, ... }
}

export const omzetConsultants: ConsultantOmzet[] = [
  { name: "Lars Hendriks", unit: "Operators", periodes: { P1: 42000, P2: 60467, P3: 80000, P4: 95000, P5: 108000, P6: 125000, P7: 132000, P8: 140000, P9: 155000, P10: 162000, P11: 175000, P12: 188000, P13: 198000 } },
  { name: "Sijmen de Boer", unit: "Monteurs", periodes: { P1: 35000, P2: 50000, P3: 60000, P4: 72000, P5: 85000, P6: 98000, P7: 105000, P8: 112000, P9: 120000, P10: 128000, P11: 138000, P12: 145000, P13: 155000 } },
  { name: "Mathijs van Dijk", unit: "Engineering", periodes: { P1: 55000, P2: 40000, P3: 25000, P4: 32000, P5: 48000, P6: 62000, P7: 58000, P8: 52000, P9: 45000, P10: 40000, P11: 38000, P12: 35000, P13: 42000 } },
  { name: "Delano Nikkels", unit: "Engineering", periodes: { P1: 38000, P2: 52000, P3: 68000, P4: 82000, P5: 91000, P6: 105000, P7: 115000, P8: 125000, P9: 138000, P10: 148000, P11: 160000, P12: 172000, P13: 185000 } },
  { name: "Falco Zegveld", unit: "Engineering", periodes: { P1: 45000, P2: 48000, P3: 55000, P4: 60000, P5: 72000, P6: 88000, P7: 92000, P8: 98000, P9: 105000, P10: 110000, P11: 118000, P12: 125000, P13: 132000 } },
  { name: "Eric Hutchison", unit: "Monteurs", periodes: { P1: 30000, P2: 42000, P3: 58000, P4: 65000, P5: 78000, P6: 90000, P7: 98000, P8: 108000, P9: 118000, P10: 125000, P11: 135000, P12: 148000, P13: 158000 } },
  { name: "Jonah Waterborg", unit: "Trainingsunit", periodes: { P1: 18000, P2: 25000, P3: 35000, P4: 42000, P5: 55000, P6: 68000, P7: 78000, P8: 88000, P9: 98000, P10: 108000, P11: 120000, P12: 132000, P13: 145000 } },
  { name: "Niels Eggens", unit: "Early Performers", periodes: { P1: 12000, P2: 20000, P3: 28000, P4: 38000, P5: 45000, P6: 52000, P7: 60000, P8: 70000, P9: 82000, P10: 92000, P11: 105000, P12: 118000, P13: 130000 } },
  { name: "Jort Koggel", unit: "Engineering", periodes: { P1: 60000, P2: 58000, P3: 62000, P4: 70000, P5: 82000, P6: 95000, P7: 88000, P8: 82000, P9: 78000, P10: 75000, P11: 72000, P12: 68000, P13: 70000 } },
  { name: "Stijn Koldenhoven", unit: "Monteurs", periodes: { P1: 28000, P2: 35000, P3: 45000, P4: 52000, P5: 60000, P6: 72000, P7: 80000, P8: 85000, P9: 92000, P10: 98000, P11: 105000, P12: 112000, P13: 120000 } },
  { name: "Miguel Kraaijeveld", unit: "Operators", periodes: { P1: 50000, P2: 65000, P3: 78000, P4: 88000, P5: 102000, P6: 118000, P7: 128000, P8: 138000, P9: 150000, P10: 160000, P11: 172000, P12: 185000, P13: 195000 } },
  { name: "Sander Beckker", unit: "Trainingsunit", periodes: { P1: 10000, P2: 15000, P3: 22000, P4: 30000, P5: 38000, P6: 45000, P7: 52000, P8: 60000, P9: 68000, P10: 75000, P11: 82000, P12: 90000, P13: 98000 } },
];

export const allPeriodes = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13"];

export function getOmzetForPeriodes(
  data: ConsultantOmzet[],
  periode1: string,
  periode2: string
) {
  return data
    .map((c) => {
      const val1 = c.periodes[periode1] ?? 0;
      const val2 = c.periodes[periode2] ?? 0;
      const verschil = val2 - val1;
      return { name: c.name, unit: c.unit, periode1: val1, periode2: val2, verschil };
    })
    .sort((a, b) => b.verschil - a.verschil);
}

/** Sum multiple periods for each consultant, compare two groups, sort by verschil */
export function getOmzetForPeriodeGroups(
  data: ConsultantOmzet[],
  groep1: string[],
  groep2: string[]
) {
  return data
    .map((c) => {
      const sum1 = groep1.reduce((s, p) => s + (c.periodes[p] ?? 0), 0);
      const sum2 = groep2.reduce((s, p) => s + (c.periodes[p] ?? 0), 0);
      const verschil = sum2 - sum1;
      return { name: c.name, unit: c.unit, periode1: sum1, periode2: sum2, verschil };
    })
    .sort((a, b) => b.verschil - a.verschil);
}

/** Abbreviate unit to 3 chars */
export function unitAbbr(unit: string): string {
  return unit.slice(0, 3);
}

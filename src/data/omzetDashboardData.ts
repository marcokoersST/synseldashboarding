// Omzet per consultant per periode (detachering omzet)

export interface ConsultantOmzet {
  name: string;
  unit: string;
  periodes: Record<string, number>; // e.g. { "P1": 60467, "P2": 80000, ... }
}

export const omzetConsultants: ConsultantOmzet[] = [
  { name: "Lars Hendriks", unit: "Operators", periodes: { P1: 42000, P2: 60467, P3: 80000, P4: 95000, P5: 108000, P6: 125000 } },
  { name: "Sijmen de Boer", unit: "Monteurs", periodes: { P1: 35000, P2: 50000, P3: 60000, P4: 72000, P5: 85000, P6: 98000 } },
  { name: "Mathijs van Dijk", unit: "Engineering", periodes: { P1: 55000, P2: 40000, P3: 25000, P4: 32000, P5: 48000, P6: 62000 } },
  { name: "Delano Nikkels", unit: "Engineering", periodes: { P1: 38000, P2: 52000, P3: 68000, P4: 82000, P5: 91000, P6: 105000 } },
  { name: "Falco Zegveld", unit: "Engineering", periodes: { P1: 45000, P2: 48000, P3: 55000, P4: 60000, P5: 72000, P6: 88000 } },
  { name: "Eric Hutchison", unit: "Monteurs", periodes: { P1: 30000, P2: 42000, P3: 58000, P4: 65000, P5: 78000, P6: 90000 } },
  { name: "Jonah Waterborg", unit: "Trainingsunit", periodes: { P1: 18000, P2: 25000, P3: 35000, P4: 42000, P5: 55000, P6: 68000 } },
  { name: "Niels Eggens", unit: "Early Performers", periodes: { P1: 12000, P2: 20000, P3: 28000, P4: 38000, P5: 45000, P6: 52000 } },
  { name: "Jort Koggel", unit: "Engineering", periodes: { P1: 60000, P2: 58000, P3: 62000, P4: 70000, P5: 82000, P6: 95000 } },
  { name: "Stijn Koldenhoven", unit: "Monteurs", periodes: { P1: 28000, P2: 35000, P3: 45000, P4: 52000, P5: 60000, P6: 72000 } },
  { name: "Miguel Kraaijeveld", unit: "Operators", periodes: { P1: 50000, P2: 65000, P3: 78000, P4: 88000, P5: 102000, P6: 118000 } },
  { name: "Sander Beckker", unit: "Trainingsunit", periodes: { P1: 10000, P2: 15000, P3: 22000, P4: 30000, P5: 38000, P6: 45000 } },
];

export const allPeriodes = ["P1", "P2", "P3", "P4", "P5", "P6"];

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

import { allConsultantsList } from "@/data/ranglijstenData";

export type GedetacheerdenScope = "week" | "periode" | "jaar";

export interface GedetacheerdenRankingRecord {
  id: string;
  consultant: string;
  unit: string;
  momenteelGedetacheerd: number;
  nogTeStarten: number;
  afTeVallen: number;
  brutoMargeLaatstePeriode: number;
  brutoMargeVorigePeriode: number;
  margePerGedetacheerde: number;
  margeAfgelopen13Periodes: number;
}

const round = (value: number, step = 50) => Math.round(value / step) * step;

export function getGedetacheerdenRankingData(
  scope: GedetacheerdenScope,
  selection: number,
): GedetacheerdenRankingRecord[] {
  const scopeOffset = scope === "week" ? selection - 42 : scope === "periode" ? selection - 11 : selection - 2026;

  return allConsultantsList
    .filter((consultant) => consultant.isActive)
    .map((consultant, index) => {
      const baseActive = Math.max(2, 31 - Math.floor(index * 0.48));
      const movement = ((index * 7 + scopeOffset * 3) % 5) - 2;
      const momenteelGedetacheerd = Math.max(1, baseActive + movement);
      const nogTeStarten = Math.max(0, (index * 3 + selection) % 7);
      const afTeVallen = Math.max(0, (index * 5 + selection) % 5);
      const margePerGedetacheerde = round(1850 + ((index * 173 + selection * 29) % 1450), 10);
      const brutoMargeLaatstePeriode = round(momenteelGedetacheerd * margePerGedetacheerde);
      const margeVerschil = round((((index * 11 + selection) % 13) - 6) * 650);
      const brutoMargeVorigePeriode = Math.max(0, brutoMargeLaatstePeriode - margeVerschil);
      const margeAfgelopen13Periodes = round(
        ((brutoMargeLaatstePeriode + brutoMargeVorigePeriode) / 2) * (11.2 + ((index % 4) * 0.35)),
        500,
      );

      return {
        id: `gedetacheerden-${consultant.fullName}`,
        consultant: consultant.fullName,
        unit: consultant.unit,
        momenteelGedetacheerd,
        nogTeStarten,
        afTeVallen,
        brutoMargeLaatstePeriode,
        brutoMargeVorigePeriode,
        margePerGedetacheerde,
        margeAfgelopen13Periodes,
      };
    })
    .map((record) => record.consultant === "Robin van Bruggen" && scopeOffset === 0
      ? {
          ...record,
          momenteelGedetacheerd: 32,
          nogTeStarten: 5,
          afTeVallen: 3,
          brutoMargeLaatstePeriode: 54000,
          brutoMargeVorigePeriode: 49000,
          margePerGedetacheerde: 2850,
          margeAfgelopen13Periodes: 580000,
        }
      : record);
}
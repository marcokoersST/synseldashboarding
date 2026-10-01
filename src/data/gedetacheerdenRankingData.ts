import { allConsultantsList } from "@/data/ranglijstenData";

export type GedetacheerdenScope = "week" | "periode" | "jaar";

export interface GedetacheerdenRankingRecord {
  id: string;
  consultant: string;
  unit: string;
  gedetacheerdenVandaag: number;
  momenteelGedetacheerd: number;
  startersGeselecteerdePeriode: number;
  nogTeStartenKomendeVierWeken: number;
  afvallersGeselecteerdePeriode: number;
  verwachteAfvallersKomendeVierWeken: number;
  brutoMargeLaatstePeriode: number;
  brutoMargeGeselecteerdePeriode: number;
  brutoMargeVorigePeriode: number;
  margePerGedetacheerde: number;
  margePerGedetacheerdeLaatstePeriode: number;
  margeAfgelopen13Periodes: number;
}

const round = (value: number, step = 50) => Math.round(value / step) * step;

const currentDateSeed = () => {
  const now = new Date();
  return Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`);
};

export function getGedetacheerdenRankingData(
  scope: GedetacheerdenScope,
  selection: number,
): GedetacheerdenRankingRecord[] {
  const scopeOffset = scope === "week" ? selection - 42 : scope === "periode" ? selection - 11 : selection - 2026;
  const fourWeekSeed = currentDateSeed();

  return allConsultantsList
    .filter((consultant) => consultant.isActive)
    .map((consultant, index) => {
      const baseActive = Math.max(2, 31 - Math.floor(index * 0.48));
      const gedetacheerdenVandaag = Math.max(1, baseActive + (((index * 7 + fourWeekSeed) % 5) - 2));
      const movement = ((index * 7 + scopeOffset * 3) % 5) - 2;
      const momenteelGedetacheerd = Math.max(1, baseActive + movement);
      const startersGeselecteerdePeriode = Math.max(0, (index * 3 + selection) % 7);
      const afvallersGeselecteerdePeriode = Math.max(0, (index * 5 + selection) % 5);
      const nogTeStartenKomendeVierWeken = Math.max(0, (index * 7 + fourWeekSeed) % 6);
      const verwachteAfvallersKomendeVierWeken = Math.max(0, (index * 11 + fourWeekSeed) % 5);
      const margePerGedetacheerde = round(1850 + ((index * 173 + selection * 29) % 1450), 10);
      const brutoMargeGeselecteerdePeriode = round(momenteelGedetacheerd * margePerGedetacheerde);
      const margePerGedetacheerdeLaatstePeriode = round(1850 + ((index * 173 + fourWeekSeed * 29) % 1450), 10);
      const brutoMargeLaatstePeriode = round(gedetacheerdenVandaag * margePerGedetacheerdeLaatstePeriode);
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
        gedetacheerdenVandaag,
        momenteelGedetacheerd,
        startersGeselecteerdePeriode,
        nogTeStartenKomendeVierWeken,
        afvallersGeselecteerdePeriode,
        verwachteAfvallersKomendeVierWeken,
        brutoMargeLaatstePeriode,
        brutoMargeGeselecteerdePeriode,
        brutoMargeVorigePeriode,
        margePerGedetacheerde,
        margePerGedetacheerdeLaatstePeriode,
        margeAfgelopen13Periodes,
      };
    })
    .map((record) => record.consultant === "Robin van Bruggen" && scopeOffset === 0
      ? {
          ...record,
          gedetacheerdenVandaag: 32,
          momenteelGedetacheerd: 32,
          startersGeselecteerdePeriode: 5,
          afvallersGeselecteerdePeriode: 3,
          brutoMargeLaatstePeriode: 54000,
          brutoMargeGeselecteerdePeriode: 54000,
          brutoMargeVorigePeriode: 49000,
          margePerGedetacheerde: 2850,
          margePerGedetacheerdeLaatstePeriode: 1688,
          margeAfgelopen13Periodes: 580000,
        }
      : record);
}
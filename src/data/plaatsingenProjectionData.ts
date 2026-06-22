// Mock data for the "Plaatsingen & Detachering Projectie" tile on the Groeimodel page.
// - 3 historical periods (12 weeks), each week split into W&S / Detachering / Marge Facturatie.
// - 4 future projection periods (16 weeks) of the running number of active gedetacheerden.
//
// Numbers are aligned with company-level mock totals (~14–24 plaatsingen/week)
// used elsewhere in the app (see src/data/projectionData.ts).

export type PlaatsingType = "W&S" | "Detachering" | "MargeFac";

export interface WeekPlaatsingen {
  weekLabel: string; // e.g. "P11 W1"
  periodIndex: number; // -3 | -2 | -1 historical, 1..4 projection
  weekInPeriod: number; // 1..4
  ws: number;
  detachering: number;
  margeFac: number;
  total: number;
}

export interface WeekDetacheerdenProjectie {
  weekLabel: string;
  periodIndex: number;
  weekInPeriod: number;
  actieveGedetacheerden: number;
}

// The "current" week sits at the boundary between historical and projection.
// We treat the last historical week as "Nu".
export const huidigeWeekLabel = "P13 W4";

// Helper to build a week row
const w = (
  periodIndex: number,
  weekInPeriod: number,
  periodNumber: number,
  ws: number,
  detachering: number,
  margeFac: number,
): WeekPlaatsingen => ({
  weekLabel: `P${periodNumber} W${weekInPeriod}`,
  periodIndex,
  weekInPeriod,
  ws,
  detachering,
  margeFac,
  total: ws + detachering + margeFac,
});

// 3 historical periods (P11, P12, P13) × 4 weeks each
export const historischePlaatsingenPerWeek: WeekPlaatsingen[] = [
  // P11 (oudste)
  w(-3, 1, 11, 6, 5, 3),
  w(-3, 2, 11, 7, 6, 4),
  w(-3, 3, 11, 5, 7, 3),
  w(-3, 4, 11, 8, 6, 4),
  // P12
  w(-2, 1, 12, 7, 7, 4),
  w(-2, 2, 12, 9, 8, 5),
  w(-2, 3, 12, 8, 9, 4),
  w(-2, 4, 12, 10, 8, 5),
  // P13 (meest recent — eindigt op "Nu")
  w(-1, 1, 13, 9, 9, 5),
  w(-1, 2, 13, 11, 10, 5),
  w(-1, 3, 13, 10, 11, 6),
  w(-1, 4, 13, 12, 11, 6),
];

// 4 future projection periods (P1..P4 of new year) × 4 weeks each
// Active gedetacheerden = standing count that evolves week over week
// based on new Detachering placements minus contract endings.
const buildProjection = (): WeekDetacheerdenProjectie[] => {
  const rows: WeekDetacheerdenProjectie[] = [];
  // Starting standing count: align with mock ~120 active gedetacheerden
  let active = 124;
  // Per period: weekly new detacheringen and weekly endings (mock)
  const periods = [
    { p: 1, newPerWeek: 11, endPerWeek: 8 }, // net +3/wk
    { p: 2, newPerWeek: 12, endPerWeek: 9 }, // net +3/wk
    { p: 3, newPerWeek: 13, endPerWeek: 10 }, // net +3/wk
    { p: 4, newPerWeek: 14, endPerWeek: 10 }, // net +4/wk
  ];
  let pIdx = 1;
  for (const { p, newPerWeek, endPerWeek } of periods) {
    for (let week = 1; week <= 4; week++) {
      active = active + newPerWeek - endPerWeek;
      rows.push({
        weekLabel: `P${p} W${week}`,
        periodIndex: pIdx,
        weekInPeriod: week,
        actieveGedetacheerden: active,
      });
    }
    pIdx++;
  }
  return rows;
};

export const detacheerdenProjectiePerWeek: WeekDetacheerdenProjectie[] = buildProjection();

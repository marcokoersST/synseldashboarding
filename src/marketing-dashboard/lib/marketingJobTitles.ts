/**
 * Synthetic normalized job titles: local data has no title dimension, so totals are split over
 * these fixed weights. Title filters scale count fields by the matching weight share.
 */
export const JOB_TITLES: { name: string; weight: number; quality: number }[] = [
  { name: "Monteur", weight: 18, quality: 78 },
  { name: "Servicemonteur", weight: 13, quality: 81 },
  { name: "Elektromonteur", weight: 11, quality: 76 },
  { name: "Operator productie", weight: 10, quality: 72 },
  { name: "Werkvoorbereider", weight: 8, quality: 83 },
  { name: "Mechanical engineer", weight: 8, quality: 85 },
  { name: "Technisch tekenaar", weight: 7, quality: 80 },
  { name: "Assemblagemedewerker", weight: 7, quality: 70 },
  { name: "Onderhoudstechnicus", weight: 6, quality: 79 },
  { name: "Lasser", weight: 5, quality: 74 },
  { name: "CNC-verspaner", weight: 4, quality: 77 },
  { name: "Projectleider techniek", weight: 3, quality: 86 },
];
export const JOB_TITLE_WEIGHT_SUM = JOB_TITLES.reduce((s, t) => s + t.weight, 0);

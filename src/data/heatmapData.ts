// Heatmap TV Dashboard Mock Data

export type HeatmapUnit = "operators" | "monteurs" | "engineering" | "training";
export type HeatmapEventType = "gesprek" | "plaatsing";

export interface HeatmapEvent {
  id: string;
  lat: number;
  lng: number;
  city: string;
  unit: HeatmapUnit;
  type: HeatmapEventType;
  consultant: string;
  company: string;
  date: string;
  delayMs: number; // staggered animation delay
}

export const unitColors: Record<HeatmapUnit, { dot: string; glow: string; label: string }> = {
  operators: {
    dot: "hsl(175, 60%, 50%)",
    glow: "hsl(175, 60%, 50%)",
    label: "Operators",
  },
  monteurs: {
    dot: "hsl(45, 30%, 55%)",
    glow: "hsl(45, 30%, 55%)",
    label: "Monteurs",
  },
  engineering: {
    dot: "hsl(260, 50%, 60%)",
    glow: "hsl(260, 50%, 60%)",
    label: "Engineering",
  },
  training: {
    dot: "hsl(340, 60%, 55%)",
    glow: "hsl(340, 60%, 55%)",
    label: "Training",
  },
};

// Netherlands city coordinates (approximate, mapped to SVG viewBox 0-400 x 0-500)
// Projection: svgX = (lon - 3.359) / (7.227 - 3.359) * 612.54
//             svgY = (53.560 - lat) / (53.560 - 50.751) * 723.62
const cities: { name: string; x: number; y: number }[] = [
  { name: "Amsterdam", x: 245, y: 307 },
  { name: "Rotterdam", x: 177, y: 422 },
  { name: "Den Haag", x: 149, y: 384 },
  { name: "Utrecht", x: 279, y: 379 },
  { name: "Eindhoven", x: 334, y: 546 },
  { name: "Groningen", x: 508, y: 88 },
  { name: "Tilburg", x: 274, y: 516 },
  { name: "Almere", x: 302, y: 312 },
  { name: "Breda", x: 223, y: 512 },
  { name: "Nijmegen", x: 392, y: 450 },
  { name: "Arnhem", x: 402, y: 406 },
  { name: "Enschede", x: 560, y: 345 },
  { name: "Haarlem", x: 204, y: 302 },
  { name: "Amersfoort", x: 321, y: 362 },
  { name: "Apeldoorn", x: 413, y: 348 },
  { name: "Zwolle", x: 431, y: 269 },
  { name: "Den Bosch", x: 308, y: 480 },
  { name: "Leiden", x: 180, y: 361 },
  { name: "Maastricht", x: 369, y: 698 },
  { name: "Dordrecht", x: 211, y: 450 },
  { name: "Leeuwarden", x: 386, y: 93 },
  { name: "Deventer", x: 443, y: 333 },
  { name: "Venlo", x: 445, y: 564 },
  { name: "Helmond", x: 364, y: 535 },
  { name: "Roosendaal", x: 175, y: 523 },
  { name: "Oss", x: 342, y: 462 },
  { name: "Heerlen", x: 415, y: 688 },
  { name: "Hilversum", x: 288, y: 343 },
  { name: "Delft", x: 158, y: 399 },
  { name: "Alkmaar", x: 221, y: 239 },
  { name: "Emmen", x: 561, y: 201 },
  { name: "Gouda", x: 214, y: 399 },
  { name: "Zaandam", x: 233, y: 289 },
  { name: "Lelystad", x: 335, y: 268 },
  { name: "Middelburg", x: 40, y: 531 },
  { name: "Vlissingen", x: 34, y: 545 },
  { name: "Assen", x: 507, y: 146 },
  { name: "Hoogeveen", x: 494, y: 215 },
];

const units: HeatmapUnit[] = ["operators", "monteurs", "engineering", "training"];
const types: HeatmapEventType[] = ["gesprek", "plaatsing"];
const consultants = [
  "Sophie de Vries", "Thomas Bakker", "Kevin Hendriks",
  "Emma Visser", "Mark de Groot", "Jan Smit",
];
const companies = [
  "ASML", "Philips", "Shell", "ING", "Rabobank", "KLM",
  "Booking.com", "ABN AMRO", "Heineken", "Unilever", "Tata Steel",
  "DAF Trucks", "NXP", "TomTom", "Randstad",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateHeatmapEvents(count: number = 65): HeatmapEvent[] {
  const rng = seededRandom(42);
  const events: HeatmapEvent[] = [];

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(rng() * cities.length)];
    // Add slight randomness to position so dots don't stack perfectly
    const jitterX = (rng() - 0.5) * 16;
    const jitterY = (rng() - 0.5) * 16;

    events.push({
      id: `evt-${i}`,
      lat: city.y + jitterY,
      lng: city.x + jitterX,
      city: city.name,
      unit: units[Math.floor(rng() * units.length)],
      type: types[Math.floor(rng() * types.length)],
      consultant: consultants[Math.floor(rng() * consultants.length)],
      company: companies[Math.floor(rng() * companies.length)],
      date: `2026-01-${String(Math.floor(rng() * 21) + 1).padStart(2, "0")}`,
      delayMs: i * 80 + Math.floor(rng() * 200),
    });
  }

  return events;
}

export const heatmapEvents = generateHeatmapEvents(65);

// Province vacancy data
export interface ProvinceVacancies {
  provinceId: string;
  name: string;
  total: number;
  byUnit: Record<HeatmapUnit, number>;
}

function generateProvinceVacancies(): ProvinceVacancies[] {
  const rng = seededRandom(99);
  const provinceInfo = [
    { id: "NL-GR", name: "Groningen" },
    { id: "NL-FR", name: "Friesland" },
    { id: "NL-DR", name: "Drenthe" },
    { id: "NL-OV", name: "Overijssel" },
    { id: "NL-FL", name: "Flevoland" },
    { id: "NL-GE", name: "Gelderland" },
    { id: "NL-UT", name: "Utrecht" },
    { id: "NL-NH", name: "Noord-Holland" },
    { id: "NL-ZH", name: "Zuid-Holland" },
    { id: "NL-ZE", name: "Zeeland" },
    { id: "NL-NB", name: "Noord-Brabant" },
    { id: "NL-LI", name: "Limburg" },
  ];

  return provinceInfo.map((p) => {
    // Some provinces have 0 vacancies
    const hasVacancies = rng() > 0.2;
    if (!hasVacancies) {
      return { provinceId: p.id, name: p.name, total: 0, byUnit: { operators: 0, monteurs: 0, engineering: 0, training: 0 } };
    }
    const operators = Math.floor(rng() * 25) + 2;
    const monteurs = Math.floor(rng() * 18) + 1;
    const engineering = Math.floor(rng() * 12);
    const training = Math.floor(rng() * 8);
    return {
      provinceId: p.id,
      name: p.name,
      total: operators + monteurs + engineering + training,
      byUnit: { operators, monteurs, engineering, training },
    };
  });
}

export const provinceVacancies = generateProvinceVacancies();

export function getProvinceVacancy(provinceId: string): ProvinceVacancies | undefined {
  return provinceVacancies.find((p) => p.provinceId === provinceId);
}

export function getTotalVacancies(): { total: number; byUnit: Record<HeatmapUnit, number> } {
  const byUnit = { operators: 0, monteurs: 0, engineering: 0, training: 0 };
  let total = 0;
  provinceVacancies.forEach((p) => {
    total += p.total;
    byUnit.operators += p.byUnit.operators;
    byUnit.monteurs += p.byUnit.monteurs;
    byUnit.engineering += p.byUnit.engineering;
    byUnit.training += p.byUnit.training;
  });
  return { total, byUnit };
}

// Summary stats
export function getHeatmapStats(events: HeatmapEvent[]) {
  const byUnit: Record<HeatmapUnit, { gesprekken: number; plaatsingen: number }> = {
    operators: { gesprekken: 0, plaatsingen: 0 },
    monteurs: { gesprekken: 0, plaatsingen: 0 },
    engineering: { gesprekken: 0, plaatsingen: 0 },
    training: { gesprekken: 0, plaatsingen: 0 },
  };

  events.forEach((e) => {
    if (e.type === "gesprek") byUnit[e.unit].gesprekken++;
    else byUnit[e.unit].plaatsingen++;
  });

  return byUnit;
}

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
  { name: "Amsterdam", x: 248, y: 306 },
  { name: "Rotterdam", x: 177, y: 421 },
  { name: "Den Haag", x: 147, y: 391 },
  { name: "Utrecht", x: 295, y: 383 },
  { name: "Eindhoven", x: 349, y: 553 },
  { name: "Groningen", x: 537, y: 114 },
  { name: "Tilburg", x: 291, y: 519 },
  { name: "Almere", x: 310, y: 304 },
  { name: "Breda", x: 216, y: 509 },
  { name: "Nijmegen", x: 401, y: 458 },
  { name: "Arnhem", x: 410, y: 413 },
  { name: "Enschede", x: 587, y: 359 },
  { name: "Haarlem", x: 196, y: 298 },
  { name: "Amersfoort", x: 330, y: 351 },
  { name: "Apeldoorn", x: 427, y: 341 },
  { name: "Zwolle", x: 441, y: 275 },
  { name: "Den Bosch", x: 318, y: 479 },
  { name: "Leiden", x: 180, y: 351 },
  { name: "Maastricht", x: 378, y: 706 },
  { name: "Dordrecht", x: 201, y: 470 },
  { name: "Leeuwarden", x: 395, y: 122 },
  { name: "Deventer", x: 453, y: 335 },
  { name: "Venlo", x: 454, y: 573 },
  { name: "Helmond", x: 374, y: 543 },
  { name: "Roosendaal", x: 176, y: 525 },
  { name: "Oss", x: 354, y: 468 },
  { name: "Heerlen", x: 424, y: 696 },
  { name: "Hilversum", x: 302, y: 340 },
  { name: "Delft", x: 151, y: 404 },
  { name: "Alkmaar", x: 214, y: 224 },
  { name: "Emmen", x: 590, y: 189 },
  { name: "Gouda", x: 206, y: 404 },
  { name: "Zaandam", x: 233, y: 281 },
  { name: "Lelystad", x: 349, y: 273 },
  { name: "Middelburg", x: 31, y: 529 },
  { name: "Vlissingen", x: 29, y: 551 },
  { name: "Assen", x: 538, y: 153 },
  { name: "Hoogeveen", x: 525, y: 205 },
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

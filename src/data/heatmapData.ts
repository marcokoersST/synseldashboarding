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
  { name: "Rotterdam", x: 228, y: 361 },
  { name: "Den Haag", x: 215, y: 349 },
  { name: "Utrecht", x: 259, y: 333 },
  { name: "Eindhoven", x: 272, y: 405 },
  { name: "Groningen", x: 508, y: 88 },
  { name: "Tilburg", x: 256, y: 415 },
  { name: "Almere", x: 263, y: 299 },
  { name: "Breda", x: 243, y: 420 },
  { name: "Nijmegen", x: 338, y: 378 },
  { name: "Arnhem", x: 335, y: 363 },
  { name: "Enschede", x: 431, y: 299 },
  { name: "Haarlem", x: 237, y: 299 },
  { name: "Amersfoort", x: 270, y: 315 },
  { name: "Apeldoorn", x: 339, y: 319 },
  { name: "Zwolle", x: 358, y: 260 },
  { name: "Den Bosch", x: 277, y: 392 },
  { name: "Leiden", x: 225, y: 335 },
  { name: "Maastricht", x: 337, y: 472 },
  { name: "Dordrecht", x: 237, y: 377 },
  { name: "Leeuwarden", x: 348, y: 98 },
  { name: "Deventer", x: 371, y: 299 },
  { name: "Venlo", x: 361, y: 411 },
  { name: "Helmond", x: 290, y: 408 },
  { name: "Roosendaal", x: 224, y: 428 },
  { name: "Oss", x: 285, y: 388 },
  { name: "Heerlen", x: 349, y: 468 },
  { name: "Hilversum", x: 261, y: 307 },
  { name: "Delft", x: 221, y: 345 },
  { name: "Alkmaar", x: 244, y: 261 },
  { name: "Emmen", x: 430, y: 159 },
  { name: "Gouda", x: 237, y: 345 },
  { name: "Zaandam", x: 243, y: 293 },
  { name: "Lelystad", x: 276, y: 270 },
  { name: "Middelburg", x: 184, y: 413 },
  { name: "Vlissingen", x: 179, y: 421 },
  { name: "Assen", x: 417, y: 152 },
  { name: "Hoogeveen", x: 400, y: 180 },
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

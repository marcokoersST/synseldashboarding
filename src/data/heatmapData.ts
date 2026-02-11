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
const cities: { name: string; x: number; y: number }[] = [
  { name: "Amsterdam", x: 195, y: 215 },
  { name: "Rotterdam", x: 175, y: 290 },
  { name: "Den Haag", x: 155, y: 270 },
  { name: "Utrecht", x: 210, y: 250 },
  { name: "Eindhoven", x: 220, y: 360 },
  { name: "Groningen", x: 270, y: 85 },
  { name: "Tilburg", x: 200, y: 345 },
  { name: "Almere", x: 220, y: 210 },
  { name: "Breda", x: 185, y: 345 },
  { name: "Nijmegen", x: 260, y: 310 },
  { name: "Arnhem", x: 255, y: 290 },
  { name: "Enschede", x: 310, y: 225 },
  { name: "Haarlem", x: 180, y: 215 },
  { name: "Amersfoort", x: 225, y: 235 },
  { name: "Apeldoorn", x: 260, y: 245 },
  { name: "Zwolle", x: 265, y: 190 },
  { name: "Den Bosch", x: 215, y: 330 },
  { name: "Leiden", x: 170, y: 255 },
  { name: "Maastricht", x: 245, y: 430 },
  { name: "Dordrecht", x: 185, y: 305 },
  { name: "Leeuwarden", x: 235, y: 90 },
  { name: "Deventer", x: 275, y: 230 },
  { name: "Venlo", x: 270, y: 375 },
  { name: "Helmond", x: 235, y: 365 },
  { name: "Roosendaal", x: 170, y: 365 },
  { name: "Oss", x: 230, y: 325 },
  { name: "Heerlen", x: 255, y: 425 },
  { name: "Hilversum", x: 215, y: 225 },
  { name: "Delft", x: 165, y: 275 },
  { name: "Alkmaar", x: 185, y: 175 },
  { name: "Emmen", x: 305, y: 130 },
  { name: "Gouda", x: 185, y: 270 },
  { name: "Zaandam", x: 190, y: 205 },
  { name: "Lelystad", x: 230, y: 190 },
  { name: "Middelburg", x: 140, y: 375 },
  { name: "Vlissingen", x: 135, y: 385 },
  { name: "Assen", x: 275, y: 115 },
  { name: "Hoogeveen", x: 280, y: 145 },
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

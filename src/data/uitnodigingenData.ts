// Mock data for Uitnodigingen map (Hendrik dashboard)

export interface UitnodigingEvent {
  id: string;
  city: string;
  x: number;
  y: number;
  company: string;
  consultant: string;
  date: string;
  functie: string;
  delayMs: number;
}

const cities = [
  { name: "Amsterdam", x: 245, y: 307 },
  { name: "Rotterdam", x: 177, y: 422 },
  { name: "Utrecht", x: 279, y: 379 },
  { name: "Eindhoven", x: 334, y: 546 },
  { name: "Groningen", x: 508, y: 88 },
  { name: "Tilburg", x: 274, y: 516 },
  { name: "Almere", x: 302, y: 312 },
  { name: "Breda", x: 223, y: 512 },
  { name: "Arnhem", x: 402, y: 406 },
  { name: "Zwolle", x: 431, y: 269 },
  { name: "Den Bosch", x: 308, y: 480 },
  { name: "Deventer", x: 443, y: 333 },
  { name: "Oss", x: 342, y: 462 },
  { name: "Helmond", x: 364, y: 535 },
  { name: "Den Haag", x: 149, y: 384 },
  { name: "Dordrecht", x: 211, y: 450 },
  { name: "Apeldoorn", x: 413, y: 348 },
  { name: "Nijmegen", x: 392, y: 450 },
  { name: "Haarlem", x: 204, y: 302 },
  { name: "Leiden", x: 180, y: 361 },
  { name: "Gouda", x: 214, y: 399 },
  { name: "Amersfoort", x: 321, y: 362 },
  { name: "Enschede", x: 560, y: 345 },
  { name: "Venlo", x: 445, y: 564 },
  { name: "Roosendaal", x: 175, y: 523 },
];

const consultants = [
  "Sophie de Vries", "Bram Jansen", "Lisa van Dijk",
  "Thomas Bakker", "Emma Visser", "Daan de Boer",
];

const companies = [
  "ASML", "Philips", "Shell", "Tata Steel", "DAF Trucks",
  "NXP", "VDL Groep", "Fokker", "Stork", "Mammoet",
  "Boskalis", "Van Oord", "BAM", "Heijmans", "VolkerWessels",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateUitnodigingen(count: number = 28): UitnodigingEvent[] {
  const rng = seededRandom(77);
  const events: UitnodigingEvent[] = [];

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(rng() * cities.length)];
    const jitterX = (rng() - 0.5) * 14;
    const jitterY = (rng() - 0.5) * 14;
    const day = Math.floor(rng() * 21) + 24; // last 3 weeks of Jan / first of Feb
    const month = day > 31 ? 2 : 1;
    const d = day > 31 ? day - 31 : day;

    events.push({
      id: `uit-${i}`,
      city: city.name,
      x: city.x + jitterX,
      y: city.y + jitterY,
      company: companies[Math.floor(rng() * companies.length)],
      consultant: consultants[Math.floor(rng() * consultants.length)],
      date: `2026-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      functie: "Operator",
      delayMs: i * 90 + Math.floor(rng() * 150),
    });
  }

  return events;
}

export const uitnodigingEvents = generateUitnodigingen(28);

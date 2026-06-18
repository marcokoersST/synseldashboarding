// Mock revenue/margin data per functiegroep (with sub-functies).
// Deterministic — seeded by name hash so totals stay stable across renders.

export const FUNCTIEGROEPEN = [
  "Metaalbewerking",
  "Engineering Mechanisch",
  "Chemie, Food & Life Science",
  "Supply Chain",
  "Logistiek",
  "Installatietechniek",
  "Technisch/commercieel",
  "Internationaal",
  "Service Benelux",
  "Productie",
  "Assemblage",
  "Automotive",
  "Civiele techniek",
  "Management",
  "Maritiem",
  "ICT",
  "Operators",
  "Bouw",
  "Engineering Allround",
  "Technische dienst",
  "Engineering Software & Elektro",
  "QHSE",
];

const FUNCTIES_PER_GROUP: Record<string, string[]> = {
  "Metaalbewerking": ["Lasser", "CNC-operator", "Verspaner", "Plaatwerker", "Constructiebankwerker"],
  "Engineering Mechanisch": ["Werktuigbouwkundig engineer", "Constructeur", "Calculator", "Projectengineer"],
  "Chemie, Food & Life Science": ["Procesoperator", "QA-analist", "R&D technoloog", "Laborant"],
  "Supply Chain": ["Planner", "Inkoper", "Demand planner", "S&OP analist"],
  "Logistiek": ["Heftruckchauffeur", "Warehouse medewerker", "Teamleider warehouse", "Expediteur"],
  "Installatietechniek": ["Servicemonteur W", "Servicemonteur E", "Werkvoorbereider", "Projectleider installatie"],
  "Technisch/commercieel": ["Accountmanager", "Sales engineer", "Inside sales", "Business developer"],
  "Internationaal": ["Internationaal projectleider", "Export coördinator", "Field service engineer"],
  "Service Benelux": ["Servicecoördinator", "Field service technicus", "After-sales engineer"],
  "Productie": ["Productiemedewerker", "Shiftleader", "Lijnoperator", "Productieplanner"],
  "Assemblage": ["Monteur eindassemblage", "Tester", "Quality controller"],
  "Automotive": ["Automonteur", "Diagnose-technicus", "Truckmonteur"],
  "Civiele techniek": ["Civiel ontwerper", "Uitvoerder GWW", "Calculator infra"],
  "Management": ["Operations manager", "Plant manager", "Site manager", "Team lead"],
  "Maritiem": ["Scheepsbouwkundige", "Scheepsmonteur", "Marine engineer"],
  "ICT": ["Software developer", "Systeembeheerder", "DevOps engineer", "Data engineer"],
  "Operators": ["Procesoperator A", "Procesoperator B", "Allround operator"],
  "Bouw": ["Timmerman", "Metselaar", "Bouwkundig opzichter", "Werkvoorbereider bouw"],
  "Engineering Allround": ["Allround engineer", "Multidisciplinair engineer", "Maintenance engineer"],
  "Technische dienst": ["TD-monteur", "TD-coördinator", "Storingsmonteur"],
  "Engineering Software & Elektro": ["E&I engineer", "PLC-programmeur", "Software engineer industrial"],
  "QHSE": ["QHSE coördinator", "Veiligheidskundige", "KAM-medewerker"],
};

function seedFromName(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function rand01(seed: number, salt: number): number {
  const v = Math.sin(seed * 0.001 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

export interface FunctieRevenueRow {
  functie: string;
  group: string;
  revenue: number;
  margin: number;
  forecast: number;
  target: number;
  potential: number;
  realisedPotential: number;
  revRisk: number;
  margePerHour: number;
  placements: number;
}

export interface FunctiegroepRevenueRow {
  id: number; // stable hash id
  group: string;
  revenue: number;
  margin: number;
  forecast: number;
  target: number;
  potential: number;
  realisedPotential: number;
  realised: number; // alias for revenue (for chart compat)
  revRisk: number;
  margePerHour: number;
  placements: number;
  functies: FunctieRevenueRow[];
}

function buildFunctie(group: string, functie: string): FunctieRevenueRow {
  const seed = seedFromName(`${group}|${functie}`);
  const target = 200 + Math.floor(rand01(seed, 1) * 600); // 200..800k
  const realisedFactor = 0.6 + rand01(seed, 2) * 0.7; // 0.6..1.3
  const revenue = Math.round(target * realisedFactor);
  const marginPct = 0.18 + rand01(seed, 3) * 0.18; // 18..36%
  const margin = Math.round(revenue * marginPct);
  const forecast = Math.round(revenue * (1 + (rand01(seed, 4) - 0.4) * 0.25));
  const potential = Math.round(target * (1.1 + rand01(seed, 5) * 0.3));
  const realisedPotential = Math.round(potential * (0.55 + rand01(seed, 6) * 0.35));
  const revRisk = Math.round(rand01(seed, 7) * 80);
  const margePerHour = Math.round(36 + rand01(seed, 8) * 32);
  const placements = 1 + Math.floor(rand01(seed, 9) * 9);
  return { functie, group, revenue, margin, forecast, target, potential, realisedPotential, revRisk, margePerHour, placements };
}

export function getFunctiegroepRows(): FunctiegroepRevenueRow[] {
  return FUNCTIEGROEPEN.map((group) => {
    const functies = (FUNCTIES_PER_GROUP[group] ?? [group]).map((f) => buildFunctie(group, f));
    const sum = (k: keyof FunctieRevenueRow) =>
      functies.reduce((s, f) => s + (f[k] as number), 0);
    const revenue = sum("revenue");
    const totalPlacements = sum("placements");
    const totalMarginPerHour = functies.reduce((s, f) => s + f.margePerHour * f.placements, 0);
    return {
      id: seedFromName(group) % 1_000_000,
      group,
      revenue,
      margin: sum("margin"),
      forecast: sum("forecast"),
      target: sum("target"),
      potential: sum("potential"),
      realisedPotential: sum("realisedPotential"),
      realised: revenue,
      revRisk: sum("revRisk"),
      margePerHour: totalPlacements ? Math.round(totalMarginPerHour / totalPlacements) : 0,
      placements: totalPlacements,
      functies,
    };
  });
}

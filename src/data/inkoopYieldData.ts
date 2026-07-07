// Inventory Based Recruitment — mock data
// Grain: 1 rij = 1 kandidaat

export type Status = "Nieuw" | "Bemiddelbaar" | "In gesprek" | "In procedure" | "Geplaatst" | "Afgewezen";

export const TITELS = [
  "Servicemonteur",
  "Onderhoudsmonteur",
  "Elektromonteur",
  "Monteur Technische Dienst",
  "Installatiemonteur",
  "Mechatronica Monteur",
  "Machine Operator",
  "Productie Operator",
  "CNC-operator",
  "Heftruckchauffeur",
  "Lasser",
  "Verspaner",
  "Werktuigbouwkundig Engineer",
  "Elektrotechnisch Engineer",
  "Process Engineer",
  "Design Engineer",
  "Software Engineer",
  "Automation Engineer",
  "Kwaliteitsingenieur",
  "Projectleider Techniek",
  "Werkvoorbereider",
  "Tekenaar Autocad",
  "Calculator Bouw",
  "Uitvoerder Bouw",
  "Logistiek Medewerker",
];

export const PROVINCIES = [
  "Groningen", "Friesland", "Drenthe", "Overijssel", "Gelderland", "Flevoland",
  "Utrecht", "Noord-Holland", "Zuid-Holland", "Zeeland", "Noord-Brabant", "Limburg",
];

export const BUSINESS_UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"];

export const CONSULTANTS = [
  { naam: "Jan de Vries", unit: "Engineering", regio: "Noord-Brabant" },
  { naam: "Lisa Bakker", unit: "Engineering", regio: "Gelderland" },
  { naam: "Tom Jansen", unit: "Monteurs", regio: "Noord-Brabant" },
  { naam: "Emma Smit", unit: "Monteurs", regio: "Zuid-Holland" },
  { naam: "Daan Visser", unit: "Monteurs", regio: "Overijssel" },
  { naam: "Sophie Mulder", unit: "Operators", regio: "Noord-Holland" },
  { naam: "Ruben de Groot", unit: "Operators", regio: "Limburg" },
  { naam: "Anne Bos", unit: "Operators", regio: "Utrecht" },
  { naam: "Mark Peters", unit: "Trainingsunit", regio: "Gelderland" },
  { naam: "Laura Hendriks", unit: "Trainingsunit", regio: "Noord-Brabant" },
];

export const BRONNEN = [
  "LinkedIn", "Indeed", "Jooble", "Google Ads", "Referral",
  "WhatsApp re-engagement", "Organisch",
];

export type KandidaatType = "Nieuw" | "Heractivering";

export interface Kandidaat {
  id: string;
  datumBinnenkomst: string;
  bron: string;
  campagne: string;
  origineelTitel: string;
  titel: string;
  provincie: string;
  status: Status;
  consultant: string;
  businessUnit: string;
  matchscore: number;
  kandidaatType: KandidaatType;
  bemiddelbaar: boolean;
  inGesprek: boolean;
  aantalGesprekken: number;
  inProcedure: boolean;
  geplaatst: boolean;
  plaatsingsdatum: string | null;
}

// Deterministic RNG
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(1337);
const pick = <T>(a: T[]) => a[Math.floor(rng() * a.length)];

// Yield-tuning per titel & provincie
const TITEL_YIELD: Record<string, number> = {
  "Servicemonteur": 0.14,
  "Onderhoudsmonteur": 0.22,
  "Elektromonteur": 0.28,
  "Monteur Technische Dienst": 0.32,
  "Installatiemonteur": 0.20,
  "Mechatronica Monteur": 0.30,
  "Machine Operator": 0.18,
  "Productie Operator": 0.16,
  "CNC-operator": 0.24,
  "Heftruckchauffeur": 0.12,
  "Lasser": 0.27,
  "Verspaner": 0.23,
  "Werktuigbouwkundig Engineer": 0.30,
  "Elektrotechnisch Engineer": 0.34,
  "Process Engineer": 0.20,
  "Design Engineer": 0.26,
  "Software Engineer": 0.29,
  "Automation Engineer": 0.33,
  "Kwaliteitsingenieur": 0.21,
  "Projectleider Techniek": 0.36,
  "Werkvoorbereider": 0.19,
  "Tekenaar Autocad": 0.17,
  "Calculator Bouw": 0.15,
  "Uitvoerder Bouw": 0.25,
  "Logistiek Medewerker": 0.10,
};
const TITEL_VOLUME: Record<string, number> = {
  "Servicemonteur": 780, "Onderhoudsmonteur": 420, "Elektromonteur": 560, "Monteur Technische Dienst": 210,
  "Installatiemonteur": 610, "Mechatronica Monteur": 180,
  "Machine Operator": 690, "Productie Operator": 820, "CNC-operator": 310,
  "Heftruckchauffeur": 640, "Lasser": 360, "Verspaner": 220,
  "Werktuigbouwkundig Engineer": 280, "Elektrotechnisch Engineer": 260, "Process Engineer": 190,
  "Design Engineer": 160, "Software Engineer": 230, "Automation Engineer": 150,
  "Kwaliteitsingenieur": 170, "Projectleider Techniek": 130,
  "Werkvoorbereider": 400, "Tekenaar Autocad": 250, "Calculator Bouw": 300, "Uitvoerder Bouw": 210,
  "Logistiek Medewerker": 550,
};
const PROV_MULT: Record<string, number> = {
  "Noord-Brabant": 1.30, "Gelderland": 1.15, "Overijssel": 1.10, "Noord-Holland": 1.05,
  "Zuid-Holland": 1.00, "Utrecht": 0.95, "Limburg": 0.90, "Flevoland": 0.85,
  "Drenthe": 0.80, "Friesland": 0.75, "Groningen": 0.75, "Zeeland": 0.60,
};

function addDays(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n.toISOString().slice(0, 10);
}

function generate(): Kandidaat[] {
  const rows: Kandidaat[] = [];
  const start = new Date("2025-01-01");
  let counter = 0;
  for (const titel of TITELS) {
    const totVoor = TITEL_VOLUME[titel];
    for (let i = 0; i < totVoor; i++) {
      const provincie = pick(PROVINCIES);
      const bron = pick(BRONNEN);
      const consultant = pick(CONSULTANTS.filter(c => c.unit === titelToUnit(titel)) || CONSULTANTS);
      const yieldRate = TITEL_YIELD[titel] * (PROV_MULT[provincie] ?? 1);
      const bemiddelbaar = rng() < 0.7;
      const inGesprek = bemiddelbaar && rng() < Math.min(0.85, yieldRate * 3);
      const aantalGesprekken = inGesprek ? 1 + Math.floor(rng() * 4) : 0;
      const inProcedure = inGesprek && rng() < Math.min(0.7, yieldRate * 2);
      const geplaatst = inProcedure && rng() < Math.min(0.85, yieldRate * 2.2);
      const status: Status = geplaatst ? "Geplaatst"
        : inProcedure ? "In procedure"
        : inGesprek ? "In gesprek"
        : bemiddelbaar ? "Bemiddelbaar"
        : rng() < 0.3 ? "Afgewezen" : "Nieuw";
      const dagOffset = Math.floor(rng() * 540);
      const datumBinnenkomst = addDays(start, dagOffset);
      const plaatsingsdatum = geplaatst
        ? addDays(new Date(datumBinnenkomst), 15 + Math.floor(rng() * 60))
        : null;
      rows.push({
        id: `K${(10000 + counter++).toString()}`,
        datumBinnenkomst,
        bron,
        campagne: `${bron} · Q${Math.floor(dagOffset / 90) + 1}`,
        origineelTitel: titel,
        titel,
        provincie,
        status,
        consultant: consultant.naam,
        businessUnit: consultant.unit,
        matchscore: Math.round(40 + rng() * 55),
        kandidaatType: rng() < 0.72 ? "Nieuw" : "Heractivering",
        bemiddelbaar,
        inGesprek,
        aantalGesprekken,
        inProcedure,
        geplaatst,
        plaatsingsdatum,
      });
    }
  }
  return rows;
}

function titelToUnit(titel: string): string {
  if (titel.includes("Engineer") || titel.includes("Werkvoorbereider")) return "Engineering";
  if (titel.includes("Monteur")) return "Monteurs";
  if (titel.includes("Operator")) return "Operators";
  return "Engineering";
}

export const kandidaten: Kandidaat[] = generate();

// ─── Filters ─────────────────────────────
export interface FilterState {
  titel: string[];
  provincie: string[];
  consultant: string[];
  businessUnit: string[];
  kandidaatType: Array<"Nieuw" | "Heractivering">;
  geplaatst: Array<"Ja" | "Nee">;
  dateFrom: string;
  dateTo: string;
  compare: boolean;
}

export const DATE_MIN = "2025-01-01";
export const DATE_MAX = "2026-06-30";

export const defaultFilter: FilterState = {
  titel: [], provincie: [], consultant: [],
  businessUnit: [], kandidaatType: [], geplaatst: [],
  dateFrom: DATE_MIN, dateTo: DATE_MAX, compare: false,
};

// Kernfilters (excl. bemiddelbaar-scope)
function matchesCore(r: Kandidaat, f: FilterState): boolean {
  if (f.titel.length && !f.titel.includes(r.titel)) return false;
  if (f.provincie.length && !f.provincie.includes(r.provincie)) return false;
  if (f.consultant.length && !f.consultant.includes(r.consultant)) return false;
  if (f.businessUnit.length && !f.businessUnit.includes(r.businessUnit)) return false;
  if (f.kandidaatType.length && !f.kandidaatType.includes(r.kandidaatType)) return false;
  if (f.geplaatst.length) {
    const val: "Ja" | "Nee" = r.geplaatst ? "Ja" : "Nee";
    if (!f.geplaatst.includes(val)) return false;
  }
  if (f.dateFrom && r.datumBinnenkomst < f.dateFrom) return false;
  if (f.dateTo && r.datumBinnenkomst > f.dateTo) return false;
  return true;
}

export function applyFilter(rows: Kandidaat[], f: FilterState): Kandidaat[] {
  // Dashboard focust altijd op bemiddelbare kandidaten
  return rows.filter(r => r.bemiddelbaar && matchesCore(r, f));
}

// Voor het "Conversies"-indicator: alle kandidaten (ook niet-bemiddelbaar) binnen de filters
export function applyFilterAllStatuses(rows: Kandidaat[], f: FilterState): Kandidaat[] {
  return rows.filter(r => matchesCore(r, f));
}

// ─── Aggregators ─────────────────────────
export interface Metrics {
  volume: number;
  bemiddelbaar: number;
  acquisitie: number;
  gesprekken: number;
  totaalGesprekken: number;
  procedures: number;
  plaatsingen: number;
  plaatsingspct: number;
  gesprekspct: number;
  acquisitiepct: number;
  procedurepct: number;
  bemiddelbaarpct: number;
  gemTijdPlaatsing: number;
}

export function metrics(rows: Kandidaat[]): Metrics {
  const volume = rows.length;
  const bem = rows.filter(r => r.bemiddelbaar).length;
  // Acquisitie = bemiddelbare kandidaten die actief in het salestraject zitten
  // (in gesprek/procedure/geplaatst OF match-score ≥ 60)
  const acq = rows.filter(r => r.bemiddelbaar && (r.inGesprek || r.matchscore >= 60)).length;
  const gesp = rows.filter(r => r.inGesprek).length;
  const totGesp = rows.reduce((sum, r) => sum + r.aantalGesprekken, 0);
  const proc = rows.filter(r => r.inProcedure).length;
  const pl = rows.filter(r => r.geplaatst);
  const tijden = pl.filter(r => r.plaatsingsdatum).map(r =>
    (new Date(r.plaatsingsdatum!).getTime() - new Date(r.datumBinnenkomst).getTime()) / 86400000);
  return {
    volume, bemiddelbaar: bem, acquisitie: acq, gesprekken: gesp, totaalGesprekken: totGesp, procedures: proc, plaatsingen: pl.length,
    plaatsingspct: volume ? pl.length / volume : 0,
    gesprekspct: volume ? gesp / volume : 0,
    acquisitiepct: volume ? acq / volume : 0,
    procedurepct: volume ? proc / volume : 0,
    bemiddelbaarpct: volume ? bem / volume : 0,
    gemTijdPlaatsing: tijden.length ? tijden.reduce((a, b) => a + b, 0) / tijden.length : 0,
  };
}

export function groupBy<T extends keyof Kandidaat>(rows: Kandidaat[], key: T) {
  const map = new Map<string, Kandidaat[]>();
  for (const r of rows) {
    const k = String(r[key]);
    (map.get(k) ?? map.set(k, []).get(k)!).push(r);
  }
  return map;
}

export interface TitelStats extends Metrics { titel: string; }
export function statsPerTitel(rows: Kandidaat[]): TitelStats[] {
  return Array.from(groupBy(rows, "titel")).map(([titel, list]) => ({ titel, ...metrics(list) }));
}

export interface ProvincieStats extends Metrics { provincie: string; }
export function statsPerProvincie(rows: Kandidaat[]): ProvincieStats[] {
  return PROVINCIES.map(provincie => {
    const list = rows.filter(r => r.provincie === provincie);
    return { provincie, ...metrics(list) };
  });
}

export interface ConsultantStats extends Metrics { consultant: string; businessUnit: string; }
export function statsPerConsultant(rows: Kandidaat[]): ConsultantStats[] {
  return CONSULTANTS.map(c => {
    const list = rows.filter(r => r.consultant === c.naam);
    return { consultant: c.naam, businessUnit: c.unit, ...metrics(list) };
  });
}

export interface BronStats extends Metrics { bron: string; }
export function statsPerBron(rows: Kandidaat[]): BronStats[] {
  return BRONNEN.map(b => {
    const list = rows.filter(r => r.bron === b);
    return { bron: b, ...metrics(list) };
  });
}

// ─── Kwadranten & opportunity ────────────
export type Quadrant = "beschermen" | "extra_inkopen" | "kritisch" | "lage_prio";

export function classify(stats: TitelStats, avgVolume: number, avgYield: number): Quadrant {
  const hoogVol = stats.volume >= avgVolume;
  const hoogYield = stats.plaatsingspct >= avgYield;
  if (hoogVol && hoogYield) return "beschermen";
  if (!hoogVol && hoogYield) return "extra_inkopen";
  if (hoogVol && !hoogYield) return "kritisch";
  return "lage_prio";
}

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  beschermen: "Beschermen & opschalen",
  extra_inkopen: "Extra inkopen · prioriteit",
  kritisch: "Kritisch beoordelen · budget verlagen",
  lage_prio: "Lage prioriteit",
};

export const QUADRANT_COLOR: Record<Quadrant, string> = {
  beschermen: "hsl(150, 65%, 45%)",
  extra_inkopen: "hsl(200, 75%, 50%)",
  kritisch: "hsl(0, 70%, 55%)",
  lage_prio: "hsl(30, 20%, 55%)",
};

// ─── Per-consultant deep-dive ────────────
export interface ConsultantTitelStat { titel: string; volume: number; plaatsingen: number; yieldPct: number; }
export interface ConsultantRegioStat { provincie: string; volume: number; plaatsingen: number; yieldPct: number; }
export interface ConsultantCombiStat { titel: string; provincie: string; volume: number; plaatsingen: number; yieldPct: number; score: number; }

export function titelsPerConsultant(rows: Kandidaat[], consultant: string): ConsultantTitelStat[] {
  const list = rows.filter(r => r.consultant === consultant);
  const map = new Map<string, { v: number; p: number }>();
  for (const r of list) {
    const c = map.get(r.titel) ?? { v: 0, p: 0 };
    c.v++; if (r.geplaatst) c.p++;
    map.set(r.titel, c);
  }
  return Array.from(map, ([titel, { v, p }]) => ({ titel, volume: v, plaatsingen: p, yieldPct: v ? p / v : 0 }));
}

export function regiosPerConsultant(rows: Kandidaat[], consultant: string): ConsultantRegioStat[] {
  const list = rows.filter(r => r.consultant === consultant);
  const map = new Map<string, { v: number; p: number }>();
  for (const r of list) {
    const c = map.get(r.provincie) ?? { v: 0, p: 0 };
    c.v++; if (r.geplaatst) c.p++;
    map.set(r.provincie, c);
  }
  return Array.from(map, ([provincie, { v, p }]) => ({ provincie, volume: v, plaatsingen: p, yieldPct: v ? p / v : 0 }));
}

export function combisPerConsultant(rows: Kandidaat[], consultant: string): ConsultantCombiStat[] {
  const list = rows.filter(r => r.consultant === consultant);
  const map = new Map<string, { v: number; p: number; titel: string; provincie: string }>();
  for (const r of list) {
    const k = `${r.titel}|${r.provincie}`;
    const c = map.get(k) ?? { v: 0, p: 0, titel: r.titel, provincie: r.provincie };
    c.v++; if (r.geplaatst) c.p++;
    map.set(k, c);
  }
  return Array.from(map.values()).map(c => {
    const yieldPct = c.v ? c.p / c.v : 0;
    return { titel: c.titel, provincie: c.provincie, volume: c.v, plaatsingen: c.p, yieldPct, score: yieldPct * Math.log(1 + c.v) };
  });
}

export interface ConsultantBest {
  besteTitel: ConsultantTitelStat | null;
  besteRegio: ConsultantRegioStat | null;
  besteCombi: ConsultantCombiStat | null;
}

export function besteVoorConsultant(rows: Kandidaat[], consultant: string): ConsultantBest {
  const titels = titelsPerConsultant(rows, consultant).filter(t => t.volume >= 3);
  const regios = regiosPerConsultant(rows, consultant).filter(t => t.volume >= 3);
  const combis = combisPerConsultant(rows, consultant).filter(t => t.volume >= 2);
  return {
    besteTitel: [...titels].sort((a, b) => b.yieldPct - a.yieldPct)[0] ?? null,
    besteRegio: [...regios].sort((a, b) => b.yieldPct - a.yieldPct)[0] ?? null,
    besteCombi: [...combis].sort((a, b) => b.score - a.score)[0] ?? null,
  };
}

// Weekly trend
export function weeklyTrend(rows: Kandidaat[]) {
  const perWeek = new Map<string, { kandidaten: number; plaatsingen: number }>();
  for (const r of rows) {
    const d = new Date(r.datumBinnenkomst);
    const week = `${d.getFullYear()}-W${Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7).toString().padStart(2, "0")}`;
    if (!perWeek.has(week)) perWeek.set(week, { kandidaten: 0, plaatsingen: 0 });
    const cell = perWeek.get(week)!;
    cell.kandidaten++;
    if (r.geplaatst) cell.plaatsingen++;
  }
  return Array.from(perWeek.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([week, v]) => ({ week, ...v }));
}

// Opportunity list
export interface Opportunity {
  id: string;
  prioriteit: number;
  aanbeveling: string;
  titel: string;
  provincie: string;
  consultant: string;
  huidigeInstroom: number;
  plaatsingskans: number;
  potentiëleImpact: number;
  actie: string;
  reden: string;
  type: "inkopen" | "verlagen" | "consultant" | "regio" | "bron";
}

export function buildOpportunities(rows: Kandidaat[]): Opportunity[] {
  const out: Opportunity[] = [];
  const alleTitels = statsPerTitel(rows);
  const avgVol = alleTitels.reduce((s, x) => s + x.volume, 0) / alleTitels.length;
  const avgYield = alleTitels.reduce((s, x) => s + x.plaatsingspct, 0) / alleTitels.length;

  // Combinaties titel × provincie
  for (const titel of TITELS) {
    for (const provincie of PROVINCIES) {
      const list = rows.filter(r => r.titel === titel && r.provincie === provincie);
      if (list.length < 3) continue;
      const m = metrics(list);
      const q = classify({ titel, ...m } as TitelStats, avgVol / PROVINCIES.length, avgYield);
      if (q === "extra_inkopen" && m.plaatsingspct > avgYield * 1.1) {
        const extra = Math.round((avgVol / PROVINCIES.length - list.length) * m.plaatsingspct);
        if (extra > 0) {
          out.push({
            id: `O-${titel}-${provincie}`,
            prioriteit: Math.round(m.plaatsingspct * 100 * (avgVol / PROVINCIES.length / Math.max(1, list.length))),
            aanbeveling: `Extra kandidaten inkopen: ${titel} in ${provincie}`,
            titel, provincie, consultant: "—",
            huidigeInstroom: list.length,
            plaatsingskans: m.plaatsingspct,
            potentiëleImpact: extra,
            actie: `Marketingbudget +25% op ${titel} in ${provincie}`,
            reden: `Plaatsingskans ${(m.plaatsingspct * 100).toFixed(0)}% is bovengemiddeld terwijl instroom (${list.length}) achterblijft`,
            type: "inkopen",
          });
        }
      } else if (q === "kritisch" && list.length > avgVol / PROVINCIES.length * 1.3) {
        out.push({
          id: `O-${titel}-${provincie}`,
          prioriteit: Math.round((1 - m.plaatsingspct) * 60 * (list.length / Math.max(1, avgVol / PROVINCIES.length))),
          aanbeveling: `Budget verlagen: ${titel} in ${provincie}`,
          titel, provincie, consultant: "—",
          huidigeInstroom: list.length,
          plaatsingskans: m.plaatsingspct,
          potentiëleImpact: Math.round(list.length * 0.3 * 45),
          actie: `Marketinguitgaven -30% en heralloceren naar prioriteit-titels`,
          reden: `Hoge instroom (${list.length}) met lage plaatsingskans ${(m.plaatsingspct * 100).toFixed(0)}%`,
          type: "verlagen",
        });
      }
    }
  }

  // Consultant × titel
  for (const c of CONSULTANTS) {
    for (const titel of TITELS) {
      const list = rows.filter(r => r.consultant === c.naam && r.titel === titel);
      if (list.length < 4) continue;
      const m = metrics(list);
      if (m.plaatsingspct > avgYield * 1.4) {
        out.push({
          id: `O-C-${c.naam}-${titel}`,
          prioriteit: Math.round(m.plaatsingspct * 100),
          aanbeveling: `${c.naam} extra ${titel}-kandidaten geven`,
          titel, provincie: c.regio, consultant: c.naam,
          huidigeInstroom: list.length,
          plaatsingskans: m.plaatsingspct,
          potentiëleImpact: Math.round(list.length * 0.5 * m.plaatsingspct),
          actie: `+50% toewijzingen van ${titel} aan ${c.naam}`,
          reden: `Bovengemiddelde plaatsingskans ${(m.plaatsingspct * 100).toFixed(0)}% op ${titel}`,
          type: "consultant",
        });
      }
    }
  }

  // Regio's met potentie
  for (const provincie of PROVINCIES) {
    const list = rows.filter(r => r.provincie === provincie);
    const m = metrics(list);
    const avgProvVol = rows.length / PROVINCIES.length;
    if (m.plaatsingspct > avgYield * 1.15 && list.length < avgProvVol * 0.85) {
      out.push({
        id: `O-R-${provincie}`,
        prioriteit: Math.round(m.plaatsingspct * 100 + 20),
        aanbeveling: `Regio ${provincie} opschalen`,
        titel: "—", provincie, consultant: "—",
        huidigeInstroom: list.length,
        plaatsingskans: m.plaatsingspct,
        potentiëleImpact: Math.round((avgProvVol - list.length) * m.plaatsingspct),
        actie: `Regio-campagne activeren in ${provincie}`,
        reden: `Plaatsingskans in regio bovengemiddeld, instroom onder gemiddelde`,
        type: "regio",
      });
    }
  }

  // Bronnen
  const bronStats = statsPerBron(rows);
  const avgBronYield = bronStats.reduce((s, b) => s + b.plaatsingspct, 0) / bronStats.length;
  for (const b of bronStats) {
    if (b.plaatsingspct > avgBronYield * 1.3 && b.volume > 30) {
      out.push({
        id: `O-B-${b.bron}`,
        prioriteit: Math.round(b.plaatsingspct * 100 + 15),
        aanbeveling: `Bron ${b.bron} opschalen`,
        titel: "—", provincie: "—", consultant: "—",
        huidigeInstroom: b.volume,
        plaatsingskans: b.plaatsingspct,
        potentiëleImpact: Math.round(b.volume * 0.4 * b.plaatsingspct),
        actie: `Budget verdubbelen op ${b.bron}`,
        reden: `Plaatsingskans ${(b.plaatsingspct * 100).toFixed(0)}%`,
        type: "bron",
      });
    } else if (b.plaatsingspct < avgBronYield * 0.6 && b.volume > 40) {
      out.push({
        id: `O-B-${b.bron}`,
        prioriteit: Math.round((1 - b.plaatsingspct) * 40),
        aanbeveling: `Bron ${b.bron} kritisch beoordelen`,
        titel: "—", provincie: "—", consultant: "—",
        huidigeInstroom: b.volume,
        plaatsingskans: b.plaatsingspct,
        potentiëleImpact: Math.round(b.volume * 0.4 * 40),
        actie: `Kwaliteitscheck + eventueel afbouwen`,
        reden: `Veel volume, lage plaatsingskans ${(b.plaatsingspct * 100).toFixed(0)}%`,
        type: "bron",
      });
    }
  }

  return out.sort((a, b) => b.prioriteit - a.prioriteit).slice(0, 30);
}

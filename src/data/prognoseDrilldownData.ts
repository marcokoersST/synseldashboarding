import type { PrognoseConsultantRow } from "./prognoseData";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function rand(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}
function pick<T>(arr: T[], seed: number, salt: number): T {
  return arr[Math.floor(rand(seed, salt) * arr.length)];
}

const KANDIDATEN = [
  "Sven Bakker", "Lisa de Vries", "Mohammed El Amrani", "Esther van Dijk",
  "Tim Hofstede", "Anna Janssen", "Pieter Mulder", "Sanne Visser",
  "Ruben Smit", "Fleur de Wit", "Jasper Kuiper", "Iris van Leeuwen",
  "Daan Postma", "Eva Bos", "Mark Vermeulen", "Noa Hendriks",
  "Bas van der Berg", "Lotte Koster", "Joris de Boer", "Yara Peters",
  "Stef van Dam", "Maud Verhoeven", "Gijs Brouwer", "Roos Willems",
];
const KLANTEN = [
  "TechNova B.V.", "Beheer Holland", "GreenLogix", "Vermeer Vastgoed",
  "Apex Industries", "Noordzee Catering", "Uniserve Solutions",
  "BlueWave Marine", "PolderTech", "Rotterdam Logistics", "Mendel Pharma",
  "Sterk Bouw", "Janssen & Co", "Fleurop Distributie", "Kompas Advies",
];
const INTAKE_TYPES = ["Kantoor Intake", "Teams Intake", "Whatsapp Intake"];
const INTAKE_STATUS = ["Inschrijven", "Verdelen", "Lead", "Nieuw"];
const STAGE_1X = [
  "1.0 Goedgekeurd",
  "1.1 Via mail voorstellen",
  "1.1 Via portal voorstellen",
  "1.1 Via 1 vast consultant voorstellen",
  "1.2 Bellen naar opdrachtgever",
];
const GESPREK_TYPES = [
  "1e sollicitatiegesprek",
  "Vervolggesprek",
  "Dealsluiter",
];
const PLAATS_TYPES = ["Detavast", "W&S", "Marge fac"];
const OPEN_DEAL_STAGES = [
  "2.0 Kandidaat voorgesteld",
  "2.1 Reminder verstuurd",
  "2.3 Lopende zaak",
  "3.0 1e gesprek nog inplannen",
  "3.2 Inplannen vervolggesprek",
];

function dateInLastDays(seed: number, salt: number, maxDays = 7): string {
  const days = Math.floor(rand(seed, salt) * maxDays);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" });
}

export interface IntakeRow { kandidaat: string; datum: string; type: string; status: string; }
export interface AcquisitieRow { kandidaat: string; vanStage: string; naarStage: string; datum: string; }
export interface VoorstelPromotedRow { kandidaat: string; klant: string; vorigeStage: string; datum: string; }
export interface OpenDealRow { kandidaat: string; openDeals: number; oudsteStage: string; }
export interface GesprekRow { kandidaat: string; klant: string; type: string; datum: string; }
export interface PlaatsingRow { kandidaat: string; klant: string; type: string; startdatum: string; }

export function getIntakes(row: PrognoseConsultantRow): IntakeRow[] {
  const seed = hash(row.id + ":intakes");
  return Array.from({ length: row.intakes.actual }, (_, i) => ({
    kandidaat: pick(KANDIDATEN, seed, i * 4 + 1),
    datum: dateInLastDays(seed, i * 4 + 2),
    type: pick(INTAKE_TYPES, seed, i * 4 + 3),
    status: pick(INTAKE_STATUS, seed, i * 4 + 4),
  }));
}

export function getAcquisities(row: PrognoseConsultantRow): AcquisitieRow[] {
  const seed = hash(row.id + ":acq");
  return Array.from({ length: row.acquisities.actual }, (_, i) => ({
    kandidaat: pick(KANDIDATEN, seed, i * 3 + 1),
    vanStage: "2 Acquisitie",
    naarStage: "3 In procedure",
    datum: dateInLastDays(seed, i * 3 + 2),
  }));
}

export function getVoorstellen(row: PrognoseConsultantRow): {
  promoted: VoorstelPromotedRow[];
  openDeals: OpenDealRow[];
} {
  const seed = hash(row.id + ":voor");
  const promoted = Array.from({ length: row.voorstellen.actual }, (_, i) => ({
    kandidaat: pick(KANDIDATEN, seed, i * 5 + 1),
    klant: pick(KLANTEN, seed, i * 5 + 2),
    vorigeStage: pick(STAGE_1X, seed, i * 5 + 3),
    datum: dateInLastDays(seed, i * 5 + 4),
  }));
  // open deals: ~30% of promoted have lingering open deals
  const openCount = Math.max(1, Math.round(row.voorstellen.actual * 0.35));
  const openDeals = Array.from({ length: openCount }, (_, i) => ({
    kandidaat: pick(KANDIDATEN, seed, i * 7 + 100),
    openDeals: 2 + Math.floor(rand(seed, i * 7 + 101) * 4),
    oudsteStage: pick(OPEN_DEAL_STAGES, seed, i * 7 + 102),
  }));
  return { promoted, openDeals };
}

export function getGesprekken(row: PrognoseConsultantRow): GesprekRow[] {
  const seed = hash(row.id + ":gespr");
  return Array.from({ length: row.gesprekken.actual }, (_, i) => ({
    kandidaat: pick(KANDIDATEN, seed, i * 4 + 1),
    klant: pick(KLANTEN, seed, i * 4 + 2),
    type: pick(GESPREK_TYPES, seed, i * 4 + 3),
    datum: dateInLastDays(seed, i * 4 + 4),
  }));
}

export function getPlaatsingen(row: PrognoseConsultantRow): PlaatsingRow[] {
  const seed = hash(row.id + ":plaats");
  return Array.from({ length: row.plaatsingen.actual }, (_, i) => ({
    kandidaat: pick(KANDIDATEN, seed, i * 4 + 1),
    klant: pick(KLANTEN, seed, i * 4 + 2),
    type: pick(PLAATS_TYPES, seed, i * 4 + 3),
    startdatum: dateInLastDays(seed, i * 4 + 4, 14),
  }));
}

export interface TelefonieRow {
  kandidaat: string;
  klant: string;
  richting: "Uitgaand" | "Inkomend";
  duur: string;
  datum: string;
  resultaat: string;
}
const RICHTINGEN: ("Uitgaand" | "Inkomend")[] = ["Uitgaand", "Uitgaand", "Uitgaand", "Inkomend"];
const RESULTATEN = ["Beantwoord", "Voicemail", "Geen gehoor", "Beantwoord", "Beantwoord"];

export function getTelefonie(row: PrognoseConsultantRow, maxDays = 7): TelefonieRow[] {
  const seed = hash(row.id + ":tel");
  const totalSec =
    row.telefonie.hours * 3600 + row.telefonie.minutes * 60 + row.telefonie.seconds;
  // ~ avg call 4 min → derive call count
  const callCount = Math.max(5, Math.round(totalSec / 240));
  return Array.from({ length: callCount }, (_, i) => {
    const callSec = 30 + Math.floor(rand(seed, i * 5 + 1) * 540);
    const m = Math.floor(callSec / 60);
    const s = callSec % 60;
    return {
      kandidaat: pick(KANDIDATEN, seed, i * 5 + 2),
      klant: pick(KLANTEN, seed, i * 5 + 3),
      richting: pick(RICHTINGEN, seed, i * 5 + 4),
      duur: `[${m}:${s.toString().padStart(2, "0")}]`,
      datum: dateInLastDays(seed, i * 5 + 5, maxDays),
      resultaat: pick(RESULTATEN, seed, i * 5 + 6),
    };
  });
}

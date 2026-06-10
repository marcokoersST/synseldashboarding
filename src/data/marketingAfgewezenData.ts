export interface AfgewezenReason {
  reason: string;
  count: number;
  color: string; // hsl token expression
}

export interface AfgewezenCandidate {
  id: string;
  naam: string;
  bron: string;
  unit: string;
  regio: string; // may be "" → rendered as "Onbekend"
  functie: string;
  reden: string;
  recruiter: string;
  datum: string; // yyyy-mm-dd
}

export const afgewezenReasons: AfgewezenReason[] = [
  { reason: "Niet kunnen spreken", count: 220, color: "hsl(190 75% 55%)" },
  { reason: "Nu niet werkzoekend", count: 165, color: "hsl(200 70% 40%)" },
  { reason: "Salaris niet passend", count: 130, color: "hsl(210 90% 65%)" },
  { reason: "Reistijd / locatie te ver", count: 120, color: "hsl(220 85% 45%)" },
  { reason: "Andere baan geaccepteerd", count: 110, color: "hsl(185 80% 60%)" },
  { reason: "ZZP / Freelance", count: 70, color: "hsl(245 70% 50%)" },
  { reason: "Bezig met studie", count: 55, color: "hsl(265 70% 60%)" },
  { reason: "Onvoldoende ervaring", count: 50, color: "hsl(25 85% 55%)" },
  { reason: "Taalvaardigheid onvoldoende", count: 32, color: "hsl(340 70% 55%)" },
  { reason: "Geen capaciteit bij opdrachtgever", count: 25, color: "hsl(160 65% 45%)" },
];

export const afgewezenTotal = afgewezenReasons.reduce((s, r) => s + r.count, 0);

const units = ["Finance", "Tech", "Engineering", "Sales & Marketing", "HR"];
const regios = [
  "Noord-Holland",
  "Zuid-Holland",
  "Noord-Brabant",
  "Utrecht",
  "Gelderland",
  "Overijssel",
  "Limburg",
  "", // empty → shown as Onbekend
  "",
];
const bronnen = [
  "RCM: Indeed",
  "RCM: LinkedIn",
  "RCM: Werkzoeken",
  "Recruit Robin",
  "Campus",
  "RCM: Nationale Vacaturebank",
];
const recruiters = [
  "Sanne de Vries",
  "Mark Jansen",
  "Lisa Bakker",
  "Tom Visser",
  "Eva Smit",
  "Daan Mulder",
  "Joost Hendriks",
  "Fleur Peters",
];
const functies = [
  "Financial Controller",
  "Frontend Developer",
  "Mechanical Engineer",
  "Account Manager",
  "HR Business Partner",
  "Data Analyst",
  "Backend Developer",
  "Project Manager",
  "Recruiter",
  "Marketing Specialist",
];
const voornamen = ["Jeroen", "Anne", "Pieter", "Sophie", "Bas", "Emma", "Thijs", "Noa", "Lars", "Fleur", "Sem", "Iris", "Ruben", "Lotte", "Joost", "Maud", "Stijn", "Roos", "Kees", "Julia", "Mees", "Sara", "Tim", "Eline", "Bram"];
const achternamen = ["Bakker", "de Jong", "Visser", "Smit", "Meijer", "de Boer", "Mulder", "Bos", "Vos", "Peters", "Hendriks", "van Dijk", "Janssen", "Willems", "van den Berg"];

function pick<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

// One row per declined candidate — totals must match afgewezenReasons exactly,
// so the new breakdown cards sum to the same total as the scorecards at the top.
export const afgewezenCandidates: AfgewezenCandidate[] = (() => {
  const rows: AfgewezenCandidate[] = [];
  let i = 0;
  for (const r of afgewezenReasons) {
    for (let k = 0; k < r.count; k++) {
      const day = ((i * 3) % 27) + 1;
      const month = (i % 3) + 4; // apr-jun
      rows.push({
        id: `cand-${i + 1}`,
        naam: `${pick(voornamen, i)} ${pick(achternamen, i * 2 + 1)}`,
        bron: pick(bronnen, i + 2),
        unit: pick(units, i + 1),
        regio: pick(regios, i * 5 + 1),
        functie: pick(functies, i * 3),
        reden: r.reason,
        recruiter: pick(recruiters, i * 7 + 1),
        datum: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      });
      i++;
    }
  }
  return rows;
})();

// Mock instroom per consultant — chosen so rejection rates vary roughly 10-45%.
export const instroomPerConsultant: Record<string, number> = {
  "Sanne de Vries": 280,
  "Mark Jansen": 320,
  "Lisa Bakker": 410,
  "Tom Visser": 540,
  "Eva Smit": 360,
  "Daan Mulder": 470,
  "Joost Hendriks": 300,
  "Fleur Peters": 620,
};

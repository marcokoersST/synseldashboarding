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
  functie: string;
  reden: string;
  recruiter: string;
  datum: string; // yyyy-mm-dd
}

export const afgewezenReasons: AfgewezenReason[] = [
  { reason: "Niet kunnen spreken", count: 83, color: "hsl(190 75% 55%)" },
  { reason: "Bezig met studie", count: 5, color: "hsl(210 90% 65%)" },
  { reason: "ZZP/Freelance", count: 6, color: "hsl(220 85% 45%)" },
  { reason: "Nu niet werkzoekend", count: 37, color: "hsl(200 70% 40%)" },
  { reason: "Geen capaciteit", count: 1, color: "hsl(245 70% 50%)" },
  { reason: "is leeg", count: 845, color: "hsl(185 80% 60%)" },
];

export const afgewezenTotal = afgewezenReasons.reduce((s, r) => s + r.count, 0);

const units = ["Finance", "Tech", "Engineering", "Sales & Marketing", "HR"];
const bronnen = [
  "RCM: Indeed",
  "RCM: LinkedIn",
  "RCM: Werkzoeken",
  "Recruit Robin",
  "Campus",
  "RCM: Nationale Vacaturebank",
];
const recruiters = ["Sanne de Vries", "Mark Jansen", "Lisa Bakker", "Tom Visser", "Eva Smit", "Daan Mulder"];
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
  return arr[i % arr.length];
}

// Distribute candidates proportionally across reasons (total 25 rows).
const distribution: { reason: string; n: number }[] = [
  { reason: "is leeg", n: 10 },
  { reason: "Niet kunnen spreken", n: 6 },
  { reason: "Nu niet werkzoekend", n: 4 },
  { reason: "ZZP/Freelance", n: 2 },
  { reason: "Bezig met studie", n: 2 },
  { reason: "Geen capaciteit", n: 1 },
];

export const afgewezenCandidates: AfgewezenCandidate[] = (() => {
  const rows: AfgewezenCandidate[] = [];
  let i = 0;
  for (const d of distribution) {
    for (let k = 0; k < d.n; k++) {
      const day = ((i * 3) % 27) + 1;
      const month = (i % 3) + 4; // apr-jun
      rows.push({
        id: `cand-${i + 1}`,
        naam: `${pick(voornamen, i)} ${pick(achternamen, i * 2 + 1)}`,
        bron: pick(bronnen, i + 2),
        unit: pick(units, i + 1),
        functie: pick(functies, i * 3),
        reden: d.reason,
        recruiter: pick(recruiters, i),
        datum: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      });
      i++;
    }
  }
  return rows;
})();

// AI-Coach Ranking mock data

export interface CoachScore {
  category: string;
  score: number; // 0-10
}

export interface ConsultantCoachRanking {
  name: string;
  scores: CoachScore[];
  average: number;
}

export const coachCategories = [
  "Telefonische Inschrijving",
  "Telefonische Acquisitie",
  "Intakegesprek",
  "Deal Sluiter",
];

export const consultantCoachRankings: ConsultantCoachRanking[] = [
  { name: "Sophie de Vries", scores: [{ category: "Telefonische Inschrijving", score: 9.1 }, { category: "Telefonische Acquisitie", score: 8.7 }, { category: "Intakegesprek", score: 8.9 }, { category: "Deal Sluiter", score: 9.3 }], average: 9.0 },
  { name: "Thomas Bakker", scores: [{ category: "Telefonische Inschrijving", score: 8.4 }, { category: "Telefonische Acquisitie", score: 8.1 }, { category: "Intakegesprek", score: 7.9 }, { category: "Deal Sluiter", score: 8.6 }], average: 8.3 },
  { name: "Emma Visser", scores: [{ category: "Telefonische Inschrijving", score: 7.8 }, { category: "Telefonische Acquisitie", score: 8.3 }, { category: "Intakegesprek", score: 7.5 }, { category: "Deal Sluiter", score: 7.9 }], average: 7.9 },
  { name: "Anna Smit", scores: [{ category: "Telefonische Inschrijving", score: 7.5 }, { category: "Telefonische Acquisitie", score: 7.2 }, { category: "Intakegesprek", score: 7.8 }, { category: "Deal Sluiter", score: 7.0 }], average: 7.4 },
  { name: "Fleur Mulder", scores: [{ category: "Telefonische Inschrijving", score: 7.1 }, { category: "Telefonische Acquisitie", score: 6.8 }, { category: "Intakegesprek", score: 7.3 }, { category: "Deal Sluiter", score: 6.5 }], average: 6.9 },
  { name: "Niels de Groot", scores: [{ category: "Telefonische Inschrijving", score: 6.6 }, { category: "Telefonische Acquisitie", score: 7.0 }, { category: "Intakegesprek", score: 6.2 }, { category: "Deal Sluiter", score: 6.8 }], average: 6.7 },
  { name: "Mark Peters", scores: [{ category: "Telefonische Inschrijving", score: 6.3 }, { category: "Telefonische Acquisitie", score: 5.9 }, { category: "Intakegesprek", score: 6.5 }, { category: "Deal Sluiter", score: 6.1 }], average: 6.2 },
  { name: "Daan de Boer", scores: [{ category: "Telefonische Inschrijving", score: 5.8 }, { category: "Telefonische Acquisitie", score: 5.5 }, { category: "Intakegesprek", score: 5.2 }, { category: "Deal Sluiter", score: 5.9 }], average: 5.6 },
  { name: "Bram Jansen", scores: [{ category: "Telefonische Inschrijving", score: 5.2 }, { category: "Telefonische Acquisitie", score: 4.8 }, { category: "Intakegesprek", score: 5.5 }, { category: "Deal Sluiter", score: 4.6 }], average: 5.0 },
  { name: "Lisa van Dijk", scores: [{ category: "Telefonische Inschrijving", score: 4.5 }, { category: "Telefonische Acquisitie", score: 4.2 }, { category: "Intakegesprek", score: 4.8 }, { category: "Deal Sluiter", score: 4.0 }], average: 4.4 },
];

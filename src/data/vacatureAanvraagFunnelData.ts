import { isWithinInterval } from "date-fns";

export interface VacatureAanvraagCandidate {
  id: number;
  name: string;
  firstVacatureAanvraagDate: Date;
  voorgesteld: boolean;
  opGesprek: boolean;
  tweedeGesprek: boolean;
  geplaatst: boolean;
}

// ~50 demo records spread across several weeks
export const vacatureAanvraagCandidates: VacatureAanvraagCandidate[] = [
  // Week 12 (Mar 17-21)
  { id: 1, name: "Jan de Vries", firstVacatureAanvraagDate: new Date(2026, 2, 17), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 2, name: "Pieter Bakker", firstVacatureAanvraagDate: new Date(2026, 2, 17), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 3, name: "Klaas Jansen", firstVacatureAanvraagDate: new Date(2026, 2, 18), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 4, name: "Henk Smit", firstVacatureAanvraagDate: new Date(2026, 2, 18), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 5, name: "Wim Visser", firstVacatureAanvraagDate: new Date(2026, 2, 19), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 6, name: "Dirk Meijer", firstVacatureAanvraagDate: new Date(2026, 2, 19), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 7, name: "Gert Mulder", firstVacatureAanvraagDate: new Date(2026, 2, 20), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 8, name: "Frank Bos", firstVacatureAanvraagDate: new Date(2026, 2, 20), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 9, name: "Tom Dekker", firstVacatureAanvraagDate: new Date(2026, 2, 21), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 10, name: "Sjaak Kok", firstVacatureAanvraagDate: new Date(2026, 2, 21), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  // Week 13 (Mar 24-28)
  { id: 11, name: "Bart Willems", firstVacatureAanvraagDate: new Date(2026, 2, 24), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 12, name: "Erik Groot", firstVacatureAanvraagDate: new Date(2026, 2, 24), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 13, name: "Mark Klein", firstVacatureAanvraagDate: new Date(2026, 2, 24), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 14, name: "Luuk Peters", firstVacatureAanvraagDate: new Date(2026, 2, 25), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 15, name: "Ruud Hendriks", firstVacatureAanvraagDate: new Date(2026, 2, 25), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 16, name: "Hugo van Dam", firstVacatureAanvraagDate: new Date(2026, 2, 25), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 17, name: "Daan Scholten", firstVacatureAanvraagDate: new Date(2026, 2, 26), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 18, name: "Lars Postma", firstVacatureAanvraagDate: new Date(2026, 2, 26), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 19, name: "Tim Dijkstra", firstVacatureAanvraagDate: new Date(2026, 2, 27), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 20, name: "Nick de Boer", firstVacatureAanvraagDate: new Date(2026, 2, 27), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 21, name: "Joep Brouwer", firstVacatureAanvraagDate: new Date(2026, 2, 28), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  // Week 14 (Mar 30 - Apr 3)
  { id: 22, name: "Sam Vos", firstVacatureAanvraagDate: new Date(2026, 2, 30), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 23, name: "Jesse van Dijk", firstVacatureAanvraagDate: new Date(2026, 2, 30), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 24, name: "Roy Kramer", firstVacatureAanvraagDate: new Date(2026, 2, 30), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 25, name: "Max de Wit", firstVacatureAanvraagDate: new Date(2026, 2, 31), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 26, name: "Bram Kuijpers", firstVacatureAanvraagDate: new Date(2026, 2, 31), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 27, name: "Thijs Maas", firstVacatureAanvraagDate: new Date(2026, 3, 1), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 28, name: "Stijn Verhoeven", firstVacatureAanvraagDate: new Date(2026, 3, 1), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 29, name: "Levi Vermeer", firstVacatureAanvraagDate: new Date(2026, 3, 1), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 30, name: "Mees van Leeuwen", firstVacatureAanvraagDate: new Date(2026, 3, 2), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 31, name: "Floris Jacobs", firstVacatureAanvraagDate: new Date(2026, 3, 2), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  // Earlier records (Feb)
  { id: 32, name: "Bo van Berg", firstVacatureAanvraagDate: new Date(2026, 1, 2), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 33, name: "Rens Huisman", firstVacatureAanvraagDate: new Date(2026, 1, 3), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 34, name: "Cas Peeters", firstVacatureAanvraagDate: new Date(2026, 1, 5), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 35, name: "Jasper Koster", firstVacatureAanvraagDate: new Date(2026, 1, 10), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 36, name: "Sem van den Heuvel", firstVacatureAanvraagDate: new Date(2026, 1, 12), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 37, name: "Noud Vogels", firstVacatureAanvraagDate: new Date(2026, 1, 14), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 38, name: "Tijn van Vliet", firstVacatureAanvraagDate: new Date(2026, 1, 17), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 39, name: "Siem Hoekstra", firstVacatureAanvraagDate: new Date(2026, 1, 19), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 40, name: "Guus Schouten", firstVacatureAanvraagDate: new Date(2026, 1, 21), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 41, name: "Abel de Jong", firstVacatureAanvraagDate: new Date(2026, 1, 24), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 42, name: "Mats Molenaar", firstVacatureAanvraagDate: new Date(2026, 1, 25), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 43, name: "Ties van Beek", firstVacatureAanvraagDate: new Date(2026, 1, 26), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 44, name: "Vince Admiraal", firstVacatureAanvraagDate: new Date(2026, 1, 27), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  // Jan records
  { id: 45, name: "Xander Prins", firstVacatureAanvraagDate: new Date(2026, 0, 6), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: true },
  { id: 46, name: "Owen Gerritsen", firstVacatureAanvraagDate: new Date(2026, 0, 8), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
  { id: 47, name: "Pim Timmermans", firstVacatureAanvraagDate: new Date(2026, 0, 13), voorgesteld: true, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 48, name: "Quinn Linden", firstVacatureAanvraagDate: new Date(2026, 0, 20), voorgesteld: false, opGesprek: false, tweedeGesprek: false, geplaatst: false },
  { id: 49, name: "Roan Veenstra", firstVacatureAanvraagDate: new Date(2026, 0, 22), voorgesteld: true, opGesprek: true, tweedeGesprek: true, geplaatst: false },
  { id: 50, name: "Sieb Kamphuis", firstVacatureAanvraagDate: new Date(2026, 0, 28), voorgesteld: true, opGesprek: true, tweedeGesprek: false, geplaatst: false },
];

export interface FunnelTotals {
  vacatureAanvraag: number;
  voorgesteld: number;
  opGesprek: number;
  tweedeGesprek: number;
  geplaatst: number;
}

export function filterByDateRange(from: Date, to: Date): VacatureAanvraagCandidate[] {
  return vacatureAanvraagCandidates.filter((c) =>
    isWithinInterval(c.firstVacatureAanvraagDate, { start: from, end: to })
  );
}

export function aggregateFunnel(candidates: VacatureAanvraagCandidate[]): FunnelTotals {
  return {
    vacatureAanvraag: candidates.length,
    voorgesteld: candidates.filter((c) => c.voorgesteld).length,
    opGesprek: candidates.filter((c) => c.opGesprek).length,
    tweedeGesprek: candidates.filter((c) => c.tweedeGesprek).length,
    geplaatst: candidates.filter((c) => c.geplaatst).length,
  };
}

export function stepConversion(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current / previous) * 100;
}

export interface ConsultantInschrijving {
  name: string;
  unit: string;
  current: {
    totaalVerwerkt: number;
    nietGebeld: number;
    doorgezet: number;
    afgewezen: number;
  };
  previous: {
    totaalVerwerkt: number;
    nietGebeld: number;
    doorgezet: number;
    afgewezen: number;
  };
}

export const consultantData: ConsultantInschrijving[] = [
  { name: "Lisa de Vries", unit: "IT", current: { totaalVerwerkt: 42, nietGebeld: 5, doorgezet: 28, afgewezen: 9 }, previous: { totaalVerwerkt: 38, nietGebeld: 7, doorgezet: 23, afgewezen: 8 } },
  { name: "Mark Jansen", unit: "IT", current: { totaalVerwerkt: 35, nietGebeld: 8, doorgezet: 19, afgewezen: 8 }, previous: { totaalVerwerkt: 30, nietGebeld: 5, doorgezet: 18, afgewezen: 7 } },
  { name: "Sophie Bakker", unit: "Finance", current: { totaalVerwerkt: 28, nietGebeld: 2, doorgezet: 20, afgewezen: 6 }, previous: { totaalVerwerkt: 25, nietGebeld: 4, doorgezet: 16, afgewezen: 5 } },
  { name: "Tom Hendriks", unit: "Finance", current: { totaalVerwerkt: 31, nietGebeld: 10, doorgezet: 14, afgewezen: 7 }, previous: { totaalVerwerkt: 29, nietGebeld: 6, doorgezet: 17, afgewezen: 6 } },
  { name: "Eva Smit", unit: "HR", current: { totaalVerwerkt: 22, nietGebeld: 1, doorgezet: 17, afgewezen: 4 }, previous: { totaalVerwerkt: 20, nietGebeld: 3, doorgezet: 13, afgewezen: 4 } },
  { name: "Daan Peters", unit: "HR", current: { totaalVerwerkt: 19, nietGebeld: 6, doorgezet: 9, afgewezen: 4 }, previous: { totaalVerwerkt: 21, nietGebeld: 4, doorgezet: 12, afgewezen: 5 } },
  { name: "Julia van Dijk", unit: "Engineering", current: { totaalVerwerkt: 45, nietGebeld: 3, doorgezet: 32, afgewezen: 10 }, previous: { totaalVerwerkt: 40, nietGebeld: 5, doorgezet: 27, afgewezen: 8 } },
  { name: "Ruben Visser", unit: "Engineering", current: { totaalVerwerkt: 38, nietGebeld: 12, doorgezet: 18, afgewezen: 8 }, previous: { totaalVerwerkt: 34, nietGebeld: 8, doorgezet: 20, afgewezen: 6 } },
  { name: "Anna Mulder", unit: "Sales", current: { totaalVerwerkt: 33, nietGebeld: 4, doorgezet: 22, afgewezen: 7 }, previous: { totaalVerwerkt: 28, nietGebeld: 3, doorgezet: 19, afgewezen: 6 } },
  { name: "Bas de Groot", unit: "Sales", current: { totaalVerwerkt: 26, nietGebeld: 9, doorgezet: 12, afgewezen: 5 }, previous: { totaalVerwerkt: 24, nietGebeld: 7, doorgezet: 13, afgewezen: 4 } },
  { name: "Lotte Bos", unit: "IT", current: { totaalVerwerkt: 30, nietGebeld: 3, doorgezet: 21, afgewezen: 6 }, previous: { totaalVerwerkt: 27, nietGebeld: 4, doorgezet: 18, afgewezen: 5 } },
  { name: "Sander Kok", unit: "Finance", current: { totaalVerwerkt: 24, nietGebeld: 7, doorgezet: 12, afgewezen: 5 }, previous: { totaalVerwerkt: 22, nietGebeld: 5, doorgezet: 13, afgewezen: 4 } },
];

export const businessUnits = [...new Set(consultantData.map(c => c.unit))];
export const consultantNames = consultantData.map(c => c.name);

export interface AggregatedData {
  totaalVerwerkt: number;
  nietGebeld: number;
  doorgezet: number;
  afgewezen: number;
}

export function aggregateData(data: ConsultantInschrijving[], period: "current" | "previous"): AggregatedData {
  return data.reduce(
    (acc, c) => {
      const p = c[period];
      return {
        totaalVerwerkt: acc.totaalVerwerkt + p.totaalVerwerkt,
        nietGebeld: acc.nietGebeld + p.nietGebeld,
        doorgezet: acc.doorgezet + p.doorgezet,
        afgewezen: acc.afgewezen + p.afgewezen,
      };
    },
    { totaalVerwerkt: 0, nietGebeld: 0, doorgezet: 0, afgewezen: 0 }
  );
}

export function filterConsultants(
  data: ConsultantInschrijving[],
  consultant: string | null,
  unit: string | null
): ConsultantInschrijving[] {
  return data.filter(c => {
    if (consultant && c.name !== consultant) return false;
    if (unit && c.unit !== unit) return false;
    return true;
  });
}

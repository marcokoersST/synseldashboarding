export interface VacatureFunnelEntry {
  title: string;
  unit: string;
  consultant: string;
  current: { inschrijven: number; acquisitie: number; geplaatst: number };
  previous: { inschrijven: number; acquisitie: number; geplaatst: number };
}

export const vacatureFunnelBusinessUnits = [
  "Engineering",
  "Monteurs",
  "Operators",
  "Trainingsunit",
  "Early Performers",
];

export const vacatureFunnelConsultants = [
  "Delano Nikkels",
  "Falco Zegveld",
  "Eric Hutchison",
  "Jonah Waterborg",
  "Niels Eggens",
  "Toby Bruinier",
  "Miguel Kraaijeveld",
  "Robin Jansen",
];

export const vacatureFunnelData: VacatureFunnelEntry[] = [
  // Engineering
  { title: "Werkvoorbereider", unit: "Engineering", consultant: "Delano Nikkels", current: { inschrijven: 42, acquisitie: 28, geplaatst: 11 }, previous: { inschrijven: 38, acquisitie: 24, geplaatst: 9 } },
  { title: "Projectleider", unit: "Engineering", consultant: "Falco Zegveld", current: { inschrijven: 36, acquisitie: 22, geplaatst: 8 }, previous: { inschrijven: 34, acquisitie: 20, geplaatst: 10 } },
  { title: "Calculator", unit: "Engineering", consultant: "Robin Jansen", current: { inschrijven: 28, acquisitie: 18, geplaatst: 7 }, previous: { inschrijven: 25, acquisitie: 15, geplaatst: 6 } },
  { title: "Constructeur", unit: "Engineering", consultant: "Delano Nikkels", current: { inschrijven: 22, acquisitie: 14, geplaatst: 5 }, previous: { inschrijven: 24, acquisitie: 16, geplaatst: 7 } },
  // Monteurs
  { title: "Servicemonteur", unit: "Monteurs", consultant: "Eric Hutchison", current: { inschrijven: 55, acquisitie: 35, geplaatst: 14 }, previous: { inschrijven: 50, acquisitie: 30, geplaatst: 12 } },
  { title: "Elektromonteur", unit: "Monteurs", consultant: "Miguel Kraaijeveld", current: { inschrijven: 48, acquisitie: 30, geplaatst: 12 }, previous: { inschrijven: 44, acquisitie: 28, geplaatst: 11 } },
  { title: "Loodgieter", unit: "Monteurs", consultant: "Eric Hutchison", current: { inschrijven: 18, acquisitie: 10, geplaatst: 3 }, previous: { inschrijven: 20, acquisitie: 12, geplaatst: 4 } },
  // Operators
  { title: "Operator", unit: "Operators", consultant: "Toby Bruinier", current: { inschrijven: 62, acquisitie: 40, geplaatst: 16 }, previous: { inschrijven: 58, acquisitie: 36, geplaatst: 14 } },
  { title: "Procesoperator", unit: "Operators", consultant: "Toby Bruinier", current: { inschrijven: 34, acquisitie: 20, geplaatst: 8 }, previous: { inschrijven: 30, acquisitie: 18, geplaatst: 7 } },
  // Trainingsunit
  { title: "Trainee Techniek", unit: "Trainingsunit", consultant: "Jonah Waterborg", current: { inschrijven: 40, acquisitie: 22, geplaatst: 9 }, previous: { inschrijven: 36, acquisitie: 20, geplaatst: 8 } },
  // Early Performers
  { title: "Junior Engineer", unit: "Early Performers", consultant: "Niels Eggens", current: { inschrijven: 30, acquisitie: 16, geplaatst: 5 }, previous: { inschrijven: 28, acquisitie: 14, geplaatst: 6 } },
  // Niet geclassificeerd (spread across consultants)
  { title: "Niet geclassificeerd", unit: "Engineering", consultant: "Delano Nikkels", current: { inschrijven: 8, acquisitie: 3, geplaatst: 1 }, previous: { inschrijven: 10, acquisitie: 4, geplaatst: 1 } },
  { title: "Niet geclassificeerd", unit: "Monteurs", consultant: "Eric Hutchison", current: { inschrijven: 12, acquisitie: 4, geplaatst: 1 }, previous: { inschrijven: 14, acquisitie: 5, geplaatst: 2 } },
  { title: "Niet geclassificeerd", unit: "Operators", consultant: "Toby Bruinier", current: { inschrijven: 6, acquisitie: 2, geplaatst: 0 }, previous: { inschrijven: 8, acquisitie: 3, geplaatst: 1 } },
];

export interface AggregatedTitle {
  title: string;
  current: { inschrijven: number; acquisitie: number; geplaatst: number };
  previous: { inschrijven: number; acquisitie: number; geplaatst: number };
}

export function filterVacatureFunnel(
  data: VacatureFunnelEntry[],
  unit: string | null,
  consultant: string | null
): VacatureFunnelEntry[] {
  return data.filter((d) => {
    if (unit && d.unit !== unit) return false;
    if (consultant && d.consultant !== consultant) return false;
    return true;
  });
}

export function aggregateByTitle(data: VacatureFunnelEntry[]): AggregatedTitle[] {
  const map = new Map<string, AggregatedTitle>();
  for (const d of data) {
    const existing = map.get(d.title);
    if (existing) {
      existing.current.inschrijven += d.current.inschrijven;
      existing.current.acquisitie += d.current.acquisitie;
      existing.current.geplaatst += d.current.geplaatst;
      existing.previous.inschrijven += d.previous.inschrijven;
      existing.previous.acquisitie += d.previous.acquisitie;
      existing.previous.geplaatst += d.previous.geplaatst;
    } else {
      map.set(d.title, {
        title: d.title,
        current: { ...d.current },
        previous: { ...d.previous },
      });
    }
  }
  // Sort: "Niet geclassificeerd" always last, rest by current inschrijven desc
  return Array.from(map.values()).sort((a, b) => {
    if (a.title === "Niet geclassificeerd") return 1;
    if (b.title === "Niet geclassificeerd") return -1;
    return b.current.inschrijven - a.current.inschrijven;
  });
}

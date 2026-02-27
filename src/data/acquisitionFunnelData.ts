export interface AcquisitionFunnelEntry {
  name: string;
  unit: string;
  toegewezen: number;
  ingeschreven: number;
  acquisitie: number;
}

export const acquisitionFunnelData: AcquisitionFunnelEntry[] = [
  { name: "Delano Nikkels", unit: "Engineering", toegewezen: 95, ingeschreven: 65, acquisitie: 38 },
  { name: "Falco Zegveld", unit: "Engineering", toegewezen: 82, ingeschreven: 52, acquisitie: 29 },
  { name: "Eric Hutchison", unit: "Monteurs", toegewezen: 78, ingeschreven: 48, acquisitie: 26 },
  { name: "Jonah Waterborg", unit: "Trainingsunit", toegewezen: 64, ingeschreven: 38, acquisitie: 18 },
  { name: "Niels Eggens", unit: "Early Performers", toegewezen: 55, ingeschreven: 28, acquisitie: 12 },
  { name: "Toby Bruinier", unit: "Operators", toegewezen: 88, ingeschreven: 58, acquisitie: 34 },
  { name: "Miguel Kraaijeveld", unit: "Monteurs", toegewezen: 72, ingeschreven: 44, acquisitie: 22 },
  { name: "Robin Jansen", unit: "Engineering", toegewezen: 68, ingeschreven: 42, acquisitie: 25 },
  { name: "Matthijs Boskamp", unit: "Operators", toegewezen: 91, ingeschreven: 61, acquisitie: 35 },
  { name: "Lars Vermeulen", unit: "Trainingsunit", toegewezen: 60, ingeschreven: 34, acquisitie: 15 },
  { name: "Bram de Wit", unit: "Early Performers", toegewezen: 48, ingeschreven: 24, acquisitie: 10 },
  { name: "Sven Kuiper", unit: "Monteurs", toegewezen: 76, ingeschreven: 46, acquisitie: 28 },
];

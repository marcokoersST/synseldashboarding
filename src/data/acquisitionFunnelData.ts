export interface AcquisitionFunnelEntry {
  name: string;
  unit: string;
  toegewezen: number;
  ingeschreven: number;
  acquisitie: number;
  // Compleet tabel
  voorstellen: number;
  geenGesprek: number;
  eersteGesprek: number;
  totaleGesprekken: number;
  // Fase 2 tabel
  gesprekken: number;
  tweedeGesprekken: number;
  dealsluiters: number;
  plaatsingen: number;
}

export const acquisitionFunnelData: AcquisitionFunnelEntry[] = [
  { name: "Delano Nikkels", unit: "Engineering", toegewezen: 95, ingeschreven: 65, acquisitie: 38, voorstellen: 28, geenGesprek: 9, eersteGesprek: 18, totaleGesprekken: 22, gesprekken: 22, tweedeGesprekken: 12, dealsluiters: 8, plaatsingen: 6 },
  { name: "Falco Zegveld", unit: "Engineering", toegewezen: 82, ingeschreven: 52, acquisitie: 29, voorstellen: 20, geenGesprek: 7, eersteGesprek: 14, totaleGesprekken: 17, gesprekken: 17, tweedeGesprekken: 9, dealsluiters: 6, plaatsingen: 4 },
  { name: "Robin Jansen", unit: "Engineering", toegewezen: 68, ingeschreven: 42, acquisitie: 25, voorstellen: 18, geenGesprek: 5, eersteGesprek: 12, totaleGesprekken: 15, gesprekken: 15, tweedeGesprekken: 8, dealsluiters: 5, plaatsingen: 3 },
  { name: "Eric Hutchison", unit: "Monteurs", toegewezen: 78, ingeschreven: 48, acquisitie: 26, voorstellen: 19, geenGesprek: 6, eersteGesprek: 13, totaleGesprekken: 16, gesprekken: 16, tweedeGesprekken: 7, dealsluiters: 5, plaatsingen: 4 },
  { name: "Miguel Kraaijeveld", unit: "Monteurs", toegewezen: 72, ingeschreven: 44, acquisitie: 22, voorstellen: 15, geenGesprek: 5, eersteGesprek: 10, totaleGesprekken: 13, gesprekken: 13, tweedeGesprekken: 6, dealsluiters: 4, plaatsingen: 3 },
  { name: "Sven Kuiper", unit: "Monteurs", toegewezen: 76, ingeschreven: 46, acquisitie: 28, voorstellen: 21, geenGesprek: 7, eersteGesprek: 14, totaleGesprekken: 18, gesprekken: 18, tweedeGesprekken: 10, dealsluiters: 7, plaatsingen: 5 },
  { name: "Toby Bruinier", unit: "Operators", toegewezen: 88, ingeschreven: 58, acquisitie: 34, voorstellen: 25, geenGesprek: 8, eersteGesprek: 16, totaleGesprekken: 21, gesprekken: 21, tweedeGesprekken: 11, dealsluiters: 7, plaatsingen: 5 },
  { name: "Matthijs Boskamp", unit: "Operators", toegewezen: 91, ingeschreven: 61, acquisitie: 35, voorstellen: 26, geenGesprek: 9, eersteGesprek: 17, totaleGesprekken: 22, gesprekken: 22, tweedeGesprekken: 13, dealsluiters: 9, plaatsingen: 7 },
  { name: "Jonah Waterborg", unit: "Trainingsunit", toegewezen: 64, ingeschreven: 38, acquisitie: 18, voorstellen: 12, geenGesprek: 4, eersteGesprek: 8, totaleGesprekken: 10, gesprekken: 10, tweedeGesprekken: 4, dealsluiters: 3, plaatsingen: 2 },
  { name: "Lars Vermeulen", unit: "Trainingsunit", toegewezen: 60, ingeschreven: 34, acquisitie: 15, voorstellen: 10, geenGesprek: 4, eersteGesprek: 7, totaleGesprekken: 9, gesprekken: 9, tweedeGesprekken: 3, dealsluiters: 2, plaatsingen: 1 },
  { name: "Niels Eggens", unit: "Early Performers", toegewezen: 55, ingeschreven: 28, acquisitie: 12, voorstellen: 8, geenGesprek: 3, eersteGesprek: 5, totaleGesprekken: 7, gesprekken: 7, tweedeGesprekken: 3, dealsluiters: 2, plaatsingen: 1 },
  { name: "Bram de Wit", unit: "Early Performers", toegewezen: 48, ingeschreven: 24, acquisitie: 10, voorstellen: 6, geenGesprek: 3, eersteGesprek: 4, totaleGesprekken: 6, gesprekken: 6, tweedeGesprekken: 2, dealsluiters: 1, plaatsingen: 1 },
];

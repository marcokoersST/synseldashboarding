export interface VoorstelType {
  detachering: number;
  vast: number;
  interim: number;
}

export interface ConsultantProductiviteit {
  id: number;
  name: string;
  unit: string;
  inschrijvingen: number;
  inschrijvingenGesprekstijdMin: number; // in minutes
  acquisities: number;
  voorstellen: number;
  voorstelType: VoorstelType;
  mails: number;
  telefoontjes: number;
  beltijdMin: number; // in minutes
  gesprekkenInTePlannen: number;
  gesprekkenGevoerd: number;
  negatieveStatusBelpogingen: number;
}

export const units = ["Engineering", "Monteurs", "Operators", "Early Performers", "Trainingsunit"];

const weekData: ConsultantProductiviteit[] = [
  { id: 1, name: "Delano Nikkels", unit: "Engineering", inschrijvingen: 12, inschrijvingenGesprekstijdMin: 186, acquisities: 6, voorstellen: 9, voorstelType: { detachering: 5, vast: 3, interim: 1 }, mails: 78, telefoontjes: 45, beltijdMin: 312, gesprekkenInTePlannen: 4, gesprekkenGevoerd: 8, negatieveStatusBelpogingen: 2 },
  { id: 2, name: "Falco Zegveld", unit: "Engineering", inschrijvingen: 9, inschrijvingenGesprekstijdMin: 142, acquisities: 4, voorstellen: 7, voorstelType: { detachering: 4, vast: 2, interim: 1 }, mails: 63, telefoontjes: 38, beltijdMin: 264, gesprekkenInTePlannen: 3, gesprekkenGevoerd: 6, negatieveStatusBelpogingen: 0 },
  { id: 3, name: "Eric Hutchison", unit: "Monteurs", inschrijvingen: 11, inschrijvingenGesprekstijdMin: 168, acquisities: 5, voorstellen: 8, voorstelType: { detachering: 3, vast: 4, interim: 1 }, mails: 71, telefoontjes: 42, beltijdMin: 295, gesprekkenInTePlannen: 5, gesprekkenGevoerd: 7, negatieveStatusBelpogingen: 3 },
  { id: 4, name: "Jij", unit: "Operators", inschrijvingen: 7, inschrijvingenGesprekstijdMin: 108, acquisities: 3, voorstellen: 5, voorstelType: { detachering: 2, vast: 2, interim: 1 }, mails: 45, telefoontjes: 28, beltijdMin: 198, gesprekkenInTePlannen: 2, gesprekkenGevoerd: 4, negatieveStatusBelpogingen: 1 },
  { id: 5, name: "Jonah Waterborg", unit: "Trainingsunit", inschrijvingen: 5, inschrijvingenGesprekstijdMin: 78, acquisities: 2, voorstellen: 3, voorstelType: { detachering: 1, vast: 1, interim: 1 }, mails: 34, telefoontjes: 22, beltijdMin: 148, gesprekkenInTePlannen: 1, gesprekkenGevoerd: 3, negatieveStatusBelpogingen: 0 },
  { id: 6, name: "Niels Eggens", unit: "Early Performers", inschrijvingen: 4, inschrijvingenGesprekstijdMin: 62, acquisities: 1, voorstellen: 2, voorstelType: { detachering: 1, vast: 1, interim: 0 }, mails: 28, telefoontjes: 18, beltijdMin: 112, gesprekkenInTePlannen: 1, gesprekkenGevoerd: 2, negatieveStatusBelpogingen: 4 },
  { id: 7, name: "Sophie van Dijk", unit: "Monteurs", inschrijvingen: 10, inschrijvingenGesprekstijdMin: 155, acquisities: 5, voorstellen: 6, voorstelType: { detachering: 3, vast: 2, interim: 1 }, mails: 58, telefoontjes: 35, beltijdMin: 245, gesprekkenInTePlannen: 3, gesprekkenGevoerd: 5, negatieveStatusBelpogingen: 1 },
  { id: 8, name: "Tom de Boer", unit: "Operators", inschrijvingen: 8, inschrijvingenGesprekstijdMin: 124, acquisities: 4, voorstellen: 6, voorstelType: { detachering: 3, vast: 2, interim: 1 }, mails: 52, telefoontjes: 32, beltijdMin: 218, gesprekkenInTePlannen: 2, gesprekkenGevoerd: 5, negatieveStatusBelpogingen: 0 },
  { id: 9, name: "Lisa Jansen", unit: "Engineering", inschrijvingen: 13, inschrijvingenGesprekstijdMin: 198, acquisities: 7, voorstellen: 10, voorstelType: { detachering: 6, vast: 3, interim: 1 }, mails: 82, telefoontjes: 48, beltijdMin: 335, gesprekkenInTePlannen: 5, gesprekkenGevoerd: 9, negatieveStatusBelpogingen: 1 },
  { id: 10, name: "Mark Bakker", unit: "Trainingsunit", inschrijvingen: 6, inschrijvingenGesprekstijdMin: 92, acquisities: 2, voorstellen: 4, voorstelType: { detachering: 2, vast: 1, interim: 1 }, mails: 38, telefoontjes: 24, beltijdMin: 162, gesprekkenInTePlannen: 2, gesprekkenGevoerd: 3, negatieveStatusBelpogingen: 2 },
];

export function getProductiviteitData(): ConsultantProductiviteit[] {
  return weekData;
}

export function filterByUnit(data: ConsultantProductiviteit[], selectedUnits: string[]): ConsultantProductiviteit[] {
  if (selectedUnits.length === 0) return data;
  return data.filter(d => selectedUnits.includes(d.unit));
}

export function filterByConsultant(data: ConsultantProductiviteit[], consultantIds: number[]): ConsultantProductiviteit[] {
  if (consultantIds.length === 0) return data;
  return data.filter(d => consultantIds.includes(d.id));
}

export function formatMinutesToHMS(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const s = 0;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export interface ProductiviteitsScore {
  label: string;
  uren: number; // hours spent on this activity
  percentage: number; // % of total work hours
}

export function berekenProductiviteit(c: ConsultantProductiviteit, werkurenPerWeek: number): { scores: ProductiviteitsScore[]; totaalUren: number; totaalPercentage: number } {
  const belUren = c.beltijdMin / 60;
  const inschrijfUren = c.inschrijvingenGesprekstijdMin / 60;
  const mailUren = c.mails * 3 / 60; // ~3 min per mail
  const voorstelUren = c.voorstellen * 20 / 60; // ~20 min per voorstel
  const gesprekUren = c.gesprekkenGevoerd * 45 / 60; // ~45 min per gesprek
  const acqUren = c.acquisities * 30 / 60; // ~30 min per acquisitie

  const scores: ProductiviteitsScore[] = [
    { label: "Bellen", uren: belUren, percentage: (belUren / werkurenPerWeek) * 100 },
    { label: "Inschrijvingen", uren: inschrijfUren, percentage: (inschrijfUren / werkurenPerWeek) * 100 },
    { label: "Mails", uren: mailUren, percentage: (mailUren / werkurenPerWeek) * 100 },
    { label: "Voorstellen", uren: voorstelUren, percentage: (voorstelUren / werkurenPerWeek) * 100 },
    { label: "Gesprekken", uren: gesprekUren, percentage: (gesprekUren / werkurenPerWeek) * 100 },
    { label: "Acquisities", uren: acqUren, percentage: (acqUren / werkurenPerWeek) * 100 },
  ];

  const totaalUren = scores.reduce((sum, s) => sum + s.uren, 0);
  const totaalPercentage = (totaalUren / werkurenPerWeek) * 100;

  return { scores, totaalUren, totaalPercentage };
}

export function aggregateTotals(data: ConsultantProductiviteit[]) {
  return data.reduce(
    (acc, c) => ({
      inschrijvingen: acc.inschrijvingen + c.inschrijvingen,
      inschrijvingenGesprekstijdMin: acc.inschrijvingenGesprekstijdMin + c.inschrijvingenGesprekstijdMin,
      acquisities: acc.acquisities + c.acquisities,
      voorstellen: acc.voorstellen + c.voorstellen,
      mails: acc.mails + c.mails,
      telefoontjes: acc.telefoontjes + c.telefoontjes,
      beltijdMin: acc.beltijdMin + c.beltijdMin,
      gesprekkenInTePlannen: acc.gesprekkenInTePlannen + c.gesprekkenInTePlannen,
      gesprekkenGevoerd: acc.gesprekkenGevoerd + c.gesprekkenGevoerd,
      negatieveStatusBelpogingen: acc.negatieveStatusBelpogingen + c.negatieveStatusBelpogingen,
    }),
    { inschrijvingen: 0, inschrijvingenGesprekstijdMin: 0, acquisities: 0, voorstellen: 0, mails: 0, telefoontjes: 0, beltijdMin: 0, gesprekkenInTePlannen: 0, gesprekkenGevoerd: 0, negatieveStatusBelpogingen: 0 }
  );
}

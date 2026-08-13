// Mock data: kandidaten die nog niet zijn ingedeeld naar een genormaliseerde titel.
// Statische demo-data (deterministisch, geen backend).

import { PROVINCIES, CONSULTANTS } from "./inkoopYieldData";

export interface CvBlok {
  periode: string;
  rol: string;
  bedrijf: string;
  bullets: string[];
}

export interface ToeTeWijzenKandidaat {
  id: string;
  naam: string;
  rcrmFunctie: string;      // functie zoals ingevuld in RecruitCRM
  functiegroep: string;     // functiegroep uit RecruitCRM
  provincie: string;
  consultant: string;
  datumBinnenkomst: string; // ISO
  status: string;
  bron: string;
  crmId: string;
  synselId: string;
  cv: {
    headline: string;
    woonplaats: string;
    telefoon: string;
    email: string;
    samenvatting: string;
    ervaring: CvBlok[];
    opleiding: { periode: string; opleiding: string; instituut: string }[];
    skills: string[];
    talen: string[];
  };
}

const RAW: { naam: string; functie: string; groep: string; bron: string; status: string }[] = [
  { naam: "Kevin Duijst", functie: "Allround monteur (buitendienst)", groep: "Techniek", bron: "Indeed", status: "Nieuw" },
  { naam: "Melissa van Rooij", functie: "Operator productielijn 3", groep: "Productie", bron: "LinkedIn", status: "Nieuw" },
  { naam: "Ahmed El Amrani", functie: "Elektricien industrie", groep: "Techniek", bron: "Google Ads", status: "Verdelen" },
  { naam: "Sander Kooij", functie: "Werkvoorbereider E-installaties", groep: "Engineering", bron: "Referral", status: "Nieuw" },
  { naam: "Priya Raman", functie: "Jr. constructeur mechanica", groep: "Engineering", bron: "LinkedIn", status: "Nieuw" },
  { naam: "Tim Broekhuizen", functie: "Servicetechnicus koeltechniek", groep: "Techniek", bron: "Jooble", status: "Verdelen" },
  { naam: "Nadia Bekkers", functie: "Kwaliteitscontroleur / QA", groep: "Kwaliteit", bron: "Organisch", status: "Nieuw" },
  { naam: "Joost Verlaan", functie: "CNC draaier/frezer", groep: "Metaal", bron: "Indeed", status: "Nieuw" },
  { naam: "Rick Slotboom", functie: "Onderhoudstechnicus TD", groep: "Techniek", bron: "WhatsApp re-engagement", status: "Verdelen" },
  { naam: "Ilse Baarsma", functie: "Logistiek medewerker warehouse", groep: "Logistiek", bron: "Indeed", status: "Nieuw" },
  { naam: "Bilal Yildiz", functie: "MIG/MAG lasser", groep: "Metaal", bron: "Google Ads", status: "Nieuw" },
  { naam: "Chantal de Rooy", functie: "Projectengineer utiliteit", groep: "Engineering", bron: "LinkedIn", status: "Verdelen" },
  { naam: "Dennis Wolthuis", functie: "Mechatronicus machinebouw", groep: "Techniek", bron: "Referral", status: "Nieuw" },
  { naam: "Sofie Lammers", functie: "Tekenaar Autocad/Revit", groep: "Engineering", bron: "Organisch", status: "Nieuw" },
  { naam: "Marco Peeters", functie: "Heftruck / reachtruck chauffeur", groep: "Logistiek", bron: "Jooble", status: "Nieuw" },
  { naam: "Youssef Haddad", functie: "PLC programmeur (Siemens TIA)", groep: "Automation", bron: "LinkedIn", status: "Verdelen" },
  { naam: "Wendy Straathof", functie: "Procesoperator food", groep: "Productie", bron: "Indeed", status: "Nieuw" },
  { naam: "Erik Nijenhuis", functie: "Uitvoerder woningbouw", groep: "Bouw", bron: "Referral", status: "Nieuw" },
  { naam: "Laura Kuiper", functie: "Calculator installatietechniek", groep: "Bouw", bron: "Organisch", status: "Nieuw" },
  { naam: "Robin Zeelenberg", functie: "Storingsmonteur elektro", groep: "Techniek", bron: "WhatsApp re-engagement", status: "Verdelen" },
  { naam: "Fatima Ouahbi", functie: "Assemblagemedewerker technisch", groep: "Productie", bron: "Indeed", status: "Nieuw" },
  { naam: "Gerard Bloemendaal", functie: "Sr. software engineer embedded", groep: "IT", bron: "LinkedIn", status: "Nieuw" },
  { naam: "Anouk Terpstra", functie: "Machinebediener verpakking", groep: "Productie", bron: "Google Ads", status: "Nieuw" },
  { naam: "Stefan Grondman", functie: "Installatiemonteur W", groep: "Techniek", bron: "Jooble", status: "Verdelen" },
  { naam: "Hakan Demirci", functie: "Verspaner / operator CNC", groep: "Metaal", bron: "Indeed", status: "Nieuw" },
  { naam: "Elise Vermeulen", functie: "Projectleider technische dienst", groep: "Engineering", bron: "Referral", status: "Nieuw" },
];

// Deterministische pseudo-random
function rnd(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const ERVARING_POOL = (functie: string): CvBlok[] => [
  {
    periode: "2021 – heden",
    rol: functie,
    bedrijf: "Van Dijk Techniek B.V.",
    bullets: [
      "Zelfstandig uitvoeren van werkzaamheden op locatie bij klanten in de industrie.",
      "Storingsanalyse en preventief onderhoud volgens onderhoudsplan.",
      "Rapporteren in het onderhoudssysteem en afstemmen met de werkvoorbereiding.",
    ],
  },
  {
    periode: "2018 – 2021",
    rol: "Medewerker technische dienst",
    bedrijf: "Brouwer Industrie",
    bullets: [
      "Ondersteunen van het TD-team bij ombouw en modificaties van productielijnen.",
      "Werken volgens VCA en interne veiligheidsprocedures.",
    ],
  },
  {
    periode: "2016 – 2018",
    rol: "Productiemedewerker",
    bedrijf: "Nedstaal Productie",
    bullets: ["Bedienen van machines in 3-ploegendienst.", "Eerstelijns onderhoud en kwaliteitscontrole."],
  },
];

export const toeTeWijzenKandidaten: ToeTeWijzenKandidaat[] = RAW.map((r, i) => {
  const rand = rnd(i + 7);
  const provincie = PROVINCIES[Math.floor(rand() * PROVINCIES.length)];
  const consultant = CONSULTANTS[Math.floor(rand() * CONSULTANTS.length)].naam;
  const d = new Date(2026, 6, 1 + Math.floor(rand() * 42));
  const skillsBase = ["VCA-VOL", "Rijbewijs B", "Lezen van technische tekeningen", "Excel", "Engels (goed)"];
  const extra = ["Siemens S7", "Hydrauliek", "Pneumatiek", "Solidworks", "Autocad", "Lean / 5S", "NEN 3140", "Heftruckcertificaat"];
  return {
    id: `ttw-${i + 1}`,
    naam: r.naam,
    rcrmFunctie: r.functie,
    functiegroep: r.groep,
    provincie,
    consultant,
    datumBinnenkomst: d.toISOString().slice(0, 10),
    status: r.status,
    bron: r.bron,
    crmId: `RC-${100000 + i * 37}`,
    synselId: `SY-${5000 + i * 13}`,
    cv: {
      headline: r.functie,
      woonplaats: provincie,
      telefoon: `06-${String(10000000 + Math.floor(rand() * 89999999)).slice(0, 8)}`,
      email: `${r.naam.toLowerCase().replace(/[^a-z]+/g, ".")}@example.nl`,
      samenvatting:
        `${r.naam.split(" ")[0]} is een ervaren professional binnen ${r.groep.toLowerCase()} met ruim ` +
        `${4 + Math.floor(rand() * 10)} jaar werkervaring als ${r.functie.toLowerCase()}. Werkt nauwkeurig, ` +
        `is gewend zelfstandig te werken en is per direct beschikbaar voor een nieuwe uitdaging in de regio ${provincie}.`,
      ervaring: ERVARING_POOL(r.functie),
      opleiding: [
        { periode: "2012 – 2016", opleiding: "MBO niveau 4 " + r.groep, instituut: "ROC Midden-Nederland" },
        { periode: "2008 – 2012", opleiding: "VMBO Techniek", instituut: "Scholengroep De Waarden" },
      ],
      skills: [...skillsBase, extra[Math.floor(rand() * extra.length)], extra[Math.floor(rand() * extra.length)]].filter(
        (v, idx, arr) => arr.indexOf(v) === idx,
      ),
      talen: ["Nederlands (moedertaal)", "Engels (goed)"],
    },
  };
});

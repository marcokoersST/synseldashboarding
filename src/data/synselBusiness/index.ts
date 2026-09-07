import type { AssignmentEpisode, EvidenceState } from "@/lib/synselBusiness/calc";

/** Rapportagedatum van deze voorbeeldsnapshot (Europe/Amsterdam) */
export const REPORT_DATE = "2026-09-07";
export const DATA_UPDATED_AT = "2026-09-07T08:34:00Z";

export const CONSULTANT = {
  name: "Voorbeeldconsultant",
  team: "Techniek Noord",
  unit: "Synsel Techniek",
  managerName: "Voorbeeldmanager",
};

/** Actieve portefeuille: 9 actieve professionals */
export const portfolio: AssignmentEpisode[] = [
  {
    id: "AE-001", professional: "Professional A", employer: "Voorbeeldbedrijf Noord", owner: CONSULTANT.name,
    actualStart: "2025-11-03", expectedEnd: "2026-10-30", actualEnd: null, status: "actief",
    openEnded: false, hoursPerWeek: 36, marginPerHour: 22.4, evidence: "waargenomen", sourceStatus: "Bron compleet",
  },
  {
    id: "AE-002", professional: "Professional B", employer: "Voorbeeldbedrijf Zuid", owner: CONSULTANT.name,
    actualStart: "2026-01-12", expectedEnd: null, actualEnd: null, status: "actief",
    openEnded: true, hoursPerWeek: 34, marginPerHour: 21.5, evidence: "waargenomen", sourceStatus: "Open einde vastgelegd",
  },
  {
    id: "AE-003", professional: "Professional C", employer: "Voorbeeldbedrijf Midden", owner: CONSULTANT.name,
    actualStart: "2026-02-02", expectedEnd: "2026-09-25", actualEnd: null, status: "actief",
    openEnded: false, hoursPerWeek: 32, marginPerHour: 20.8, evidence: "waargenomen", sourceStatus: "Bron compleet",
  },
  {
    id: "AE-004", professional: "Professional D", employer: "Voorbeeldbedrijf Noord", owner: CONSULTANT.name,
    actualStart: "2026-03-16", expectedEnd: "2026-11-27", actualEnd: null, status: "actief",
    openEnded: false, hoursPerWeek: 40, marginPerHour: 19.9, evidence: "waargenomen", sourceStatus: "Uren gewijzigd 01-07",
  },
  {
    id: "AE-005", professional: "Professional E", employer: "Voorbeeldbedrijf West", owner: CONSULTANT.name,
    actualStart: "2026-04-06", expectedEnd: "2026-12-18", actualEnd: null, status: "actief",
    openEnded: false, hoursPerWeek: 34, marginPerHour: 21.5, evidence: "waargenomen", sourceStatus: "Bron compleet",
  },
  {
    id: "AE-006", professional: "Professional F", employer: "Voorbeeldbedrijf Oost", owner: CONSULTANT.name,
    actualStart: "2026-05-11", expectedEnd: "2026-09-18", actualEnd: null, status: "actief",
    openEnded: false, hoursPerWeek: 30, marginPerHour: 23.1, evidence: "waargenomen", sourceStatus: "Marge onbevestigd",
  },
  {
    id: "AE-007", professional: "Professional G", employer: "Voorbeeldbedrijf Zuid", owner: CONSULTANT.name,
    actualStart: "2026-06-01", expectedEnd: "2027-01-29", actualEnd: null, status: "actief",
    openEnded: false, hoursPerWeek: 34, marginPerHour: 21.5, evidence: "waargenomen", sourceStatus: "Bron compleet",
  },
  {
    id: "AE-008", professional: "Professional H", employer: "Voorbeeldbedrijf Midden", owner: CONSULTANT.name,
    actualStart: "2026-08-17", expectedEnd: "2027-03-19", actualEnd: null, status: "actief",
    openEnded: false, hoursPerWeek: 36, marginPerHour: 20.2, evidence: "waargenomen", sourceStatus: "Bron compleet",
  },
  {
    id: "AE-009", professional: "Professional I", employer: "Voorbeeldbedrijf West", owner: CONSULTANT.name,
    actualStart: "2026-08-31", expectedEnd: null, actualEnd: null, status: "actief",
    openEnded: true, hoursPerWeek: 34, marginPerHour: 21.5, evidence: "waargenomen", sourceStatus: "Open einde vastgelegd",
  },
  // Bevestigde toekomstige starts
  {
    id: "AE-010", professional: "Professional J", employer: "Voorbeeldbedrijf Noord", owner: CONSULTANT.name,
    actualStart: null, plannedStart: "2026-09-14", expectedEnd: "2027-04-16", actualEnd: null, status: "bevestigde-start",
    openEnded: false, hoursPerWeek: 34, marginPerHour: 21.5, evidence: "bevestigd", sourceStatus: "Contract ondertekend",
  },
  {
    id: "AE-011", professional: "Professional K", employer: "Voorbeeldbedrijf Oost", owner: CONSULTANT.name,
    actualStart: null, plannedStart: "2026-09-21", expectedEnd: "2027-05-14", actualEnd: null, status: "bevestigde-start",
    openEnded: false, hoursPerWeek: 32, marginPerHour: 22.0, evidence: "bevestigd", sourceStatus: "Contract ondertekend",
  },
  {
    id: "AE-012", professional: "Professional L", employer: "Voorbeeldbedrijf Zuid", owner: CONSULTANT.name,
    actualStart: null, plannedStart: "2026-10-01", expectedEnd: null, actualEnd: null, status: "bevestigde-start",
    openEnded: true, hoursPerWeek: 36, marginPerHour: 21.0, evidence: "bevestigd", sourceStatus: "Contract ondertekend",
  },
  // Afgeronde episode binnen historisch venster
  {
    id: "AE-013", professional: "Professional M", employer: "Voorbeeldbedrijf Midden", owner: CONSULTANT.name,
    actualStart: "2025-09-01", expectedEnd: "2026-08-21", actualEnd: "2026-08-21", status: "afgerond",
    openEnded: false, hoursPerWeek: 34, marginPerHour: 21.5, evidence: "waargenomen", sourceStatus: "Uitstroom vastgelegd",
  },
];

export interface PortfolioEvent {
  id: string;
  type: "start" | "uitstroom" | "overdracht-in" | "overdracht-uit";
  professional: string;
  employer: string;
  date: string;
  scheduledEnd?: string | null;
  actualEnd?: string | null;
  evidenceDate?: string;
  evidence: EvidenceState;
  note?: string;
}

/** Historisch venster: laatste 28 dagen — 2 starts, 1 uitstroom */
export const historicalEvents: PortfolioEvent[] = [
  { id: "PE-001", type: "start", professional: "Professional H", employer: "Voorbeeldbedrijf Midden", date: "2026-08-17", evidence: "waargenomen", evidenceDate: "2026-08-17" },
  { id: "PE-002", type: "start", professional: "Professional I", employer: "Voorbeeldbedrijf West", date: "2026-08-31", evidence: "waargenomen", evidenceDate: "2026-08-31" },
  { id: "PE-003", type: "uitstroom", professional: "Professional M", employer: "Voorbeeldbedrijf Midden", date: "2026-08-21", scheduledEnd: "2026-08-21", actualEnd: "2026-08-21", evidence: "waargenomen", evidenceDate: "2026-08-24", note: "Opdracht regulier afgelopen" },
];

/** Komende 4 weken: 3 bevestigde starts, 2 verwachte uitstromen */
export const upcomingStarts: PortfolioEvent[] = [
  { id: "PE-010", type: "start", professional: "Professional J", employer: "Voorbeeldbedrijf Noord", date: "2026-09-14", evidence: "bevestigd", evidenceDate: "2026-08-28", note: "Contract ondertekend, meeloopdag afgerond" },
  { id: "PE-011", type: "start", professional: "Professional K", employer: "Voorbeeldbedrijf Oost", date: "2026-09-21", evidence: "bevestigd", evidenceDate: "2026-09-01", note: "Contract ondertekend" },
  { id: "PE-012", type: "start", professional: "Professional L", employer: "Voorbeeldbedrijf Zuid", date: "2026-10-01", evidence: "bevestigd", evidenceDate: "2026-09-03", note: "Contract ondertekend, open einde" },
];

export const upcomingExits: PortfolioEvent[] = [
  { id: "PE-020", type: "uitstroom", professional: "Professional F", employer: "Voorbeeldbedrijf Oost", date: "2026-09-18", scheduledEnd: "2026-09-18", actualEnd: null, evidence: "bevestigd", evidenceDate: "2026-08-30", note: "Einddatum bevestigd door opdrachtgever" },
  { id: "PE-021", type: "uitstroom", professional: "Professional C", employer: "Voorbeeldbedrijf Midden", date: "2026-09-25", scheduledEnd: "2026-09-25", actualEnd: null, evidence: "geschat", evidenceDate: "2026-09-02", note: "Verlenging in gesprek, uitstroom nog niet bevestigd" },
];

export const ownershipTransfers: PortfolioEvent[] = [
  { id: "PE-030", type: "overdracht-in", professional: "Professional G", employer: "Voorbeeldbedrijf Zuid", date: "2026-06-01", evidence: "waargenomen", evidenceDate: "2026-06-01", note: "Overgenomen van collega, telt niet als commerciële groei" },
];

export interface WeeklyAction {
  id: string;
  deal: string;
  employer: string;
  reason: string;
  nextAction: string;
  owner: string;
  dueDate: string;
  status: "Open" | "Bezig" | "Geblokkeerd" | "Afgerond";
  blocker?: string;
  reviewDate?: string;
  sourceUrl: string;
  coachingNote?: string;
  skillPractice?: string;
}

export const weeklyActions: WeeklyAction[] = [
  {
    id: "WA-001", deal: "Monteur elektrotechniek", employer: "Voorbeeldbedrijf Noord",
    reason: "Kandidaat is enthousiast, opdrachtgever wacht op de meeloopdag",
    nextAction: "Bevestig de meeloopdag bij Voorbeeldbedrijf Noord voor vrijdag",
    owner: CONSULTANT.name, dueDate: "2026-09-11", status: "Bezig",
    sourceUrl: "https://app.recruitcrm.io/deal/voorbeeld-1",
    skillPractice: "Oefen de afsluitvraag met je manager",
  },
  {
    id: "WA-002", deal: "Werkvoorbereider", employer: "Voorbeeldbedrijf Oost",
    reason: "Marge staat onder druk, tarief nog niet vastgelegd",
    nextAction: "Leg het uurtarief schriftelijk vast en stuur de bevestiging",
    owner: CONSULTANT.name, dueDate: "2026-09-10", status: "Open",
    sourceUrl: "https://app.recruitcrm.io/deal/voorbeeld-2",
  },
  {
    id: "WA-003", deal: "Servicetechnicus", employer: "Voorbeeldbedrijf Zuid",
    reason: "Opdrachtgever heeft intern nog geen budgetakkoord",
    nextAction: "Vraag naar de besluitvormer en plan een vervolggesprek",
    owner: CONSULTANT.name, dueDate: "2026-09-12", status: "Geblokkeerd",
    blocker: "Budgetakkoord ontbreekt bij opdrachtgever",
    reviewDate: "2026-09-16",
    sourceUrl: "https://app.recruitcrm.io/deal/voorbeeld-3",
    coachingNote: "Bespreek hoe je de DMU eerder in kaart brengt",
  },
];

export interface PriorityDeal extends WeeklyAction {
  stage: string;
  potentialMarginPerWeek: number;
  expectedDurationWeeks: number;
}

export const priorityDeals: PriorityDeal[] = weeklyActions.map((a, i) => ({
  ...a,
  stage: ["Introductie", "Voorstel", "Onderhandeling"][i] ?? "Introductie",
  potentialMarginPerWeek: [731, 688, 774][i] ?? 731,
  expectedDurationWeeks: [30, 26, 34][i] ?? 30,
}));

export interface SkillStage {
  stage: string;
  focus: string;
  evidence: string;
}

export const skillStages: SkillStage[] = [
  { stage: "0 tot 5", focus: "Intake, matching, bellen, introductie, opvolging", evidence: "Zelfstandig een kandidaat van intake naar een werkelijke start brengen" },
  { stage: "5 tot 13", focus: "Commitment, gespreksvoorbereiding, bezwaren, afsluiten, margeonderhandeling", evidence: "Herhaalbare starts en aantoonbare verbetering in waargenomen dealstappen" },
  { stage: "13 tot 20", focus: "Accountgroei, extra vacatures, referrals, herhaalopdrachten", evidence: "Aangetoonde herhaalstarts en bredere actieve klantrelaties" },
  { stage: "20 tot 26 en verder", focus: "Pipelinebeheer, uitstroomplanning, vervangingen, margediscipline", evidence: "Stabiele portefeuille met beheerste uitstroom en gedocumenteerde groeiacties" },
];

export interface TeamConsultant {
  id: string;
  name: string;
  team: string;
  active: number;
  nextMilestone: number;
  startsLast28: number;
  exitsLast28: number;
  confirmedStarts4w: number;
  expectedExits4w: number;
  weeklyMargin: number;
  attention: string | null;
}

export const teamConsultants: TeamConsultant[] = [
  { id: "C-01", name: "Voorbeeldconsultant", team: "Techniek Noord", active: 9, nextMilestone: 10, startsLast28: 2, exitsLast28: 1, confirmedStarts4w: 3, expectedExits4w: 2, weeklyMargin: 6739, attention: null },
  { id: "C-02", name: "Consultant 2", team: "Techniek Noord", active: 4, nextMilestone: 5, startsLast28: 0, exitsLast28: 1, confirmedStarts4w: 0, expectedExits4w: 1, weeklyMargin: 2924, attention: "Geen starts in 28 dagen en 1 uitstroom verwacht" },
  { id: "C-03", name: "Consultant 3", team: "Techniek Zuid", active: 12, nextMilestone: 13, startsLast28: 3, exitsLast28: 1, confirmedStarts4w: 2, expectedExits4w: 0, weeklyMargin: 8772, attention: null },
  { id: "C-04", name: "Consultant 4", team: "Techniek Zuid", active: 7, nextMilestone: 8, startsLast28: 1, exitsLast28: 2, confirmedStarts4w: 1, expectedExits4w: 2, weeklyMargin: 5117, attention: "Netto groei negatief over het laatste venster" },
  { id: "C-05", name: "Consultant 5", team: "Techniek West", active: 2, nextMilestone: 3, startsLast28: 1, exitsLast28: 0, confirmedStarts4w: 1, expectedExits4w: 0, weeklyMargin: 1462, attention: "Opbouwfase, focus op intake en introductie" },
  { id: "C-06", name: "Consultant 6", team: "Techniek West", active: 14, nextMilestone: 20, startsLast28: 2, exitsLast28: 0, confirmedStarts4w: 2, expectedExits4w: 3, weeklyMargin: 10234, attention: "3 verwachte uitstromen komende 4 weken" },
];

export interface CoachingRecord {
  id: string;
  consultant: string;
  date: string;
  currentPortfolio: number;
  gap: number;
  exits: string;
  starts: string;
  priorityDeals: string;
  skill: string;
  practice: string;
  practiceOwner: string;
  deadline: string;
  reviewResult: string | null;
}

export const coachingRecords: CoachingRecord[] = [
  {
    id: "CR-001", consultant: "Voorbeeldconsultant", date: "2026-09-01",
    currentPortfolio: 9, gap: 4,
    exits: "2 verwacht, 1 bevestigd en 1 geschat",
    starts: "3 bevestigd binnen 4 weken",
    priorityDeals: "Voorbeeldbedrijf Noord, Oost en Zuid",
    skill: "Afsluiten en margeonderhandeling",
    practice: "Bereid twee kandidaatevaluaties voor en oefen de afsluitvraag met je manager",
    practiceOwner: "Voorbeeldconsultant", deadline: "2026-09-08", reviewResult: null,
  },
  {
    id: "CR-002", consultant: "Consultant 2", date: "2026-08-25",
    currentPortfolio: 4, gap: 1,
    exits: "1 bevestigd",
    starts: "0 bevestigd",
    priorityDeals: "Twee openstaande introducties",
    skill: "Introductie en opvolging",
    practice: "Bel drie kandidaten na binnen 24 uur na introductie",
    practiceOwner: "Consultant 2", deadline: "2026-09-01", reviewResult: "Uitgevoerd, opvolging nog niet consistent",
  },
];

export interface BonusBlocker {
  id: string;
  issue: string;
  decision: string;
  owner: string;
  status: "open" | "in behandeling" | "opgelost";
  sourceReference: string;
  resolvedAt: string | null;
  approvedBy: string | null;
}

export const bonusBlockers: BonusBlocker[] = [
  { id: "BR-01", issue: "Jaar 2 flyer noemt 13 perioden van vier weken, terwijl jaarlijkse periodebonusvoorbeelden 12 vermenigvuldigers gebruiken", decision: "Finance bevestigt het aantal verdien- en uitbetaalmomenten met grensvoorbeelden", owner: "Finance", status: "open", sourceReference: "Flyer Jaar 2", resolvedAt: null, approvedBy: null },
  { id: "BR-02", issue: "De bronnen gebruiken omzet; het €21,50-model rekent met brutomarge", decision: "Finance legt de exacte economische grondslag per component vast", owner: "Finance", status: "open", sourceReference: "Flyer Jaar 2 / gespreksbron", resolvedAt: null, approvedBy: null },
  { id: "BR-03", issue: "Rolling forecast is niet gedefinieerd als uitvoerbare tijdvensterformule", decision: "Finance definieert horizon, afkapdatum, werkelijk versus prognose, bronrecords en correcties", owner: "Finance", status: "open", sourceReference: "HPC v2", resolvedAt: null, approvedBy: null },
  { id: "BR-04", issue: "HPC-header verwijst naar P8 en P9 in plaats van P7, terwijl de tekst P1, P7, P8 en P13 als vakantieperioden noemt", decision: "HR en Finance keuren één effectief gedateerde vakantiekalender goed", owner: "HR en Finance", status: "open", sourceReference: "HPC v2", resolvedAt: null, approvedBy: null },
  { id: "BR-05", issue: "HPC-continuering hangt af van forecast plus gemiddelde starts over drie niet-vakantieperioden", decision: "Finance bevestigt meetdata, deelperioden, definitie werkelijke start en verlies/herintrede", owner: "Finance", status: "open", sourceReference: "HPC v2", resolvedAt: null, approvedBy: null },
  { id: "BR-06", issue: "Yellow Card pipelineherstel bevat X- en Y-placeholders; Margebaas heeft een lege eurodrempel", decision: "HR en Finance leveren definitieve waarden of de regels blijven uitgeschakeld", owner: "HR en Finance", status: "open", sourceReference: "HPC v2", resolvedAt: null, approvedBy: null },
  { id: "BR-07", issue: "Jaar 2 noemt zowel 10% als 12,5% maximaal aandeel wervingsfee voor salarisupgrades", decision: "Finance benoemt de geldende limiet, teller, noemer, venster en grensvergelijking", owner: "Finance", status: "open", sourceReference: "Flyer Jaar 2", resolvedAt: null, approvedBy: null },
  { id: "BR-08", issue: "De flyer bevat tegenstrijdige labels voor 8% vakantiegeld, inclusief en exclusief", decision: "HR en Finance bevestigen de vakantiegeldgrondslag voor salaris en bonussen", owner: "HR en Finance", status: "open", sourceReference: "Flyer Jaar 2", resolvedAt: null, approvedBy: null },
  { id: "BR-09", issue: "Salaristerugblik, forecast-onderhoudstoets, dienstjarenbonus en betalingsvertraging gebruiken verschillende vensters", decision: "HR en Finance definiëren per component het verdienvenster, de aanspraakdatum en de betaaldatum", owner: "HR en Finance", status: "open", sourceReference: "Flyer Jaar 2", resolvedAt: null, approvedBy: null },
  { id: "BR-10", issue: "Trapmechaniek, drempelvergelijking, cumulatief versus hoogste doelbonus, correcties en historische salarisbehandeling zijn onopgelost", decision: "Finance keurt een machineleesbare regelspecificatie met voorbeeldberekeningen goed", owner: "Finance", status: "open", sourceReference: "HPC v2 / Flyer Jaar 2", resolvedAt: null, approvedBy: null },
  { id: "BR-11", issue: "Bronversies en effectieve toepasbaarheid zijn niet bevestigd en individuele toewijzingen zijn niet ingezien", decision: "HR benoemt planversie, medewerkersgroep, ingangsdatum en gedocumenteerde uitzonderingen", owner: "HR", status: "open", sourceReference: "SharePoint metadata", resolvedAt: null, approvedBy: null },
  { id: "BR-12", issue: "Fast Growers, HPC en tijdelijke forecastgerelateerde bonussen kunnen interactieregels hebben", decision: "HR en Finance bevestigen stapelbaarheid; HPC Million en 7.5 Ton blijven onderling exclusief", owner: "HR en Finance", status: "open", sourceReference: "HPC v2", resolvedAt: null, approvedBy: null },
];

export interface RuleSet {
  id: string;
  name: string;
  version: string;
  status: "concept" | "gevalideerd" | "goedgekeurd" | "ingetrokken";
  effectiveFrom: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  sourceReference: string;
}

export const ruleSets: RuleSet[] = [
  { id: "RS-01", name: "High Performance Club", version: "v2", status: "concept", effectiveFrom: null, approvedBy: null, approvedAt: null, sourceReference: "High Performance Club v2.docx" },
  { id: "RS-02", name: "Beloning Jaar 2", version: "flyer", status: "concept", effectiveFrom: null, approvedBy: null, approvedAt: null, sourceReference: "Flyer - Zo werkt je beloning - Jaar 2.pdf" },
  { id: "RS-03", name: "Fast Growers", version: "onbekend", status: "concept", effectiveFrom: null, approvedBy: null, approvedAt: null, sourceReference: "High Performance Club v2.docx" },
];

export interface SourceStatus {
  name: string;
  role: string;
  lastSync: string | null;
  watermark: string | null;
  recordsIn: number | null;
  recordsOut: number | null;
  rejected: number | null;
  state: "fixture" | "niet verbonden";
}

export const sourceStatuses: SourceStatus[] = [
  { name: "RecruitCRM", role: "Eigenaarschap, kandidaten, deals, plaatsingsepisodes", lastSync: null, watermark: null, recordsIn: null, recordsOut: null, rejected: null, state: "niet verbonden" },
  { name: "Marge-dataset Finance", role: "Werkelijke brutomarge", lastSync: null, watermark: null, recordsIn: null, recordsOut: null, rejected: null, state: "niet verbonden" },
  { name: "SharePoint bonusdocumenten", role: "Goedgekeurde regelingen", lastSync: null, watermark: null, recordsIn: null, recordsOut: null, rejected: null, state: "niet verbonden" },
  { name: "Voorbeelddataset", role: "Concept-fixtures voor alle schermen", lastSync: DATA_UPDATED_AT, watermark: REPORT_DATE, recordsIn: 13, recordsOut: 13, rejected: 0, state: "fixture" },
];

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export const auditTrail: AuditEntry[] = [
  { id: "A-001", at: "2026-09-07T08:34:00Z", actor: "Systeem", action: "Snapshot geladen", detail: "Voorbeelddataset met rapportagedatum 7 september 2026" },
  { id: "A-002", at: "2026-09-05T10:12:00Z", actor: "Voorbeeldmanager", action: "Coachingnotitie toegevoegd", detail: "Deal Voorbeeldbedrijf Zuid, DMU eerder in kaart brengen" },
  { id: "A-003", at: "2026-09-03T09:01:00Z", actor: "Voorbeeldconsultant", action: "Actie afgerond", detail: "Lokale coachingregistratie bijgewerkt, bron-CRM ongewijzigd" },
];

/** Werkelijke brutomarge tot de afkapdatum, uit de goedgekeurde financiële bron */
export const actualGrossMarginToDate = 318450;
/** Prognose brutomarge voor het geselecteerde boekjaar */
export const forecastAnnualMargin = 462800;

export const financialYear = "2026";

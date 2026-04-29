// Systeem Hygiene Dashboard — internal-data-only mock layer.
// Scores RecruitCRM + AI.synsel hygiene across 7 entities using:
//   hygiene = required_fields * 0.5 + admin_process * 0.25 + freshness * 0.25
// All numbers are deterministic via a seeded PRNG so the dashboard is stable.

import { allConsultantsList, type ConsultantInfo } from "./ranglijstenData";

export type EntityKey =
  | "candidates"
  | "companies"
  | "deals"
  | "contacts"
  | "jobs"
  | "ai_synsel"
  | "notities";

export const SCORE_WEIGHTS = { requiredFields: 0.5, adminProcess: 0.25, freshness: 0.25 } as const;
export const THRESHOLDS = { clean: 85, attention: 60 } as const;

export type ScoreStatus = "clean" | "attention" | "critical" | "grey";

export function getScoreStatus(score: number | null | undefined): ScoreStatus {
  if (score == null || Number.isNaN(score)) return "grey";
  if (score >= THRESHOLDS.clean) return "clean";
  if (score >= THRESHOLDS.attention) return "attention";
  return "critical";
}

export const STATUS_COLOR: Record<ScoreStatus, string> = {
  clean: "hsl(var(--success, 142 71% 45%))",
  attention: "hsl(var(--warning, 38 92% 50%))",
  critical: "hsl(var(--destructive))",
  grey: "hsl(var(--muted-foreground))",
};

export const STATUS_LABEL: Record<ScoreStatus, string> = {
  clean: "Clean",
  attention: "Needs attention",
  critical: "Critical",
  grey: "Niet genoeg data",
};

export const FRESHNESS_DAYS: Record<EntityKey, number> = {
  candidates: 30,
  companies: 90,
  contacts: 90,
  jobs: 30,
  deals: 14,
  ai_synsel: 14,
  notities: 30,
};

export const ENTITY_LABEL: Record<EntityKey, string> = {
  candidates: "Candidates",
  companies: "Companies",
  contacts: "Contacts",
  jobs: "Jobs",
  deals: "Deals",
  ai_synsel: "AI.synsel",
  notities: "Notities",
};

export const ENTITY_SUBTITLE: Record<EntityKey, string> = {
  candidates: "Completeness en freshness van kandidaat-records.",
  companies: "Completeness, enrichment en operationele bruikbaarheid.",
  contacts: "Contact completeness en commerciële bruikbaarheid.",
  jobs: "Vacature completeness, publicatie-readiness en match-kwaliteit.",
  deals: "Deal completeness, plaatsings-administratie en stage-discipline.",
  ai_synsel: "AI-data completeness, gebruik en processing-status.",
  notities: "Dossier-activiteit en activity registration kwaliteit.",
};

// ---- Required field rules (mirrored from briefing) ---------------------------

export const CANDIDATE_FIELDS_BY_STATUS = {
  nieuw: { mandatory: [] as string[], optional: ["First name", "Last name", "Email", "Phone", "City", "Resume", "AI.synsel", "LinkedIn", "Functiegroep"] },
  verdelen: {
    mandatory: ["First name", "Last name", "Email", "Phone", "Bron"],
    wouldBeNice: ["City", "Full address", "Postal code", "Date of birth", "Functiegroep", "Functies", "Categorie", "Resume", "UTM source", "UTM medium"],
  },
  inschrijven: {
    mandatory: ["First name", "Last name", "Email", "Phone", "Bron", "Resume", "City", "Full address", "Postal code", "Functiegroep", "Functies", "AI.synsel"],
    wouldBeNice: ["Date of birth", "Categorie", "LinkedIn", "Opgemaakt CV", "UTM source"],
  },
  later: {
    mandatory: ["First name", "Last name", "Email", "Phone", "Bron", "Resume", "City", "Full address", "Postal code", "Date of birth", "Functiegroep", "Categorie", "Functies", "AI.synsel", "Opgemaakt CV"],
    wouldBeNice: ["LinkedIn", "Salary expectation", "Skills", "Current organization", "Title"],
  },
};

export const COMPANY_FIELDS = {
  mandatory: ["Company name", "Website", "City", "Full address", "Postal code", "Sector", "Branches", "Status", "Telefoonnummer"],
  mandatoryIfAvailable: ["LinkedIn", "Youtube", "Portal", "Gebruikersnaam portal", "Wachtwoord portal"],
  wouldBeNice: ["Apollo status", "Apollo domain", "Manier van voorstellen"],
  optional: ["Kenmerken", "Carerix ID", "KvK nummer", "IND lijst", "Afwijkende afspraken", "AI-keuring", "Bron bedrijf"],
};

export const CONTACT_FIELDS = {
  mandatory: ["First name", "Last name", "Company", "Title", "Stage", "Functie"],
  mandatoryIfAvailable: ["Email", "Phone", "LinkedIn", "Voorkeurscontactpersoon", "Relatie warm"],
  wouldBeNice: ["Manier van voorstellen", "Verantwoordelijk voor functies"],
  optional: ["Email 2", "Telefoonnummer 2", "Carerix ID", "Bron"],
};

export const JOB_FIELDS = {
  sales: {
    mandatory: ["Company", "Job title", "Functie", "Type vacature", "Job description", "Full address", "Postal code", "Selected owner", "Bedrijf sector", "Bron vacature"],
    mandatoryIfAvailable: ["URL", "AI-keuring"],
    wouldBeNice: ["Bedrijf branches", "Skills", "Min experience", "Min salary", "Max salary"],
    optional: ["Carerix ID", "Secondary contacts", "Vacature aanvraag", "Number of openings", "Collaborator"],
  },
  marketing: {
    mandatory: ["Gepubliceerd", "Publicatie titel", "Publicatie overzichtspagina", "Organisatieomschrijving", "Functie-informatie", "Functie-eisen", "Aanbod", "Specialismen", "Opleidingsrichting", "Ervaring", "Branches"],
    optional: ["Opleidingsniveau", "Specialisme operators", "Publicatie carerix ID", "Ploegendiensten", "Branches operators"],
  },
};

export const DEAL_FIELDS_BY_STAGE = {
  earlyPipeline: { mandatory: ["Name", "Stage", "Owner", "Company", "Contact", "Job", "Candidate"] },
  detacheringActive: {
    mandatory: ["Name", "Stage", "Owner", "Company", "Contact", "Job", "Candidate", "Aanmaakdatum plaatsing", "Contract type", "Payroll partner", "Verantwoordelijk CS", "Contactpersoon contract", "Start datum", "Bruto maandsalaris", "Officiële functie", "Uurloon", "CAO", "Loonschaal + trede", "Reiskosten per werkdag", "Detacheringstermijn", "Verloningsfrequentie", "Close date", "Value"],
  },
  wAndS: {
    mandatory: ["Name", "Stage", "Owner", "Company", "Contact", "Job", "Candidate", "Aanmaakdatum plaatsing", "Contract type", "Verantwoordelijk CS", "Start datum", "Officiële functie", "W&S fee in €", "Berekening fee", "E-mail factuur", "PO-nummer", "Tekenbevoegde", "Betaal afspraak", "Close date", "Value"],
  },
  overgenomen: { mandatory: ["Name", "Stage", "Owner", "Company", "Contact", "Job", "Candidate", "Einddatum", "Contract type", "Start datum"] },
  nietBegonnen: { mandatory: ["Name", "Stage", "Owner", "Company", "Contact", "Job", "Candidate", "Aanmaakdatum plaatsing", "Contract type", "Start datum"] },
  elseStage: { mandatory: ["Name", "Stage", "Owner", "Company", "Contact", "Job", "Candidate"] },
};

// ---- Deterministic PRNG ------------------------------------------------------

function rng(seed: number, i: number): number {
  const x = Math.sin(seed + i * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function hash(...nums: number[]): number {
  let h = 0x811c9dc5;
  for (const n of nums) {
    h ^= n | 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function entitySeed(entity: EntityKey): number {
  let s = 0;
  for (let i = 0; i < entity.length; i++) s = (s * 31 + entity.charCodeAt(i)) | 0;
  return Math.abs(s) + 1;
}

const RECORD_COUNTS: Record<EntityKey, number> = {
  candidates: 4860,
  companies: 1342,
  contacts: 2987,
  jobs: 612,
  deals: 1184,
  ai_synsel: 4860,
  notities: 18420,
};

// ---- Entity summary ---------------------------------------------------------

export interface EntitySummary {
  entity: EntityKey;
  score: number; // 0-100
  requiredScore: number;
  adminScore: number;
  freshnessScore: number;
  status: ScoreStatus;
  recordCount: number;
  updatedPastWeek: number;
  addedPastWeek: number;
  distribution: { incomplete: number; outdatedComplete: number; freshComplete: number }; // counts
  topIssue: string;
  quickSummary: string;
}

const TOP_ISSUE: Record<EntityKey, string> = {
  candidates: "Resume ontbreekt bij kandidaten in Inschrijven of later",
  companies: "Sector en branches ontbreken bij actieve bedrijven",
  contacts: "Functie en title ontbreken bij actieve contacten",
  jobs: "Gepubliceerde vacatures missen marketingvelden",
  deals: "Plaatsings-deals missen contract/payroll velden",
  ai_synsel: "AI.synsel link ontbreekt bij kandidaten in procedure",
  notities: "Actieve deals zonder activiteit in afgelopen 14 dagen",
};

export function getEntitySummary(entity: EntityKey): EntitySummary {
  const seed = entitySeed(entity);
  // Deterministic per-entity scores in a realistic range
  const requiredScore = Math.round(55 + rng(seed, 1) * 38); // 55-93
  const adminScore = Math.round(55 + rng(seed, 2) * 38);
  const freshnessScore = Math.round(45 + rng(seed, 3) * 50);
  const score = Math.round(
    requiredScore * SCORE_WEIGHTS.requiredFields +
      adminScore * SCORE_WEIGHTS.adminProcess +
      freshnessScore * SCORE_WEIGHTS.freshness,
  );
  const recordCount = RECORD_COUNTS[entity];
  const updatedPastWeek = Math.round(recordCount * (0.04 + rng(seed, 4) * 0.18));
  const addedPastWeek = Math.round(recordCount * (0.01 + rng(seed, 5) * 0.04));

  // Distribution sums to recordCount
  const incompletePct = (100 - requiredScore) / 100;
  const incomplete = Math.round(recordCount * incompletePct);
  const remaining = recordCount - incomplete;
  const freshPct = freshnessScore / 100;
  const freshComplete = Math.round(remaining * freshPct);
  const outdatedComplete = remaining - freshComplete;

  return {
    entity,
    score,
    requiredScore,
    adminScore,
    freshnessScore,
    status: getScoreStatus(score),
    recordCount,
    updatedPastWeek,
    addedPastWeek,
    distribution: { incomplete, outdatedComplete, freshComplete },
    topIssue: TOP_ISSUE[entity],
    quickSummary: `${ENTITY_LABEL[entity]} score is ${STATUS_LABEL[getScoreStatus(score)].toLowerCase()}. ${requiredScore}% van verplichte velden ingevuld. Grootste issue: ${TOP_ISSUE[entity]}.`,
  };
}

export function getAllSummaries(): EntitySummary[] {
  return (Object.keys(ENTITY_LABEL) as EntityKey[]).map(getEntitySummary);
}

export interface GlobalScore {
  score: number;
  status: ScoreStatus;
  perEntity: { entity: EntityKey; score: number; status: ScoreStatus }[];
  componentBreakdown: { requiredFields: number; adminProcess: number; freshness: number };
}

export function getGlobalHygieneScore(): GlobalScore {
  const summaries = getAllSummaries();
  const score = Math.round(summaries.reduce((s, x) => s + x.score, 0) / summaries.length);
  const required = Math.round(summaries.reduce((s, x) => s + x.requiredScore, 0) / summaries.length);
  const admin = Math.round(summaries.reduce((s, x) => s + x.adminScore, 0) / summaries.length);
  const fresh = Math.round(summaries.reduce((s, x) => s + x.freshnessScore, 0) / summaries.length);
  return {
    score,
    status: getScoreStatus(score),
    perEntity: summaries.map(s => ({ entity: s.entity, score: s.score, status: s.status })),
    componentBreakdown: { requiredFields: required, adminProcess: admin, freshness: fresh },
  };
}

// ---- Field missing counts ---------------------------------------------------

export type FieldScope = "mandatory" | "mandatoryIfAvailable" | "wouldBeNice" | "optional";

function fieldsForEntity(entity: EntityKey, scope: FieldScope): string[] {
  if (entity === "candidates") {
    if (scope === "mandatory") return CANDIDATE_FIELDS_BY_STATUS.later.mandatory;
    if (scope === "wouldBeNice") return CANDIDATE_FIELDS_BY_STATUS.later.wouldBeNice;
    if (scope === "optional") return CANDIDATE_FIELDS_BY_STATUS.nieuw.optional;
    return [];
  }
  if (entity === "companies") return (COMPANY_FIELDS as any)[scope] ?? [];
  if (entity === "contacts") return (CONTACT_FIELDS as any)[scope] ?? [];
  if (entity === "jobs") return (JOB_FIELDS.sales as any)[scope] ?? [];
  if (entity === "deals") {
    if (scope === "mandatory") return DEAL_FIELDS_BY_STAGE.detacheringActive.mandatory;
    return [];
  }
  if (entity === "ai_synsel") {
    if (scope === "mandatory") return ["AI.synsel link", "AI keuring", "AI samenvatting", "AI matchscore", "AI category"];
    return [];
  }
  if (entity === "notities") {
    if (scope === "mandatory") return ["Linked entity", "Activity type", "Owner", "Datum", "Inhoud"];
    return [];
  }
  return [];
}

export function getMarketingFields(scope: FieldScope): string[] {
  return (JOB_FIELDS.marketing as any)[scope] ?? [];
}

export function getFieldMissingCounts(entity: EntityKey, scope: FieldScope = "mandatory"): { field: string; missing: number; pct: number }[] {
  const fields = fieldsForEntity(entity, scope);
  const seed = entitySeed(entity) + (scope === "mandatory" ? 0 : scope === "mandatoryIfAvailable" ? 100 : scope === "wouldBeNice" ? 200 : 300);
  const total = RECORD_COUNTS[entity];
  return fields
    .map((field, i) => {
      const base = scope === "mandatory" ? 0.05 + rng(seed, i) * 0.35 : 0.2 + rng(seed, i) * 0.55;
      const missing = Math.round(total * base);
      return { field, missing, pct: Math.round((missing / total) * 100) };
    })
    .sort((a, b) => b.missing - a.missing);
}

export function getMarketingFieldMissingCounts(): { field: string; missing: number; pct: number }[] {
  const fields = getMarketingFields("mandatory");
  const seed = entitySeed("jobs") + 999;
  const total = Math.round(RECORD_COUNTS.jobs * 0.55); // only published
  return fields
    .map((field, i) => {
      const base = 0.1 + rng(seed, i) * 0.5;
      const missing = Math.round(total * base);
      return { field, missing, pct: Math.round((missing / total) * 100) };
    })
    .sort((a, b) => b.missing - a.missing);
}

// ---- Process checks ---------------------------------------------------------

export interface ProcessCheck { check: string; passedPct: number; status: ScoreStatus; passed: number; total: number; prevPct: number; deltaPct: number; examples: string[]; explanation: string }

const PROCESS_CHECK_TEXT: Record<EntityKey, string[]> = {
  candidates: [
    "Status ≥ Inschrijven heeft resume",
    "Status ≥ Acquisitie heeft opgemaakt CV",
    "Status ≥ Acquisitie heeft categorie, functiegroep en functies",
    "Campagne-bron heeft UTM velden ingevuld",
  ],
  companies: [
    "Heeft minstens één gekoppeld contact",
    "Heeft sector en branche",
    "Heeft volledig adres en postcode",
    "Status is gevuld",
    "Heeft telefoonnummer",
    "Heeft actieve jobs gekoppeld waar van toepassing",
  ],
  contacts: [
    "Gekoppeld aan een bedrijf",
    "Heeft titel en functie",
    "Heeft stage",
    "Heeft email of telefoon indien beschikbaar",
    "Voorkeurscontactpersoon vlag waar relevant",
  ],
  jobs: [
    "Gekoppeld aan een bedrijf",
    "Heeft primaire contactpersoon",
    "Heeft selected owner",
    "Heeft volledig adres en postcode",
    "Heeft sector en bron",
    "Heeft job description",
    "Gepubliceerde vacature heeft alle publicatievelden",
  ],
  deals: [
    "Heeft company, contact, job en candidate gekoppeld",
    "Plaatsings-stages hebben plaatsingsdatum en startdatum",
    "Plaatsings-stages hebben payroll en contract info",
    "Detachering heeft salaris en uurloonberekening",
    "W&S heeft factuur- en fee-velden",
    "Closed stages hebben close date en value",
    "Hoog-risico plaatsing vlag is gevuld waar relevant",
  ],
  ai_synsel: [
    "AI checks zijn succesvol afgerond",
    "AI.synsel link is aanwezig op kandidaten in procedure",
    "AI keuring is gevuld op gepubliceerde jobs",
    "AI matchscore is bijgewerkt afgelopen 7 dagen",
  ],
  notities: [
    "Activiteit is gekoppeld aan juiste entiteit",
    "Actieve kandidaten hebben recente notities",
    "Actieve deals hebben relevante activiteit in huidige stage",
    "Bedrijven met actieve jobs hebben recente activiteit",
    "Taken zijn niet te laat zonder follow-up",
  ],
};

export function getProcessChecks(entity: EntityKey): ProcessCheck[] {
  const seed = entitySeed(entity) + 7;
  const names = SAMPLE_NAMES_BY_ENTITY[entity];
  return PROCESS_CHECK_TEXT[entity].map((check, i) => {
    const passedPct = Math.round(45 + rng(seed, i) * 50);
    const total = Math.round(80 + rng(seed, i + 90) * 1200);
    const passed = Math.round(total * passedPct / 100);
    const prevPct = Math.max(0, Math.min(100, passedPct + Math.round((rng(seed, i + 200) - 0.5) * 14)));
    const deltaPct = passedPct - prevPct;
    const examples = [0, 1, 2].map(k => names[(i + k) % names.length]);
    const explanation = `Deze check meet of records die voldoen aan de voorwaarde "${check.toLowerCase()}" correct zijn ingevuld. ${total - passed} van ${total} records voldoen niet en zijn meegenomen als faal. Records worden geteld op basis van actuele veld-status; freshness en owner-filter werken mee in de aggregatie.`;
    return { check, passedPct, status: getScoreStatus(passedPct), total, passed, prevPct, deltaPct, examples, explanation };
  });
}

export function getFieldScopeTotal(entity: EntityKey, scope: FieldScope): number {
  return fieldsForEntity(entity, scope).length;
}

// ---- Action pointers --------------------------------------------------------

export interface ActionPointer {
  priority: "high" | "medium" | "low";
  entity: EntityKey;
  issue: string;
  impact: string;
  suggestedAction: string;
  affectedRecords: number;
  owner?: string;
  flagged?: boolean;
}

const ACTION_TEMPLATES: Record<EntityKey, Omit<ActionPointer, "affectedRecords" | "entity" | "owner">[]> = {
  candidates: [
    { priority: "high", issue: "Kandidaten in Inschrijven of later zonder resume", impact: "Blokkeert voorstellen", suggestedAction: "Resume aanvragen of uploaden" },
    { priority: "high", issue: "Kandidaten in Acquisitie/Procedure zonder opgemaakt CV", impact: "Klant ontvangt geen CV", suggestedAction: "CV opmaken via AI.synsel" },
    { priority: "medium", issue: "Kandidaten zonder AI.synsel link", impact: "Match-kwaliteit lager", suggestedAction: "AI.synsel record koppelen" },
    { priority: "low", issue: "Kandidaat-records niet bijgewerkt > 30 dagen", impact: "Stale dossier", suggestedAction: "Status of contactgegevens updaten" },
  ],
  companies: [
    { priority: "high", issue: "Bedrijven zonder sector of branche", impact: "Beperkt segmentatie en rapportage", suggestedAction: "Sector en branche invullen" },
    { priority: "high", issue: "Bedrijven met actieve jobs maar geen contactpersoon", impact: "Verzwakt commerciële opvolging", suggestedAction: "Primaire contactpersoon koppelen" },
    { priority: "medium", issue: "Bedrijven zonder website of telefoonnummer", impact: "Bemoeilijkt outreach", suggestedAction: "Bedrijfsdata aanvullen" },
    { priority: "low", issue: "Bedrijven niet bijgewerkt > 90 dagen", impact: "Stale account", suggestedAction: "Account-review uitvoeren" },
  ],
  contacts: [
    { priority: "high", issue: "Contacten zonder functie of titel", impact: "Verzwakt matching en propose-logic", suggestedAction: "Functie en titel toevoegen" },
    { priority: "medium", issue: "Contacten zonder email of telefoon", impact: "Geen outreach mogelijk", suggestedAction: "Communicatiegegevens aanvullen" },
    { priority: "medium", issue: "Contacten zonder voorkeur/warm-vlag bij actieve bedrijven", impact: "Onduidelijke prioritering", suggestedAction: "Voorkeur- en warm-vlag instellen" },
    { priority: "low", issue: "Contacten zonder recente activiteit", impact: "Relatie koelt af", suggestedAction: "Follow-up plannen" },
  ],
  jobs: [
    { priority: "high", issue: "Vacatures zonder job description", impact: "Onbruikbaar voor matching en publicatie", suggestedAction: "Job description toevoegen" },
    { priority: "high", issue: "Gepubliceerde vacatures missen publicatieteksten", impact: "Marketing-kwaliteitsrisico", suggestedAction: "Publicatie-velden invullen" },
    { priority: "medium", issue: "Vacatures zonder sector of branche", impact: "Verzwakt rapportage en matching", suggestedAction: "Sector en branche invullen" },
    { priority: "medium", issue: "Vacatures zonder primaire contactpersoon", impact: "Verzwakt operationele opvolging", suggestedAction: "Primaire contactpersoon koppelen" },
  ],
  deals: [
    { priority: "high", issue: "Actieve plaatsings-deals zonder payroll partner", impact: "Hoog administratief risico", suggestedAction: "Payroll partner toewijzen" },
    { priority: "high", issue: "W&S deals zonder factuur-email of PO-nummer", impact: "Financieel proces-risico", suggestedAction: "Factuurgegevens compleet maken" },
    { priority: "high", issue: "Deals in stage 4.0+ zonder startdatum", impact: "Plaatsing kan niet worden geactiveerd", suggestedAction: "Startdatum invullen" },
    { priority: "medium", issue: "Deals zonder company/contact/job/candidate links", impact: "Kritieke data-integriteit", suggestedAction: "Relaties leggen" },
  ],
  ai_synsel: [
    { priority: "high", issue: "Records gemarkeerd door AI als incompleet", impact: "Kwaliteitsrisico", suggestedAction: "Record reviewen en aanvullen" },
    { priority: "medium", issue: "AI checks gefaald in de afgelopen week", impact: "Geen kwaliteitscheck uitgevoerd", suggestedAction: "AI run opnieuw triggeren" },
    { priority: "low", issue: "AI coverage onder 60% voor entiteit", impact: "Verminderde insights", suggestedAction: "Bulk AI.synsel verwerking starten" },
  ],
  notities: [
    { priority: "high", issue: "Notes met negatieve klanttoon — sales-impact risico", impact: "Kan deal momentum schaden", suggestedAction: "Note herzien en feitelijk maken", flagged: true },
    { priority: "high", issue: "Notes met demotiverende formuleringen richting kandidaat of klant", impact: "Verzwakt vertrouwen en commerciële positie", suggestedAction: "Toon aanpassen of intern label gebruiken", flagged: true },
    { priority: "high", issue: "Note type ontbreekt of is generiek 'Algemeen' op recente notities", impact: "Note niet vindbaar in rapportage", suggestedAction: "Correct activity type kiezen" },
    { priority: "medium", issue: "Recente notities zonder linked entity of activity type", impact: "Note geïsoleerd van dossier", suggestedAction: "Koppelen aan candidate/deal/company" },
    { priority: "medium", issue: "Korte one-liner notities zonder context op deals in late stage", impact: "Verlies van besluitvormings-historie", suggestedAction: "Context, besluit en next step toevoegen" },
  ],
};

export function getActionPointers(entity: EntityKey, limit = 6): ActionPointer[] {
  const seed = entitySeed(entity) + 13;
  const tpl = ACTION_TEMPLATES[entity];
  return tpl.slice(0, limit).map((t, i) => ({
    ...t,
    entity,
    affectedRecords: Math.round(8 + rng(seed, i) * 220),
    owner: allConsultantsList[hash(seed, i) % allConsultantsList.length].fullName,
  }));
}

export function getGlobalActionPointers(limit = 8): ActionPointer[] {
  const all = (Object.keys(ENTITY_LABEL) as EntityKey[]).flatMap(e => getActionPointers(e, 3));
  const order = { high: 0, medium: 1, low: 2 } as const;
  return all.sort((a, b) => order[a.priority] - order[b.priority] || b.affectedRecords - a.affectedRecords).slice(0, limit);
}

// ---- Events -----------------------------------------------------------------

export interface EventCounters { added: number; updated: number; deleted: number; stageChanges: number; notesAdded: number; tasksAdded: number }

export function getEventCounters(entity: EntityKey): EventCounters {
  const seed = entitySeed(entity) + 23;
  return {
    added: Math.round(20 + rng(seed, 1) * 180),
    updated: Math.round(80 + rng(seed, 2) * 600),
    deleted: Math.round(rng(seed, 3) * 40),
    stageChanges: Math.round(10 + rng(seed, 4) * 120),
    notesAdded: Math.round(40 + rng(seed, 5) * 300),
    tasksAdded: Math.round(15 + rng(seed, 6) * 100),
  };
}

export interface EventLogRow { id: string; owner: string; action: string; field: string; entityName: string; minutesAgo: number }

const ACTIONS = ["updated", "added a note to", "changed stage on", "created", "updated field on"];
const FIELDS_BY_ENTITY: Record<EntityKey, string[]> = {
  candidates: ["Resume", "AI.synsel", "Phone", "Status", "Opgemaakt CV", "Functiegroep"],
  companies: ["Sector", "Branches", "Status", "Contactpersoon", "Telefoonnummer"],
  contacts: ["Functie", "Title", "Email", "Stage", "Voorkeurscontactpersoon"],
  jobs: ["Job description", "Publicatie titel", "Primaire contact", "Sector", "Status"],
  deals: ["Stage", "Start datum", "Payroll partner", "Contract type", "Value", "Close date"],
  ai_synsel: ["AI keuring", "AI matchscore", "AI samenvatting", "Coverage flag"],
  notities: ["Note", "Call", "Meeting", "Task"],
};

const SAMPLE_NAMES_BY_ENTITY: Record<EntityKey, string[]> = {
  candidates: ["Mark de Vries", "Sanne Jansen", "Tim Bakker", "Lotte van Dijk", "Ruud Smit"],
  companies: ["Acme Engineering BV", "Brouwer Operators", "Daalman Monteurs", "Holtkamp Industries", "Vellekoop Tech"],
  contacts: ["Anouk Visser", "Bram Hendriks", "Carla Peters", "Dirk Mulder", "Eva Bos"],
  jobs: ["Senior Lasser Tilburg", "Werkvoorbereider Eindhoven", "Operator Veghel", "Engineer Helmond", "Monteur Den Bosch"],
  deals: ["Plaatsing Acme #182", "W&S Brouwer #91", "Detavast Daalman #44", "Plaatsing Holtkamp #210", "W&S Vellekoop #18"],
  ai_synsel: ["AI run #4821", "AI keuring batch #91", "AI matchscore job #612", "AI samenvatting candidate #1841"],
  notities: ["Note on Acme #182", "Call with Brouwer", "Meeting Daalman", "Task: follow up Holtkamp"],
};

export function getEventLog(entity: EntityKey, limit = 8): EventLogRow[] {
  const seed = entitySeed(entity) + 31;
  const fields = FIELDS_BY_ENTITY[entity];
  const names = SAMPLE_NAMES_BY_ENTITY[entity];
  return Array.from({ length: limit }, (_, i) => {
    const owner = allConsultantsList[hash(seed, i, 1) % allConsultantsList.length].fullName;
    const action = ACTIONS[hash(seed, i, 2) % ACTIONS.length];
    const field = fields[hash(seed, i, 3) % fields.length];
    const entityName = names[hash(seed, i, 4) % names.length];
    const minutesAgo = Math.round(2 + rng(seed, i + 50) * 480);
    return { id: `${entity}-${i}`, owner, action, field, entityName, minutesAgo };
  });
}

// ---- Records needing attention ---------------------------------------------

export interface RecordRow {
  name: string;
  status: string;
  owner: string;
  missing: string[];
  lastUpdatedDays: number;
  hygieneScore: number;
}

const STATUS_BY_ENTITY: Record<EntityKey, string[]> = {
  candidates: [
    "1 | Inschrijven", "2 | Acquisitie", "3 | In procedure",
    "Afgewezen", "Geplaatst", "Lead", "Niet beschikbaar",
    "Niet geplaatst", "Nieuw", "Vacature aanvraag", "Verdelen",
  ],
  companies: ["Klant", "Oud-klant", "Prospect", "Gesloten", "Zwarte lijst"],
  contacts: ["Nieuw", "In dienst", "Uit dienst", "Geen contactpersoon"],
  jobs: ["Open", "On hold", "Canceld", "Afgekeurd", "Closed"],
  deals: [
    "1.0 | Goedgekeurd",
    "1.1 | Via mail voorstellen",
    "2.0 | Kandidaat voorgesteld",
    "2.1 | Reminder verstuurd",
    "2.3 | Lopende zaak",
    "3.0 | 1e gesprek nog inplannen",
    "3.1 | 1e sollicitatiegesprek",
    "3.2 | Inplannen vervolggesprek",
    "3.3 | Vervolggesprek",
    "3.4 | Deal sluiter",
    "4.0 | Plaatsing aangemaakt",
    "4.1 | Contract verstuurd",
    "4.2 | Contract getekend",
    "5 | Momenteel gedetacheerd",
    "6 | Geplaatst W&S / Marge facturering",
    "Lost", "Won", "Niet begonnen",
    "Afgevallen tijdens detacheringsperiode",
    "Kandidaat teruggetrokken",
    "Overgenomen na detacheringsperiode",
    "Overgenomen na margefacturatie/W&S",
  ],
  ai_synsel: ["Pending", "Failed", "Incomplete"],
  notities: [
    "Call", "Intake", "Inschrijving", "Bezoekrapport",
    "Deal Algemeen", "Lopende Zaak", "To Do", "Sentiment Analyse",
    "Evaluatie Plaatsing", "Plan Van Aanpak",
  ],
};

export function getRecordsNeedingAttention(entity: EntityKey, limit = 8): RecordRow[] {
  const seed = entitySeed(entity) + 41;
  const names = SAMPLE_NAMES_BY_ENTITY[entity];
  const statuses = STATUS_BY_ENTITY[entity];
  const fields = fieldsForEntity(entity, "mandatory");
  const fallbackFields = fields.length > 0 ? fields : FIELDS_BY_ENTITY[entity];
  return Array.from({ length: limit }, (_, i) => {
    const name = `${names[i % names.length]}${i >= names.length ? ` #${i + 1}` : ""}`;
    const status = statuses[hash(seed, i, 1) % statuses.length];
    const owner = allConsultantsList[hash(seed, i, 2) % allConsultantsList.length].fullName;
    const missingCount = 1 + Math.round(rng(seed, i) * 3);
    const missing = Array.from({ length: missingCount }, (_, k) => fallbackFields[hash(seed, i, 3 + k) % fallbackFields.length]).filter((v, idx, a) => a.indexOf(v) === idx);
    const lastUpdatedDays = Math.round(5 + rng(seed, i + 7) * 60);
    const hygieneScore = Math.round(30 + rng(seed, i + 11) * 55);
    return { name, status, owner, missing, lastUpdatedDays, hygieneScore };
  });
}

// ---- Deal stage completeness -----------------------------------------------

export const DEAL_STAGES_FOR_CHART = [
  "1.0 Goedgekeurd",
  "2.0 Voorgesteld",
  "3.1 1e gesprek",
  "3.4 Deal sluiter",
  "4.0 Plaatsing",
  "4.1 Contract verstuurd",
  "4.2 Getekend",
  "5 Gedetacheerd",
  "6 W&S / Marge fac",
];

export function getDealStageCompleteness(): { stage: string; complete: number; incomplete: number; outdated: number }[] {
  const seed = entitySeed("deals") + 61;
  return DEAL_STAGES_FOR_CHART.map((stage, i) => {
    const total = Math.round(20 + rng(seed, i) * 180);
    const completePct = 0.4 + rng(seed, i + 5) * 0.5;
    const complete = Math.round(total * completePct);
    const incomplete = Math.round((total - complete) * (0.4 + rng(seed, i + 9) * 0.5));
    const outdated = total - complete - incomplete;
    return { stage, complete, incomplete, outdated };
  });
}

// ---- AI.synsel coverage ----------------------------------------------------

export function getAiSynselCoverage(): { entity: string; coverage: number }[] {
  const seed = entitySeed("ai_synsel") + 71;
  return ["Candidates", "Jobs", "Deals", "Companies"].map((e, i) => ({
    entity: e,
    coverage: Math.round(40 + rng(seed, i) * 55),
  }));
}

// ---- Notities activity by entity -------------------------------------------

export function getNotitiesActivityByEntity(): { entity: string; notes: number; calls: number; meetings: number; tasks: number }[] {
  const seed = entitySeed("notities") + 81;
  return ["Candidates", "Companies", "Contacts", "Jobs", "Deals"].map((e, i) => ({
    entity: e,
    notes: Math.round(30 + rng(seed, i) * 280),
    calls: Math.round(20 + rng(seed, i + 5) * 200),
    meetings: Math.round(5 + rng(seed, i + 9) * 60),
    tasks: Math.round(10 + rng(seed, i + 13) * 90),
  }));
}

// ---- Insights --------------------------------------------------------------

export interface Insight { severity: "good" | "warning" | "critical"; text: string }

const GLOBAL_INSIGHTS: Insight[] = [
  { severity: "critical", text: "Deals hebben de laagste hygiene score deze periode omdat plaatsings-administratie velden ontbreken." },
  { severity: "warning", text: "Jobs zijn grotendeels compleet, maar gepubliceerde vacatures missen marketing publicatievelden." },
  { severity: "good", text: "Candidate hygiene is verbeterd ten opzichte van de vorige periode dankzij meer resume en AI.synsel completions." },
  { severity: "warning", text: "Companies met actieve jobs missen vaak sector en branche data." },
];

const ENTITY_INSIGHTS: Record<EntityKey, Insight[]> = {
  candidates: [
    { severity: "warning", text: "Meest ontbrekende velden zijn resume, AI.synsel en opgemaakt CV." },
    { severity: "warning", text: "Kandidaten in Procedure verdienen prioriteit boven kandidaten in Nieuw." },
  ],
  companies: [
    { severity: "warning", text: "Bedrijven zonder sector/branche verzwakken rapportage-kwaliteit." },
    { severity: "warning", text: "Bedrijven zonder gekoppeld contact verzwakken commerciële opvolging." },
  ],
  contacts: [
    { severity: "warning", text: "Contacten zonder functie/titel zijn moeilijk in te zetten in gerichte voorstellen." },
    { severity: "good", text: "Voorkeurscontact en warm-relatie vlaggen verbeteren commerciële prioritering." },
  ],
  jobs: [
    { severity: "critical", text: "Gepubliceerde vacatures met incomplete publicatievelden zijn een kwaliteitsrisico." },
    { severity: "warning", text: "Vacatures zonder sector/functie/type vacature verzwakken matching." },
  ],
  deals: [
    { severity: "critical", text: "Plaatsings-stage deals zonder contract/payroll/salaris zijn hoog administratief risico." },
    { severity: "critical", text: "W&S deals zonder factuurgegevens vormen een financieel proces-risico." },
  ],
  ai_synsel: [
    { severity: "warning", text: "AI checks identificeren ontbrekende of inconsistente record data." },
    { severity: "good", text: "AI coverage moet per entiteit gemonitord worden." },
  ],
  notities: [
    { severity: "warning", text: "Actieve dossiers zonder recente activiteit moeten worden opgevolgd." },
    { severity: "warning", text: "Te late taken vormen proces-risico." },
  ],
};

export function getInsights(scope: "global" | EntityKey): Insight[] {
  return scope === "global" ? GLOBAL_INSIGHTS : ENTITY_INSIGHTS[scope];
}

// ---- Owner list (for filter) -----------------------------------------------

export const OWNERS: ConsultantInfo[] = allConsultantsList.filter(c => c.isActive);

// ---- Overlay filters + drop-off aggregations -------------------------------

export interface OverlayFilters {
  owners: string[];                                // [] = alle
  statuses: string[];                              // [] = alle (entity-specifiek)
  freshness: "all" | "fresh" | "outdated" | "stale";
  fieldScope: FieldScope;
}

export const DEFAULT_OVERLAY_FILTERS: OverlayFilters = {
  owners: [],
  statuses: [],
  freshness: "all",
  fieldScope: "mandatory",
};

export interface StepDropOff {
  step: string;
  records: number;
  completePct: number;
  dropOffPct: number;          // verschil compleet% t.o.v. vorige step (negatief = drop)
  hygieneScore: number;
}

export interface EntityDropOff {
  entity: EntityKey;
  hygiene: number;
  required: number;
  process: number;
  freshness: number;
  deltaVsAvg: number;
}

const ENTITY_STEP_LABELS: Record<EntityKey, string[]> = {
  candidates: ["Nieuw", "Verdelen", "Inschrijven", "Acquisitie", "Procedure", "Geplaatst"],
  companies: ["Lead", "Prospect", "Klant actief", "Klant inactief"],
  contacts: ["Nieuw", "Gekwalificeerd", "Actief", "Inactief"],
  jobs: ["Concept", "Open", "Gepubliceerd", "On hold", "Gesloten"],
  deals: DEAL_STAGES_FOR_CHART,
  ai_synsel: ["Aangemaakt", "AI keuring", "AI samenvatting", "Match score", "Synced"],
  notities: ["Vandaag", "Deze week", "Deze maand", "Ouder"],
};

export function getStatusOptions(entity: EntityKey): string[] {
  return ENTITY_STEP_LABELS[entity];
}

function filterFactor(filters: OverlayFilters, entity: EntityKey): number {
  let f = 1;
  if (filters.owners.length > 0) {
    f *= Math.max(0.15, filters.owners.length / Math.max(OWNERS.length, 1));
  }
  if (filters.statuses.length > 0) {
    const total = ENTITY_STEP_LABELS[entity].length || 1;
    f *= Math.max(0.2, filters.statuses.length / total);
  }
  if (filters.freshness === "fresh") f *= 0.55;
  else if (filters.freshness === "outdated") f *= 0.3;
  else if (filters.freshness === "stale") f *= 0.15;
  return f;
}

export function getStepDropOffs(entity: EntityKey, filters: OverlayFilters = DEFAULT_OVERLAY_FILTERS): StepDropOff[] {
  const seed = entitySeed(entity) + 131;
  const labelsAll = ENTITY_STEP_LABELS[entity];
  const labels = filters.statuses.length > 0 ? labelsAll.filter(l => filters.statuses.includes(l)) : labelsAll;
  const total = RECORD_COUNTS[entity] * filterFactor(filters, entity);

  // Funnel-like decreasing record counts
  let prevComplete: number | null = null;
  const decay = labels.length > 1 ? 0.78 : 1;
  return labels.map((step, i) => {
    const records = Math.max(8, Math.round(total * Math.pow(decay, i) / Math.max(labelsAll.length, 1) * 1.4));
    const completePct = Math.round(45 + rng(seed, i) * 50);
    const hygieneScore = Math.round(completePct * 0.6 + (50 + rng(seed, i + 50) * 45) * 0.4);
    const dropOffPct = prevComplete == null ? 0 : completePct - prevComplete;
    prevComplete = completePct;
    return { step, records, completePct, dropOffPct, hygieneScore };
  });
}

export function getEntityDropOffs(_filters: OverlayFilters = DEFAULT_OVERLAY_FILTERS): EntityDropOff[] {
  const summaries = getAllSummaries();
  const avg = Math.round(summaries.reduce((s, x) => s + x.score, 0) / summaries.length);
  return summaries.map(s => ({
    entity: s.entity,
    hygiene: s.score,
    required: s.requiredScore,
    process: s.adminScore,
    freshness: s.freshnessScore,
    deltaVsAvg: s.score - avg,
  }));
}

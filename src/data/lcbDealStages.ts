// Allowed deal stage values for LC-B drilldowns.
export const LCB_DEAL_STAGES = [
  "1.0 | Goedgekeurd",
  "1.1 | Via 1 vast consultant voorstellen",
  "1.1 | Via mail voorstellen",
  "1.1 | Via portal voorstellen",
  "1.2 | Bellen naar opdrachtgever",
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
  "Afgevallen tijdens detacheringsperiode",
  "Afgewezen na telefonisch voorstellen",
  "Afgewezen na voorstelmail",
  "Detacheringstermijn afgemaakt, niet overgenomen",
  "Kandidaat teruggetrokken",
  "Lost",
  "Na sollicitatiegesprek heeft KDD geen interesse",
  "Na sollicitatiegesprek is KDD afgewezen",
  "Niet begonnen",
  "Overgenomen na detacheringsperiode",
  "Overgenomen na margefacturatie/W&S",
  "Won",
] as const;

export type LcbDealStage = typeof LCB_DEAL_STAGES[number];

export function dealStageBadgeClass(stage: string): string {
  if (stage === "Won" || stage.startsWith("5 ") || stage.startsWith("6 ") || stage.startsWith("Overgenomen"))
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400";
  if (stage.startsWith("4.")) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400";
  if (stage.startsWith("3.")) return "bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400";
  if (stage.startsWith("2.")) return "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400";
  if (stage.startsWith("1.")) return "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400";
  if (
    stage === "Lost" || stage.startsWith("Afgewezen") || stage.startsWith("Afgevallen") ||
    stage.startsWith("Kandidaat teruggetrokken") || stage.startsWith("Na sollicitatie") ||
    stage.startsWith("Niet begonnen") || stage.startsWith("Detacheringstermijn")
  ) return "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400";
  return "bg-muted text-muted-foreground border-border";
}

export const CONTACT_STATUSES = ["Nieuw", "In dienst", "Uit dienst", "Geen contactpersoon"] as const;
export type ContactStatus = typeof CONTACT_STATUSES[number];

export function contactStatusBadgeClass(s: ContactStatus): string {
  switch (s) {
    case "In dienst": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    case "Uit dienst": return "bg-red-500/10 text-red-600 border-red-500/30";
    case "Nieuw": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "Geen contactpersoon": return "bg-muted text-muted-foreground border-border";
  }
}

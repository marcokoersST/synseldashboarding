import type { UnitFunnelRow } from "./tvData";

export type SubCol =
  | { type: "value"; key: keyof UnitFunnelRow; label: string; decimals?: number }
  | { type: "conv"; from: keyof UnitFunnelRow; to: keyof UnitFunnelRow; label: string };

export interface ColumnGroup {
  group: string;
  subs: SubCol[];
}

export const columnGroups: ColumnGroup[] = [
  {
    group: "1. Inschrijvingen",
    subs: [
      { type: "value", key: "toegewezen", label: "Toegewezen" },
      { type: "value", key: "ingeschreven", label: "Ingeschreven" },
      { type: "conv", from: "ingeschreven", to: "toegewezen", label: "Inschr. ÷ Toegew." },
      { type: "conv", from: "intakes", to: "ingeschreven", label: "Intake ÷ Inschr." },
    ],
  },
  {
    group: "2. Acquisitie",
    subs: [
      { type: "value", key: "acquisities", label: "Acquisitie" },
      { type: "conv", from: "acquisities", to: "ingeschreven", label: "Acq. ÷ Inschr." },
      { type: "conv", from: "acquisities", to: "toegewezen", label: "Acq. ÷ Toegew." },
    ],
  },
  {
    group: "3. Voorstellen",
    subs: [
      { type: "value", key: "voorstellenPerKandidaat", label: "Per kandidaat", decimals: 1 },
      { type: "value", key: "voorstellenViaEmail", label: "Via email" },
      { type: "value", key: "voorstellenViaTelefoon", label: "Via telefoon" },
      { type: "conv", from: "voorstellenViaEmail", to: "ingeschreven", label: "Email ÷ Inschr." },
      { type: "conv", from: "voorstellenViaTelefoon", to: "ingeschreven", label: "Tel. ÷ Inschr." },
    ],
  },
  {
    group: "4. Uitnodigingen",
    subs: [
      { type: "value", key: "uitnodigingenTotaal", label: "Totaal" },
      { type: "value", key: "nietUitgenodigd", label: "Niet uitgen." },
      { type: "value", key: "welUitgenodigd", label: "Wel uitgen." },
      { type: "conv", from: "uitnodigingenTotaal", to: "acquisities", label: "Uitn. ÷ Acq." },
    ],
  },
  {
    group: "5. Gesprekken",
    subs: [
      { type: "value", key: "eersteGesprek", label: "1e gesprek" },
      { type: "value", key: "geenEersteGesprek", label: "Geen 1e" },
      { type: "value", key: "welEersteGesprek", label: "Wel 1e" },
      { type: "conv", from: "eersteGesprek", to: "acquisities", label: "1e ÷ Acq." },
    ],
  },
  {
    group: "6. Vervolg",
    subs: [
      { type: "value", key: "vervolgGesprek", label: "Vervolg/meeloop" },
      { type: "value", key: "dealsluiter", label: "Dealsluiter" },
      { type: "conv", from: "welEersteGesprek", to: "vervolgGesprek", label: "Wel 1e ÷ Verv." },
    ],
  },
  {
    group: "7. Geplaatst",
    subs: [
      { type: "value", key: "geplaatst", label: "Geplaatst" },
      { type: "value", key: "gemDagenTotPlaatsing", label: "Gem. dagen" },
      { type: "conv", from: "geplaatst", to: "ingeschreven", label: "Plts. ÷ Inschr." },
      { type: "conv", from: "geplaatst", to: "toegewezen", label: "Plts. ÷ Toegew." },
    ],
  },
];

export function subKey(sub: SubCol): string {
  return sub.type === "value" ? `value:${String(sub.key)}` : `conv:${String(sub.from)}/${String(sub.to)}`;
}

export const ALL_SUBKEYS: string[] = columnGroups.flatMap(g => g.subs.map(subKey));

// Default selection per spec.
export const DEFAULT_VISIBLE_SUBKEYS: string[] = [
  // Inschrijvingen
  "value:ingeschreven",
  "conv:ingeschreven/toegewezen",
  "conv:intakes/ingeschreven",
  // Acquisitie
  "value:acquisities",
  "conv:acquisities/ingeschreven",
  // Voorstellen
  "value:voorstellenPerKandidaat",
  "value:voorstellenViaEmail",
  "conv:voorstellenViaEmail/ingeschreven",
  // Uitnodigingen
  "value:uitnodigingenTotaal",
  "value:nietUitgenodigd",
  "conv:uitnodigingenTotaal/acquisities",
  // Gesprekken
  "value:eersteGesprek",
  "value:geenEersteGesprek",
  "conv:eersteGesprek/acquisities",
  // Vervolg
  "value:vervolgGesprek",
  "value:dealsluiter",
  "conv:welEersteGesprek/vervolgGesprek",
  // Geplaatst
  "value:geplaatst",
  "value:gemDagenTotPlaatsing",
  "conv:geplaatst/ingeschreven",
  "conv:geplaatst/toegewezen",
];

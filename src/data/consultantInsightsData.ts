export interface ConsultantInsight {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  linkTo: string;
  linkParams?: string;
}

export const consultantInsights: ConsultantInsight[] = [
  {
    id: "ins-1",
    type: "warning",
    title: "Belactiviteit gedaald",
    message: "De laatste 3 dagen heb je 40% minder gebeld dan vorige week. Bekijk je activiteiten.",
    timestamp: "2026-04-02T09:15:00",
    linkTo: "/consultant/activiteit-resultaat",
    linkParams: "?period=week",
  },
  {
    id: "ins-2",
    type: "success",
    title: "Conversie gestegen",
    message: "Je conversie van intakes naar acquisities is gestegen naar 78%. Goed bezig!",
    timestamp: "2026-04-01T16:30:00",
    linkTo: "/consultant/sales-funnel",
  },
  {
    id: "ins-3",
    type: "warning",
    title: "Deals zonder update",
    message: "3 deals staan al 5+ dagen zonder update in je pipeline.",
    timestamp: "2026-04-01T11:00:00",
    linkTo: "/consultant/crm-hygiene",
  },
  {
    id: "ins-4",
    type: "info",
    title: "Nieuwe match gevonden",
    message: "Er zijn 2 nieuwe kandidaten die matchen met je openstaande vacatures.",
    timestamp: "2026-03-31T14:20:00",
    linkTo: "/consultant/kandidaat-first",
  },
  {
    id: "ins-5",
    type: "success",
    title: "Target bijna bereikt",
    message: "Je zit op 92% van je maandtarget. Nog 1 plaatsing nodig!",
    timestamp: "2026-03-31T09:45:00",
    linkTo: "/consultant/geld-bonus",
  },
  {
    id: "ins-6",
    type: "warning",
    title: "NPS-score gedaald",
    message: "Je NPS-score is deze week gedaald van 42 naar 35. Check je opvolging.",
    timestamp: "2026-03-30T17:10:00",
    linkTo: "/consultant/gesprekskwaliteit",
  },
  {
    id: "ins-7",
    type: "info",
    title: "Forecast bijgewerkt",
    message: "Je Q2-forecast is automatisch bijgewerkt op basis van je huidige pipeline.",
    timestamp: "2026-03-30T10:00:00",
    linkTo: "/consultant/forecasting",
    linkParams: "?quarter=Q2",
  },
  {
    id: "ins-8",
    type: "success",
    title: "Leaderboard positie",
    message: "Je bent gestegen naar plek 3 op de team-ranglijst deze week!",
    timestamp: "2026-03-29T15:30:00",
    linkTo: "/tv/ranglijsten",
  },
];

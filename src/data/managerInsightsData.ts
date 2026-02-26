import { myTeamConsultants } from "./managerData";

export interface Insight {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  consultantName?: string;
  consultantAvatar?: string;
  timestamp: Date;
  linkLabel?: string;
  isRead: boolean;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

const c = myTeamConsultants;

export const managerInsights: Insight[] = [
  {
    id: "ins-1",
    type: "warning",
    title: "Acquisitie daling",
    message: `${c[4]?.name ?? "Consultant"} heeft deze week 2 acquisities minder gedaan dan vorige week.`,
    consultantName: c[4]?.name,
    consultantAvatar: c[4]?.avatar,
    timestamp: hoursAgo(1),
    linkLabel: "Bekijk details →",
    isRead: false,
  },
  {
    id: "ins-2",
    type: "info",
    title: "Wekelijkse teamprestatie",
    message: "Bekijk hier de wekelijkse performance van je team.",
    timestamp: hoursAgo(2),
    linkLabel: "Bekijk overzicht →",
    isRead: false,
  },
  {
    id: "ins-3",
    type: "warning",
    title: "Lage NPS-score",
    message: `${c[3]?.name ?? "Consultant"} heeft de laagste NPS-score van het team — plan een gesprek in.`,
    consultantName: c[3]?.name,
    consultantAvatar: c[3]?.avatar,
    timestamp: hoursAgo(4),
    linkLabel: "Plan gesprek →",
    isRead: false,
  },
  {
    id: "ins-4",
    type: "success",
    title: "Top prestatie!",
    message: `${c[0]?.name ?? "Consultant"} heeft 3 plaatsingen gerealiseerd deze periode — uitstekend!`,
    consultantName: c[0]?.name,
    consultantAvatar: c[0]?.avatar,
    timestamp: hoursAgo(6),
    isRead: false,
  },
  {
    id: "ins-5",
    type: "warning",
    title: "Opvolging vertraagd",
    message: "4 deals staan al 7+ dagen in dezelfde fase zonder update.",
    timestamp: hoursAgo(8),
    linkLabel: "Bekijk deals →",
    isRead: false,
  },
  {
    id: "ins-6",
    type: "success",
    title: "Belscore gestegen",
    message: "Team gemiddelde belscore is gestegen naar 7.8 — goed bezig!",
    timestamp: hoursAgo(12),
    isRead: true,
  },
];

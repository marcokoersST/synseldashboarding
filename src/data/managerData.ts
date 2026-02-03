import { TeamMember, teamMembers } from "./teamData";

// Revenue trend data per period (in thousands)
export interface RevenuePeriodData {
  period: string;
  historical: number | null;
  projected: number | null;
}

export interface ConsultantWithTrends extends TeamMember {
  revenueTrend: RevenuePeriodData[];
  teamId: string;
}

export interface PlacementRecord {
  id: string;
  candidateName: string;
  company: string;
  startDate: Date;
  endDate: Date;
  consultantId: number;
  isActive: boolean;
}

// Generate revenue trend data for a consultant based on their current revenue
function generateRevenueTrend(currentRevenue: number, growthRate: number = 0.08): RevenuePeriodData[] {
  const periods: RevenuePeriodData[] = [];
  const baseRevenue = currentRevenue * 0.7; // Start at 70% of current
  
  // Historical data (P1-P6)
  for (let i = 1; i <= 6; i++) {
    const progress = i / 6;
    const value = baseRevenue + (currentRevenue - baseRevenue) * progress;
    periods.push({
      period: `P${i}`,
      historical: Math.round(value / 1000), // Convert to thousands
      projected: i === 6 ? Math.round(value / 1000) : null,
    });
  }
  
  // Projected data (P7-P13)
  const lastHistorical = currentRevenue;
  for (let i = 7; i <= 13; i++) {
    const periodsAhead = i - 6;
    const projectedValue = lastHistorical * Math.pow(1 + growthRate / 13, periodsAhead);
    periods.push({
      period: `P${i}`,
      historical: null,
      projected: Math.round(projectedValue / 1000),
    });
  }
  
  return periods;
}

// Extended team members with revenue trends
export const consultantsWithTrends: ConsultantWithTrends[] = teamMembers.map((member) => ({
  ...member,
  revenueTrend: generateRevenueTrend(member.revenue, 0.06 + Math.random() * 0.04),
  teamId: "team-alpha",
}));

// Additional consultants for "Heel Bedrijf" view
const additionalConsultants: ConsultantWithTrends[] = [
  {
    id: 7,
    name: "Mark de Groot",
    role: "Senior Recruiter",
    revenue: 1720000,
    avatar: "https://i.pravatar.cc/150?img=7",
    isLeader: false,
    teamId: "team-beta",
    metrics: {
      emailsSent: 312,
      emailsTrend: [40, 45, 52, 50, 58, 67],
      calls: 115,
      callsTrend: [14, 17, 20, 18, 22, 24],
      acquisitions: 16,
      acquisitionsTrend: [2, 3, 3, 3, 2, 3],
      placements: 4,
      placementsTrend: [0, 1, 1, 0, 1, 1],
      candidates: 40,
      conversionRate: 3.0,
      salaryProgress: 88,
      performanceScore: 90,
    },
    revenueTrend: generateRevenueTrend(1720000),
  },
  {
    id: 8,
    name: "Linda Smeets",
    role: "Recruiter",
    revenue: 1380000,
    avatar: "https://i.pravatar.cc/150?img=8",
    isLeader: false,
    teamId: "team-beta",
    metrics: {
      emailsSent: 265,
      emailsTrend: [32, 38, 44, 42, 50, 59],
      calls: 95,
      callsTrend: [11, 14, 16, 15, 18, 21],
      acquisitions: 13,
      acquisitionsTrend: [2, 2, 2, 2, 2, 3],
      placements: 3,
      placementsTrend: [0, 1, 0, 1, 0, 1],
      candidates: 32,
      conversionRate: 2.9,
      salaryProgress: 72,
      performanceScore: 79,
    },
    revenueTrend: generateRevenueTrend(1380000),
  },
  {
    id: 9,
    name: "Kevin Hoekstra",
    role: "Senior Recruiter",
    revenue: 1950000,
    avatar: "https://i.pravatar.cc/150?img=9",
    isLeader: true,
    teamId: "team-beta",
    metrics: {
      emailsSent: 348,
      emailsTrend: [44, 50, 58, 54, 64, 78],
      calls: 128,
      callsTrend: [16, 19, 23, 20, 25, 27],
      acquisitions: 19,
      acquisitionsTrend: [2, 3, 4, 4, 3, 3],
      placements: 5,
      placementsTrend: [1, 1, 1, 0, 1, 1],
      candidates: 45,
      conversionRate: 3.3,
      salaryProgress: 95,
      performanceScore: 96,
    },
    revenueTrend: generateRevenueTrend(1950000),
  },
  {
    id: 10,
    name: "Rianne Willems",
    role: "Junior Recruiter",
    revenue: 850000,
    avatar: "https://i.pravatar.cc/150?img=10",
    isLeader: false,
    teamId: "team-beta",
    metrics: {
      emailsSent: 178,
      emailsTrend: [20, 25, 30, 32, 36, 35],
      calls: 65,
      callsTrend: [7, 9, 11, 10, 13, 15],
      acquisitions: 8,
      acquisitionsTrend: [1, 1, 1, 2, 1, 2],
      placements: 2,
      placementsTrend: [0, 0, 1, 0, 0, 1],
      candidates: 20,
      conversionRate: 2.0,
      salaryProgress: 45,
      performanceScore: 62,
    },
    revenueTrend: generateRevenueTrend(850000),
  },
];

export const allConsultants: ConsultantWithTrends[] = [
  ...consultantsWithTrends,
  ...additionalConsultants,
].sort((a, b) => b.revenue - a.revenue);

export const myTeamConsultants = consultantsWithTrends.sort((a, b) => b.revenue - a.revenue);

// Placement records for team
const candidateNames = [
  "Jan de Vries", "Maria van den Berg", "Pieter Jansen", "Anna Bakker",
  "Thomas Visser", "Sophie de Jong", "Lars Mulder", "Emma Bos",
  "Daan Smit", "Lisa van Dijk", "Ruben Meijer", "Eva de Graaf",
  "Luuk Peters", "Julia Hendriks", "Tim van Leeuwen", "Sara Dekker",
  "Bram Vermeer", "Nina van den Broek", "Jesse Kok", "Femke de Boer",
];

const companies = [
  "TechCorp BV", "Digital Solutions", "FinanceHub", "MarketPro",
  "DataDriven NL", "CloudFirst", "InnovateTech", "SmartBiz",
  "GlobalTech", "NextGen Systems", "EuroData", "Prime Software",
];

function generatePlacements(consultantIds: number[], count: number): PlacementRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const endDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    return {
      id: `placement-${i}`,
      candidateName: candidateNames[i % candidateNames.length],
      company: companies[i % companies.length],
      startDate,
      endDate,
      consultantId: consultantIds[i % consultantIds.length],
      isActive: endDate > new Date(),
    };
  });
}

export const teamPlacements = generatePlacements(
  myTeamConsultants.map(c => c.id),
  30
);

export const companyPlacements = generatePlacements(
  allConsultants.map(c => c.id),
  60
);

// Aggregated stats
export const teamStats = {
  totalPlacements: teamPlacements.length,
  activePlacements: teamPlacements.filter(p => p.isActive).length,
  totalRevenue: myTeamConsultants.reduce((sum, c) => sum + c.revenue, 0),
};

export const companyStats = {
  totalPlacements: companyPlacements.length,
  activePlacements: companyPlacements.filter(p => p.isActive).length,
  totalRevenue: allConsultants.reduce((sum, c) => sum + c.revenue, 0),
};

// Chart data for placements over periods
export const teamPlacementsChartData = [
  { period: "P1", historical: 3, projected: null },
  { period: "P2", historical: 2, projected: null },
  { period: "P3", historical: 4, projected: null },
  { period: "P4", historical: 5, projected: null },
  { period: "P5", historical: 4, projected: null },
  { period: "P6", historical: 6, projected: 6 },
  { period: "P7", historical: null, projected: 7 },
  { period: "P8", historical: null, projected: 6 },
  { period: "P9", historical: null, projected: 8 },
  { period: "P10", historical: null, projected: 7 },
  { period: "P11", historical: null, projected: 9 },
  { period: "P12", historical: null, projected: 8 },
  { period: "P13", historical: null, projected: 10 },
];

export const companyPlacementsChartData = [
  { period: "P1", historical: 8, projected: null },
  { period: "P2", historical: 6, projected: null },
  { period: "P3", historical: 10, projected: null },
  { period: "P4", historical: 12, projected: null },
  { period: "P5", historical: 9, projected: null },
  { period: "P6", historical: 14, projected: 14 },
  { period: "P7", historical: null, projected: 15 },
  { period: "P8", historical: null, projected: 13 },
  { period: "P9", historical: null, projected: 17 },
  { period: "P10", historical: null, projected: 15 },
  { period: "P11", historical: null, projected: 19 },
  { period: "P12", historical: null, projected: 17 },
  { period: "P13", historical: null, projected: 21 },
];

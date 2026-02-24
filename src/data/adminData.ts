import { ConsultantWithTrends, allConsultants } from "./managerData";
import { TeamMember } from "./teamData";

export type { ConsultantWithTrends };

// Revenue trend generator (same as managerData)
function generateRevenueTrend(currentRevenue: number, growthRate: number = 0.08) {
  const periods = [];
  const baseRevenue = currentRevenue * 0.7;
  for (let i = 1; i <= 6; i++) {
    const progress = i / 6;
    const value = baseRevenue + (currentRevenue - baseRevenue) * progress;
    periods.push({ period: `P${i}`, historical: Math.round(value / 1000), projected: i === 6 ? Math.round(value / 1000) : null });
  }
  const lastHistorical = currentRevenue;
  for (let i = 7; i <= 13; i++) {
    const periodsAhead = i - 6;
    const projectedValue = lastHistorical * Math.pow(1 + growthRate / 13, periodsAhead);
    periods.push({ period: `P${i}`, historical: null, projected: Math.round(projectedValue / 1000) });
  }
  return periods;
}

// Department types
export interface Department {
  id: string;
  name: string;
  color: string;
  consultantIds: number[];
}

// Monteurs consultants
const monteursConsultants: ConsultantWithTrends[] = [
  {
    id: 11, name: "Bart van Vliet", role: "Senior Recruiter", unit: "Monteurs", revenue: 1540000,
    avatar: "https://i.pravatar.cc/150?img=11", isLeader: true, teamId: "dept-monteurs",
    metrics: { emailsSent: 290, emailsTrend: [36, 42, 48, 46, 54, 64], calls: 105, callsTrend: [13, 15, 18, 16, 20, 23], acquisitions: 15, acquisitionsTrend: [2, 2, 3, 3, 2, 3], placements: 4, placementsTrend: [0, 1, 1, 0, 1, 1], candidates: 36, conversionRate: 3.0, salaryProgress: 80, performanceScore: 85 },
    revenueTrend: generateRevenueTrend(1540000),
  },
  {
    id: 12, name: "Daan Jacobs", role: "Recruiter", revenue: 1180000,
    avatar: "https://i.pravatar.cc/150?img=12", isLeader: false, teamId: "dept-monteurs",
    metrics: { emailsSent: 220, emailsTrend: [28, 32, 36, 38, 42, 44], calls: 82, callsTrend: [10, 12, 14, 13, 16, 17], acquisitions: 11, acquisitionsTrend: [1, 2, 2, 2, 2, 2], placements: 3, placementsTrend: [0, 1, 0, 1, 0, 1], candidates: 26, conversionRate: 2.6, salaryProgress: 62, performanceScore: 73 },
    revenueTrend: generateRevenueTrend(1180000),
  },
  {
    id: 13, name: "Elmar Koopman", role: "Junior Recruiter", revenue: 890000,
    avatar: "https://i.pravatar.cc/150?img=13", isLeader: false, teamId: "dept-monteurs",
    metrics: { emailsSent: 175, emailsTrend: [20, 24, 28, 30, 34, 39], calls: 64, callsTrend: [7, 9, 11, 10, 13, 14], acquisitions: 8, acquisitionsTrend: [1, 1, 1, 2, 1, 2], placements: 2, placementsTrend: [0, 0, 1, 0, 0, 1], candidates: 19, conversionRate: 2.1, salaryProgress: 48, performanceScore: 64 },
    revenueTrend: generateRevenueTrend(890000),
  },
  {
    id: 14, name: "Joey Pol", role: "Recruiter", revenue: 1320000,
    avatar: "https://i.pravatar.cc/150?img=14", isLeader: false, teamId: "dept-monteurs",
    metrics: { emailsSent: 252, emailsTrend: [30, 36, 42, 40, 48, 56], calls: 92, callsTrend: [11, 13, 16, 14, 18, 20], acquisitions: 13, acquisitionsTrend: [2, 2, 2, 2, 2, 3], placements: 3, placementsTrend: [0, 1, 0, 1, 0, 1], candidates: 30, conversionRate: 2.8, salaryProgress: 68, performanceScore: 77 },
    revenueTrend: generateRevenueTrend(1320000),
  },
];

// Departments
export const departments: Department[] = [
  { id: "dept-engineering", name: "Engineering", color: "hsl(var(--primary))", consultantIds: [1, 2, 3, 4, 5, 6] },
  { id: "dept-operators", name: "Operators", color: "hsl(var(--accent))", consultantIds: [7, 8, 9, 10] },
  { id: "dept-monteurs", name: "Monteurs", color: "hsl(var(--teal))", consultantIds: [11, 12, 13, 14] },
];

// All consultants across all departments
export const allAdminConsultants: ConsultantWithTrends[] = [
  ...allConsultants.map(c => ({
    ...c,
    teamId: departments.find(d => d.consultantIds.includes(c.id))?.id || "dept-engineering",
  })),
  ...monteursConsultants,
].sort((a, b) => b.revenue - a.revenue);

// Get consultants for a specific department
export function getConsultantsByDepartment(deptId: string): ConsultantWithTrends[] {
  const dept = departments.find(d => d.id === deptId);
  if (!dept) return [];
  return allAdminConsultants.filter(c => dept.consultantIds.includes(c.id));
}

// Department stats
export function getDepartmentStats(deptId: string) {
  const consultants = getConsultantsByDepartment(deptId);
  return {
    totalRevenue: consultants.reduce((sum, c) => sum + c.revenue, 0),
    consultantCount: consultants.length,
    activePlacements: consultants.reduce((sum, c) => sum + c.metrics.placements, 0),
    avgPerformance: Math.round(consultants.reduce((sum, c) => sum + c.metrics.performanceScore, 0) / consultants.length),
  };
}

// Revenue distribution for donut chart
export function getRevenueDistribution() {
  return departments.map(dept => ({
    name: dept.name,
    value: getConsultantsByDepartment(dept.id).reduce((sum, c) => sum + c.revenue, 0),
    color: dept.color,
  }));
}

// All users for emulation (consultants + managers)
export interface EmulationUser {
  id: number;
  name: string;
  role: "consultant" | "manager";
  department: string;
  avatar: string;
}

export const emulationUsers: EmulationUser[] = [
  ...allAdminConsultants.map(c => ({
    id: c.id,
    name: c.name,
    role: "consultant" as const,
    department: departments.find(d => d.consultantIds.includes(c.id))?.name || "Engineering",
    avatar: c.avatar,
  })),
  { id: 100, name: "Peter van Dam", role: "manager", department: "Engineering", avatar: "https://i.pravatar.cc/150?img=15" },
  { id: 101, name: "Sandra Koster", role: "manager", department: "Operators", avatar: "https://i.pravatar.cc/150?img=16" },
];

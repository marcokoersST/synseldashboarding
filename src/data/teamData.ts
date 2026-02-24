export interface TeamMemberMetrics {
  emailsSent: number;
  emailsTrend: number[];
  calls: number;
  callsTrend: number[];
  acquisitions: number;
  acquisitionsTrend: number[];
  placements: number;
  placementsTrend: number[];
  candidates: number;
  conversionRate: number;
  salaryProgress: number;
  performanceScore: number;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  unit: string;
  revenue: number;
  avatar: string;
  isLeader: boolean;
  isCurrentUser?: boolean;
  metrics: TeamMemberMetrics;
}

export const REVENUE_GOAL = 2000000; // €2M

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Delano Nikkels",
    role: "Senior Recruiter",
    unit: "Engineering",
    revenue: 1850000,
    avatar: "https://i.pravatar.cc/150?img=1",
    isLeader: true,
    metrics: {
      emailsSent: 334,
      emailsTrend: [42, 48, 55, 52, 61, 76],
      calls: 123,
      callsTrend: [15, 18, 22, 19, 24, 25],
      acquisitions: 18,
      acquisitionsTrend: [2, 3, 4, 3, 3, 3],
      placements: 4,
      placementsTrend: [0, 1, 1, 0, 1, 1],
      candidates: 42,
      conversionRate: 3.1,
      salaryProgress: 92,
      performanceScore: 94,
    },
  },
  {
    id: 2,
    name: "Falco Zegveld",
    role: "Recruiter",
    unit: "Engineering",
    revenue: 1620000,
    avatar: "https://i.pravatar.cc/150?img=2",
    isLeader: false,
    metrics: {
      emailsSent: 298,
      emailsTrend: [38, 42, 50, 48, 58, 62],
      calls: 108,
      callsTrend: [14, 16, 19, 17, 21, 21],
      acquisitions: 15,
      acquisitionsTrend: [2, 2, 3, 3, 2, 3],
      placements: 3,
      placementsTrend: [0, 1, 0, 1, 0, 1],
      candidates: 38,
      conversionRate: 2.8,
      salaryProgress: 85,
      performanceScore: 88,
    },
  },
  {
    id: 3,
    name: "Eric Hutchison",
    role: "Senior Recruiter",
    unit: "Monteurs",
    revenue: 1450000,
    avatar: "https://i.pravatar.cc/150?img=3",
    isLeader: false,
    metrics: {
      emailsSent: 276,
      emailsTrend: [35, 40, 45, 44, 52, 60],
      calls: 98,
      callsTrend: [12, 14, 17, 15, 19, 21],
      acquisitions: 14,
      acquisitionsTrend: [2, 2, 2, 3, 2, 3],
      placements: 4,
      placementsTrend: [1, 0, 1, 1, 0, 1],
      candidates: 35,
      conversionRate: 3.4,
      salaryProgress: 78,
      performanceScore: 82,
    },
  },
  {
    id: 4,
    name: "Jij",
    role: "Recruiter",
    revenue: 1280000,
    avatar: "https://i.pravatar.cc/150?img=4",
    isLeader: false,
    isCurrentUser: true,
    metrics: {
      emailsSent: 245,
      emailsTrend: [30, 35, 42, 40, 48, 50],
      calls: 89,
      callsTrend: [10, 12, 15, 14, 18, 20],
      acquisitions: 12,
      acquisitionsTrend: [1, 2, 2, 2, 2, 3],
      placements: 5,
      placementsTrend: [1, 1, 0, 1, 1, 1],
      candidates: 28,
      conversionRate: 4.2,
      salaryProgress: 64,
      performanceScore: 76,
    },
  },
  {
    id: 5,
    name: "Jonah Waterborg",
    role: "Junior Recruiter",
    revenue: 980000,
    avatar: "https://i.pravatar.cc/150?img=5",
    isLeader: false,
    metrics: {
      emailsSent: 198,
      emailsTrend: [24, 28, 32, 34, 38, 42],
      calls: 72,
      callsTrend: [8, 10, 12, 11, 14, 17],
      acquisitions: 9,
      acquisitionsTrend: [1, 1, 2, 1, 2, 2],
      placements: 2,
      placementsTrend: [0, 0, 1, 0, 0, 1],
      candidates: 22,
      conversionRate: 2.2,
      salaryProgress: 52,
      performanceScore: 68,
    },
  },
  {
    id: 6,
    name: "Niels Eggens",
    role: "Junior Recruiter",
    revenue: 720000,
    avatar: "https://i.pravatar.cc/150?img=6",
    isLeader: false,
    metrics: {
      emailsSent: 156,
      emailsTrend: [18, 22, 25, 28, 30, 33],
      calls: 58,
      callsTrend: [6, 8, 9, 10, 12, 13],
      acquisitions: 7,
      acquisitionsTrend: [1, 1, 1, 1, 1, 2],
      placements: 1,
      placementsTrend: [0, 0, 0, 1, 0, 0],
      candidates: 18,
      conversionRate: 1.8,
      salaryProgress: 42,
      performanceScore: 58,
    },
  },
];

export function getTeamMemberRank(memberId: number): number {
  const sortedMembers = [...teamMembers].sort((a, b) => b.revenue - a.revenue);
  return sortedMembers.findIndex(m => m.id === memberId) + 1;
}

export function getCurrentUser(): TeamMember | undefined {
  return teamMembers.find(m => m.isCurrentUser);
}

export function getTeamMemberById(id: number): TeamMember | undefined {
  return teamMembers.find(m => m.id === id);
}

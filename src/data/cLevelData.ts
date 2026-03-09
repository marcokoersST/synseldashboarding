import { allAdminConsultants, departments, getDepartmentStats } from "./adminData";

// Revenue
export const revenueData = {
  total: allAdminConsultants.reduce((sum, c) => sum + c.revenue, 0),
  previousPeriod: 12_400_000,
  target: 16_000_000,
  sparkline: [8.2, 9.1, 10.4, 11.2, 12.4, 13.8],
};

// Margin
export const marginData = {
  totalEuro: Math.round(allAdminConsultants.reduce((sum, c) => sum + c.revenue, 0) * 0.23),
  percentage: 23,
  targetPercentage: 25,
  previousPeriod: 2_850_000,
};

// Placements
export const placementsData = {
  total: allAdminConsultants.reduce((sum, c) => sum + c.metrics.placements, 0),
  previousPeriod: 32,
  target: 45,
  trend: [22, 26, 28, 30, 32, 38],
};

// Forecast
export const forecastData = {
  forecastedPlacements: 42,
  targetPlacements: 45,
  forecastedRevenue: 15_200_000,
  targetRevenue: 16_000_000,
  forecastedMargin: 3_500_000,
  targetMargin: 4_000_000,
};

// Sales & Recruitment Funnel
export const funnelData = {
  stages: [
    { name: "Inschrijvingen", count: 820, previousCount: 780 },
    { name: "Intakes", count: 508, previousCount: 490 },
    { name: "Acquisities", count: 396, previousCount: 370 },
    { name: "Uitnodigingen", count: 249, previousCount: 235 },
    { name: "Gesprekken", count: 179, previousCount: 165 },
    { name: "Plaatsingen", count: 38, previousCount: 32 },
  ],
};

// Consultant Productivity
export const productivityData = {
  avgPlacementsPerConsultant: +(allAdminConsultants.reduce((sum, c) => sum + c.metrics.placements, 0) / allAdminConsultants.length).toFixed(1),
  benchmark: 3.5,
  trend: [2.1, 2.4, 2.6, 2.8, 2.7, 3.0],
  activityToOutputRatio: 14.2,
};

// Business Unit Performance
export const unitPerformanceData = departments.map(dept => {
  const stats = getDepartmentStats(dept.id);
  return {
    name: dept.name,
    color: dept.color,
    revenue: stats.totalRevenue,
    placements: stats.activePlacements,
    avgPerformance: stats.avgPerformance,
  };
});

// Funnel Quality
export const funnelQualityData = {
  timelyFollowUp: 78,
  registrationCompliance: 85,
  overdueActions: 12,
  correctlyProcessed: 92,
};

// Workforce Health
export const workforceHealthData = {
  attritionPercent: 8.2,
  absenteeismPercent: 4.1,
  openVacancies: 3,
  totalStaff: allAdminConsultants.length,
};

// Risk / Alerts
export const riskAlertsData = {
  criticalCount: 2,
  warningCount: 5,
  issues: [
    { severity: "critical" as const, text: "2 consultants onder minimum plaatsingen (3 perioden)" },
    { severity: "critical" as const, text: "Monteurs unit conversie gedaald 15% t.o.v. vorige periode" },
    { severity: "warning" as const, text: "CRM registratie compliance onder 80% bij 3 medewerkers" },
  ],
};

// Strategic Initiatives
export const strategicInitiativesData = [
  { name: "AI-Matching implementatie", status: "on_track" as const, progress: 72 },
  { name: "Nieuwe vestiging Eindhoven", status: "delayed" as const, progress: 45 },
  { name: "CRM migratie Bullhorn", status: "on_track" as const, progress: 88 },
  { name: "Employer branding campagne", status: "at_risk" as const, progress: 30 },
];

// Executive Summary
export const executiveSummaryData = {
  onTrack: 7,
  atRisk: 3,
  offTrack: 2,
  insight: "Revenue groeit conform plan. Monteurs unit vraagt aandacht op conversie. Forecast plaatsingen licht onder target.",
};

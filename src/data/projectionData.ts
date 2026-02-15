export interface WeekProjectionPoint {
  week: string;
  historical: number | null;
  projected: number | null;
}

export interface ProjectionMetric {
  label: string;
  value: number;
}

export interface ProjectionDataSet {
  plaatsingen: WeekProjectionPoint[];
  gesprekken: WeekProjectionPoint[];
  plaatsingenMetrics: ProjectionMetric[];
  gesprekkenMetrics: ProjectionMetric[];
}

// Consultant level - personal data (small numbers)
export const consultantProjections: ProjectionDataSet = {
  plaatsingen: [
    { week: "Wk 4", historical: 1, projected: null },
    { week: "Wk 5", historical: 2, projected: null },
    { week: "Wk 6", historical: 1, projected: 1 },
    { week: "Wk 7", historical: null, projected: 2 },
    { week: "Wk 8", historical: null, projected: 2 },
    { week: "Wk 9", historical: null, projected: 3 },
  ],
  gesprekken: [
    { week: "Wk 4", historical: 8, projected: null },
    { week: "Wk 5", historical: 6, projected: null },
    { week: "Wk 6", historical: 10, projected: 10 },
    { week: "Wk 7", historical: null, projected: 9 },
    { week: "Wk 8", historical: null, projected: 11 },
    { week: "Wk 9", historical: null, projected: 12 },
  ],
  plaatsingenMetrics: [
    { label: "Gesprekken (3 wk)", value: 24 },
  ],
  gesprekkenMetrics: [
    { label: "Acquisities", value: 14 },
    { label: "Belduur (uur)", value: 6.5 },
    { label: "E-mails", value: 42 },
  ],
};

// Team level - aggregated (medium numbers)
export const teamProjections: ProjectionDataSet = {
  plaatsingen: [
    { week: "Wk 4", historical: 5, projected: null },
    { week: "Wk 5", historical: 8, projected: null },
    { week: "Wk 6", historical: 6, projected: 6 },
    { week: "Wk 7", historical: null, projected: 7 },
    { week: "Wk 8", historical: null, projected: 9 },
    { week: "Wk 9", historical: null, projected: 10 },
  ],
  gesprekken: [
    { week: "Wk 4", historical: 34, projected: null },
    { week: "Wk 5", historical: 28, projected: null },
    { week: "Wk 6", historical: 38, projected: 38 },
    { week: "Wk 7", historical: null, projected: 35 },
    { week: "Wk 8", historical: null, projected: 40 },
    { week: "Wk 9", historical: null, projected: 42 },
  ],
  plaatsingenMetrics: [
    { label: "Gesprekken (3 wk)", value: 100 },
  ],
  gesprekkenMetrics: [
    { label: "Acquisities", value: 58 },
    { label: "Belduur (uur)", value: 32 },
    { label: "E-mails", value: 186 },
  ],
};

// Company level - all departments (large numbers)
export const companyProjections: ProjectionDataSet = {
  plaatsingen: [
    { week: "Wk 4", historical: 14, projected: null },
    { week: "Wk 5", historical: 19, projected: null },
    { week: "Wk 6", historical: 16, projected: 16 },
    { week: "Wk 7", historical: null, projected: 18 },
    { week: "Wk 8", historical: null, projected: 22 },
    { week: "Wk 9", historical: null, projected: 24 },
  ],
  gesprekken: [
    { week: "Wk 4", historical: 96, projected: null },
    { week: "Wk 5", historical: 82, projected: null },
    { week: "Wk 6", historical: 105, projected: 105 },
    { week: "Wk 7", historical: null, projected: 98 },
    { week: "Wk 8", historical: null, projected: 112 },
    { week: "Wk 9", historical: null, projected: 120 },
  ],
  plaatsingenMetrics: [
    { label: "Gesprekken (3 wk)", value: 283 },
  ],
  gesprekkenMetrics: [
    { label: "Acquisities", value: 164 },
    { label: "Belduur (uur)", value: 89 },
    { label: "E-mails", value: 520 },
  ],
};

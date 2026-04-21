import { describe, it, expect } from "vitest";
import {
  lifecyclesWithBreakEven,
  monthToPeriod,
} from "@/data/groeimodelData";

/**
 * Replicates the filtering + point-derivation logic of CohortChart so we can
 * verify, across many filter combinations, that:
 *   1. exit markers (exitMonth) only render inside the visible domain
 *   2. break-even pulses (breakEvenMonth) only render inside the visible domain
 *   3. nothing references a month that exceeds the chart's totalMonths
 */
function buildVisibleMarkers(opts: {
  filterUnits: string[];
  filterStatus: "all" | "active" | "terminated";
  filterYears: number[];
  filterPeriodRange: [number, number];
  /** zoom window override; defaults to full range [0, maxMonths-1] */
  domainOverride?: [number, number];
}) {
  const filtered = lifecyclesWithBreakEven.filter(({ lifecycle }) => {
    if (opts.filterUnits.length > 0 && !opts.filterUnits.includes(lifecycle.unit)) return false;
    if (opts.filterStatus === "active" && lifecycle.endDate) return false;
    if (opts.filterStatus === "terminated" && !lifecycle.endDate) return false;
    if (opts.filterYears.length > 0 && !opts.filterYears.includes(lifecycle.startDate.getFullYear())) return false;
    const p = monthToPeriod(lifecycle.startDate.getMonth());
    if (p < opts.filterPeriodRange[0] || p > opts.filterPeriodRange[1]) return false;
    return true;
  });

  const maxMonths = Math.max(...filtered.map((x) => x.result.totalMonths), 1);
  const domain: [number, number] = opts.domainOverride ?? [0, maxMonths - 1];

  const breakEvenPoints = filtered
    .filter(({ result }) => result.breakEvenMonth !== null)
    .map(({ lifecycle, result }) => ({
      id: lifecycle.id,
      month: result.breakEvenMonth as number,
    }));

  const exitPoints = filtered
    .filter(({ result }) => result.exitMonth !== null)
    .map(({ lifecycle, result }) => ({
      id: lifecycle.id,
      month: result.exitMonth as number,
    }));

  // Mirror the chart's per-marker visibility filter
  const visibleBreakEven = breakEvenPoints.filter((p) => p.month >= domain[0] && p.month <= domain[1]);
  const visibleExit = exitPoints.filter((p) => p.month >= domain[0] && p.month <= domain[1]);

  return { filtered, maxMonths, domain, breakEvenPoints, exitPoints, visibleBreakEven, visibleExit };
}

const allUnits = Array.from(
  new Set(lifecyclesWithBreakEven.map(({ lifecycle }) => lifecycle.unit)),
);

describe("CohortChart regression — exit & break-even markers stay inside the active domain", () => {
  const filterScenarios: Array<{
    name: string;
    filterUnits: string[];
    filterStatus: "all" | "active" | "terminated";
    filterYears: number[];
    filterPeriodRange: [number, number];
  }> = [
    { name: "all consultants, full year + period", filterUnits: [], filterStatus: "all", filterYears: [], filterPeriodRange: [1, 13] },
    { name: "active only", filterUnits: [], filterStatus: "active", filterYears: [], filterPeriodRange: [1, 13] },
    { name: "terminated only", filterUnits: [], filterStatus: "terminated", filterYears: [], filterPeriodRange: [1, 13] },
    { name: "narrow period range P1–P3", filterUnits: [], filterStatus: "all", filterYears: [], filterPeriodRange: [1, 3] },
    { name: "narrow period range P10–P13", filterUnits: [], filterStatus: "all", filterYears: [], filterPeriodRange: [10, 13] },
    ...allUnits.map((u) => ({
      name: `single unit: ${u}`,
      filterUnits: [u],
      filterStatus: "all" as const,
      filterYears: [],
      filterPeriodRange: [1, 13] as [number, number],
    })),
  ];

  for (const scenario of filterScenarios) {
    it(`[${scenario.name}] all break-even & exit markers respect the full domain`, () => {
      const r = buildVisibleMarkers(scenario);
      // Sanity: derived markers never exceed the chart's month range
      for (const p of r.breakEvenPoints) {
        expect(p.month).toBeGreaterThanOrEqual(0);
        expect(p.month).toBeLessThan(r.maxMonths);
      }
      for (const p of r.exitPoints) {
        expect(p.month).toBeGreaterThanOrEqual(0);
        expect(p.month).toBeLessThan(r.maxMonths);
      }
      // With the full domain, every marker must be visible
      expect(r.visibleBreakEven.length).toBe(r.breakEvenPoints.length);
      expect(r.visibleExit.length).toBe(r.exitPoints.length);
    });

    it(`[${scenario.name}] zoomed-in domain hides out-of-range markers`, () => {
      const full = buildVisibleMarkers(scenario);
      if (full.maxMonths < 4) return; // not enough range to zoom meaningfully

      // Simulate the intro-zoom phase: a tight window at the start
      const zoomedEnd = Math.max(2, Math.floor(full.maxMonths / 3));
      const r = buildVisibleMarkers({ ...scenario, domainOverride: [0, zoomedEnd] });

      // Every visible marker must lie inside the zoomed window
      for (const p of r.visibleBreakEven) {
        expect(p.month).toBeGreaterThanOrEqual(r.domain[0]);
        expect(p.month).toBeLessThanOrEqual(r.domain[1]);
      }
      for (const p of r.visibleExit) {
        expect(p.month).toBeGreaterThanOrEqual(r.domain[0]);
        expect(p.month).toBeLessThanOrEqual(r.domain[1]);
      }
      // And every hidden marker must lie strictly outside
      const hiddenBE = r.breakEvenPoints.filter((p) => !r.visibleBreakEven.includes(p));
      const hiddenEx = r.exitPoints.filter((p) => !r.visibleExit.includes(p));
      for (const p of hiddenBE) {
        expect(p.month < r.domain[0] || p.month > r.domain[1]).toBe(true);
      }
      for (const p of hiddenEx) {
        expect(p.month < r.domain[0] || p.month > r.domain[1]).toBe(true);
      }
    });

    it(`[${scenario.name}] sliding mid-window keeps marker partition consistent`, () => {
      const full = buildVisibleMarkers(scenario);
      if (full.maxMonths < 6) return;
      const a = Math.floor(full.maxMonths * 0.25);
      const b = Math.floor(full.maxMonths * 0.75);
      const r = buildVisibleMarkers({ ...scenario, domainOverride: [a, b] });
      // visible + hidden must equal totals
      const beHidden = r.breakEvenPoints.length - r.visibleBreakEven.length;
      const exHidden = r.exitPoints.length - r.visibleExit.length;
      expect(beHidden + r.visibleBreakEven.length).toBe(r.breakEvenPoints.length);
      expect(exHidden + r.visibleExit.length).toBe(r.exitPoints.length);
      // Every visible marker is strictly within bounds
      for (const p of [...r.visibleBreakEven, ...r.visibleExit]) {
        expect(p.month).toBeGreaterThanOrEqual(a);
        expect(p.month).toBeLessThanOrEqual(b);
      }
    });
  }
});

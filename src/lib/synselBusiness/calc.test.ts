import { describe, expect, it } from "vitest";
import {
  annualizedMarginPerProfessional,
  buildUpScenario,
  equivalentActiveCount,
  maintenanceStartsPerWeek,
  maintenanceStartsPerYear,
  potentialMarginPerPlacement,
  requiredStarts,
  requiredWholeActiveCount,
  weeklyMargin,
} from "./calc";

describe("aannameset uit de briefing", () => {
  it("levert 731 weekmarge, 38.012 geannualiseerd en 21.930 potentieel", () => {
    expect(weeklyMargin()).toBeCloseTo(731, 6);
    expect(annualizedMarginPerProfessional()).toBeCloseTo(38012, 6);
    expect(potentialMarginPerPlacement()).toBeCloseTo(21930, 6);
  });
});

describe("financiële doelen", () => {
  const cases: [number, number, number, number, number][] = [
    [500000, 13.15, 14, 22.8, 0.438],
    [750000, 19.73, 20, 34.2, 0.658],
    [1000000, 26.31, 27, 45.6, 0.877],
    [1250000, 32.88, 33, 57.0, 1.096],
    [1500000, 39.46, 40, 68.4, 1.315],
    [1750000, 46.04, 47, 79.8, 1.535],
    [2000000, 52.61, 53, 91.2, 1.754],
  ];

  it.each(cases)("%s", (target, equiv, whole, perYear, perWeek) => {
    expect(equivalentActiveCount(target)).toBeCloseTo(equiv, 2);
    expect(requiredWholeActiveCount(target)).toBe(whole);
    expect(maintenanceStartsPerYear(target)).toBeCloseTo(perYear, 1);
    expect(maintenanceStartsPerWeek(target)).toBeCloseTo(perWeek, 3);
  });
});

describe("continue opbouwbenadering", () => {
  it("reproduceert het €500.000 voorbeeld", () => {
    const s = buildUpScenario(500000);
    expect(s.startsPerWeek).toBeCloseTo(0.6162112865, 8);
    expect(s.startsPerYear).toBeCloseTo(32.0429869, 5);
    expect(s.startsPerCalendarMonth).toBeCloseTo(2.6702489, 5);
    expect(s.activeAtYearEnd).toBeCloseTo(18.4863386, 5);
    expect(s.annualizedMarginAtYearEnd).toBeCloseTo(702702.7, 0);
  });
});

describe("benodigde starts", () => {
  it("rekent het fixture-voorbeeld", () => {
    expect(
      requiredStarts({
        targetActive: 13,
        currentActive: 9,
        exitsBeforeTarget: 2,
        confirmedStartsBeforeTarget: 3,
      }),
    ).toBe(3);
  });

  it("kan niet negatief worden", () => {
    expect(
      requiredStarts({
        targetActive: 10,
        currentActive: 12,
        exitsBeforeTarget: 0,
        confirmedStartsBeforeTarget: 1,
      }),
    ).toBe(0);
  });
});

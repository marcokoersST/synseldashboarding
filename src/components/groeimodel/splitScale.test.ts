import { describe, it, expect } from "vitest";
import { makeSplitScale } from "./splitScale";
import { lifecyclesWithBreakEven, formatEuro } from "@/data/groeimodelData";

describe("split Y-axis scale", () => {
  describe("boundary at €0", () => {
    it("maps €0 exactly onto display=0 for representative ranges", () => {
      const ranges: Array<[number, number]> = [
        [-50_000, 500_000],
        [-8_000, 250_000],
        [-100_000, 1_000_000],
        [-1, 1], // degenerate
      ];
      for (const [yMin, yMax] of ranges) {
        const s = makeSplitScale(yMin, yMax);
        expect(s.transform(0)).toBe(0);
        expect(s.inverse(0)).toBe(0);
      }
    });

    it("loss zone occupies 45% of display, profit zone occupies 55%", () => {
      const s = makeSplitScale(-50_000, 500_000);
      expect(s.displayMin).toBe(-45);
      expect(s.displayMax).toBe(55);
      // yMin maps to displayMin, yMax maps to displayMax
      expect(s.transform(-50_000)).toBeCloseTo(-45, 6);
      expect(s.transform(500_000)).toBeCloseTo(55, 6);
    });
  });

  describe("inverse round-trip preserves original € balances", () => {
    const s = makeSplitScale(-50_000, 500_000);
    const samples = [
      -50_000, -25_000, -10_000, -1_000, -1, 0, 1, 1_000, 25_000,
      100_000, 250_000, 499_999, 500_000,
    ];
    for (const v of samples) {
      it(`inverse(transform(${v})) ≈ ${v}`, () => {
        expect(s.inverse(s.transform(v))).toBeCloseTo(v, 6);
      });
    }
  });

  describe("tick → real € mapping (matches chart's tickFormatter behaviour)", () => {
    // Use real chart bounds derived from the actual data
    const allBalances = lifecyclesWithBreakEven.flatMap(({ result }) =>
      result.cumulativeSeries.map((p) => p.balance),
    );
    const minBal = Math.min(0, ...allBalances);
    const maxBal = Math.max(0, ...allBalances);
    const splitScale = makeSplitScale(minBal * 1.05, maxBal * 1.05);

    // Same candidate set the chart uses
    const candidates = [
      minBal, -50_000, -25_000, -10_000, 0, 25_000, 50_000, 100_000,
      200_000, 350_000, 500_000, 750_000, 1_000_000, maxBal,
    ];
    const inRange = candidates.filter(
      (v) => v >= minBal * 1.05 && v <= maxBal * 1.05,
    );

    it("each tick's display value maps back to its original € balance", () => {
      const tickToReal = new Map<number, number>();
      inRange.forEach((v) => tickToReal.set(splitScale.transform(v), v));
      // Every tick must round-trip — this is what the chart's tickFormatter relies on.
      for (const v of inRange) {
        const display = splitScale.transform(v);
        const real = tickToReal.get(display);
        expect(real).toBeDefined();
        expect(real).toBe(v);
        // formatEuro must produce the human-readable string for the original € value
        expect(formatEuro(real!)).toBe(formatEuro(v));
      }
    });

    it("tooltip inverse(value) reproduces the underlying € balance for each chart point", () => {
      // Pick a handful of real cumulativeSeries points and verify the tooltip pipeline:
      //   real → splitScale.transform → (chart-rendered display value) → splitScale.inverse → real
      const sampleSeries = lifecyclesWithBreakEven.slice(0, 5).flatMap(
        ({ result }) => result.cumulativeSeries.filter((_, i) => i % 4 === 0),
      );
      for (const point of sampleSeries) {
        const display = splitScale.transform(point.balance);
        const recovered = splitScale.inverse(display);
        expect(recovered).toBeCloseTo(point.balance, 4);
        // And the formatted euro string is identical
        expect(formatEuro(Math.round(recovered))).toBe(
          formatEuro(Math.round(point.balance)),
        );
      }
    });

    it("ticks below 0 land in the loss zone, ticks above 0 in the profit zone", () => {
      for (const v of inRange) {
        const d = splitScale.transform(v);
        if (v < 0) expect(d).toBeLessThan(0);
        else if (v > 0) expect(d).toBeGreaterThan(0);
        else expect(d).toBe(0);
      }
    });
  });

  describe("monotonicity", () => {
    it("transform is strictly monotonically increasing", () => {
      const s = makeSplitScale(-50_000, 500_000);
      const xs = [-50_000, -25_000, -10_000, -1, 0, 1, 10_000, 100_000, 500_000];
      for (let i = 1; i < xs.length; i++) {
        expect(s.transform(xs[i])).toBeGreaterThan(s.transform(xs[i - 1]));
      }
    });
  });
});

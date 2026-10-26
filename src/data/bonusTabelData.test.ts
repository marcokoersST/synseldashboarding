import { describe, it, expect } from "vitest";
import { bonusRecordsForPeriode } from "./bonusTabelData";
describe("Totaal uit te keren", () => {
  const r = bonusRecordsForPeriode(8);
  const get = (n: string) => r.find((x) => x.consultant === n)!.totaalUitTeKeren;
  it("Robin P8 = 1500", () => expect(get("Robin van Bruggen")).toBe(1500));
  it("Lars P8 = 3400", () => expect(get("Lars van Suntenmaartensdijk")).toBe(3400));
  it("Jort P8 = 1300", () => expect(get("Jort Koggel")).toBe(1300));
});

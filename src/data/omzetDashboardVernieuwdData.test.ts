import { describe, it, expect } from "vitest";
import { omzetConsultants, getOmzetForPeriodeGroups } from "./omzetDashboardData";
import {
  omzetConsultantsPerType, alleOmzetTypes, getOmzetPerTypeForPeriodeGroups, getUitsplitsingPerType,
} from "./omzetDashboardVernieuwdData";

describe("Omzet dashboard - vernieuwde versie", () => {
  it("som van alle types per periode = origineel periodetotaal", () => {
    omzetConsultants.forEach((c, i) => {
      Object.entries(c.periodes).forEach(([p, totaal]) => {
        const perType = omzetConsultantsPerType[i].periodes[p];
        expect(alleOmzetTypes.reduce((s, t) => s + perType[t], 0)).toBe(totaal);
        alleOmzetTypes.forEach((t) => expect(perType[t]).toBeGreaterThanOrEqual(0));
      });
    });
  });

  it("alle types geselecteerd geeft dezelfde ranglijst als het originele dashboard", () => {
    const origineel = getOmzetForPeriodeGroups(omzetConsultants, ["P4"], ["P5"]);
    const vernieuwd = getOmzetPerTypeForPeriodeGroups(omzetConsultantsPerType, ["P4"], ["P5"], alleOmzetTypes);
    expect(vernieuwd.map((r) => [r.name, r.verschil])).toEqual(origineel.map((r) => [r.name, r.verschil]));
  });

  it("uitsplitsing per type telt op tot het totaal van de tabel", () => {
    const rijen = getOmzetPerTypeForPeriodeGroups(omzetConsultantsPerType, ["P10", "P11"], ["P12", "P13"], alleOmzetTypes);
    const perType = getUitsplitsingPerType(omzetConsultantsPerType, ["P10", "P11"], ["P12", "P13"], alleOmzetTypes);
    expect(perType.reduce((s, t) => s + t.periode2, 0)).toBe(rijen.reduce((s, r) => s + r.periode2, 0));
  });

  it("heeft zowel actieve als inactieve consultants", () => {
    const statussen = new Set(omzetConsultantsPerType.map((c) => c.status));
    expect(statussen).toEqual(new Set(["actief", "inactief"]));
  });
});

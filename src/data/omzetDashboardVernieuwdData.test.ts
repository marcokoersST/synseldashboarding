import { describe, it, expect } from "vitest";
import { omzetConsultants, getOmzetForPeriodeGroups } from "./omzetDashboardData";
import {
  omzetConsultantsPerType, alleOmzetTypes, getOmzetPerTypeForPeriodeGroups, getUitsplitsingPerType,
  laatste13Periodes, omzetLaatste13Periodes, omzetVoorTypes, jaarFactor, sorteerOmzetRijen,
} from "./omzetDashboardVernieuwdData";

describe("Sorteren van de consultanttabel", () => {
  const rijen = [
    { name: "A", periode1: 10, periode2: 50, verschil: 40 },
    { name: "B", periode1: 30, periode2: 20, verschil: -10 },
    { name: "C", periode1: 20, periode2: 80, verschil: 60 },
  ];
  const namen = (r: { name: string }[]) => r.map((x) => x.name).join("");

  it("sorteert op verschil, groep 1 of groep 2, hoog naar laag of andersom", () => {
    expect(namen(sorteerOmzetRijen(rijen, { kolom: "verschil", richting: "desc" }))).toBe("CAB");
    expect(namen(sorteerOmzetRijen(rijen, { kolom: "periode1", richting: "desc" }))).toBe("BCA");
    expect(namen(sorteerOmzetRijen(rijen, { kolom: "periode2", richting: "desc" }))).toBe("CAB");
    expect(namen(sorteerOmzetRijen(rijen, { kolom: "periode2", richting: "asc" }))).toBe("BAC");
  });

  it("past de originele lijst niet aan", () => {
    sorteerOmzetRijen(rijen, { kolom: "periode1", richting: "asc" });
    expect(namen(rijen)).toBe("ABC");
  });
});

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

describe("Afgelopen 13 periodes", () => {
  const label = (r: { jaar: string; periode: string }) => `${r.periode} ${r.jaar}`;

  it("loopt t/m de huidige periode en gaat over de jaargrens heen", () => {
    const periodes = laatste13Periodes(new Date(2026, 10, 2)).map(label); // 2 nov 2026 = P11
    expect(periodes).toHaveLength(13);
    expect(periodes[0]).toBe("P12 2025");
    expect(periodes[1]).toBe("P13 2025");
    expect(periodes[2]).toBe("P1 2026");
    expect(periodes[12]).toBe("P11 2026");
  });

  it("begin januari zijn bijna alle periodes van vorig jaar", () => {
    const periodes = laatste13Periodes(new Date(2027, 0, 10)).map(label); // P1 2027
    expect(periodes[0]).toBe("P2 2026");
    expect(periodes[11]).toBe("P13 2026");
    expect(periodes[12]).toBe("P1 2027");
  });

  it("totaal per periode = omzet van die periode met de jaarfactor van dat jaar", () => {
    const vandaag = new Date(2026, 10, 2);
    const c = omzetConsultantsPerType[0];
    omzetLaatste13Periodes(c, vandaag).forEach((r) => {
      const totaal = alleOmzetTypes.reduce((s, t) => s + r[t], 0);
      expect(totaal).toBe(omzetVoorTypes(c, [r.periode], alleOmzetTypes, jaarFactor(r.jaar, vandaag)));
    });
  });
});

import { describe, expect, it } from "vitest";
import { localeFor, translateDutchText } from "./translations";

describe("translations", () => {
  it("uses exact translations for primary interface labels", () => {
    expect(translateDutchText("Plaatsingen ranglijst")).toBe("Placements ranking");
    expect(translateDutchText("Gedetacheerden ranglijst")).toBe("Contractors ranking");
  });

  it("translates dynamic labels while retaining their values", () => {
    expect(translateDutchText("Beste plaatsingen · Periode 11")).toBe("Best placements · period 11");
  });

  it("selects the correct formatting locale", () => {
    expect(localeFor("nl")).toBe("nl-NL");
    expect(localeFor("en")).toBe("en-GB");
  });
});
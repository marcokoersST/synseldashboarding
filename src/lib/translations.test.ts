import { describe, expect, it } from "vitest";
import { localeFor, translateDutchText } from "./translations";

describe("translations", () => {
  it("uses exact translations for primary interface labels", () => {
    expect(translateDutchText("Plaatsingen ranglijst")).toBe("Placements ranking");
    expect(translateDutchText("Gedetacheerden ranglijst")).toBe("Contractors ranking");
    expect(translateDutchText("Plaatsingen ranglijst", "pl")).toBe("Ranking zatrudnień");
    expect(translateDutchText("Plaatsingen ranglijst", "uk")).toBe("Рейтинг працевлаштувань");
  });

  it("translates dynamic labels while retaining their values", () => {
    expect(translateDutchText("Beste plaatsingen · Periode 11")).toBe("Best placements · period 11");
  });

  it("selects the correct formatting locale", () => {
    expect(localeFor("nl")).toBe("nl-NL");
    expect(localeFor("en")).toBe("en-GB");
    expect(localeFor("pl")).toBe("pl-PL");
    expect(localeFor("uk")).toBe("uk-UA");
  });
});
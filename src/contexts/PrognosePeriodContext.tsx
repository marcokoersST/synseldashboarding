import { createContext, useContext, useState, type ReactNode } from "react";

export type PrognosePeriod = "week" | "period";

interface Ctx {
  period: PrognosePeriod;
  setPeriod: (p: PrognosePeriod) => void;
  scale: number; // 1 for week, 4 for period
  maxDays: number; // 7 vs 28
  label: string; // "Rolling week (ma–vandaag)" / "Periode 5 (P)"
}

const PrognosePeriodContext = createContext<Ctx | null>(null);

export function PrognosePeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PrognosePeriod>("week");
  const scale = period === "week" ? 1 : 4;
  const maxDays = period === "week" ? 7 : 28;
  const label =
    period === "week" ? "Rolling week (ma–vandaag)" : "Huidige periode (4 weken)";
  return (
    <PrognosePeriodContext.Provider value={{ period, setPeriod, scale, maxDays, label }}>
      {children}
    </PrognosePeriodContext.Provider>
  );
}

export function usePrognosePeriod(): Ctx {
  const ctx = useContext(PrognosePeriodContext);
  if (!ctx) throw new Error("usePrognosePeriod must be used inside PrognosePeriodProvider");
  return ctx;
}

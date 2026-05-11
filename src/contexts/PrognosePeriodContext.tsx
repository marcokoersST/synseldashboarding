import { createContext, useContext, useState, type ReactNode } from "react";

export type PrognosePeriod = "week" | "period";

interface Ctx {
  period: PrognosePeriod;
  setPeriod: (p: PrognosePeriod) => void;
  offset: number; // 0 = current, 1 = previous, ...
  setOffset: (n: number) => void;
  scale: number; // 1 for week, 4 for period
  maxDays: number;
  label: string;
}

const PrognosePeriodContext = createContext<Ctx | null>(null);

export function PrognosePeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodRaw] = useState<PrognosePeriod>("week");
  const [offset, setOffsetRaw] = useState<number>(0);
  const setPeriod = (p: PrognosePeriod) => {
    setPeriodRaw(p);
    setOffsetRaw(0);
  };
  const setOffset = (n: number) => setOffsetRaw(Math.max(0, n));

  const scale = period === "week" ? 1 : 4;
  const maxDays = period === "week" ? 7 : 28;

  let label: string;
  if (period === "week") {
    label =
      offset === 0
        ? "Huidige week (ma–vandaag)"
        : offset === 1
          ? "Vorige week"
          : `${offset} weken terug`;
  } else {
    label =
      offset === 0
        ? "Huidige periode (4 weken)"
        : offset === 1
          ? "Vorige periode"
          : `${offset} periodes terug`;
  }

  return (
    <PrognosePeriodContext.Provider
      value={{ period, setPeriod, offset, setOffset, scale, maxDays, label }}
    >
      {children}
    </PrognosePeriodContext.Provider>
  );
}

export function usePrognosePeriod(): Ctx {
  const ctx = useContext(PrognosePeriodContext);
  if (!ctx) throw new Error("usePrognosePeriod must be used inside PrognosePeriodProvider");
  return ctx;
}

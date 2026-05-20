export type LCBStatus = "clean" | "attention" | "critical";

export const LCB_STATUS_COLOR: Record<LCBStatus, string> = {
  clean: "hsl(142 71% 45%)",
  attention: "hsl(38 92% 50%)",
  critical: "hsl(0 84% 60%)",
};

export const LCB_STATUS_LABEL: Record<LCBStatus, string> = {
  clean: "Op koers",
  attention: "Aandacht",
  critical: "Kritiek",
};

// classes for table cells / pills
export const LCB_STATUS_BG: Record<LCBStatus, string> = {
  clean: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  attention: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
};

export function statusFromRatio(ratio: number): LCBStatus {
  // ratio = actual / benchmark
  if (ratio >= 1) return "clean";
  if (ratio >= 0.7) return "attention";
  return "critical";
}

export function statusFromScore(score: number): LCBStatus {
  if (score >= 75) return "clean";
  if (score >= 55) return "attention";
  return "critical";
}

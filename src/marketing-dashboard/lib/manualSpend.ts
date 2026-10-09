import { differenceInCalendarDays, eachMonthOfInterval, endOfMonth, max, min, startOfDay, startOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker-v9";

export type SpendPeriod = "day" | "month";

export interface ManualSpendSetting {
  amount: number;
  period: SpendPeriod;
  validFrom: string;
  validTo: string;
}

function parseLocalDate(value: string): Date {
  const parts = value.split("-").map(Number);
  return new Date(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

export function calculateManualSpend(setting: ManualSpendSetting | undefined, range: DateRange): number | undefined {
  if (!setting || !range.from || !range.to) return undefined;

  const overlapFrom = max([startOfDay(range.from), parseLocalDate(setting.validFrom)]);
  const overlapTo = min([startOfDay(range.to), parseLocalDate(setting.validTo)]);
  if (overlapFrom > overlapTo) return 0;

  if (setting.period === "day") {
    return setting.amount * (differenceInCalendarDays(overlapTo, overlapFrom) + 1);
  }

  return eachMonthOfInterval({ start: overlapFrom, end: overlapTo }).reduce((total, month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const activeFrom = max([overlapFrom, monthStart]);
    const activeTo = min([overlapTo, monthEnd]);
    const activeDays = differenceInCalendarDays(activeTo, activeFrom) + 1;
    const monthDays = differenceInCalendarDays(monthEnd, monthStart) + 1;
    return total + setting.amount * (activeDays / monthDays);
  }, 0);
}
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export type SortDir = "asc" | "desc";

export function useSort<T, K extends string>(rows: T[], getter: (k: K) => (r: T) => string | number | undefined, initial?: { key: K; dir: SortDir }) {
  const [sortKey, setSortKey] = useState<K | null>(initial?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(initial?.dir ?? "desc");
  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const fn = getter(sortKey);
    return [...rows].sort((a, b) => {
      const av = fn(a) ?? "";
      const bv = fn(b) ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir, getter]);
  const toggle = (k: K) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };
  return { sortKey, sortDir, toggle, sorted };
}

export function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="inline h-3 w-3 ml-0.5 text-muted-foreground/50" />;
  return dir === "asc"
    ? <ChevronUp className="inline h-3 w-3 ml-0.5" />
    : <ChevronDown className="inline h-3 w-3 ml-0.5" />;
}

export function SortableTh({
  children, active, dir, onClick, align = "left", className,
}: {
  children: React.ReactNode; active: boolean; dir: SortDir; onClick: () => void;
  align?: "left" | "right" | "center"; className?: string;
}) {
  return (
    <th
      onClick={onClick}
      className={cn(
        "px-2 py-1.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground",
        align === "right" && "text-right",
        align === "center" && "text-center",
        active && "text-foreground",
        className,
      )}
    >
      {children}<SortIcon active={active} dir={dir} />
    </th>
  );
}

export function MultiSelectFilter<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
}) {
  const allOn = value.length === 0 || value.length === options.length;
  const toggle = (opt: T) => {
    const set = new Set(value.length === 0 ? options : value);
    if (set.has(opt)) set.delete(opt); else set.add(opt);
    const next = Array.from(set) as T[];
    onChange(next.length === options.length ? [] : next);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5">
          {label}
          {!allOn && (
            <span className="rounded-full bg-primary/15 text-primary px-1.5 py-0 text-[10px] font-semibold tabular-nums">
              {value.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className="flex items-center gap-1">
            <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => onChange([])}>Alles aan</button>
            <span className="text-muted-foreground">·</span>
            <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => onChange([...options])}>Alles uit</button>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {options.map((opt) => {
            const checked = value.length === 0 ? true : value.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted/40 cursor-pointer">
                <Checkbox checked={checked} onCheckedChange={() => toggle(opt)} />
                <span className="truncate">{opt}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <X className="h-3 w-3" /> Reset
    </button>
  );
}

/**
 * Filter rows by selected values. Empty selection = include all.
 */
export function filterBy<T>(rows: T[], get: (r: T) => string, selected: string[]): T[] {
  if (selected.length === 0) return rows;
  const s = new Set(selected);
  return rows.filter((r) => s.has(get(r)));
}

import { MousePointerClick, UserCheck, ClipboardList, Euro, Gauge, BarChart3, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Conversions: MousePointerClick,
  "Bemiddelbare kandidaten": UserCheck,
  Inschrijven: ClipboardList,
  "Cost per Inschrijving": Euro,
  "Quality Index Conv.": Gauge,
  "Quality Index bem.": Gauge,
};

type KpiIconProps = {
  /** Used to look up the icon. */
  label: string;
  /** When given, the title renders next to the icon instead of under it. */
  title?: string;
  size?: "sm" | "lg";
  className?: string;
};

export default function KpiIcon({ label, title, size = "sm", className = "" }: KpiIconProps) {
  const Icon = ICONS[label] ?? BarChart3;
  const box = size === "lg"
    ? "h-10 w-10 [@media(max-height:850px)]:h-8 [@media(max-height:850px)]:w-8"
    : "h-8 w-8";
  const icon = size === "lg"
    ? "h-5 w-5 [@media(max-height:850px)]:h-4 [@media(max-height:850px)]:w-4"
    : "h-4 w-4";
  const titleClass = size === "lg"
    ? "text-lg font-semibold text-foreground leading-snug [@media(max-height:850px)]:text-sm"
    : "text-sm font-semibold text-foreground leading-snug";

  const badge = (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ${box}`} aria-hidden="true">
      <Icon className={icon} />
    </span>
  );

  if (title) {
    return (
      <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
        {badge}
        <p className={`min-w-0 ${titleClass}`}>{title}</p>
      </div>
    );
  }

  return <span className={`mb-2 block ${className}`}>{badge}</span>;
}


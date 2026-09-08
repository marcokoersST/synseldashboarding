import { createContext, ReactNode, useContext } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DATA_UPDATED_AT, REPORT_DATE } from "@/data/synselBusiness";
import { DEFAULT_ASSUMPTIONS, formatDate, formatEuro } from "@/lib/synselBusiness/calc";
import { cn } from "@/lib/utils";

/** Zodra een BusinessPage in een andere BusinessPage hangt, rendert hij als sectie. */
const NestedContext = createContext(false);

/** Wikkel tab-inhoud hierin zodat losse pagina's als secties renderen. */
export function BusinessNestedProvider({ children }: { children: ReactNode }) {
  return <NestedContext.Provider value={true}>{children}</NestedContext.Provider>;
}


/** Smalle conceptstrook in warme zandkleur, precies zoals het oorspronkelijke raamwerk. */
export function ConceptStrip() {
  return (
    <div className="-mx-6 -mt-6 mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 bg-primary/10 px-6 py-2 text-[11px] font-medium uppercase tracking-wide text-foreground/70">
      <span>Concept · alle cijfers zijn fictief</span>
      <span className="text-primary/90 normal-case tracking-normal">
        Geen live data · Geen persoonlijke bonusberekening
      </span>
    </div>
  );
}

/** Rustige voetregel met de rekenbasis van de run-rate. */
export function BusinessFooterLine() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
      <span>
        Rekenbasis run-rate: {DEFAULT_ASSUMPTIONS.hoursPerWeek} declarabele uren ·{" "}
        {formatEuro(DEFAULT_ASSUMPTIONS.marginPerHour, 2)} marge per uur ·{" "}
        {DEFAULT_ASSUMPTIONS.annualWeeks} weken
      </span>
      <span>Voorbeelddata · Alle wijzigingen blijven lokaal</span>
    </div>
  );
}

/** Behouden voor bestaande verwijzingen. */
export function ConceptBanner() {
  return <ConceptStrip />;
}

export function FreshnessLine() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        Gegevens bijgewerkt: {formatDate(DATA_UPDATED_AT)} 10:34
      </span>
      <span>Rapportagedatum: {formatDate(REPORT_DATE)}</span>
      <span>Tijdzone: Europe/Amsterdam</span>
    </div>
  );
}

interface BusinessPageProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Verberg de eigen kop; gebruikt wanneer de tab zelf al een kop toont. */
  hideHeader?: boolean;
  children: ReactNode;
}

export function BusinessPage({ title, subtitle, actions, hideHeader, children }: BusinessPageProps) {
  const nested = useContext(NestedContext);

  if (nested) {
    return (
      <section className="space-y-4">
        {!hideHeader && (
          <div className="flex flex-wrap items-start justify-between gap-3 border-l-2 border-primary/50 pl-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </section>
    );
  }

  return (
    <NestedContext.Provider value={true}>
      <div className="space-y-6">
        <ConceptStrip />
        {!hideHeader && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              <div className="mt-2">
                <FreshnessLine />
              </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
        <BusinessFooterLine />
      </div>
    </NestedContext.Provider>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Section({ title, description, actions, children }: SectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface MetricProps {
  label: string;
  value: string;
  basis: string;
  hint?: string;
  tone?: "default" | "dark";
}

export function Metric({ label, value, basis, hint, tone = "default" }: MetricProps) {
  const dark = tone === "dark";
  return (
    <Card className={cn(dark && "border-transparent bg-sidebar")}>
      <CardContent className="p-4">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            dark ? "text-sidebar-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-2 text-2xl font-bold",
            dark ? "text-[hsl(var(--gold))] text-4xl" : "text-foreground",
          )}
        >
          {value}
        </p>
        <p className={cn("mt-1 text-xs", dark ? "text-sidebar-foreground/80" : "text-muted-foreground")}>
          {basis}
        </p>
        {hint && (
          <p
            className={cn(
              "mt-2 text-[11px] leading-snug",
              dark ? "text-sidebar-foreground/70" : "text-muted-foreground/80",
            )}
          >
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

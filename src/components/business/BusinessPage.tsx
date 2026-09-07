import { ReactNode } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DATA_UPDATED_AT, REPORT_DATE } from "@/data/synselBusiness";
import { formatDate } from "@/lib/synselBusiness/calc";

export function ConceptBanner() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground">
      <AlertTriangle className="h-4 w-4 shrink-0 text-primary" />
      <span>
        <strong>Concept met voorbeelddata.</strong> Alle cijfers op deze pagina en in elke export komen
        uit een vaste voorbeelddataset. Er is geen koppeling met RecruitCRM of Finance.
      </span>
    </div>
  );
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
  children: ReactNode;
}

export function BusinessPage({ title, subtitle, actions, children }: BusinessPageProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <ConceptBanner />
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
      </div>
      {children}
    </div>
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
}

export function Metric({ label, value, basis, hint }: MetricProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{basis}</p>
        {hint && <p className="mt-2 text-[11px] leading-snug text-muted-foreground/80">{hint}</p>}
      </CardContent>
    </Card>
  );
}

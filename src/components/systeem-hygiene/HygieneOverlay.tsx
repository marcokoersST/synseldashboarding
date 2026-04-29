import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Sparkles, ChevronDown, ChevronRight, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ENTITY_LABEL,
  ENTITY_SUBTITLE,
  STATUS_COLOR,
  STATUS_LABEL,
  DEFAULT_OVERLAY_FILTERS,
  getEntitySummary,
  getProcessChecks,
  getActionPointers,
  getEventCounters,
  getEventLog,
  getRecordsNeedingAttention,
  getFieldMissingCounts,
  getMarketingFieldMissingCounts,
  getDealStageCompleteness,
  getAiSynselCoverage,
  getNotitiesActivityByEntity,
  getInsights,
  getStepDropOffs,
  getEntityDropOffs,
  type EntityKey,
  type OverlayFilters,
} from "@/data/systeemHygieneData";
import { ActionPointerList } from "./ActionPointerList";
import { EventCountersStrip, EventLogList } from "./EventLog";
import { InsightCard } from "./InsightCard";
import { OverlayFilterBar } from "./OverlayFilterBar";
import { StepDropOffTable, EntityComparisonTable } from "./DropOffSummaryTable";

interface Props {
  entity: EntityKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HygieneOverlay({ entity, open, onOpenChange }: Props) {
  if (!entity) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal />
      </DialogPrimitive.Root>
    );
  }
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=closed]:duration-200 ease-out" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[90vw] h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-98 data-[state=open]:slide-in-from-bottom-2",
            "data-[state=open]:duration-500 data-[state=closed]:duration-200 data-[state=open]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:ease-out",
          )}
        >
          <OverlayBody entity={entity} />
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function OverlayBody({ entity }: { entity: EntityKey }) {
  const summary = getEntitySummary(entity);
  const insights = getInsights(entity);
  const color = STATUS_COLOR[summary.status];

  const [filters, setFilters] = useState<OverlayFilters>(DEFAULT_OVERLAY_FILTERS);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  // Reset bij entity-wissel
  useEffect(() => {
    setFilters(DEFAULT_OVERLAY_FILTERS);
    setSelectedStep(null);
    setShowCompare(false);
  }, [entity]);

  const stepRows = useMemo(() => getStepDropOffs(entity, filters), [entity, filters]);
  const entityRows = useMemo(() => getEntityDropOffs(filters), [filters]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card/40 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="text-xl font-semibold text-foreground">
              {ENTITY_LABEL[entity]} Hygiene Detail
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-xs text-muted-foreground mt-0.5">
              {ENTITY_SUBTITLE[entity]}
            </DialogPrimitive.Description>
          </div>
          <div className="flex items-center gap-4 pr-10">
            <Metric label="Hygiene" value={`${summary.score}`} sub={STATUS_LABEL[summary.status]} color={color} />
            <Metric label="Verplichte velden" value={`${summary.requiredScore}%`} />
            <Metric label="Process" value={`${summary.adminScore}%`} />
            <Metric label="Freshness" value={`${summary.freshnessScore}%`} />
          </div>
        </div>
        {insights.length > 0 && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b border-border px-6">
          <TabsList className="bg-transparent h-auto p-0">
            {["overview", "fields", "process", "records", "actions", "events"].map(t => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-4 py-2 text-xs uppercase tracking-wider"
              >
                {labelFor(t)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <OverlayFilterBar entity={entity} filters={filters} onChange={setFilters} />

          <div className="px-6 py-4 space-y-4">
            {/* Drop-off summary block — shown above every tab */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground">
                  Drop-off per step{selectedStep ? ` — gefilterd op ${selectedStep}` : ""}
                </h4>
                {selectedStep && (
                  <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-xs"
                    onClick={() => setSelectedStep(null)}>
                    Step-filter wissen
                  </Button>
                )}
              </div>
              <StepDropOffTable rows={stepRows} selectedStep={selectedStep} onSelectStep={setSelectedStep} />

              <button
                type="button"
                onClick={() => setShowCompare(v => !v)}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {showCompare ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Vergelijk met andere entities
              </button>
              {showCompare && <EntityComparisonTable rows={entityRows} highlight={entity} />}
            </section>

            <TabsContent value="overview" className="m-0"><OverviewTab entity={entity} filters={filters} selectedStep={selectedStep} /></TabsContent>
            <TabsContent value="fields" className="m-0"><FieldsTab entity={entity} filters={filters} /></TabsContent>
            <TabsContent value="process" className="m-0"><ProcessTab entity={entity} /></TabsContent>
            <TabsContent value="records" className="m-0"><RecordsTab entity={entity} /></TabsContent>
            <TabsContent value="actions" className="m-0"><ActionsTab entity={entity} /></TabsContent>
            <TabsContent value="events" className="m-0"><EventsTab entity={entity} /></TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function labelFor(t: string) {
  return ({
    overview: "Overzicht",
    fields: "Velden",
    process: "Process",
    records: "Records",
    actions: "Action pointers",
    events: "Events",
  } as Record<string, string>)[t];
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ---- Tabs ------------------------------------------------------------------

function OverviewTab({ entity, filters, selectedStep }: { entity: EntityKey; filters: OverlayFilters; selectedStep: string | null }) {
  const counters = getEventCounters(entity);
  const checks = getProcessChecks(entity).slice(0, 5);
  const actions = getActionPointers(entity, 4);
  return (
    <div className="space-y-5">
      {/* Featured: Events deze periode */}
      <section className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-tight">Events deze periode</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Mutaties en activiteit binnen de huidige periode</p>
          </div>
        </div>
        <EventCountersStrip counters={counters} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Top action pointers</h4>
          <ActionPointerList items={actions} />
        </div>
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Process checks</h4>
          <div className="space-y-2">
            {checks.map((c, i) => (
              <div key={i} className="rounded-lg border border-border bg-card/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground truncate">{c.check}</span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: STATUS_COLOR[c.status] }}>{c.passedPct}%</span>
                </div>
                <Progress value={c.passedPct} className="h-1.5 mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldsTab({ entity, filters }: { entity: EntityKey; filters: OverlayFilters }) {
  const scope = filters.fieldScope;
  const data = getFieldMissingCounts(entity, scope);
  const showMarketing = entity === "jobs";
  const marketingData = showMarketing ? getMarketingFieldMissingCounts() : null;

  return (
    <div className="space-y-5">
      <div className="text-[11px] text-muted-foreground">
        Scope: <span className="font-medium text-foreground">{scope === "mandatory" ? "Mandatory" : scope === "mandatoryIfAvailable" ? "Mandatory if available" : scope === "wouldBeNice" ? "Would-be-nice" : "Optional"}</span> — wijzig via filterbalk hierboven.
      </div>


      {data.length === 0 ? (
        <div className="rounded-lg border border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          Geen velden gedefinieerd voor dit scope-niveau.
        </div>
      ) : (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{showMarketing ? "Sales velden — missing count" : "Missing per veld"}</h4>
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 60 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="field" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="missing" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showMarketing && marketingData && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Marketing / publicatie velden — gepubliceerde vacatures</h4>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={marketingData} margin={{ top: 8, right: 12, left: 4, bottom: 60 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="field" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="missing" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {entity === "deals" && <DealStageChart />}
      {entity === "ai_synsel" && <AiCoverageChart />}
      {entity === "notities" && <NotitiesActivityChart />}
    </div>
  );
}

function DealStageChart() {
  const data = getDealStageCompleteness();
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Deal hygiene per stage</h4>
      <div className="h-[260px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 60 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="complete" stackId="a" fill="hsl(142 71% 45%)" name="Compleet" />
            <Bar dataKey="outdated" stackId="a" fill="hsl(38 92% 50%)" name="Compleet, oud" />
            <Bar dataKey="incomplete" stackId="a" fill="hsl(var(--destructive))" name="Incompleet" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AiCoverageChart() {
  const data = getAiSynselCoverage();
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">AI.synsel coverage per entiteit</h4>
      <div className="h-[240px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 16 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="entity" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="coverage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function NotitiesActivityChart() {
  const data = getNotitiesActivityByEntity();
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Activiteit per entiteit</h4>
      <div className="h-[260px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 16 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="entity" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="notes" stackId="a" fill="hsl(var(--primary))" name="Notes" />
            <Bar dataKey="calls" stackId="a" fill="hsl(var(--accent))" name="Calls" />
            <Bar dataKey="meetings" stackId="a" fill="hsl(var(--teal, 173 80% 40%))" name="Meetings" />
            <Bar dataKey="tasks" stackId="a" fill="hsl(38 92% 50%)" name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ProcessTab({ entity }: { entity: EntityKey }) {
  const checks = getProcessChecks(entity);
  return (
    <div className="space-y-2 max-w-3xl">
      {checks.map((c, i) => (
        <div key={i} className="rounded-lg border border-border bg-card/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-foreground">{c.check}</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: STATUS_COLOR[c.status] }}>{c.passedPct}%</span>
          </div>
          <Progress value={c.passedPct} className="h-2 mt-2" />
        </div>
      ))}
    </div>
  );
}

function RecordsTab({ entity }: { entity: EntityKey }) {
  const rows = getRecordsNeedingAttention(entity, 12);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground uppercase tracking-wider text-[10px]">
            <th className="px-2 py-2 font-medium">Record</th>
            <th className="px-2 py-2 font-medium">Status</th>
            <th className="px-2 py-2 font-medium">Owner</th>
            <th className="px-2 py-2 font-medium">Missing fields</th>
            <th className="px-2 py-2 font-medium text-right">Last updated</th>
            <th className="px-2 py-2 font-medium text-right">Hygiene</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const status = r.hygieneScore >= 85 ? STATUS_COLOR.clean : r.hygieneScore >= 60 ? STATUS_COLOR.attention : STATUS_COLOR.critical;
            return (
              <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
                <td className="px-2 py-2 font-medium text-foreground">{r.name}</td>
                <td className="px-2 py-2 text-muted-foreground">{r.status}</td>
                <td className="px-2 py-2 text-muted-foreground">{r.owner}</td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1">
                    {r.missing.map(m => <span key={m} className="rounded-sm bg-destructive/10 text-destructive px-1.5 py-0.5 text-[10px]">{m}</span>)}
                  </div>
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.lastUpdatedDays}d</td>
                <td className="px-2 py-2 text-right tabular-nums font-semibold" style={{ color: status }}>{r.hygieneScore}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActionsTab({ entity }: { entity: EntityKey }) {
  const actions = getActionPointers(entity, 12);
  return <ActionPointerList items={actions} />;
}

function EventsTab({ entity }: { entity: EntityKey }) {
  const counters = getEventCounters(entity);
  const log = getEventLog(entity, 14);
  return (
    <div className="space-y-4">
      <EventCountersStrip counters={counters} />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Events vandaag</h4>
          {entity === "ai_synsel" && (
            <span className="inline-flex items-center gap-1 text-[10px] text-primary"><Sparkles className="h-3 w-3" /> AI processing log</span>
          )}
        </div>
        <EventLogList rows={log} />
      </div>
    </div>
  );
}

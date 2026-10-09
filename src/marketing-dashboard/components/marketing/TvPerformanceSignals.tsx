import { useTvCarousel } from "@/marketing-dashboard/components/marketing/useTvCarousel";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { Card, CardContent } from "@/marketing-dashboard/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/marketing-dashboard/components/ui/carousel";
import type { ForecastPeriod, ForecastResult } from "@/marketing-dashboard/lib/marketingForecast";
import { cn } from "@/marketing-dashboard/lib/utils";

export interface TvSignal { source: string; period: ForecastPeriod; metric?: string; result: ForecastResult }
const pct = (value: number) => `${value.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}%`;

function SignalCard({ signal }: { signal: TvSignal }) {
  const { source, period, metric, result } = signal;
  const behind = result.status === "behind";
  const color = behind ? "text-destructive" : "text-forecast-positive";
  return <Card className={cn("h-full border-l-4", behind ? "border-l-destructive" : "border-l-forecast-positive")}>
    <CardContent className="flex h-full flex-col justify-between p-5 [@media(max-height:850px)]:p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="break-words text-xl font-bold">{source}</p><p className="mt-1 text-sm font-medium text-muted-foreground">{metric ? `${metric} · ` : ""}{period === "week" ? "Week" : "Maand"}</p></div>
        <span className={cn("flex shrink-0 items-center gap-1 text-xs font-semibold", color)} title={behind ? "Onder verwachting" : "Boven verwachting"}>
          {behind ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}<span className="hidden xl:inline">{behind ? "Onder verwachting" : "Boven verwachting"}</span>
        </span>
      </div>
      <p className={cn("mt-3 text-4xl font-bold tabular-nums [@media(max-height:850px)]:mt-2", color)}>{(result.deviation ?? 0) > 0 ? "+" : ""}{pct(result.deviation ?? 0)}</p>
      <div className="relative mt-4 h-2 shrink-0 rounded-full bg-muted [@media(max-height:850px)]:mt-2" aria-label={`${source} ${period === "week" ? "week" : "maand"}: ${pct(result.progress)} behaald`}>
        <div className={cn("h-full rounded-full", behind ? "bg-destructive" : "bg-forecast-positive")} style={{ width: `${Math.min(result.progress, 100)}%` }} />
        <div className="absolute -top-1 h-4 w-0.5 bg-foreground" style={{ left: `${result.expectedPct}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground [@media(max-height:850px)]:mt-2">Eindprognose: <span className="font-semibold tabular-nums text-foreground">{result.projectedPct === null ? "—" : pct(result.projectedPct)}</span></p>
    </CardContent>
  </Card>;
}

export default function TvPerformanceSignals({ signals }: { signals: TvSignal[] }) {
  const rotating = signals.length >= 4;
  const { api, setApi, paused, setPaused, setHovered, reducedMotion, index } = useTvCarousel(rotating);
  return <section className="flex shrink-0 flex-col" aria-label="Week- en maandprestatiesignalen" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
      <h3 className="text-xl font-semibold">Prestatiesignalen <span className="ml-2 text-base font-normal text-muted-foreground">Week & Maand</span></h3>
      {rotating && <div className="flex items-center gap-1">
        <span className="mr-2 text-sm tabular-nums text-muted-foreground">{index + 1} / {signals.length}</span>
        <Button variant="ghost" size="icon" aria-label="Vorig prestatiesignaal" title="Vorig prestatiesignaal" onClick={() => api?.scrollPrev(reducedMotion)}><ChevronLeft className="size-5" /></Button>
        {!reducedMotion && <Button variant="ghost" size="icon" aria-label={paused ? "Signalen afspelen" : "Signalen pauzeren"} title={paused ? "Afspelen" : "Pauzeren"} onClick={() => setPaused(value => !value)}>{paused ? <Play className="size-4" /> : <Pause className="size-4" />}</Button>}
        <Button variant="ghost" size="icon" aria-label="Volgend prestatiesignaal" title="Volgend prestatiesignaal" onClick={() => api?.scrollNext(reducedMotion)}><ChevronRight className="size-5" /></Button>
      </div>}
    </div>
    {signals.length === 0 ? <p className="flex min-h-44 items-center gap-2 text-lg text-muted-foreground"><CheckCircle2 className="size-5" />Week en maand op schema</p> : rotating ?
      <Carousel className="h-52 [&>div]:h-full [@media(max-height:850px)]:h-32" key={signals.map(signal => `${signal.period}:${signal.metric}:${signal.source}`).join("|")} setApi={setApi} opts={{ loop: true, align: "start", duration: 80 }} aria-label="Prestatiesignalen" onFocusCapture={() => setPaused(true)}>
        <CarouselContent className="-ml-6 h-full [@media(max-height:850px)]:-ml-4">{signals.map(signal => <CarouselItem key={`${signal.period}:${signal.metric}:${signal.source}`} className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3 [@media(max-height:850px)]:pl-4"><SignalCard signal={signal} /></CarouselItem>)}</CarouselContent>
      </Carousel> : <div className="grid auto-rows-[13rem] gap-6 sm:grid-cols-2 lg:grid-cols-3 [@media(max-height:850px)]:auto-rows-[8rem] [@media(max-height:850px)]:gap-4">{signals.map(signal => <SignalCard key={`${signal.period}:${signal.metric}:${signal.source}`} signal={signal} />)}</div>}
  </section>;
}
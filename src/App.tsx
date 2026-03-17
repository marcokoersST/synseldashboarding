import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Vergelijking from "./pages/Vergelijking";
import VergelijkingOverview from "./pages/VergelijkingOverview";
import ManagerDashboard from "./pages/ManagerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminEmulate from "./pages/SuperAdminEmulate";
import TVSalesFunnelWeek from "./pages/TVSalesFunnelWeek";
import TVSalesFunnelPeriod from "./pages/TVSalesFunnelPeriod";
import TVBekerDashboard from "./pages/TVBekerDashboard";
import TVGedetacheerden from "./pages/TVGedetacheerden";
import TVRanglijsten from "./pages/TVRanglijsten";
import TVHeatmap from "./pages/TVHeatmap";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

const GeldBonus = lazy(() => import("./pages/consultant/GeldBonus"));
const KPICockpit = lazy(() => import("./pages/consultant/KPICockpit"));
const SalesFunnel = lazy(() => import("./pages/consultant/SalesFunnel"));
const NextActions = lazy(() => import("./pages/consultant/NextActions"));
const Gesprekskwaliteit = lazy(() => import("./pages/consultant/Gesprekskwaliteit"));
const ActiviteitResultaat = lazy(() => import("./pages/consultant/ActiviteitResultaat"));
const Benchmarking = lazy(() => import("./pages/consultant/Benchmarking"));
const KandidaatFirst = lazy(() => import("./pages/consultant/KandidaatFirst"));
const KlantMarkt = lazy(() => import("./pages/consultant/KlantMarkt"));
const CRMHygiene = lazy(() => import("./pages/consultant/CRMHygiene"));
const Snelheid = lazy(() => import("./pages/consultant/Snelheid"));
const Forecasting = lazy(() => import("./pages/consultant/Forecasting"));
const Detavast = lazy(() => import("./pages/consultant/Detavast"));
const SkillsTraining = lazy(() => import("./pages/consultant/SkillsTraining"));
const Gamification = lazy(() => import("./pages/consultant/Gamification"));
const AlertsRisicos = lazy(() => import("./pages/consultant/AlertsRisicos"));
const MatchKwaliteit = lazy(() => import("./pages/consultant/MatchKwaliteit"));
const RouteNaar1 = lazy(() => import("./pages/consultant/RouteNaar1"));
const ExtraDashboards = lazy(() => import("./pages/consultant/ExtraDashboards"));

// Hendrik dashboards
const HendrikOverzicht = lazy(() => import("./pages/hendrik/Overzicht"));
const HendrikMailVoorstellen = lazy(() => import("./pages/hendrik/MailVoorstellen"));
const HendrikDMUCorrectheid = lazy(() => import("./pages/hendrik/DMUCorrectheid"));
const HendrikConversieFunnel = lazy(() => import("./pages/hendrik/ConversieFunnel"));
const HendrikKlachtRisico = lazy(() => import("./pages/hendrik/KlachtRisico"));
const HendrikOpvolgingHygiene = lazy(() => import("./pages/hendrik/OpvolgingHygiene"));
const HendrikGamificationLevels = lazy(() => import("./pages/hendrik/GamificationLevels"));
const HendrikUitnodigingenKaart = lazy(() => import("./pages/hendrik/UitnodigingenKaart"));
const HendrikAICoachRanking = lazy(() => import("./pages/hendrik/AICoachRanking"));
const HendrikGroeiplan = lazy(() => import("./pages/hendrik/ConsultantGroeiplan"));
const HendrikSnelheidSalesproces = lazy(() => import("./pages/hendrik/SnelheidSalesproces"));
const HendrikKandidaatRelatie = lazy(() => import("./pages/hendrik/KandidaatRelatie"));
const HendrikWerkgeluk = lazy(() => import("./pages/hendrik/Werkgeluk"));

// Peter-Jan dashboards
const PeterJanSalesFlow = lazy(() => import("./pages/peter-jan/SalesFlowDashboards"));
const PeterJanAcquisitieFunnel = lazy(() => import("./pages/peter-jan/AcquisitieFunnel"));
const PeterJanOmzetDashboard = lazy(() => import("./pages/peter-jan/OmzetDashboard"));
// AcquisitieConversie merged into ManagerSalesFunnel

// Marketing dashboards
const MarketingInschrijvingen = lazy(() => import("./pages/marketing/InschrijvingenDashboard"));
const MarketingVacatureFunnel = lazy(() => import("./pages/marketing/VacatureFunnelMonitor"));
const MarketingInflow = lazy(() => import("./pages/marketing/InflowDashboard"));

const CLevelDashboard = lazy(() => import("./pages/CLevelDashboard"));
const ManagerOverzichtV2 = lazy(() => import("./pages/manager/OverzichtV2"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Laden...</div>}>
          <Routes>
            {/* All pages sharing persistent Sidebar + TopBar */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/personal-dashboard/:userCode" element={<Index />} />
              <Route path="/vergelijking" element={<VergelijkingOverview />} />
              <Route path="/vergelijking/:memberId" element={<Vergelijking />} />
              <Route path="/manager-dashboard" element={<ManagerDashboard />} />
              <Route path="/manager-dashboard/overzicht-v2" element={<ManagerOverzichtV2 />} />
              {/* AcquisitieConversie route removed - merged into Sales Funnel */}
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/emulate" element={<SuperAdminEmulate />} />
              <Route path="/super-admin/c-level" element={<CLevelDashboard />} />
              <Route path="/tv/sales-funnel-week" element={<TVSalesFunnelWeek />} />
              <Route path="/tv/sales-funnel-period" element={<TVSalesFunnelPeriod />} />
              <Route path="/tv/beker" element={<TVBekerDashboard />} />
              <Route path="/tv/gedetacheerden" element={<TVGedetacheerden />} />
              <Route path="/tv/ranglijsten" element={<TVRanglijsten />} />
              <Route path="/tv/heatmap" element={<TVHeatmap />} />
              <Route path="/consultant/geld-bonus" element={<GeldBonus />} />
              <Route path="/consultant/kpi-cockpit" element={<KPICockpit />} />
              <Route path="/consultant/sales-funnel" element={<SalesFunnel />} />
              <Route path="/consultant/next-actions" element={<NextActions />} />
              <Route path="/consultant/gesprekskwaliteit" element={<Gesprekskwaliteit />} />
              <Route path="/consultant/activiteit-resultaat" element={<ActiviteitResultaat />} />
              <Route path="/consultant/benchmarking" element={<Benchmarking />} />
              <Route path="/consultant/kandidaat-first" element={<KandidaatFirst />} />
              <Route path="/consultant/klant-markt" element={<KlantMarkt />} />
              <Route path="/consultant/crm-hygiene" element={<CRMHygiene />} />
              <Route path="/consultant/snelheid" element={<Snelheid />} />
              <Route path="/consultant/forecasting" element={<Forecasting />} />
              <Route path="/consultant/detavast" element={<Detavast />} />
              <Route path="/consultant/skills" element={<SkillsTraining />} />
              <Route path="/consultant/gamification" element={<Gamification />} />
              <Route path="/consultant/alerts" element={<AlertsRisicos />} />
              <Route path="/consultant/match-kwaliteit" element={<MatchKwaliteit />} />
              <Route path="/consultant/route-naar-1" element={<RouteNaar1 />} />
              <Route path="/consultant/extra" element={<ExtraDashboards />} />
              <Route path="/hendrik/overzicht" element={<HendrikOverzicht />} />
              <Route path="/hendrik/mail-voorstellen" element={<HendrikMailVoorstellen />} />
              <Route path="/hendrik/dmu-correctheid" element={<HendrikDMUCorrectheid />} />
              <Route path="/hendrik/conversie-funnel" element={<HendrikConversieFunnel />} />
              <Route path="/hendrik/klacht-risico" element={<HendrikKlachtRisico />} />
              <Route path="/hendrik/opvolging" element={<HendrikOpvolgingHygiene />} />
              <Route path="/hendrik/gamification" element={<HendrikGamificationLevels />} />
              <Route path="/hendrik/uitnodigingen" element={<HendrikUitnodigingenKaart />} />
              <Route path="/hendrik/ai-coach" element={<HendrikAICoachRanking />} />
              <Route path="/hendrik/groeiplan" element={<HendrikGroeiplan />} />
              <Route path="/hendrik/snelheid-salesproces" element={<HendrikSnelheidSalesproces />} />
              <Route path="/hendrik/kandidaat-relatie" element={<HendrikKandidaatRelatie />} />
              <Route path="/hendrik/werkgeluk" element={<HendrikWerkgeluk />} />
              <Route path="/peter-jan/sales-flow" element={<PeterJanSalesFlow />} />
              <Route path="/peter-jan/acquisitie-funnel" element={<PeterJanAcquisitieFunnel />} />
              <Route path="/peter-jan/omzet-dashboard" element={<PeterJanOmzetDashboard />} />
              <Route path="/marketing" element={<MarketingInschrijvingen />} />
              <Route path="/marketing/inschrijvingen" element={<MarketingInschrijvingen />} />
              <Route path="/marketing/vacature-funnel" element={<MarketingVacatureFunnel />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

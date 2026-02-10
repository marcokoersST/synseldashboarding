import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Vergelijking from "./pages/Vergelijking";
import ManagerDashboard from "./pages/ManagerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminEmulate from "./pages/SuperAdminEmulate";
import TVSalesFunnelWeek from "./pages/TVSalesFunnelWeek";
import TVSalesFunnelPeriod from "./pages/TVSalesFunnelPeriod";
import TVBekerDashboard from "./pages/TVBekerDashboard";
import TVGedetacheerden from "./pages/TVGedetacheerden";
import TVRanglijsten from "./pages/TVRanglijsten";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vergelijking/:memberId" element={<Vergelijking />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/emulate" element={<SuperAdminEmulate />} />
          <Route path="/tv/sales-funnel-week" element={<TVSalesFunnelWeek />} />
          <Route path="/tv/sales-funnel-period" element={<TVSalesFunnelPeriod />} />
          <Route path="/tv/beker" element={<TVBekerDashboard />} />
          <Route path="/tv/gedetacheerden" element={<TVGedetacheerden />} />
          <Route path="/tv/ranglijsten" element={<TVRanglijsten />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

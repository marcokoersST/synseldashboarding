import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/marketing-dashboard/components/ui/tooltip";
import MarketingHub from "@/marketing-dashboard/pages/marketing/MarketingHub";
import theme from "./styles-source.tw?dashboard-theme";
import tvStyles from "./tv-layout.css?raw";

const style = document.createElement("style");
style.textContent = theme + tvStyles;
document.head.append(style);
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <TooltipProvider>
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <MarketingHub />
      </main>
    </TooltipProvider>,
  );
}
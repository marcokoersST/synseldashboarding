import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BusinessFooterLine, BusinessNestedProvider, ConceptStrip } from "@/components/business/BusinessPage";
import MijnBusiness from "./MijnBusiness";
import MijnTeam from "./MijnTeam";
import Portefeuille from "./Portefeuille";
import MijnDeals from "./MijnDeals";
import MijnGroeipad from "./MijnGroeipad";
import MijnVerdienvermogen from "./MijnVerdienvermogen";
import MijnDocumenten from "./MijnDocumenten";
import Beheer from "./Beheer";
import Bonusregels from "./Bonusregels";

const TABS = ["business", "team", "route"] as const;
type TabKey = (typeof TABS)[number];

export default function BouwJeEigenBusiness() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab") as TabKey | null;
  const tab: TabKey = raw && TABS.includes(raw) ? raw : "business";

  return (
    <div className="space-y-6">
      <ConceptStrip />
      <BusinessNestedProvider>
      <Tabs
        value={tab}
        onValueChange={(v) => setParams({ tab: v }, { replace: true })}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="business">Mijn business</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="route">Mijn route</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <MijnBusiness />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <MijnTeam />
        </TabsContent>

        <TabsContent value="route" className="space-y-8">
          <Portefeuille />
          <MijnDeals />
          <MijnGroeipad />
          <MijnVerdienvermogen />
          <MijnDocumenten />
          <Accordion type="single" collapsible className="rounded-lg border border-border px-4">
            <AccordionItem value="verantwoording" className="border-none">
              <AccordionTrigger className="text-sm font-semibold">
                Verantwoording: bronnen, rekenregels en bonusblokkades
              </AccordionTrigger>
              <AccordionContent className="space-y-8 pb-6">
                <Beheer />
                <Bonusregels />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
      </BusinessNestedProvider>
      <BusinessFooterLine />
    </div>
  );
}

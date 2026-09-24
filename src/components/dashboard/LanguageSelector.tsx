import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AppLanguage } from "@/lib/translations";

export function LanguageSelector({ collapsed = false }: { collapsed?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="shrink-0" data-no-translate="true">
          <Select value={language} onValueChange={(value) => setLanguage(value as AppLanguage)}>
            <SelectTrigger aria-label="Language" className={collapsed ? "h-7 w-9 border-sidebar-border bg-sidebar-accent px-2 text-[10px] text-sidebar-accent-foreground" : "h-7 w-[52px] border-sidebar-border bg-sidebar-accent px-2 text-[10px] font-semibold text-sidebar-accent-foreground"}>
              {collapsed ? <Languages className="h-3.5 w-3.5" /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="nl">NL</SelectItem>
              <SelectItem value="en">EN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">Language · Taal</TooltipContent>
    </Tooltip>
  );
}
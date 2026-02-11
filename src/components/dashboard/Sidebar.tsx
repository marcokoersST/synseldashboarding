import { 
  LayoutDashboard, 
  LogOut,
  ChevronLeft,
  GitCompare,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Shield,
  Eye,
  BarChart3,
  Monitor,
  Trophy,
  Users,
  TrendingUp,
  ListOrdered
} from "lucide-react";
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  active?: boolean;
  subItems?: { icon: typeof LayoutDashboard; label: string; path: string }[];
}

const navItems: NavItem[] = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/",
    active: true,
    subItems: [
      { icon: GitCompare, label: "Vergelijking", path: "/vergelijking" }
    ]
  },
  {
    icon: BarChart3,
    label: "Consultant",
    path: "/consultant/geld-bonus",
    subItems: [
      { icon: BarChart3, label: "Geld & Bonus", path: "/consultant/geld-bonus" },
      { icon: BarChart3, label: "KPI Cockpit", path: "/consultant/kpi-cockpit" },
      { icon: TrendingUp, label: "Sales Funnel", path: "/consultant/sales-funnel" },
      { icon: BarChart3, label: "Volgende Actie", path: "/consultant/next-actions" },
      { icon: BarChart3, label: "Gesprekskwaliteit", path: "/consultant/gesprekskwaliteit" },
      { icon: BarChart3, label: "Activiteit vs Resultaat", path: "/consultant/activiteit-resultaat" },
      { icon: BarChart3, label: "Benchmarking", path: "/consultant/benchmarking" },
      { icon: Users, label: "Kandidaat-First", path: "/consultant/kandidaat-first" },
      { icon: BarChart3, label: "Klant & Markt", path: "/consultant/klant-markt" },
      { icon: BarChart3, label: "CRM Hygiëne", path: "/consultant/crm-hygiene" },
      { icon: BarChart3, label: "Snelheid", path: "/consultant/snelheid" },
      { icon: TrendingUp, label: "Forecasting", path: "/consultant/forecasting" },
      { icon: Users, label: "Detavast & Retentie", path: "/consultant/detavast" },
      { icon: BarChart3, label: "Skills & Training", path: "/consultant/skills" },
      { icon: Trophy, label: "Gamification", path: "/consultant/gamification" },
      { icon: BarChart3, label: "Alerts & Risico's", path: "/consultant/alerts" },
      { icon: BarChart3, label: "Match Kwaliteit", path: "/consultant/match-kwaliteit" },
      { icon: ListOrdered, label: "Route naar #1", path: "/consultant/route-naar-1" },
      { icon: BarChart3, label: "Extra Dashboards", path: "/consultant/extra" },
    ]
  },
  { 
    icon: Briefcase, 
    label: "Manager Dashboard", 
    path: "/manager-dashboard",
  },
  {
    icon: Shield,
    label: "Super Admin",
    path: "/super-admin",
    subItems: [
      { icon: BarChart3, label: "Overzicht", path: "/super-admin" },
      { icon: Eye, label: "User Emulatie", path: "/super-admin/emulate" },
    ]
  },
  {
    icon: Monitor,
    label: "TV Dashboards",
    path: "/tv/sales-funnel-week",
    subItems: [
      { icon: TrendingUp, label: "Sales Funnel (Week)", path: "/tv/sales-funnel-week" },
      { icon: BarChart3, label: "Sales Funnel (Periode)", path: "/tv/sales-funnel-period" },
      { icon: Trophy, label: "Beker Dashboard", path: "/tv/beker" },
      { icon: Users, label: "Gedetacheerden", path: "/tv/gedetacheerden" },
      { icon: ListOrdered, label: "Ranglijsten", path: "/tv/ranglijsten" },
    ]
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [manuallyCollapsed, setManuallyCollapsed] = useState<string[]>([]);
  const savedExpandedRef = useRef<{ expanded: string[]; manual: string[] }>({ expanded: [], manual: [] });

  const isOnComparisonPage = location.pathname.startsWith("/vergelijking");
  const isOnSuperAdminPage = location.pathname.startsWith("/super-admin");
  const isOnTVPage = location.pathname.startsWith("/tv/");
  const isOnConsultantPage = location.pathname.startsWith("/consultant/");
  
  const autoExpanded = [
    ...(isOnComparisonPage ? ["/"] : []),
    ...(isOnSuperAdminPage ? ["/super-admin"] : []),
    ...(isOnTVPage ? ["/tv/sales-funnel-week"] : []),
    ...(isOnConsultantPage ? ["/consultant/geld-bonus"] : []),
  ].filter(path => !manuallyCollapsed.includes(path));

  const effectiveExpandedItems = [
    ...expandedItems,
    ...autoExpanded,
  ].filter((v, i, a) => a.indexOf(v) === i);

  const handleToggleCollapse = () => {
    if (!isCollapsed) {
      savedExpandedRef.current = { expanded: expandedItems, manual: manuallyCollapsed };
    } else {
      setExpandedItems(savedExpandedRef.current.expanded);
      setManuallyCollapsed(savedExpandedRef.current.manual);
    }
    onToggleCollapse();
  };

  const handleNavClick = (item: NavItem) => {
    if (item.subItems && item.subItems.length > 0 && !isCollapsed) {
      const isExpanded = effectiveExpandedItems.includes(item.path);
      if (isExpanded) {
        setExpandedItems(prev => prev.filter(p => p !== item.path));
        setManuallyCollapsed(prev => prev.includes(item.path) ? prev : [...prev, item.path]);
      } else {
        setExpandedItems(prev => [...prev, item.path]);
        setManuallyCollapsed(prev => prev.filter(p => p !== item.path));
      }
    }
    navigate(item.path);
  };

  const isSubItemActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navButton = (item: NavItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = effectiveExpandedItems.includes(item.path);

    return (
      <button
        onClick={() => handleNavClick(item)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
          isCollapsed && "justify-center px-2",
          item.active 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left min-w-0 truncate">{item.label}</span>
            {hasSubItems && (
              <span className="p-0.5 shrink-0">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className={cn("p-6 flex items-center gap-3", isCollapsed && "justify-center p-4")}>
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">S</span>
          </div>
          {!isCollapsed && <span className="text-sidebar-accent-foreground font-semibold text-lg whitespace-nowrap">Synsel AI</span>}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto overflow-x-hidden scrollbar-thin overscroll-contain">
          <div className="space-y-1">
            {navItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = effectiveExpandedItems.includes(item.path);
              
              return (
                <div key={item.label}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {navButton(item)}
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    navButton(item)
                  )}
                  
                  {/* Sub Items - only show when expanded AND not collapsed */}
                  {hasSubItems && isExpanded && !isCollapsed && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                      {item.subItems!.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = isSubItemActive(subItem.path);
                        
                        return (
                          <button
                            key={subItem.path}
                            onClick={() => navigate(subItem.path)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap overflow-hidden",
                              subActive 
                                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <SubIcon className="w-4 h-4 shrink-0" />
                            <span className="min-w-0 truncate">{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer",
            isCollapsed && "justify-center p-1"
          )}>
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-accent-foreground truncate">Jouw naam</p>
                  <p className="text-xs text-sidebar-foreground truncate">Recruitment Consultant</p>
                </div>
                <LogOut className="w-4 h-4 text-sidebar-foreground shrink-0" />
              </>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button 
          onClick={handleToggleCollapse}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center hover:bg-sidebar-accent/80 transition-all"
        >
          <ChevronLeft className={cn("w-4 h-4 text-sidebar-foreground transition-transform duration-300", isCollapsed && "rotate-180")} />
        </button>
      </aside>
    </TooltipProvider>
  );
}

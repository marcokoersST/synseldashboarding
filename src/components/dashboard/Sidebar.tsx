import { 
  LayoutDashboard, 
  Users, 
  Mic, 
  Mail, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Kandidaten", active: false },
  { icon: Mic, label: "Gespreksopnames", active: false },
  { icon: Mail, label: "Voorstel emails", active: false },
  { icon: MessageSquare, label: "Chat", active: false },
];

const settingsItems = [
  { icon: Settings, label: "Instellingen" },
  { icon: HelpCircle, label: "Support" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <span className="text-sidebar-primary-foreground font-bold text-sm">S</span>
        </div>
        <span className="text-sidebar-accent-foreground font-semibold text-lg">Synsel AI</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Section */}
        <div className="mt-8">
          <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Instellingen
          </p>
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
          <Avatar className="w-9 h-9">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">Jouw naam</p>
            <p className="text-xs text-sidebar-foreground truncate">Recruitment Consultant</p>
          </div>
          <LogOut className="w-4 h-4 text-sidebar-foreground" />
        </div>
      </div>

      {/* Collapse Button */}
      <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center hover:bg-sidebar-accent/80 transition-colors">
        <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
      </button>
    </aside>
  );
}

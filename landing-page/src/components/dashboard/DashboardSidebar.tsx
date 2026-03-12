import { Shield, LayoutDashboard, Brain, Activity } from "lucide-react";
import type { DashboardPage } from "@/pages/Dashboard";

const navItems: { id: DashboardPage; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "scam-intelligence", label: "Scam Intelligence", icon: Brain },
  { id: "system-health", label: "System Health", icon: Activity },
];

interface Props {
  activePage: DashboardPage;
  onNavigate: (page: DashboardPage) => void;
  collapsed?: boolean;
}

const DashboardSidebar = ({ activePage, onNavigate, collapsed = false }: Props) => {
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 flex flex-col bg-white transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}
      style={{ borderRight: "1px solid #e0eeeb" }}
    >
      <div className={`flex items-center gap-2.5 py-6 ${collapsed ? "justify-center px-2" : "px-5"}`}>
        <Shield className="w-7 h-7 flex-shrink-0" style={{ color: "#00e5b0" }} />
        {!collapsed && <span className="font-bold text-lg" style={{ color: "#111111" }}>ScamBuster</span>}
      </div>

      <nav className="flex-1 mt-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${collapsed ? "justify-center px-0" : "px-3"}`}
              style={{
                background: active ? "#e8f5f0" : "transparent",
                borderLeft: active ? "3px solid #00e5b0" : "3px solid transparent",
                color: active ? "#00e5b0" : "#555555",
              }}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      <div className={`py-4 text-xs ${collapsed ? "text-center px-1" : "px-5"}`} style={{ color: "#555555" }}>
        {collapsed ? "©" : `© ${new Date().getFullYear()} ScamBuster`}
      </div>
    </aside>
  );
};

export default DashboardSidebar;

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewPage from "@/components/dashboard/OverviewPage";
import ScamIntelligencePage from "@/components/dashboard/ScamIntelligencePage";
import SystemHealthPage from "@/components/dashboard/SystemHealthPage";
import { useIsMobile } from "@/hooks/use-mobile";

export type DashboardPage = "overview" | "scam-intelligence" | "system-health";

const pageTitles: Record<DashboardPage, string> = {
  overview: "Overview",
  "scam-intelligence": "Scam Intelligence",
  "system-health": "System Health",
};

const DESKTOP_MIN = 1024;

const Dashboard = () => {
  const [activePage, setActivePage] = useState<DashboardPage>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < DESKTOP_MIN);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarCollapsed = isTablet;
  const showSidebar = !isMobile;
  const sidebarWidth = isMobile ? 0 : isTablet ? 64 : 240;

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#f5f9f8", color: "#111111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {showSidebar && (
        <DashboardSidebar activePage={activePage} onNavigate={setActivePage} collapsed={sidebarCollapsed} />
      )}

      {isMobile && drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-60 h-full bg-white shadow-xl z-10 flex flex-col" style={{ borderRight: "1px solid #e0eeeb" }}>
            <div className="flex items-center justify-between px-5 py-6">
              <div className="flex items-center gap-2.5">
                <Shield className="w-7 h-7" style={{ color: "#00e5b0" }} />
                <span className="font-bold text-lg" style={{ color: "#111111" }}>ScamBuster</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ color: "#555555" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 mt-4 space-y-1 px-2">
              {(["overview", "scam-intelligence", "system-health"] as DashboardPage[]).map((id) => {
                const active = activePage === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setActivePage(id); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: active ? "#e8f5f0" : "transparent",
                      borderLeft: active ? "3px solid #00e5b0" : "3px solid transparent",
                      color: active ? "#00e5b0" : "#555555",
                    }}
                  >
                    {pageTitles[id]}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarWidth }}>
        <DashboardHeader
          title={pageTitles[activePage]}
          showMenu={isMobile}
          onMenuClick={() => setDrawerOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activePage === "overview" && <OverviewPage />}
          {activePage === "scam-intelligence" && <ScamIntelligencePage />}
          {activePage === "system-health" && <SystemHealthPage />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

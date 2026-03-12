import { ScanLine, ShieldAlert, Users, Gauge, Circle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardKPICard from "./DashboardKPICard";
import { last30DaysScans, riskDistribution } from "./dashboardData";
import { useScamData } from "@/hooks/useScamData";

const riskColorMap: Record<string, string> = {
  SAFE: "#00e5b0",
  SUSPICIOUS: "#F9E300",
  "LIKELY SCAM": "#ffd166",
  "DEFINITE SCAM": "#ED2939"
};

const totalToday = riskDistribution.reduce((s, r) => s + r.value, 0);

const tooltipStyle = { background: "#ffffff", border: "1px solid #e0eeeb", borderRadius: 8, color: "#111111" };

const OverviewPage = () => {
  const { data, loading, error } = useScamData();

  const scamsDetected = data ? data.filter(e => e.score >= 79).length : 0;
  const scamsDetectedRate = data && data.length > 0 ? ((scamsDetected / data.length) * 100).toFixed(1) + "%" : "0.0%";
  
  const avgRiskScore = data && data.length > 0 ? (data.reduce((sum, e) => sum + e.score, 0) / data.length) : 0;
  const avgRiskScoreColor = avgRiskScore > 75 ? "#ED2939" : "#00e5b0";

  const dynamicRiskDistribution = ['SAFE', 'SUSPICIOUS', 'LIKELY SCAM', 'DEFINITE SCAM'].map(label => ({
    label,
    count: data ? data.filter(e => e.riskLabel === label).length : 0,
    color: riskColorMap[label]
  }));

  const totalEntries = data ? data.length : 0;

  const liveScans = data ? [...data].sort((a, b) => b.createdDate - a.createdDate).slice(0, 10) : [];

  const formatTimeAgo = (createdDate: number) => {
    const mins = Math.floor((Date.now() - createdDate) / 60000);
    if (mins < 60) return `${mins} mins ago`;
    return `${Math.floor(mins / 60)} hours ago`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard title="Total Scans Today" value={totalToday.toLocaleString()} icon={ScanLine} trend="↑ 12% vs yesterday" trendColor="#00e5b0" />
        <DashboardKPICard 
          title="Scams Detected" 
          value={scamsDetected} 
          icon={ShieldAlert} 
          iconColor="#ED2939" 
          trend={`${scamsDetectedRate} of total`} 
          trendColor="#ED2939" 
          accentBorderColor="#ED2939" 
          loading={loading}
          error={error}
        />
        <DashboardKPICard title="Active Users" value="1,247" icon={Users} trend="↑ 89 new today" trendColor="#00e5b0" />
        <DashboardKPICard 
          title="Avg Risk Score" 
          value={avgRiskScore.toFixed(1)} 
          icon={Gauge} 
          iconColor={avgRiskScoreColor}
          trend={avgRiskScore > 75 ? "Above threshold" : "Below threshold"} 
          trendColor={avgRiskScoreColor} 
          accentBorderColor={avgRiskScoreColor} 
          loading={loading}
          error={error}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Line Chart 60% */}
        <div className="lg:col-span-3 rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#111111" }}>Scans vs Scams — Last 30 Days</h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30DaysScans}>
                <CartesianGrid stroke="#e0eeeb" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#555555", fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: "#555555", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="totalScans" stroke="#00e5b0" strokeWidth={2} dot={false} name="Total Scans" />
                <Line type="monotone" dataKey="scamsDetected" stroke="#ED2939" strokeWidth={2} dot={false} name="Scams Detected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut 40% */}
        <div className="lg:col-span-2 rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#111111" }}>Risk Level Distribution Today</h3>
          <div className="w-full h-[240px] relative">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center font-bold text-[#ED2939]">Failed to load data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dynamicRiskDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="count" paddingAngle={3}>
                      {dynamicRiskDistribution.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold tabular-nums" style={{ color: "#111111" }}>{totalEntries}</span>
                </div>
              </>
            )}
          </div>
          {!loading && !error && (
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {dynamicRiskDistribution.map((r) => (
                <div key={r.label} className="flex items-center gap-1.5 text-xs" style={{ color: "#555555" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                  {r.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Scan Feed */}
      <div className="rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "#111111" }}>Recent Scans</h3>
          <span className="flex items-center gap-1 text-xs" style={{ color: "#00e5b0" }}>
            <Circle className="w-2 h-2 animate-pulse fill-current" />
            Live
          </span>
        </div>
        <div className="space-y-1 max-h-[340px] overflow-auto min-h-[100px]">
          {loading ? (
            <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded" />
          ) : error ? (
            <div className="w-full h-[200px] flex items-center justify-center font-bold text-[#ED2939]">Failed to load data</div>
          ) : (
            liveScans.map((scan, i) => (
              <div
                key={scan.id}
                className="flex items-center gap-4 px-4 py-3 rounded-lg transition-colors"
                style={{ background: i % 2 === 0 ? "#f5f9f8" : "#ffffff" }}
              >
                <span className="font-mono text-sm flex-1" style={{ color: "#111111" }}>{scan.domain}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums" style={{ background: scan.riskColor, color: scan.riskLabel === "SAFE" || scan.riskLabel === "SUSPICIOUS" || scan.riskLabel === "LIKELY SCAM" ? "#0a1412" : "#ffffff" }}>{scan.score}</span>
                <span className="text-xs w-28 hidden sm:block truncate" style={{ color: "#555555" }}>{scan.scamType}</span>
                <span className="text-xs w-20 text-right hidden sm:block" style={{ color: "#555555" }}>{formatTimeAgo(scan.createdDate)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

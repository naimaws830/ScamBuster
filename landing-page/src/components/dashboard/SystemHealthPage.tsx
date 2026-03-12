import { Wifi, Clock, Brain, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import DashboardKPICard from "./DashboardKPICard";
import { responseTimeLast24h, errorRateLast7d } from "./dashboardData";
import { useScamData } from "@/hooks/useScamData";

const tooltipStyle = { background: "#ffffff", border: "1px solid #e0eeeb", borderRadius: 8, color: "#111111" };

const SystemHealthPage = () => {
  const { data, loading, error } = useScamData();

  const uptime = 99.7;
  
  const totalEntries = data ? data.length : 0;
  
  const avgResponse = totalEntries > 0 
    ? data.reduce((sum, e) => sum + e.responseTimeMs, 0) / totalEntries / 1000 
    : 0;
    
  const aiSuccess = totalEntries > 0 
    ? (data.filter(e => e.aiSuccess).length / totalEntries) * 100 
    : 0;
    
  const fallbackRate = totalEntries > 0 
    ? (data.filter(e => e.usedFallback).length / totalEntries) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard
          title="API Uptime"
          value={`${uptime}%`}
          icon={Wifi}
          iconColor={uptime >= 99 ? "#00e5b0" : "#ED2939"}
          trend="Last 30 days"
          trendColor={uptime >= 99 ? "#00e5b0" : "#ED2939"}
          accentBorderColor={uptime >= 99 ? "#00e5b0" : "#ED2939"}
        />
        <DashboardKPICard
          title="Avg Response Time"
          value={`${avgResponse.toFixed(2)}s`}
          icon={Clock}
          iconColor={avgResponse < 2 ? "#00e5b0" : avgResponse < 4 ? "#F9E300" : "#ED2939"}
          trend="Per scan request"
          trendColor={avgResponse < 2 ? "#00e5b0" : avgResponse < 4 ? "#F9E300" : "#ED2939"}
          accentBorderColor={avgResponse < 2 ? "#00e5b0" : avgResponse < 4 ? "#F9E300" : "#ED2939"}
          loading={loading}
          error={error}
        />
        <DashboardKPICard
          title="AI Success Rate"
          value={`${aiSuccess.toFixed(1)}%`}
          icon={Brain}
          iconColor="#00e5b0"
          trend="Valid JSON responses"
          trendColor="#00e5b0"
          loading={loading}
          error={error}
        />
        <DashboardKPICard
          title="Fallback Rate"
          value={`${fallbackRate.toFixed(1)}%`}
          icon={AlertTriangle}
          iconColor={fallbackRate > 10 ? "#F9E300" : "#555555"}
          trend={fallbackRate > 10 ? "⚠ Above threshold" : "Normal"}
          trendColor={fallbackRate > 10 ? "#ED2939" : "#555555"}
          accentBorderColor={fallbackRate > 10 ? "#F9E300" : "#00e5b0"}
          loading={loading}
          error={error}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Response Time */}
        <div className="rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#111111" }}>API Response Time — Last 24 Hours</h3>
          <div className="w-full h-[300px]">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center font-bold text-[#ED2939]">Failed to load data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeLast24h}>
                  <CartesianGrid stroke="#e0eeeb" strokeDasharray="3 3" />
                  <ReferenceArea y1={0} y2={2000} fill="#00e5b0" fillOpacity={0.04} />
                  <ReferenceArea y1={2000} y2={4000} fill="#F9E300" fillOpacity={0.04} />
                  <ReferenceArea y1={4000} y2={5000} fill="#ED2939" fillOpacity={0.04} />
                  <XAxis dataKey="hour" tick={{ fill: "#555555", fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: "#555555", fontSize: 10 }} unit="ms" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="total" stroke="#00e5b0" strokeWidth={2} dot={false} name="Total" />
                  <Line type="monotone" dataKey="ai" stroke="#003399" strokeWidth={2} dot={false} name="AI Only" />
                  <Line type="monotone" dataKey="whois" stroke="#F9E300" strokeWidth={2} dot={false} name="WHOIS Only" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Error Rate */}
        <div className="rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#111111" }}>Error Rate — Last 7 Days</h3>
          <div className="w-full h-[300px]">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center font-bold text-[#ED2939]">Failed to load data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={errorRateLast7d}>
                  <CartesianGrid stroke="#e0eeeb" strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: "#555555", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#555555", fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="aiTimeouts" stroke="#ED2939" strokeWidth={2} dot={false} name="AI Timeouts" />
                  <Line type="monotone" dataKey="invalidJson" stroke="#ffd166" strokeWidth={2} dot={false} name="Invalid JSON" />
                  <Line type="monotone" dataKey="whoisFailures" stroke="#F9E300" strokeWidth={2} dot={false} name="WHOIS Failures" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPage;

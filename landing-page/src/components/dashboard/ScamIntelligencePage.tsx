import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle } from "lucide-react";
import { useScamData } from "@/hooks/useScamData";
import { Slider } from "@/components/ui/slider";

const tooltipStyle = { background: "#ffffff", border: "1px solid #e0eeeb", borderRadius: 8, color: "#111111" };

const COLORS = ["#ED2939", "#ffd166", "#F9E300", "#003399", "#00e5b0", "#8e44ad", "#2980b9", "#27ae60", "#e67e22", "#d35400"];

const getScoreColor = (s: number) => (s >= 79 ? "#ED2939" : s >= 56 ? "#ffd166" : s >= 26 ? "#F9E300" : "#00e5b0");

const ScamIntelligencePage = () => {
  const { data, loading, error } = useScamData();
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [scoreRange, setScoreRange] = useState<number[]>([0, 100]);

  const scamTypes = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(e => e.scamType)));
  }, [data]);

  const scamTypeData = useMemo(() => {
    if (!data) return [];
    return scamTypes
      .map((type, i) => ({
        type,
        count: data.filter(e => e.scamType === type).length,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count);
  }, [scamTypes, data]);

  const detectionMethodData = useMemo(() => {
    if (!data) return [];
    return ['AI', 'Keyword Fallback'].map((method, i) => ({
      method,
      count: data.filter(e => e.detectionMethod === method).length,
      color: method === 'AI' ? "#00e5b0" : "#F9E300"
    }));
  }, [data]);

  const fallbackCount = detectionMethodData.find(d => d.method === 'Keyword Fallback')?.count || 0;
  const totalEntries = data ? data.length : 0;
  const fallbackPct = totalEntries > 0 ? (fallbackCount / totalEntries) * 100 : 0;

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => {
      if (typeFilter !== "All" && row.scamType !== typeFilter) return false;
      if (row.score < scoreRange[0] || row.score > scoreRange[1]) return false;
      return true;
    });
  }, [data, typeFilter, scoreRange]);

  const renderPlaceholder = () => {
    if (loading) return <div className="w-full h-[280px] bg-gray-200 animate-pulse rounded" />;
    if (error) return <div className="w-full h-[280px] flex items-center justify-center font-bold text-[#ED2939]">Failed to load data</div>;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-3 rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#111111" }}>Scam Type Breakdown</h3>
          <div className="w-full h-[280px]">
            {renderPlaceholder() || (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scamTypeData} layout="vertical">
                  <XAxis type="number" tick={{ fill: "#555555", fontSize: 10 }} />
                  <YAxis type="category" dataKey="type" tick={{ fill: "#555555", fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {scamTypeData.map((entry) => (
                      <Cell key={entry.type} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detection Method Donut */}
        <div className="lg:col-span-2 rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#111111" }}>Detection Method</h3>
          <div className="w-full h-[220px]">
            {loading ? <div className="w-full h-full bg-gray-200 animate-pulse rounded" /> : error ? <div className="w-full h-full flex items-center justify-center font-bold text-[#ED2939]">Failed to load data</div> : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={detectionMethodData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" paddingAngle={3}>
                      {detectionMethodData.map((entry) => (
                        <Cell key={entry.method} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
          {!loading && !error && (
            <>
              <div className="flex justify-center gap-4 mt-2">
                {detectionMethodData.map((d) => (
                  <div key={d.method} className="flex items-center gap-1.5 text-xs" style={{ color: "#555555" }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.method} ({totalEntries > 0 ? ((d.count / totalEntries) * 100).toFixed(1) : 0}%)
                  </div>
                ))}
              </div>
              {fallbackPct > 10 && (
                <div className="flex items-center gap-2 mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(237,41,57,0.08)", color: "#ED2939" }}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Fallback rate exceeds 10% — AI model may need retraining
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scam Site Database */}
      <div className="rounded-xl p-5 bg-white" style={{ border: "1px solid #e0eeeb" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "#111111" }}>Scam Site Database</h3>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm font-medium focus:outline-none"
            style={{ background: "#f5f9f8", border: "1px solid #e0eeeb", color: "#111111" }}
            onFocus={(e) => (e.target.style.borderColor = "#00e5b0")}
            onBlur={(e) => (e.target.style.borderColor = "#e0eeeb")}
            disabled={loading || !!error}
          >
            <option value="All">All Types</option>
            {scamTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-xs" style={{ color: "#555555" }}>Score: {scoreRange[0]}–{scoreRange[1]}</span>
            <Slider
              min={0}
              max={100}
              step={1}
              value={scoreRange}
              onValueChange={setScoreRange}
              disabled={loading || !!error}
              className="flex-1 [&_[data-radix-slider-track]]:bg-[#e0eeeb] [&_[data-radix-slider-range]]:bg-[#00e5b0] [&_[data-radix-slider-thumb]]:bg-[#00e5b0] [&_[data-radix-slider-thumb]]:border-[#00e5b0]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto rounded-lg min-h-[200px]">
          {loading ? (
            <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded" />
          ) : error ? (
             <div className="w-full h-[200px] flex items-center justify-center font-bold text-[#ED2939]">Failed to load data</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f5f9f8" }}>
                  {["Domain", "First Seen", "Avg Score", "Scam Type", "Times Scanned"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider sticky top-0" style={{ color: "#00e5b0", background: "#f5f9f8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const sColor = scamTypeData.find(d => d.type === row.scamType)?.color || "#00e5b0";
                  return (
                    <tr
                      key={row.id}
                      className="transition-all group"
                      style={{ background: i % 2 === 0 ? "#f5f9f8" : "#ffffff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderLeft = "3px solid #003399")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderLeft = "3px solid transparent")}
                    >
                      <td className="px-4 py-3 font-mono" style={{ color: "#111111" }}>{row.domain}</td>
                      <td className="px-4 py-3" style={{ color: "#555555" }}>{row.firstSeen}</td>
                      <td className="px-4 py-3 font-bold tabular-nums" style={{ color: getScoreColor(row.score) }}>{row.score}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: sColor,
                            color: "#fff",
                          }}
                        >
                          {row.scamType}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums" style={{ color: "#111111" }}>{row.timesScanned}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScamIntelligencePage;

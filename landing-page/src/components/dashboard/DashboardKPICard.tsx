import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;
  trendColor?: string;
  accentBorderColor?: string;
  loading?: boolean;
  error?: string | null;
}

const DashboardKPICard = ({ title, value, icon: Icon, iconColor = "#00e5b0", trend, trendColor = "#00e5b0", accentBorderColor = "#00e5b0", loading, error }: Props) => {
  if (error) {
    return (
      <div
        className="rounded-xl p-5 flex items-center justify-center bg-white"
        style={{
          border: "1px solid #e0eeeb",
          borderTop: `3px solid #ED2939`,
          boxShadow: "0 2px 10px rgba(0,51,153,0.04)",
          minHeight: "138px"
        }}
      >
        <span className="font-bold whitespace-nowrap" style={{ color: "#ED2939" }}>Failed to load data</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="rounded-xl p-5 flex flex-col gap-3 bg-white"
        style={{
          border: "1px solid #e0eeeb",
          borderTop: `3px solid #e0eeeb`,
          boxShadow: "0 2px 10px rgba(0,51,153,0.04)",
          minHeight: "138px"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-5 h-5 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
  <div
    className="rounded-xl p-5 flex flex-col gap-3 bg-white"
    style={{
      border: "1px solid #e0eeeb",
      borderTop: `3px solid ${accentBorderColor}`,
      boxShadow: "0 2px 10px rgba(0,51,153,0.04)",
    }}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#555555" }}>{title}</span>
      <Icon className="w-5 h-5" style={{ color: iconColor }} />
    </div>
    <p className="text-3xl font-bold tabular-nums" style={{ color: "#111111" }}>{value}</p>
    {trend && (
      <span className="text-xs font-medium" style={{ color: trendColor }}>{trend}</span>
    )}
  </div>
  );
};

export default DashboardKPICard;

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

interface Props {
  title: string;
  onMenuClick?: () => void;
  showMenu?: boolean;
}

const DashboardHeader = ({ title, onMenuClick, showMenu = false }: Props) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-4 bg-white"
      style={{ borderBottom: "1px solid #e0eeeb" }}
    >
      <div className="flex items-center gap-3">
        {showMenu && (
          <button onClick={onMenuClick} className="p-1.5 rounded-lg hover:bg-[#e8f5f0] transition-colors" style={{ color: "#111111" }}>
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-bold" style={{ color: "#111111" }}>{title}</h1>
      </div>
      <div className="text-sm font-medium hidden sm:block" style={{ color: "#555555" }}>
        {now.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
        {" · "}
        {now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
    </header>
  );
};

export default DashboardHeader;

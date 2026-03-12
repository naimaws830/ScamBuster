import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LoginModal = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-8"
        style={{ background: "#0a1412", borderTop: "3px solid #00e5b0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-[#8a9e9a] hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <Shield className="w-10 h-10" style={{ color: "#00e5b0" }} />
        </div>

        <h2 className="text-center text-xl font-bold text-white mb-8">Login to ScamBuster</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8a9e9a] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#8a9e9a] focus:outline-none focus:ring-2"
              style={{ background: "#1a3a32", borderColor: "transparent" }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #00e5b0")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8a9e9a] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#8a9e9a] focus:outline-none focus:ring-2"
              style={{ background: "#1a3a32", borderColor: "transparent" }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #00e5b0")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-bold text-base py-6 mt-2"
            style={{ background: "#00e5b0", color: "#0a1412" }}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

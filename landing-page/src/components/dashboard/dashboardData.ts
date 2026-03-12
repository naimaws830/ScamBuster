// Mock data for dashboard

export const last30DaysScans = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 29 + i);
  const totalScans = Math.floor(800 + Math.random() * 600);
  const scamsDetected = Math.floor(totalScans * (0.12 + Math.random() * 0.1));
  return {
    date: d.toLocaleDateString("en-MY", { day: "2-digit", month: "short" }),
    totalScans,
    scamsDetected,
  };
});

export const riskDistribution = [
  { name: "Safe", value: 412, color: "#00e5b0" },
  { name: "Suspicious", value: 89, color: "#F9E300" },
  { name: "Likely Scam", value: 54, color: "#ffd166" },
  { name: "Definite Scam", value: 31, color: "#ED2939" },
];

export const recentScans = [
  { domain: "goldprime-invest.my", score: 92, type: "MLM", time: "12s ago" },
  { domain: "amanah-saham.com", score: 15, type: "Legitimate", time: "45s ago" },
  { domain: "forex-genius.com.my", score: 78, type: "Forex", time: "1m ago" },
  { domain: "crypto-moon-profit.net", score: 88, type: "Crypto", time: "2m ago" },
  { domain: "bursamalaysia.com", score: 8, type: "Legitimate", time: "3m ago" },
  { domain: "pelaburan-tetap.biz", score: 65, type: "Fake Platform", time: "4m ago" },
  { domain: "sc-malaysia-licensed.xyz", score: 95, type: "Phishing", time: "5m ago" },
  { domain: "maybank2u.com.my", score: 5, type: "Legitimate", time: "6m ago" },
  { domain: "high-return-fx.com", score: 81, type: "Forex", time: "7m ago" },
  { domain: "clickpay-invest.my", score: 72, type: "MLM", time: "8m ago" },
];

export const scamTypeBreakdown = [
  { type: "MLM", count: 142, color: "#ED2939" },
  { type: "Forex", count: 98, color: "#ffd166" },
  { type: "Crypto", count: 76, color: "#F9E300" },
  { type: "Phishing", count: 45, color: "#003399" },
  { type: "Fake Platform", count: 31, color: "#00e5b0" },
];

export const detectionMethod = [
  { name: "AI Primary", value: 87, color: "#00e5b0" },
  { name: "Keyword Fallback", value: 13, color: "#F9E300" },
];

export const scamSiteDatabase = [
  { domain: "goldprime-invest.my", firstSeen: "2024-11-02", avgScore: 92, scamType: "MLM" as const, timesScanned: 347, scListed: true },
  { domain: "forex-genius.com.my", firstSeen: "2024-09-15", avgScore: 78, scamType: "Forex" as const, timesScanned: 214, scListed: false },
  { domain: "crypto-moon-profit.net", firstSeen: "2024-12-01", avgScore: 88, scamType: "Crypto" as const, timesScanned: 189, scListed: true },
  { domain: "sc-malaysia-licensed.xyz", firstSeen: "2025-01-10", avgScore: 95, scamType: "Phishing" as const, timesScanned: 412, scListed: true },
  { domain: "clickpay-invest.my", firstSeen: "2024-08-20", avgScore: 72, scamType: "MLM" as const, timesScanned: 156, scListed: false },
  { domain: "pelaburan-tetap.biz", firstSeen: "2024-10-05", avgScore: 65, scamType: "Fake Platform" as const, timesScanned: 98, scListed: false },
  { domain: "high-return-fx.com", firstSeen: "2024-07-12", avgScore: 81, scamType: "Forex" as const, timesScanned: 267, scListed: true },
  { domain: "emas-digital.org", firstSeen: "2025-02-01", avgScore: 48, scamType: "Crypto" as const, timesScanned: 54, scListed: false },
];

export const responseTimeLast24h = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  total: 800 + Math.floor(Math.random() * 1200),
  ai: 500 + Math.floor(Math.random() * 800),
  whois: 200 + Math.floor(Math.random() * 400),
}));

export const errorRateLast7d = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 6 + i);
  return {
    day: d.toLocaleDateString("en-MY", { weekday: "short" }),
    aiTimeouts: Math.floor(Math.random() * 8),
    invalidJson: Math.floor(Math.random() * 5),
    whoisFailures: Math.floor(Math.random() * 6),
  };
});

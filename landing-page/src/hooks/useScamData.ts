import { useState, useEffect } from "react";

export interface ScamEntry {
  id: string;
  createdDate: number;
  domain: string;
  firstSeen: string;
  score: number;
  riskLabel: "SAFE" | "SUSPICIOUS" | "LIKELY SCAM" | "DEFINITE SCAM";
  riskColor: string;
  scamType: string;
  timesScanned: number;
  detectionMethod: string;
  aiSuccess: boolean;
  usedFallback: boolean;
  responseTimeMs: number;
  errorType: string | null;
}

export function useScamData() {
  const [data, setData] = useState<ScamEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const response = await fetch(import.meta.env.VITE_API_ENDPOINT);
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        const json = await response.json();

        if (isMounted) {
          const parsedData = json.content.map((entry: any) => {
            const score = entry.data.score;
            let riskLabel: ScamEntry["riskLabel"] = "SAFE";
            let riskColor = "#00e5b0";

            if (score <= 25) {
              riskLabel = "SAFE";
              riskColor = "#00e5b0";
            } else if (score <= 55) {
              riskLabel = "SUSPICIOUS";
              riskColor = "#F9E300";
            } else if (score <= 78) {
              riskLabel = "LIKELY SCAM";
              riskColor = "#ffd166";
            } else {
              riskLabel = "DEFINITE SCAM";
              riskColor = "#ED2939";
            }

            return {
              id: entry.id,
              createdDate: entry.createdDate,
              domain: entry.data.domain,
              firstSeen: new Date(entry.data.first_seen).toLocaleDateString("en-MY"),
              score,
              riskLabel,
              riskColor,
              scamType: entry.data.scam_type.code,
              timesScanned: entry.data.times_scanned,
              detectionMethod: entry.data.detection_method.code,
              aiSuccess: entry.data.ai_success.code === "Yes",
              usedFallback: entry.data.used_fallback.code === "Yes",
              responseTimeMs: entry.data.response_time__ms,
              errorType: entry.data.error_type?.code || null,
            };
          });

          setData(parsedData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load data");
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

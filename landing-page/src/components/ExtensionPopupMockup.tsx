import { Shield, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  variant: "safe" | "danger";
}

const ExtensionPopupMockup = ({ variant }: Props) => {
  const isDanger = variant === "danger";

  return (
    <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-float">
      {/* Chrome extension header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-sans font-bold text-sm text-foreground">ScamBuster</span>
        <span className="ml-auto text-xs text-muted-foreground">v2.1</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Verdict */}
        <div className={`flex items-center gap-3 p-4 rounded-xl ${isDanger ? "bg-destructive/10" : "bg-light-tint"}`}>
          {isDanger ? (
            <ShieldAlert className="w-8 h-8 text-destructive flex-shrink-0" />
          ) : (
            <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" />
          )}
          <div>
            <p className={`font-bold text-sm ${isDanger ? "text-destructive" : "text-primary"}`}>
              {isDanger ? "⚠️ High Risk — Likely Scam" : "✅ Low Risk — Appears Safe"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isDanger ? "Multiple red flags detected" : "No scam indicators found"}
            </p>
          </div>
        </div>

        {/* Evidence */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Evidence</p>
          {isDanger ? (
            <>
              <EvidenceRow icon={<AlertTriangle className="w-3.5 h-3.5 text-warning" />} text={'"Guaranteed 30% monthly returns"'} />
              <EvidenceRow icon={<AlertTriangle className="w-3.5 h-3.5 text-warning" />} text='"No risk investment opportunity"' />
              <EvidenceRow icon={<AlertTriangle className="w-3.5 h-3.5 text-destructive" />} text="Domain registered 14 days ago" />
            </>
          ) : (
            <>
              <EvidenceRow icon={<CheckCircle className="w-3.5 h-3.5 text-primary" />} text="Licensed by SC Malaysia" />
              <EvidenceRow icon={<CheckCircle className="w-3.5 h-3.5 text-primary" />} text="Domain age: 8 years" />
              <EvidenceRow icon={<CheckCircle className="w-3.5 h-3.5 text-primary" />} text="No scam language detected" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EvidenceRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card rounded-lg px-3 py-2">
    <span className="mt-0.5 flex-shrink-0">{icon}</span>
    <span>{text}</span>
  </div>
);

export default ExtensionPopupMockup;

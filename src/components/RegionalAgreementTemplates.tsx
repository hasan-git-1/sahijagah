import { useState } from "react";
import { FileText, Download, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const templates: Record<string, { name: string; clauses: string[]; stampDuty: string; regFee: string }> = {
  "Maharashtra": {
    name: "Maharashtra Rent Agreement",
    clauses: ["Leave & License format mandatory", "Max 60-month duration", "Notarization required", "Online registration via IGR portal", "Stamp duty: 0.25% of total rent"],
    stampDuty: "0.25% of total rent",
    regFee: "₹1,000",
  },
  "Karnataka": {
    name: "Karnataka Rental Agreement",
    clauses: ["11-month standard duration", "Registered if >12 months", "2-month security deposit norm", "Tenant police verification required", "E-stamping available"],
    stampDuty: "1% of annual rent",
    regFee: "₹500-2,000",
  },
  "Telangana": {
    name: "Telangana Rent Agreement",
    clauses: ["11-month renewable format", "Mandatory registration for >11 months", "IGRS online registration", "Biometric verification required", "Maintenance clause recommended"],
    stampDuty: "0.5% of annual rent",
    regFee: "₹1,000-3,000",
  },
  "Tamil Nadu": {
    name: "Tamil Nadu Rental Agreement",
    clauses: ["Tamil Nadu Regulation of Rights Act 2017", "Mandatory registration", "3-month advance rent max", "Rent authority for disputes", "E-registration via TNREGINET"],
    stampDuty: "1% of annual rent",
    regFee: "₹1,000",
  },
};

const RegionalAgreementTemplates = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleDownload = (state: string) => {
    toast.success(`${state} agreement template downloaded!`);
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <h3 className="font-bold text-foreground text-sm flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-primary" /> Regional Agreement Templates
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">State-specific rental agreement templates with local legal requirements</p>

      <div className="space-y-2">
        {Object.entries(templates).map(([state, tpl]) => (
          <div key={state} className="bg-secondary/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setSelected(selected === state ? null : state)}
              className="w-full flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{state}</span>
              </div>
              {selected === state ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {selected === state && (
              <div className="px-3 pb-3 space-y-2">
                <p className="text-xs font-bold text-foreground">{tpl.name}</p>
                <ul className="space-y-1">
                  {tpl.clauses.map((c, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {c}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="text-muted-foreground">Stamp Duty: <span className="font-bold text-foreground">{tpl.stampDuty}</span></span>
                  <span className="text-muted-foreground">Reg Fee: <span className="font-bold text-foreground">{tpl.regFee}</span></span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleDownload(state)} className="w-full gap-2 text-xs">
                  <Download className="h-3 w-3" /> Download {state} Template
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionalAgreementTemplates;

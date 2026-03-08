import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const stateRates: Record<string, { stamp: number; reg: number }> = {
  "Maharashtra": { stamp: 5, reg: 1 },
  "Karnataka": { stamp: 5, reg: 1 },
  "Telangana": { stamp: 5, reg: 0.5 },
  "Tamil Nadu": { stamp: 7, reg: 1 },
  "Delhi": { stamp: 6, reg: 1 },
  "Uttar Pradesh": { stamp: 5, reg: 1 },
  "Gujarat": { stamp: 4.9, reg: 1 },
  "Rajasthan": { stamp: 5, reg: 1 },
  "West Bengal": { stamp: 6, reg: 1 },
  "Kerala": { stamp: 8, reg: 2 },
};

const StampDutyCalculator = () => {
  const [price, setPrice] = useState(5000000);
  const [state, setState] = useState("Maharashtra");
  const [isWoman, setIsWoman] = useState(false);

  const rates = stateRates[state] || { stamp: 5, reg: 1 };
  const discount = isWoman && (state === "Maharashtra" || state === "Delhi") ? 1 : 0;
  const stampDuty = price * (rates.stamp - discount) / 100;
  const registration = price * rates.reg / 100;
  const total = stampDuty + registration;

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Stamp Duty Calculator</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Property Value (₹)</label>
          <input type="number" value={price} onChange={e => setPrice(+e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">State</label>
          <select value={state} onChange={e => setState(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none">
            {Object.keys(stateRates).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" checked={isWoman} onChange={e => setIsWoman(e.target.checked)}
            className="rounded accent-primary" />
          Woman buyer (reduced rates in some states)
        </label>
      </div>

      <div className="mt-4 bg-secondary/50 rounded-xl p-3 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Stamp Duty ({rates.stamp - (isWoman && (state === "Maharashtra" || state === "Delhi") ? 1 : 0)}%)</span>
          <span className="font-semibold text-foreground">{fmt(stampDuty)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Registration ({rates.reg}%)</span>
          <span className="font-semibold text-foreground">{fmt(registration)}</span>
        </div>
        <div className="border-t border-border pt-1 flex justify-between text-sm">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-primary">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default StampDutyCalculator;

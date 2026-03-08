import { useState } from "react";
import { Percent, TrendingUp } from "lucide-react";

const RentalYieldCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(20000);
  const [maintenance, setMaintenance] = useState(3000);
  const [vacancy, setVacancy] = useState(1);

  const annualRent = monthlyRent * (12 - vacancy);
  const annualExpenses = maintenance * 12;
  const grossYield = (monthlyRent * 12 / propertyValue) * 100;
  const netYield = ((annualRent - annualExpenses) / propertyValue) * 100;

  const yieldColor = netYield >= 4 ? "text-green-600" : netYield >= 2.5 ? "text-yellow-600" : "text-destructive";
  const yieldLabel = netYield >= 4 ? "Excellent" : netYield >= 2.5 ? "Average" : "Below Average";

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Percent className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Rental Yield Calculator</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Property Value (₹)</label>
          <input type="number" value={propertyValue} onChange={e => setPropertyValue(+e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Monthly Rent (₹)</label>
            <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(+e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Maintenance (₹/mo)</label>
            <input type="number" value={maintenance} onChange={e => setMaintenance(+e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Vacancy (months/year): {vacancy}</label>
          <input type="range" min={0} max={6} value={vacancy} onChange={e => setVacancy(+e.target.value)}
            className="w-full accent-primary" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Gross Yield</p>
          <p className="text-lg font-bold text-foreground">{grossYield.toFixed(1)}%</p>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Net Yield</p>
          <p className={`text-lg font-bold ${yieldColor}`}>{netYield.toFixed(1)}%</p>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Rating</p>
          <p className={`text-sm font-bold ${yieldColor}`}>{yieldLabel}</p>
        </div>
      </div>
    </div>
  );
};

export default RentalYieldCalculator;

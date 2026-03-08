import { useState } from "react";
import { Calculator, TrendingUp, Home, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const RentVsBuyCalculator = () => {
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [years, setYears] = useState(10);
  const [showResult, setShowResult] = useState(false);

  const annualRentIncrease = 0.08;
  const propertyAppreciation = 0.06;
  const downPayment = propertyPrice * 0.2;
  const loanAmount = propertyPrice - downPayment;
  const interestRate = 0.085;
  const monthlyEMI = (loanAmount * interestRate / 12 * Math.pow(1 + interestRate / 12, years * 12)) / (Math.pow(1 + interestRate / 12, years * 12) - 1);

  let totalRent = 0;
  let currentRent = monthlyRent;
  for (let y = 0; y < years; y++) {
    totalRent += currentRent * 12;
    currentRent *= (1 + annualRentIncrease);
  }

  const totalEMI = monthlyEMI * years * 12;
  const totalBuyCost = downPayment + totalEMI;
  const futureValue = propertyPrice * Math.pow(1 + propertyAppreciation, years);
  const netBuyCost = totalBuyCost - futureValue;
  const recommendation = netBuyCost < totalRent ? "buy" : "rent";

  const formatCurrency = (n: number) => {
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Calculator className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Rent vs Buy Calculator</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Monthly Rent (₹)</label>
          <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(+e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border-0 outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Property Price (₹)</label>
          <input type="number" value={propertyPrice} onChange={e => setPropertyPrice(+e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border-0 outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Time Horizon (Years): {years}</label>
          <input type="range" min={3} max={30} value={years} onChange={e => setYears(+e.target.value)}
            className="w-full mt-1 accent-primary" />
        </div>

        <Button onClick={() => setShowResult(true)} className="w-full gap-2" size="sm">
          <TrendingUp className="h-4 w-4" /> Calculate
        </Button>
      </div>

      {showResult && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 ${recommendation === "rent" ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary"}`}>
              <Home className="h-4 w-4 text-primary mb-1" />
              <p className="text-[10px] text-muted-foreground">Total Rent Cost</p>
              <p className="text-sm font-bold text-foreground">{formatCurrency(totalRent)}</p>
            </div>
            <div className={`rounded-xl p-3 ${recommendation === "buy" ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary"}`}>
              <DollarSign className="h-4 w-4 text-primary mb-1" />
              <p className="text-[10px] text-muted-foreground">Net Buy Cost</p>
              <p className="text-sm font-bold text-foreground">{formatCurrency(netBuyCost)}</p>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">EMI: {formatCurrency(monthlyEMI)}/mo · Future Value: {formatCurrency(futureValue)}</p>
            <p className="text-sm font-bold text-primary mt-1">
              {recommendation === "buy" ? "🏠 Buying is better!" : "🔑 Renting saves more!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentVsBuyCalculator;

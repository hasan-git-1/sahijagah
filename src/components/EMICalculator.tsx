import { useState } from "react";
import { Calculator } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface EMICalculatorProps {
  propertyPrice: number;
}

const EMICalculator = ({ propertyPrice }: EMICalculatorProps) => {
  const [loanPercent, setLoanPercent] = useState(80);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8.5);

  const principal = (propertyPrice * loanPercent) / 100;
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  const emi = monthlyRate > 0
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  const formatCurrency = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">EMI Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Loan Amount ({loanPercent}%)</span>
            <span className="font-semibold text-foreground">{formatCurrency(principal)}</span>
          </div>
          <Slider value={[loanPercent]} onValueChange={(v) => setLoanPercent(v[0])} min={10} max={95} step={5} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Tenure</span>
            <span className="font-semibold text-foreground">{years} years</span>
          </div>
          <Slider value={[years]} onValueChange={(v) => setYears(v[0])} min={1} max={30} step={1} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Interest Rate</span>
            <span className="font-semibold text-foreground">{rate}%</span>
          </div>
          <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={5} max={15} step={0.25} />
        </div>

        <div className="border-t border-border pt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-extrabold text-primary">{formatCurrency(emi)}</p>
            <p className="text-[10px] text-muted-foreground">Monthly EMI</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{formatCurrency(totalInterest)}</p>
            <p className="text-[10px] text-muted-foreground">Total Interest</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{formatCurrency(totalPayment)}</p>
            <p className="text-[10px] text-muted-foreground">Total Payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;

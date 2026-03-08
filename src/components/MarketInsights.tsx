import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketInsightsProps {
  city: string;
  price: number;
  type: string;
}

const cityData: Record<string, { avgPrice: number; trend: number; demand: string; supply: string }> = {
  Hyderabad: { avgPrice: 2500000, trend: 8.2, demand: "High", supply: "Moderate" },
  Bengaluru: { avgPrice: 3500000, trend: 5.1, demand: "Very High", supply: "Low" },
  Pune: { avgPrice: 2200000, trend: 6.8, demand: "High", supply: "Moderate" },
  Mumbai: { avgPrice: 8500000, trend: 3.2, demand: "Very High", supply: "Very Low" },
  Chennai: { avgPrice: 2800000, trend: 4.5, demand: "Moderate", supply: "Moderate" },
};

const formatPrice = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

const MarketInsights = ({ city, price, type }: MarketInsightsProps) => {
  const data = cityData[city] || { avgPrice: 2000000, trend: 4.0, demand: "Moderate", supply: "Moderate" };
  const comparison = ((price - data.avgPrice) / data.avgPrice) * 100;
  const isAbove = comparison > 5;
  const isBelow = comparison < -5;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">Market Insights — {city}</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground">Avg. Price</p>
          <p className="text-sm font-bold text-foreground">{formatPrice(data.avgPrice)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground">YoY Trend</p>
          <p className="text-sm font-bold text-accent flex items-center gap-1">
            {data.trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {data.trend > 0 ? "+" : ""}{data.trend}%
          </p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground">Demand</p>
          <p className="text-sm font-bold text-foreground">{data.demand}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground">Supply</p>
          <p className="text-sm font-bold text-foreground">{data.supply}</p>
        </div>
      </div>

      <div className={`rounded-xl p-3 flex items-center gap-2 ${
        isBelow ? "bg-accent/10" : isAbove ? "bg-destructive/10" : "bg-primary/10"
      }`}>
        {isBelow ? (
          <TrendingDown className="h-4 w-4 text-accent" />
        ) : isAbove ? (
          <TrendingUp className="h-4 w-4 text-destructive" />
        ) : (
          <Minus className="h-4 w-4 text-primary" />
        )}
        <p className={`text-xs font-semibold ${
          isBelow ? "text-accent" : isAbove ? "text-destructive" : "text-primary"
        }`}>
          This property is {isBelow ? `${Math.abs(Math.round(comparison))}% below` : isAbove ? `${Math.round(comparison)}% above` : "at"} market average
        </p>
      </div>
    </div>
  );
};

export default MarketInsights;

import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceHistoryChartProps {
  currentPrice: number;
  city: string;
  type: string;
}

const generateHistory = (currentPrice: number) => {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const data: { month: string; price: number }[] = [];
  let price = currentPrice * 0.92;
  for (const m of months) {
    price += (Math.random() - 0.3) * currentPrice * 0.03;
    data.push({ month: m, price: Math.round(price) });
  }
  data[data.length - 1].price = currentPrice;
  return data;
};

const formatShort = (n: number) => {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
};

const PriceHistoryChart = ({ currentPrice, city, type }: PriceHistoryChartProps) => {
  const data = generateHistory(currentPrice);
  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const firstPrice = data[0].price;
  const change = ((currentPrice - firstPrice) / firstPrice) * 100;
  const isUp = change >= 0;

  // SVG dimensions
  const w = 280;
  const h = 80;
  const pad = 4;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((d.price - minP) / range) * (h - 2 * pad);
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = pathD + ` L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground text-sm">Price Trend</h3>
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          isUp ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
        }`}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
        <defs>
          <linearGradient id="priceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#priceGrad)" />
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        ))}
      </svg>

      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <div key={d.month} className="text-center">
            <p className="text-[8px] text-muted-foreground">{d.month}</p>
            <p className="text-[8px] font-semibold text-foreground">₹{formatShort(d.price)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceHistoryChart;

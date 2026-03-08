import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, MapPin, Building2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cityData = [
  {
    name: "Hyderabad",
    avgRent: 22000,
    avgSale: 6500000,
    rentTrend: 7.2,
    saleTrend: 12.5,
    listings: 342,
    demand: "High",
    topAreas: [
      { name: "Gachibowli", avgPrice: 28000, trend: 9.1 },
      { name: "Kondapur", avgPrice: 22000, trend: 6.5 },
      { name: "Madhapur", avgPrice: 25000, trend: 8.0 },
      { name: "Kukatpally", avgPrice: 15000, trend: 4.2 },
    ],
  },
  {
    name: "Bengaluru",
    avgRent: 30000,
    avgSale: 8500000,
    rentTrend: 5.8,
    saleTrend: 8.2,
    listings: 520,
    demand: "Very High",
    topAreas: [
      { name: "Whitefield", avgPrice: 32000, trend: 7.2 },
      { name: "Sarjapur", avgPrice: 25000, trend: 10.5 },
      { name: "Marathahalli", avgPrice: 22000, trend: 4.8 },
      { name: "Electronic City", avgPrice: 18000, trend: 3.5 },
    ],
  },
  {
    name: "Pune",
    avgRent: 18000,
    avgSale: 5200000,
    rentTrend: 6.5,
    saleTrend: 9.8,
    listings: 280,
    demand: "High",
    topAreas: [
      { name: "Hinjewadi", avgPrice: 22000, trend: 8.0 },
      { name: "Baner", avgPrice: 25000, trend: 6.2 },
      { name: "Wakad", avgPrice: 18000, trend: 5.5 },
      { name: "Kharadi", avgPrice: 20000, trend: 7.8 },
    ],
  },
  {
    name: "Mumbai",
    avgRent: 45000,
    avgSale: 15000000,
    rentTrend: 3.2,
    saleTrend: 5.5,
    listings: 680,
    demand: "Very High",
    topAreas: [
      { name: "Andheri", avgPrice: 42000, trend: 4.0 },
      { name: "Bandra", avgPrice: 65000, trend: 2.8 },
      { name: "Powai", avgPrice: 38000, trend: 5.2 },
      { name: "Thane", avgPrice: 25000, trend: 6.8 },
    ],
  },
  {
    name: "Chennai",
    avgRent: 20000,
    avgSale: 5800000,
    rentTrend: 4.5,
    saleTrend: 7.0,
    listings: 195,
    demand: "Moderate",
    topAreas: [
      { name: "OMR", avgPrice: 22000, trend: 6.5 },
      { name: "Adyar", avgPrice: 30000, trend: 3.8 },
      { name: "Velachery", avgPrice: 18000, trend: 5.0 },
      { name: "Porur", avgPrice: 15000, trend: 7.2 },
    ],
  },
];

const formatPrice = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const CityAnalyticsScreen = () => {
  const navigate = useNavigate();
  const [activeCity, setActiveCity] = useState(0);
  const city = cityData[activeCity];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">City Analytics</h2>
      </div>

      {/* City tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {cityData.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveCity(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCity === i ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Home className="h-4 w-4 text-primary" />
              <p className="text-[10px] text-muted-foreground">Avg. Rent</p>
            </div>
            <p className="text-lg font-extrabold text-foreground">{formatPrice(city.avgRent)}<span className="text-[10px] text-muted-foreground font-normal">/mo</span></p>
            <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${city.rentTrend >= 0 ? "text-accent" : "text-destructive"}`}>
              {city.rentTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {city.rentTrend >= 0 ? "+" : ""}{city.rentTrend}% YoY
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <p className="text-[10px] text-muted-foreground">Avg. Sale</p>
            </div>
            <p className="text-lg font-extrabold text-foreground">{formatPrice(city.avgSale)}</p>
            <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${city.saleTrend >= 0 ? "text-accent" : "text-destructive"}`}>
              {city.saleTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {city.saleTrend >= 0 ? "+" : ""}{city.saleTrend}% YoY
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-around">
          <div className="text-center">
            <p className="text-xl font-extrabold text-primary">{city.listings}</p>
            <p className="text-[10px] text-muted-foreground">Active Listings</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{city.demand}</p>
            <p className="text-[10px] text-muted-foreground">Demand</p>
          </div>
        </div>

        {/* Top Areas */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Top Areas in {city.name}
          </h3>
          <div className="space-y-2">
            {city.topAreas.map((area, i) => (
              <div key={area.name} className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{area.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{formatPrice(area.avgPrice)}/mo</p>
                  <p className={`text-[9px] font-semibold ${area.trend >= 0 ? "text-accent" : "text-destructive"}`}>
                    {area.trend >= 0 ? "↑" : "↓"} {area.trend}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityAnalyticsScreen;

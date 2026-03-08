import { useState } from "react";
import { TrendingUp, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const cityRates: Record<string, number> = {
  "Mumbai": 22000, "Bengaluru": 9500, "Hyderabad": 8000,
  "Pune": 8500, "Chennai": 9000, "Delhi": 18000,
  "Gurgaon": 11000, "Noida": 7500, "Kolkata": 6500,
};

const HomeValueEstimator = () => {
  const [city, setCity] = useState("Hyderabad");
  const [area, setArea] = useState(1200);
  const [bedrooms, setBedrooms] = useState(2);
  const [floor, setFloor] = useState("mid");
  const [age, setAge] = useState(5);
  const [estimated, setEstimated] = useState(false);

  const baseRate = cityRates[city] || 8000;
  const bhkMultiplier = bedrooms === 1 ? 0.9 : bedrooms === 2 ? 1.0 : bedrooms === 3 ? 1.05 : 1.1;
  const floorMultiplier = floor === "low" ? 0.95 : floor === "mid" ? 1.0 : 1.05;
  const ageDiscount = Math.max(0.6, 1 - age * 0.02);
  const estimatedValue = Math.round(baseRate * area * bhkMultiplier * floorMultiplier * ageDiscount);
  const perSqFt = Math.round(estimatedValue / area);

  const fmt = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Home Value Estimator</h3>
          <p className="text-[10px] text-muted-foreground">AI-powered property valuation</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">City</label>
            <select value={city} onChange={e => { setCity(e.target.value); setEstimated(false); }}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none">
              {Object.keys(cityRates).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Area (sq ft)</label>
            <input type="number" value={area} onChange={e => { setArea(+e.target.value); setEstimated(false); }}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Bedrooms</label>
            <select value={bedrooms} onChange={e => { setBedrooms(+e.target.value); setEstimated(false); }}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none">
              {[1, 2, 3, 4].map(b => <option key={b} value={b}>{b} BHK</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Floor</label>
            <select value={floor} onChange={e => { setFloor(e.target.value); setEstimated(false); }}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none">
              <option value="low">Low</option>
              <option value="mid">Mid</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Age (yrs)</label>
            <input type="number" min={0} max={30} value={age} onChange={e => { setAge(+e.target.value); setEstimated(false); }}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm outline-none" />
          </div>
        </div>

        <Button onClick={() => setEstimated(true)} className="w-full gap-2" size="sm">
          <Home className="h-4 w-4" /> Estimate Value
        </Button>
      </div>

      {estimated && (
        <div className="mt-4 bg-primary/5 rounded-xl p-4 text-center space-y-1">
          <p className="text-xs text-muted-foreground">Estimated Market Value</p>
          <p className="text-2xl font-extrabold text-primary">{fmt(estimatedValue)}</p>
          <p className="text-xs text-muted-foreground">₹{perSqFt.toLocaleString("en-IN")}/sq ft in {city}</p>
        </div>
      )}
    </div>
  );
};

export default HomeValueEstimator;

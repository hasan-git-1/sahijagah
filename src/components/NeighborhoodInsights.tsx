import { MapPin, School, Building2, Train, ShoppingBag, TreePine, Shield } from "lucide-react";

interface NeighborhoodInsightsProps {
  lat: number;
  lng: number;
  city: string;
}

const insights = [
  { icon: School, label: "Schools", score: "Good", detail: "3 schools within 2km", color: "text-primary" },
  { icon: Building2, label: "Hospitals", score: "Excellent", detail: "2 hospitals within 1.5km", color: "text-accent" },
  { icon: Train, label: "Transit", score: "Good", detail: "Metro station 1.2km away", color: "text-primary" },
  { icon: ShoppingBag, label: "Shopping", score: "Excellent", detail: "Mall & market within 1km", color: "text-accent" },
  { icon: TreePine, label: "Parks", score: "Average", detail: "1 park within 2km", color: "text-muted-foreground" },
  { icon: Shield, label: "Safety", score: "Good", detail: "Low crime area", color: "text-primary" },
];

const scoreColors: Record<string, string> = {
  Excellent: "bg-accent/20 text-accent",
  Good: "bg-primary/20 text-primary",
  Average: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const NeighborhoodInsights = ({ lat, lng, city }: NeighborhoodInsightsProps) => {
  // Generate a pseudo-walkability score based on coordinates
  const walkScore = Math.min(95, Math.max(55, Math.round((lat * 10 + lng * 5) % 40 + 55)));

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" /> Neighborhood
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full gradient-blue flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-extrabold">{walkScore}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Walk Score</p>
            <p className="text-[10px] text-muted-foreground">
              {walkScore >= 80 ? "Very Walkable" : walkScore >= 65 ? "Somewhat Walkable" : "Car-Dependent"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-secondary/50 rounded-xl p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs font-semibold text-foreground">{item.label}</span>
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${scoreColors[item.score]}`}>
                {item.score}
              </span>
              <p className="text-[10px] text-muted-foreground mt-1">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NeighborhoodInsights;

import { Shield, Wifi, TreePine, Bus, GraduationCap, ShoppingBag } from "lucide-react";

interface Props {
  city: string;
  locality?: string | null;
}

const getScores = (city: string) => {
  const base: Record<string, number[]> = {
    "Hyderabad": [8.2, 8.5, 7.0, 8.8, 8.0, 9.0],
    "Bengaluru": [7.5, 9.0, 7.5, 7.0, 9.0, 8.5],
    "Pune": [8.0, 8.0, 8.0, 7.5, 8.5, 8.0],
    "Mumbai": [7.0, 8.5, 5.5, 9.0, 8.5, 9.5],
    "Chennai": [7.8, 7.5, 6.5, 8.0, 8.0, 7.5],
  };
  return base[city] || [7.0, 7.0, 7.0, 7.0, 7.0, 7.0];
};

const categories = [
  { label: "Safety", icon: Shield },
  { label: "Internet", icon: Wifi },
  { label: "Green Cover", icon: TreePine },
  { label: "Transport", icon: Bus },
  { label: "Education", icon: GraduationCap },
  { label: "Shopping", icon: ShoppingBag },
];

const LocalityScoreCard = ({ city, locality }: Props) => {
  const scores = getScores(city);
  const overall = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

  const getColor = (s: number) => s >= 8 ? "bg-green-500" : s >= 6 ? "bg-yellow-500" : "bg-destructive";

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground">Locality Score</h3>
          <p className="text-[10px] text-muted-foreground">{locality || city}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-extrabold text-primary">{overall}</p>
          <p className="text-[9px] text-muted-foreground">out of 10</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={cat.label} className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs text-foreground w-16">{cat.label}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getColor(scores[i])} transition-all`}
                  style={{ width: `${scores[i] * 10}%` }} />
              </div>
              <span className="text-xs font-bold text-foreground w-8 text-right">{scores[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocalityScoreCard;

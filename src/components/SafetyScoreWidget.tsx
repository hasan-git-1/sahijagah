import { Shield, AlertTriangle, Moon, Sun, Users } from "lucide-react";

interface Props {
  city: string;
}

const safetyData: Record<string, { overall: number; day: number; night: number; women: number; crowding: string }> = {
  "Hyderabad": { overall: 8.0, day: 9.0, night: 7.0, women: 7.5, crowding: "Moderate" },
  "Bengaluru": { overall: 7.5, day: 8.5, night: 6.5, women: 7.0, crowding: "High" },
  "Pune": { overall: 8.5, day: 9.0, night: 8.0, women: 8.0, crowding: "Low" },
  "Mumbai": { overall: 7.0, day: 8.0, night: 6.0, women: 6.5, crowding: "Very High" },
  "Chennai": { overall: 8.0, day: 8.5, night: 7.5, women: 7.5, crowding: "Moderate" },
};

const SafetyScoreWidget = ({ city }: Props) => {
  const data = safetyData[city] || safetyData["Hyderabad"];
  const getColor = (s: number) => s >= 8 ? "text-green-500" : s >= 6 ? "text-yellow-500" : "text-destructive";
  const getBg = (s: number) => s >= 8 ? "bg-green-500/10" : s >= 6 ? "bg-yellow-500/10" : "bg-destructive/10";

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">Safety Score</h3>
          <p className="text-[10px] text-muted-foreground">{city} area safety assessment</p>
        </div>
        <div className={`px-3 py-1 rounded-full ${getBg(data.overall)}`}>
          <span className={`text-lg font-extrabold ${getColor(data.overall)}`}>{data.overall}</span>
          <span className="text-[9px] text-muted-foreground">/10</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary rounded-xl p-3 flex items-center gap-2">
          <Sun className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-[10px] text-muted-foreground">Daytime</p>
            <p className={`text-sm font-bold ${getColor(data.day)}`}>{data.day}/10</p>
          </div>
        </div>
        <div className="bg-secondary rounded-xl p-3 flex items-center gap-2">
          <Moon className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-[10px] text-muted-foreground">Nighttime</p>
            <p className={`text-sm font-bold ${getColor(data.night)}`}>{data.night}/10</p>
          </div>
        </div>
        <div className="bg-secondary rounded-xl p-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-pink-500" />
          <div>
            <p className="text-[10px] text-muted-foreground">Women Safety</p>
            <p className={`text-sm font-bold ${getColor(data.women)}`}>{data.women}/10</p>
          </div>
        </div>
        <div className="bg-secondary rounded-xl p-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <div>
            <p className="text-[10px] text-muted-foreground">Crowding</p>
            <p className="text-sm font-bold text-foreground">{data.crowding}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyScoreWidget;

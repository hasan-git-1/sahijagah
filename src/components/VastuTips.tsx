import { useState } from "react";
import { Compass, ChevronDown, ChevronUp, Check, X } from "lucide-react";

const vastuData = [
  { area: "Main Door", good: "North, East, North-East", avoid: "South-West, South", tip: "Entrance should face North or East for positive energy flow." },
  { area: "Kitchen", good: "South-East", avoid: "North-East", tip: "Place cooking stove in the South-East corner (Agni corner)." },
  { area: "Master Bedroom", good: "South-West", avoid: "North-East, South-East", tip: "Head should point South while sleeping for better rest." },
  { area: "Bathroom", good: "North-West, West", avoid: "North-East, South-West", tip: "Toilets should never be in North-East direction." },
  { area: "Living Room", good: "North, East, North-East", avoid: "South-West", tip: "Keep North-East corner clean and clutter-free." },
  { area: "Pooja Room", good: "North-East", avoid: "South, Under staircase", tip: "Face East or North while praying. Keep idols 6-8 inches from wall." },
  { area: "Study Room", good: "North, East, North-East", avoid: "South-West", tip: "Face East or North while studying for better concentration." },
  { area: "Balcony", good: "North, East", avoid: "South-West", tip: "Keep plants in North or East balcony for freshness." },
];

const VastuTips = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Compass className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Vastu Guide</h3>
          <p className="text-[10px] text-muted-foreground">Room-by-room Vastu Shastra tips</p>
        </div>
      </div>

      <div className="space-y-2">
        {vastuData.map((item, i) => (
          <div key={item.area} className="rounded-xl overflow-hidden border border-border">
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/50 transition-colors">
              <span className="text-sm font-medium text-foreground">{item.area}</span>
              {expanded === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {expanded === i && (
              <div className="px-3 pb-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground"><span className="font-semibold">Good:</span> {item.good}</p>
                </div>
                <div className="flex items-start gap-2">
                  <X className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground"><span className="font-semibold">Avoid:</span> {item.avoid}</p>
                </div>
                <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">💡 {item.tip}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VastuTips;

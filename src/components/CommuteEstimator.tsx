import { useState } from "react";
import { MapPin, Car, Train, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const CommuteEstimator = ({ propertyCity }: { propertyCity: string }) => {
  const [destination, setDestination] = useState("");
  const [calculated, setCalculated] = useState(false);

  // Simulated commute times based on city
  const getCommute = () => {
    const hash = (destination + propertyCity).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      driving: 15 + (hash % 45),
      transit: 25 + (hash % 60),
      peakDriving: 30 + (hash % 75),
    };
  };

  const commute = getCommute();

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Commute Time</h3>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <input placeholder="Your office / destination" value={destination}
            onChange={e => { setDestination(e.target.value); setCalculated(false); }}
            className="flex-1 bg-transparent text-sm text-foreground outline-none" />
        </div>
        <Button size="sm" onClick={() => setCalculated(true)} disabled={!destination}>Go</Button>
      </div>

      {calculated && destination && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <Car className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Driving</p>
            <p className="text-sm font-bold text-foreground">{commute.driving} min</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <Train className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Transit</p>
            <p className="text-sm font-bold text-foreground">{commute.transit} min</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <Car className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Peak Hour</p>
            <p className="text-sm font-bold text-foreground">{commute.peakDriving} min</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommuteEstimator;

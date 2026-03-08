import { Train, Bus, Plane, MapPin } from "lucide-react";

interface Props {
  city: string;
}

const transportData: Record<string, { type: string; name: string; distance: string; icon: React.ElementType }[]> = {
  "Hyderabad": [
    { type: "Metro", name: "Raidurg Metro", distance: "1.2 km", icon: Train },
    { type: "Bus", name: "Gachibowli Bus Stand", distance: "0.8 km", icon: Bus },
    { type: "Airport", name: "RGIA Airport", distance: "28 km", icon: Plane },
    { type: "Railway", name: "Lingampally Station", distance: "8 km", icon: Train },
  ],
  "Bengaluru": [
    { type: "Metro", name: "Whitefield Metro", distance: "2.0 km", icon: Train },
    { type: "Bus", name: "Majestic Bus Station", distance: "15 km", icon: Bus },
    { type: "Airport", name: "KIA Airport", distance: "35 km", icon: Plane },
    { type: "Railway", name: "Bangalore City Jn", distance: "18 km", icon: Train },
  ],
  "Pune": [
    { type: "Metro", name: "Hinjewadi Metro", distance: "3.0 km", icon: Train },
    { type: "Bus", name: "Swargate Bus Stand", distance: "12 km", icon: Bus },
    { type: "Airport", name: "Pune Airport", distance: "20 km", icon: Plane },
    { type: "Railway", name: "Pune Junction", distance: "14 km", icon: Train },
  ],
  "Mumbai": [
    { type: "Metro", name: "Andheri Metro", distance: "1.5 km", icon: Train },
    { type: "Local", name: "Andheri Station", distance: "0.5 km", icon: Train },
    { type: "Airport", name: "CSIA Airport", distance: "8 km", icon: Plane },
    { type: "Bus", name: "Andheri Bus Depot", distance: "1.0 km", icon: Bus },
  ],
  "Chennai": [
    { type: "Metro", name: "Guindy Metro", distance: "2.5 km", icon: Train },
    { type: "Bus", name: "CMBT", distance: "10 km", icon: Bus },
    { type: "Airport", name: "MAA Airport", distance: "15 km", icon: Plane },
    { type: "Railway", name: "Chennai Central", distance: "12 km", icon: Train },
  ],
};

const NearbyTransport = ({ city }: Props) => {
  const data = transportData[city] || transportData["Hyderabad"];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Train className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Nearby Transport</h3>
      </div>

      <div className="space-y-2">
        {data.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-3 py-2.5">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.type}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-primary">
                <MapPin className="h-3 w-3" /> {t.distance}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyTransport;

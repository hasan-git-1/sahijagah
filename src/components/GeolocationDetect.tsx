import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeolocationDetectProps {
  onLocationDetected: (lat: number, lng: number, cityName: string) => void;
}

const REVERSE_GEOCODE_CITIES: Record<string, { lat: [number, number]; name: string }> = {
  hyderabad: { lat: [17.2, 17.6], name: "Hyderabad" },
  bengaluru: { lat: [12.8, 13.2], name: "Bengaluru" },
  pune: { lat: [18.3, 18.7], name: "Pune" },
  mumbai: { lat: [18.8, 19.3], name: "Mumbai" },
  chennai: { lat: [12.9, 13.2], name: "Chennai" },
  delhi: { lat: [28.4, 28.9], name: "Delhi" },
};

const detectCity = (lat: number): string => {
  for (const city of Object.values(REVERSE_GEOCODE_CITIES)) {
    if (lat >= city.lat[0] && lat <= city.lat[1]) return city.name;
  }
  return "Nearby";
};

const GeolocationDetect = ({ onLocationDetected }: GeolocationDetectProps) => {
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);

  const handleDetect = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = detectCity(latitude);
        setDetected(city);
        setLoading(false);
        onLocationDetected(latitude, longitude, city);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (detected) {
    return (
      <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
        <Navigation className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">{detected}</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDetect}
      disabled={loading}
      className="gap-1.5 rounded-full text-xs h-8"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
      {loading ? "Detecting..." : "Near Me"}
    </Button>
  );
};

export default GeolocationDetect;

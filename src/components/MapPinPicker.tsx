import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPinPickerProps {
  lat?: number;
  lng?: number;
  city?: string;
  onChange: (lat: number, lng: number) => void;
}

const CITY_COORDS: Record<string, [number, number]> = {
  hyderabad: [17.385, 78.4867],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  chennai: [13.0827, 80.2707],
  delhi: [28.6139, 77.209],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
};

const MapPinPicker = ({ lat, lng, city, onChange }: MapPinPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [pinned, setPinned] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [locating, setLocating] = useState(false);

  const getInitialCenter = (): [number, number] => {
    if (lat && lng) return [lat, lng];
    if (city) {
      const key = city.toLowerCase().trim();
      if (CITY_COORDS[key]) return CITY_COORDS[key];
    }
    return [17.385, 78.4867]; // Default: Hyderabad
  };

  const getPinIcon = () =>
    L.divIcon({
      html: `<div style="background:hsl(var(--primary));width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);"></div></div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center = getInitialCenter();
    const map = L.map(mapRef.current, { zoomControl: false }).setView(center, 13);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { icon: getPinIcon(), draggable: true }).addTo(map);
      markerRef.current.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        const newLat = +pos.lat.toFixed(6);
        const newLng = +pos.lng.toFixed(6);
        setPinned({ lat: newLat, lng: newLng });
        onChange(newLat, newLng);
      });
    }

    map.on("click", (e) => {
      const newLat = +e.latlng.lat.toFixed(6);
      const newLng = +e.latlng.lng.toFixed(6);

      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng]);
      } else {
        markerRef.current = L.marker([newLat, newLng], { icon: getPinIcon(), draggable: true }).addTo(map);
        markerRef.current.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          const dragLat = +pos.lat.toFixed(6);
          const dragLng = +pos.lng.toFixed(6);
          setPinned({ lat: dragLat, lng: dragLng });
          onChange(dragLat, dragLng);
        });
      }

      setPinned({ lat: newLat, lng: newLng });
      onChange(newLat, newLng);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update map center when city changes
  useEffect(() => {
    if (!mapInstance.current || !city) return;
    const key = city.toLowerCase().trim();
    if (CITY_COORDS[key] && !pinned) {
      mapInstance.current.setView(CITY_COORDS[key], 13);
    }
  }, [city]);

  const handleMyLocation = () => {
    if (!navigator.geolocation || !mapInstance.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLat = +latitude.toFixed(6);
        const newLng = +longitude.toFixed(6);

        mapInstance.current?.setView([newLat, newLng], 15);

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          markerRef.current = L.marker([newLat, newLng], { icon: getPinIcon(), draggable: true }).addTo(mapInstance.current!);
          markerRef.current.on("dragend", (e) => {
            const p = e.target.getLatLng();
            const dragLat = +p.lat.toFixed(6);
            const dragLng = +p.lng.toFixed(6);
            setPinned({ lat: dragLat, lng: dragLng });
            onChange(dragLat, dragLng);
          });
        }

        setPinned({ lat: newLat, lng: newLng });
        onChange(newLat, newLng);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-primary" />
          Pin Location on Map
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleMyLocation}
          disabled={locating}
          className="gap-1.5 text-xs h-7"
        >
          {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
          {locating ? "Locating..." : "My Location"}
        </Button>
      </div>

      <div ref={mapRef} className="h-48 w-full rounded-xl border border-border overflow-hidden" />

      {pinned ? (
        <p className="text-xs text-muted-foreground">
          📍 Pinned: {pinned.lat}, {pinned.lng}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Tap on the map to pin your property location</p>
      )}
    </div>
  );
};

export default MapPinPicker;

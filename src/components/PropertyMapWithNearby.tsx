import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface NearbyPlace {
  name: string;
  type: string;
  lat: number;
  lng: number;
}

interface PropertyMapWithNearbyProps {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
  showNearby?: boolean;
}

const nearbyCategories = [
  { key: "school", label: "🏫 Schools", color: "#f59e0b" },
  { key: "hospital", label: "🏥 Hospitals", color: "#ef4444" },
  { key: "metro", label: "🚇 Metro", color: "#3b82f6" },
  { key: "market", label: "🛒 Markets", color: "#22c55e" },
];

// Simulate nearby places based on property location
const generateNearbyPlaces = (lat: number, lng: number): NearbyPlace[] => {
  const offsets = [
    { name: "City School", type: "school", dlat: 0.005, dlng: 0.003 },
    { name: "International School", type: "school", dlat: -0.004, dlng: 0.006 },
    { name: "General Hospital", type: "hospital", dlat: 0.007, dlng: -0.002 },
    { name: "Medical Centre", type: "hospital", dlat: -0.003, dlng: -0.005 },
    { name: "Metro Station", type: "metro", dlat: 0.002, dlng: -0.004 },
    { name: "Express Metro", type: "metro", dlat: -0.006, dlng: 0.002 },
    { name: "Super Market", type: "market", dlat: 0.003, dlng: 0.005 },
    { name: "Local Market", type: "market", dlat: -0.002, dlng: -0.003 },
  ];

  return offsets.map((o) => ({
    name: o.name,
    type: o.type,
    lat: lat + o.dlat + (Math.random() - 0.5) * 0.002,
    lng: lng + o.dlng + (Math.random() - 0.5) * 0.002,
  }));
};

const PropertyMapWithNearby = ({ lat, lng, title, className = "h-64 w-full rounded-xl", showNearby = true }: PropertyMapWithNearbyProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>(["school", "hospital", "metro", "market"]);
  const [places] = useState(() => generateNearbyPlaces(lat, lng));

  const toggleCategory = (key: string) => {
    setActiveCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView([lat, lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Property marker
    const propIcon = L.divIcon({
      html: `<div style="background:hsl(217,91%,50%);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
    L.marker([lat, lng], { icon: propIcon }).addTo(map).bindPopup(title || "Property");

    // Nearby markers
    if (showNearby) {
      const colorMap: Record<string, string> = { school: "#f59e0b", hospital: "#ef4444", metro: "#3b82f6", market: "#22c55e" };
      const emojiMap: Record<string, string> = { school: "🏫", hospital: "🏥", metro: "🚇", market: "🛒" };

      places
        .filter((p) => activeCategories.includes(p.type))
        .forEach((place) => {
          const color = colorMap[place.type] || "#888";
          const icon = L.divIcon({
            html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;">${emojiMap[place.type] || ""}</div>`,
            className: "",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          L.marker([place.lat, place.lng], { icon }).addTo(map).bindPopup(`<b>${place.name}</b><br/>${place.type}`);
        });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, title, showNearby, activeCategories, places]);

  return (
    <div>
      <div ref={mapRef} className={className} />
      {showNearby && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {nearbyCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                activeCategories.includes(cat.key)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyMapWithNearby;

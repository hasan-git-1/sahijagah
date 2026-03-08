import { useEffect, useRef, useState } from "react";
import { MapPin, List, X } from "lucide-react";
import { Property } from "@/hooks/useProperties";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

interface MapSearchViewProps {
  properties: Property[];
  onClose: () => void;
}

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const MapSearchView = ({ properties, onClose }: MapSearchViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<Property | null>(null);
  const navigate = useNavigate();

  const geoProperties = properties.filter((p) => p.lat && p.lng);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center: [number, number] = geoProperties.length > 0
      ? [geoProperties[0].lat!, geoProperties[0].lng!]
      : [17.385, 78.4867];

    const map = L.map(mapRef.current, { zoomControl: false }).setView(center, 11);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const priceIcon = (price: string) =>
      L.divIcon({
        className: "custom-price-pin",
        html: `<div style="background:hsl(217,91%,50%);color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2)">${price}</div>`,
        iconSize: [80, 28],
        iconAnchor: [40, 14],
      });

    geoProperties.forEach((p) => {
      const marker = L.marker([p.lat!, p.lng!], {
        icon: priceIcon(formatPrice(p.price, p.type)),
      }).addTo(map);
      marker.on("click", () => setSelected(p));
    });

    if (geoProperties.length > 1) {
      const bounds = L.latLngBounds(geoProperties.map((p) => [p.lat!, p.lng!]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Map View ({geoProperties.length} properties)
        </h3>
        <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          <X className="h-4 w-4 text-foreground" />
        </button>
      </div>

      <div ref={mapRef} className="flex-1" />

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 bg-card rounded-xl shadow-elevated p-3 animate-slide-up">
          <button
            onClick={() => navigate(`/app/property/${selected.id}`)}
            className="flex gap-3 w-full text-left"
          >
            <img
              src={selected.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
              alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary">{formatPrice(selected.price, selected.type)}</p>
              <p className="text-xs font-semibold text-foreground truncate">{selected.title}</p>
              <p className="text-[10px] text-muted-foreground">{selected.address || selected.city}</p>
            </div>
          </button>
          <button onClick={() => setSelected(null)} className="absolute top-2 right-2">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MapSearchView;

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
}

const PropertyMap = ({ lat, lng, title, className = "h-48 w-full rounded-xl" }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="background:hsl(217,91%,50%);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([lat, lng], { icon }).addTo(map).bindPopup(title || "Property Location");
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, title]);

  return <div ref={mapRef} className={className} />;
};

export default PropertyMap;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MapPin, BedDouble, Bath } from "lucide-react";

interface SimilarPropertiesProps {
  propertyId: string;
  city: string;
  type: string;
  price: number;
}

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const SimilarProperties = ({ propertyId, city, type, price }: SimilarPropertiesProps) => {
  const navigate = useNavigate();

  const { data: similar } = useQuery({
    queryKey: ["similar", propertyId, city, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, price, city, type, images, bedrooms, bathrooms, area")
        .eq("status", "approved")
        .eq("city", city)
        .eq("type", type)
        .neq("id", propertyId)
        .gte("price", price * 0.5)
        .lte("price", price * 1.5)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  if (!similar?.length) return null;

  return (
    <div className="mt-6">
      <h3 className="font-bold text-foreground mb-3">Similar Properties</h3>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {similar.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/app/property/${p.id}`)}
            className="flex-shrink-0 w-48 bg-card rounded-xl overflow-hidden shadow-card text-left"
          >
            <img
              src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
              alt={p.title}
              className="w-full h-28 object-cover"
            />
            <div className="p-2.5">
              <p className="text-sm font-bold text-primary">{formatPrice(p.price, p.type)}</p>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">{p.title}</p>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="text-[10px]">{p.city}</span>
              </div>
              <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                {p.bedrooms > 0 && <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3" /> {p.bedrooms}</span>}
                {p.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" /> {p.bathrooms}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SimilarProperties;

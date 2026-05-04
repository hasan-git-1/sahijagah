import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, MapPin, BedDouble, Heart } from "lucide-react";
import { Property } from "@/hooks/useProperties";

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const AIRecommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["ai-recommendations", user?.id],
    queryFn: async () => {
      // Get user's recently viewed properties to understand preferences
      const { data: recentViews } = await supabase
        .from("recently_viewed")
        .select("property_id")
        .eq("user_id", user!.id)
        .order("viewed_at", { ascending: false })
        .limit(10);

      const viewedIds = recentViews?.map((r) => r.property_id) || [];

      // Get viewed properties to understand preferences
      let preferredCities: string[] = [];
      let preferredTypes: string[] = [];
      let avgPrice = 0;

      if (viewedIds.length > 0) {
        const { data: viewedProps } = await supabase
          .from("properties")
          .select("city, type, price")
          .in("id", viewedIds);

        if (viewedProps?.length) {
          preferredCities = [...new Set(viewedProps.map((p) => p.city))];
          preferredTypes = [...new Set(viewedProps.map((p) => p.type))];
          avgPrice = viewedProps.reduce((s, p) => s + Number(p.price), 0) / viewedProps.length;
        }
      }

      // Get wishlist preferences too
      const { data: wishlist } = await supabase
        .from("wishlists")
        .select("property_id")
        .eq("user_id", user!.id)
        .limit(5);

      const wishIds = wishlist?.map((w) => w.property_id) || [];
      if (wishIds.length > 0) {
        const { data: wishProps } = await supabase
          .from("properties")
          .select("city, type")
          .in("id", wishIds);
        if (wishProps?.length) {
          preferredCities.push(...wishProps.map((p) => p.city));
          preferredTypes.push(...wishProps.map((p) => p.type));
        }
      }

      // Build recommendation query
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .limit(6);

      const excludeIds = [...viewedIds, ...wishIds];
      if (excludeIds.length > 0) {
        // Try to exclude already seen
      }

      if (preferredCities.length > 0) {
        query = query.in("city", [...new Set(preferredCities)]);
      }
      if (preferredTypes.length > 0) {
        query = query.in("type", [...new Set(preferredTypes)]);
      }
      if (avgPrice > 0) {
        query = query.gte("price", avgPrice * 0.5).lte("price", avgPrice * 2);
      }

      query = query.order("view_count", { ascending: false });

      const { data } = await query;
      // Filter out already viewed
      const filtered = (data || []).filter((p) => !excludeIds.includes(p.id));
      return filtered.slice(0, 4) as Property[];
    },
    enabled: !!user,
    staleTime: 60000,
  });

  if (!user || !recommendations?.length) return null;

  return (
    <div className="px-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-foreground">Recommended For You</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {recommendations.map((prop) => (
          <button
            key={prop.id}
            onClick={() => navigate(`/app/property/${prop.id}`)}
            className="flex-shrink-0 w-44 rounded-xl overflow-hidden shadow-card bg-card text-left"
          >
            <img
              src={prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
              alt={prop.title}
              className="w-full h-24 object-cover"
            />
            <div className="p-2.5">
              <p className="text-sm font-bold text-primary">{formatPrice(prop.price, prop.type)}</p>
              <p className="text-xs font-semibold text-foreground truncate">{prop.title}</p>
              <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                <span className="text-[10px]">{prop.city}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;

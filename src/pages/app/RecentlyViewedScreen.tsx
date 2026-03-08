import { ArrowLeft, Clock, MapPin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const RecentlyViewedScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recentItems, isLoading } = useQuery({
    queryKey: ["recently-viewed", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recently_viewed")
        .select("*, properties(*)")
        .eq("user_id", user!.id)
        .order("viewed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      await supabase.from("recently_viewed").delete().eq("user_id", user!.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recently-viewed", user?.id] }),
  });

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Clock className="h-12 w-12 text-primary mb-4" />
        <h3 className="font-bold text-foreground mb-2">Sign in to view history</h3>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0 px-8">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h2 className="text-lg font-bold text-foreground">Recently Viewed</h2>
        </div>
        {recentItems && recentItems.length > 0 && (
          <button onClick={() => clearHistory.mutate()} className="text-xs text-destructive font-medium flex items-center gap-1">
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !recentItems?.length ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Clock className="h-12 w-12 text-primary/50 mb-4" />
          <h3 className="font-bold text-foreground mb-1">No history</h3>
          <p className="text-sm text-muted-foreground">Properties you view will appear here</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {recentItems.map((item: any) => {
            const p = item.properties;
            if (!p) return null;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/app/property/${p.id}`)}
                className="w-full bg-card rounded-xl shadow-card overflow-hidden flex gap-3 p-3 text-left"
              >
                <img
                  src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                  alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-primary font-bold">{formatPrice(p.price, p.type)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" /> {p.city}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {timeAgo(item.viewed_at)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewedScreen;

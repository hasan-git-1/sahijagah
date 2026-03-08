import { ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const BookingsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, properties(title, city, images)")
        .or(`client_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Calendar className="h-12 w-12 text-primary mb-4" />
        <h3 className="font-bold text-foreground mb-2">Sign in to view bookings</h3>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0 px-8">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">My Bookings</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !bookings?.length ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Calendar className="h-12 w-12 text-primary/50 mb-4" />
          <h3 className="font-bold text-foreground mb-1">No bookings yet</h3>
          <p className="text-sm text-muted-foreground">Book a property visit to see it here</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="flex gap-3 p-3">
                <img
                  src={b.properties?.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{b.properties?.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" /> {b.properties?.city}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.scheduled_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.scheduled_time}</span>
                  </div>
                  <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[b.status] || "bg-secondary text-foreground"}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsScreen;

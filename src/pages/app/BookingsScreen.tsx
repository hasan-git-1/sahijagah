import { useState } from "react";
import { ArrowLeft, Calendar, MapPin, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  confirmed: "bg-accent/10 text-accent",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-secondary text-foreground",
};

const filters = ["All", "Pending", "Confirmed", "Cancelled", "Completed"];

const BookingsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("All");

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

  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled");
    },
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

  const filtered = bookings?.filter(b => filter === "All" || b.status === filter.toLowerCase()) || [];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h2 className="text-lg font-bold text-foreground">My Bookings</h2>
        </div>
        <div className="flex gap-1.5 mt-3 overflow-x-auto hide-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Calendar className="h-12 w-12 text-primary/50 mb-4" />
          <h3 className="font-bold text-foreground mb-1">No bookings</h3>
          <p className="text-sm text-muted-foreground">{filter === "All" ? "Book a property visit to see it here" : `No ${filter.toLowerCase()} bookings`}</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {filtered.map((b: any) => (
            <div key={b.id} className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="flex gap-3 p-3">
                <img
                  src={b.properties?.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/app/property/${b.property_id}`)}
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
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[b.status] || "bg-secondary text-foreground"}`}>
                      {b.status}
                    </span>
                    {b.status === "pending" && b.client_id === user.id && (
                      <button
                        onClick={() => cancelBooking.mutate(b.id)}
                        className="flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    )}
                  </div>
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

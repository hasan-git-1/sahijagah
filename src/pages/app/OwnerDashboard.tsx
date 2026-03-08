import { useState } from "react";
import { ArrowLeft, Home, Eye, Calendar, Edit, Trash2, Plus, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const bookingStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

type Tab = "listings" | "bookings" | "stats";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("listings");

  // Owner's properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ["owner-properties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Booking requests for owner's properties
  const { data: bookings } = useQuery({
    queryKey: ["owner-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, properties(title, city), profiles!bookings_client_id_fkey(name, email)")
        .eq("owner_id", user!.id)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-bookings", user?.id] });
      toast.success("Booking updated");
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-properties", user?.id] });
      toast.success("Property deleted");
    },
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const totalViews = properties?.reduce((s, p) => s + (p.view_count || 0), 0) || 0;
  const activeCount = properties?.filter((p) => p.status === "active").length || 0;
  const pendingBookings = bookings?.filter((b) => b.status === "pending").length || 0;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "listings", label: "My Listings", count: properties?.length },
    { key: "bookings", label: "Booking Requests", count: pendingBookings },
    { key: "stats", label: "Stats" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" /> Owner Dashboard
          </h2>
        </div>
        <div className="flex gap-1 mt-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors relative ${
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full text-[9px] font-bold flex items-center justify-center px-1 ${
                  tab === t.key ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Stats */}
        {tab === "stats" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Listings", value: properties?.length || 0, color: "text-primary" },
              { label: "Active Listings", value: activeCount, color: "text-accent" },
              { label: "Total Views", value: totalViews, color: "text-blue-500" },
              { label: "Pending Bookings", value: pendingBookings, color: "text-yellow-600" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-4 shadow-card text-center">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Listings */}
        {tab === "listings" && (
          <div className="space-y-3">
            <Button onClick={() => navigate("/app/post")} className="w-full gradient-blue text-primary-foreground border-0 gap-2">
              <Plus className="h-4 w-4" /> Post New Property
            </Button>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !properties?.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <Home className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No listings yet</p>
              </div>
            ) : (
              properties.map((p) => (
                <div key={p.id} className="bg-card rounded-xl p-3 shadow-card">
                  <div className="flex gap-3">
                    <img
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                      alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.city} · ₹{Number(p.price).toLocaleString("en-IN")}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[p.status] || "bg-secondary text-foreground"}`}>
                          {p.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Eye className="h-3 w-3" /> {p.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => navigate(`/app/property/${p.id}`)}>
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive gap-1" onClick={() => deleteProperty.mutate(p.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bookings */}
        {tab === "bookings" && (
          <div className="space-y-3">
            {!bookings?.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No booking requests</p>
              </div>
            ) : (
              bookings.map((b: any) => (
                <div key={b.id} className="bg-card rounded-xl p-3 shadow-card">
                  <p className="text-sm font-semibold text-foreground">{b.properties?.title}</p>
                  <p className="text-xs text-muted-foreground">{b.profiles?.name || b.profiles?.email} wants to visit</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{b.scheduled_date}</span>
                    <span>{b.scheduled_time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${bookingStatusColors[b.status]}`}>
                      {b.status}
                    </span>
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBooking.mutate({ id: b.id, status: "confirmed" })}
                          className="h-7 w-7 rounded-full bg-accent flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 text-accent-foreground" />
                        </button>
                        <button
                          onClick={() => updateBooking.mutate({ id: b.id, status: "cancelled" })}
                          className="h-7 w-7 rounded-full bg-destructive flex items-center justify-center"
                        >
                          <X className="h-4 w-4 text-destructive-foreground" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;

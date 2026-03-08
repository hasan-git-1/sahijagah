import { useState } from "react";
import { ArrowLeft, Users, Home, Calendar, TrendingUp, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: isAgent, isLoading: checkingRole } = useQuery({
    queryKey: ["isAgent", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "agent" });
      return !!data;
    },
    enabled: !!user,
  });

  // Agent's managed properties (properties they've listed on behalf of clients)
  const { data: properties } = useQuery({
    queryKey: ["agent-properties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!isAgent,
  });

  const { data: bookings } = useQuery({
    queryKey: ["agent-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, properties(title, city)")
        .eq("owner_id", user!.id)
        .order("scheduled_date", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!isAgent,
  });

  if (checkingRole) {
    return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isAgent) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Users className="h-12 w-12 text-primary mb-4" />
        <h3 className="font-bold text-foreground mb-2">Agent Access Only</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center">This dashboard is for registered agents. Contact admin to get agent access.</p>
        <Button onClick={() => navigate("/app")} variant="outline">Go Home</Button>
      </div>
    );
  }

  const totalViews = properties?.reduce((s, p) => s + (p.view_count || 0), 0) || 0;
  const activeListings = properties?.filter(p => p.status === "active").length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;

  return (
    <div className="bg-background min-h-screen">
      <SEOHead title="Agent Dashboard" />
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Agent Dashboard
          </h2>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Listings", value: properties?.length || 0, icon: Home, color: "text-primary" },
            { label: "Active", value: activeListings, icon: TrendingUp, color: "text-accent" },
            { label: "Bookings", value: pendingBookings, icon: Calendar, color: "text-destructive" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl p-3 shadow-card text-center">
              <s.icon className={`h-5 w-5 mx-auto ${s.color}`} />
              <p className={`text-xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => navigate("/app/post")} className="gradient-blue text-primary-foreground border-0 gap-2">
            <Home className="h-4 w-4" /> List Property
          </Button>
          <Button onClick={() => navigate("/app/search")} variant="outline" className="gap-2">
            <Search className="h-4 w-4" /> Find Properties
          </Button>
        </div>

        {/* Total Views */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-foreground">{totalViews}</p>
            <p className="text-xs text-muted-foreground">Total property views</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <h3 className="font-bold text-foreground mb-2">Recent Booking Requests</h3>
          {!bookings?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b: any) => (
                <div key={b.id} className="bg-card rounded-xl p-3 shadow-card">
                  <p className="text-sm font-semibold text-foreground truncate">{b.properties?.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{b.scheduled_date}</span>
                    <span>{b.scheduled_time}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      b.status === "pending" ? "bg-primary/10 text-primary" : b.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-secondary text-foreground"
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Listings */}
        <div>
          <h3 className="font-bold text-foreground mb-2">My Listings</h3>
          {!properties?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No listings yet. Start by posting a property!</p>
          ) : (
            <div className="space-y-2">
              {properties.slice(0, 5).map(p => (
                <button key={p.id} onClick={() => navigate(`/app/property/${p.id}`)} className="w-full bg-card rounded-xl p-3 shadow-card flex gap-3 text-left">
                  <img src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.city} · ₹{Number(p.price).toLocaleString("en-IN")}</p>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      p.status === "active" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                    }`}>{p.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;

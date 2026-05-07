import { ArrowLeft, Home, TrendingUp, Eye, Calendar, IndianRupee, Plus, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const formatPrice = (p: number) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}`;
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#8b5cf6", "#ec4899"];

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["landlord-properties", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["landlord-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const totalViews = properties.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const totalRevenue = properties.filter(p => p.type === "rent").reduce((sum, p) => sum + p.price, 0);
  const activeCount = properties.filter(p => p.status === "approved").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;

  const cityData = properties.reduce((acc: Record<string, number>, p) => {
    acc[p.city] = (acc[p.city] || 0) + 1;
    return acc;
  }, {});
  const cityChart = Object.entries(cityData).map(([city, count]) => ({ city, count }));

  const typeData = properties.reduce((acc: Record<string, number>, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});
  const typeChart = Object.entries(typeData).map(([name, value]) => ({ name, value }));

  const viewsChart = properties.slice(0, 6).map(p => ({
    name: p.title.slice(0, 12),
    views: p.view_count || 0,
  }));

  const stats = [
    { icon: Home, label: "Total Properties", value: properties.length, color: "text-primary" },
    { icon: Eye, label: "Total Views", value: totalViews, color: "text-accent" },
    { icon: IndianRupee, label: "Monthly Revenue", value: formatPrice(totalRevenue), color: "text-primary" },
    { icon: Calendar, label: "Pending Bookings", value: pendingBookings, color: "text-destructive" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Landlord Dashboard</h2>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-4 shadow-card">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button onClick={() => navigate("/app/post")} className="flex-1 gap-2"><Plus className="h-4 w-4" /> Add Property</Button>
          <Button onClick={() => navigate("/app/owner-analytics")} variant="outline" className="flex-1 gap-2"><BarChart3 className="h-4 w-4" /> Analytics</Button>
        </div>

        {/* Views Chart */}
        {viewsChart.length > 0 && (
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-bold text-foreground text-sm mb-3">Property Views</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={viewsChart}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Type Distribution */}
        {typeChart.length > 0 && (
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-bold text-foreground text-sm mb-3">Property Types</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={typeChart} dataKey="value" cx="50%" cy="50%" outerRadius={50} strokeWidth={0}>
                    {typeChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {typeChart.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-foreground capitalize">{t.name}</span>
                    <span className="text-xs font-bold text-muted-foreground">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Properties by City */}
        {cityChart.length > 0 && (
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-bold text-foreground text-sm mb-3">Properties by City</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={cityChart} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="city" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Property List */}
        <div>
          <h3 className="font-bold text-foreground text-sm mb-3">Your Properties</h3>
          <div className="space-y-2">
            {properties.map((p) => (
              <button key={p.id} onClick={() => navigate(`/app/property/${p.id}`)} className="w-full bg-card rounded-2xl p-3 shadow-card flex gap-3 text-left">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.city} · {p.type}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-bold text-primary">{formatPrice(p.price)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === "approved" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {properties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No properties yet</p>
                <Button onClick={() => navigate("/app/post")} className="mt-3 gap-2"><Plus className="h-4 w-4" /> List Your First Property</Button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <div>
            <h3 className="font-bold text-foreground text-sm mb-3">Recent Bookings</h3>
            <div className="space-y-2">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="bg-card rounded-xl p-3 shadow-card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.scheduled_date} at {b.scheduled_time}</p>
                    <p className="text-[10px] text-muted-foreground">{b.notes || "Visit booking"}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                    b.status === "confirmed" ? "bg-accent/10 text-accent" : b.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-muted text-muted-foreground"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordDashboard;

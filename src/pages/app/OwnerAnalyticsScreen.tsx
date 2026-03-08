import { useState } from "react";
import { ArrowLeft, TrendingUp, Eye, Users, MessageSquare, Calendar, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import SEOHead from "@/components/SEOHead";

const COLORS = ["hsl(217,91%,50%)", "hsl(142,64%,36%)", "hsl(0,84%,60%)", "hsl(45,93%,47%)", "hsl(280,60%,50%)"];

const OwnerAnalyticsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: properties } = useQuery({
    queryKey: ["analytics-props", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: bookings } = useQuery({
    queryKey: ["analytics-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("owner_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: reviews } = useQuery({
    queryKey: ["analytics-reviews", user?.id],
    queryFn: async () => {
      const propIds = properties?.map((p) => p.id) || [];
      if (!propIds.length) return [];
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .in("property_id", propIds);
      return data || [];
    },
    enabled: !!properties?.length,
  });

  const { data: conversations } = useQuery({
    queryKey: ["analytics-convos", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`);
      return count || 0;
    },
    enabled: !!user,
  });

  const totalViews = properties?.reduce((s, p) => s + (p.view_count || 0), 0) || 0;
  const totalBookings = bookings?.length || 0;
  const avgRating = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const conversionRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : "0";

  // Views per property chart
  const viewsData = properties?.map((p) => ({
    name: p.title.length > 10 ? p.title.slice(0, 10) + "…" : p.title,
    views: p.view_count || 0,
  })).sort((a, b) => b.views - a.views).slice(0, 6) || [];

  // Bookings by status
  const bookingStatusData = [
    { name: "Confirmed", value: bookings?.filter((b) => b.status === "confirmed").length || 0 },
    { name: "Pending", value: bookings?.filter((b) => b.status === "pending").length || 0 },
    { name: "Cancelled", value: bookings?.filter((b) => b.status === "cancelled").length || 0 },
    { name: "Completed", value: bookings?.filter((b) => b.status === "completed").length || 0 },
  ].filter((d) => d.value > 0);

  // Property type distribution
  const typeData = properties?.reduce((acc, p) => {
    const type = p.type.charAt(0).toUpperCase() + p.type.slice(1);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const typeChartData = Object.entries(typeData || {}).map(([name, value]) => ({ name, value }));

  // Simulated weekly views trend
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    views: Math.floor(totalViews / 7 * (0.7 + Math.random() * 0.6)),
  }));

  if (!user) { navigate("/auth"); return null; }

  return (
    <div className="bg-background min-h-screen pb-6">
      <SEOHead title="Owner Analytics" />
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Analytics
        </h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Eye, label: "Total Views", value: totalViews, color: "text-primary" },
            { icon: Calendar, label: "Bookings", value: totalBookings, color: "text-accent" },
            { icon: Star, label: "Avg Rating", value: avgRating, color: "text-yellow-500" },
            { icon: TrendingUp, label: "Conversion", value: `${conversionRate}%`, color: "text-primary" },
            { icon: MessageSquare, label: "Conversations", value: conversations || 0, color: "text-primary" },
            { icon: Users, label: "Listings", value: properties?.length || 0, color: "text-accent" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
              </div>
              <p className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Weekly Views Trend */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h4 className="text-sm font-bold text-foreground mb-3">📈 Weekly Views Trend</h4>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="hsl(217,91%,50%)" fill="hsl(217,91%,50%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Views per Listing */}
        {viewsData.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card">
            <h4 className="text-sm font-bold text-foreground mb-3">👁️ Views per Listing</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={viewsData}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215,16%,47%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3">
          {bookingStatusData.length > 0 && (
            <div className="bg-card rounded-xl p-4 shadow-card">
              <h4 className="text-[10px] font-bold text-foreground mb-2">Booking Status</h4>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={bookingStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={42} label={({ name }) => name}>
                    {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {typeChartData.length > 0 && (
            <div className="bg-card rounded-xl p-4 shadow-card">
              <h4 className="text-[10px] font-bold text-foreground mb-2">Property Types</h4>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={typeChartData} dataKey="value" cx="50%" cy="50%" outerRadius={42} label={({ name }) => name}>
                    {typeChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerAnalyticsScreen;

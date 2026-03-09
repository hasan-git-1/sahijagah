import { useState } from "react";
import { ArrowLeft, Home, Eye, Calendar, Edit, Trash2, Plus, Check, X, TrendingUp } from "lucide-react";
import PropertyEditModal from "@/components/PropertyEditModal";
import BulkUploadModal from "@/components/BulkUploadModal";
import OwnerChatbot from "@/components/OwnerChatbot";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import SEOHead from "@/components/SEOHead";

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  active: "bg-accent/10 text-accent",
  rejected: "bg-destructive/10 text-destructive",
};

const bookingStatusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  confirmed: "bg-accent/10 text-accent",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-secondary text-foreground",
};

type Tab = "listings" | "bookings" | "stats";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("listings");
  const [editProperty, setEditProperty] = useState<any>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

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
        .select("*, properties(title, city)")
        .eq("owner_id", user!.id)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      
      // Fetch client profiles separately since there's no FK
      const clientIds = [...new Set((data || []).map(b => b.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, name, email").in("id", clientIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (data || []).map(b => ({
        ...b,
        client_profile: profileMap.get(b.client_id) || null,
      }));
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

  const COLORS = ["hsl(217,91%,50%)", "hsl(142,64%,36%)", "hsl(0,84%,60%)", "hsl(45,93%,47%)"];

  const viewsData = properties?.map((p) => ({
    name: p.title.length > 12 ? p.title.slice(0, 12) + "…" : p.title,
    views: p.view_count || 0,
  })) || [];

  const statusData = [
    { name: "Active", value: properties?.filter((p) => p.status === "active").length || 0 },
    { name: "Pending", value: properties?.filter((p) => p.status === "pending").length || 0 },
    { name: "Rejected", value: properties?.filter((p) => p.status === "rejected").length || 0 },
  ].filter((d) => d.value > 0);

  const bookingStatusData = [
    { name: "Pending", value: bookings?.filter((b) => b.status === "pending").length || 0 },
    { name: "Confirmed", value: bookings?.filter((b) => b.status === "confirmed").length || 0 },
    { name: "Cancelled", value: bookings?.filter((b) => b.status === "cancelled").length || 0 },
    { name: "Completed", value: bookings?.filter((b) => b.status === "completed").length || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-background min-h-screen">
      <SEOHead title="Owner Dashboard" />
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
        {/* Stats with Charts */}
        {tab === "stats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Listings", value: properties?.length || 0, color: "text-primary" },
                { label: "Active Listings", value: activeCount, color: "text-accent" },
                { label: "Total Views", value: totalViews, color: "text-primary" },
                { label: "Pending Bookings", value: pendingBookings, color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 shadow-card text-center">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Views per listing chart */}
            {viewsData.length > 0 && (
              <div className="bg-card rounded-xl p-4 shadow-card">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Views per Listing
                </h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={viewsData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Status breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {statusData.length > 0 && (
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <h4 className="text-xs font-bold text-foreground mb-2">Listing Status</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={45} label={({ name }) => name}>
                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {bookingStatusData.length > 0 && (
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <h4 className="text-xs font-bold text-foreground mb-2">Booking Status</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={bookingStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={45} label={({ name }) => name}>
                        {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listings */}
        {tab === "listings" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={() => navigate("/app/post")} className="flex-1 gradient-blue text-primary-foreground border-0 gap-2">
                <Plus className="h-4 w-4" /> Post New
              </Button>
              <Button onClick={() => setShowBulkUpload(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> CSV Upload
              </Button>
            </div>

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
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setEditProperty(p)}>
                      <Edit className="h-3 w-3" /> Edit
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

      {editProperty && user && (
        <PropertyEditModal
          open={!!editProperty}
          onOpenChange={(open) => !open && setEditProperty(null)}
          property={editProperty}
          userId={user.id}
        />
      )}

      {showBulkUpload && user && (
        <BulkUploadModal
          open={showBulkUpload}
          onOpenChange={setShowBulkUpload}
          userId={user.id}
        />
      )}

      {/* AI Chatbot for owners */}
      <OwnerChatbot />
    </div>
  );
};

export default OwnerDashboard;

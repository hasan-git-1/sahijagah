import { useState } from "react";
import { ArrowLeft, Shield, Home, Users, Star, Check, X, BarChart3, Flag, TrendingUp, Sparkles, Bot, Loader2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Tab = "properties" | "ai" | "users" | "feedback" | "stats" | "reports";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("properties");

  // Check admin role
  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      return !!data;
    },
    enabled: !!user,
  });

  // Properties
  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  // Users
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  // Feedback
  const { data: feedback } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  // Reports
  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*, properties(title, city)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("properties").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast.success("Property updated");
    },
  });

  if (checkingRole) {
    return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Shield className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-bold text-foreground mb-2">Access Denied</h3>
        <p className="text-sm text-muted-foreground mb-6">You need admin privileges to access this page.</p>
        <Button onClick={() => navigate("/app")} variant="outline">Go Home</Button>
      </div>
    );
  }

  const pendingCount = properties?.filter((p) => p.status === "pending").length || 0;
  const activeCount = properties?.filter((p) => p.status === "approved").length || 0;
  const totalUsers = profiles?.length || 0;
  const avgRating = feedback?.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : "0";

  const pendingReports = reports?.filter(r => r.status === "pending").length || 0;

  const tabs: { key: Tab; icon: React.ElementType; label: string }[] = [
    { key: "properties", icon: Home, label: "Properties" },
    { key: "ai", icon: Sparkles, label: "AI" },
    { key: "users", icon: Users, label: "Users" },
    { key: "reports", icon: Flag, label: "Reports" },
    { key: "feedback", icon: Star, label: "Feedback" },
    { key: "stats", icon: BarChart3, label: "Stats" },
  ];

  const handleManageUsers = () => navigate("/app/admin/users");

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Admin Dashboard
          </h2>
        </div>
        <div className="flex gap-1 mt-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Stats cards */}
        {tab === "stats" && (() => {
          const COLORS = ["hsl(217,91%,50%)", "hsl(142,64%,36%)", "hsl(0,84%,60%)", "hsl(45,93%,47%)", "hsl(280,60%,50%)"];
          
          const cityData = properties ? Object.entries(
            properties.reduce((acc: Record<string, number>, p) => { acc[p.city] = (acc[p.city] || 0) + 1; return acc; }, {})
          ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6) : [];

          const typeData = properties ? Object.entries(
            properties.reduce((acc: Record<string, number>, p) => { acc[p.type] = (acc[p.type] || 0) + 1; return acc; }, {})
          ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })) : [];

          const totalViews = properties?.reduce((s, p) => s + (p.view_count || 0), 0) || 0;
          const totalReports = reports?.length || 0;

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Pending", value: pendingCount, color: "text-primary" },
                  { label: "Active Listings", value: activeCount, color: "text-accent" },
                  { label: "Total Users", value: totalUsers, color: "text-primary" },
                  { label: "Avg Rating", value: avgRating, color: "text-primary" },
                  { label: "Total Views", value: totalViews, color: "text-primary" },
                  { label: "Reports", value: totalReports, color: "text-destructive" },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-xl p-4 shadow-card text-center">
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* City distribution chart */}
              {cityData.length > 0 && (
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Listings by City
                  </h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={cityData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Type distribution */}
              {typeData.length > 0 && (
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <h4 className="text-xs font-bold text-foreground mb-2">Property Types</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={typeData} dataKey="value" cx="50%" cy="50%" outerRadius={55} label={({ name, value }) => `${name} (${value})`}>
                        {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })()}

        {/* Properties */}
        {tab === "properties" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{pendingCount} pending approval</p>
            {properties?.map((p) => (
              <div key={p.id} className="bg-card rounded-xl p-3 shadow-card">
                <div className="flex gap-3">
                  <img
                    src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                    alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.city} · ₹{Number(p.price).toLocaleString("en-IN")}</p>
                    <span className={`inline-flex items-center mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      p.status === "approved" ? "bg-accent/20 text-accent" : p.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-destructive/20 text-destructive"
                    }`}>{p.status}</span>
                  </div>
                </div>
                {p.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 gradient-cta text-accent-foreground border-0 gap-1"
                      onClick={() => updateProperty.mutate({ id: p.id, updates: { status: "approved", is_verified: true } })}
                    >
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive border-destructive gap-1"
                      onClick={() => updateProperty.mutate({ id: p.id, updates: { status: "rejected" } })}
                    >
                      <X className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Automation */}
        {tab === "ai" && <AIAutomationPanel properties={properties || []} />}

        {/* Users */}
        {tab === "users" && (
          <div className="space-y-2">
            <Button onClick={handleManageUsers} className="w-full gradient-blue text-primary-foreground border-0 gap-2 mb-3">
              <Users className="h-4 w-4" /> Advanced User Management
            </Button>
            {profiles?.map((p) => (
              <div key={p.id} className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{p.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{p.role}</span>
              </div>
            ))}
          </div>
        )}

        {/* Feedback */}
        {tab === "feedback" && (
          <div className="space-y-3">
            {feedback?.map((f) => (
              <div key={f.id} className="bg-card rounded-xl p-3 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-foreground">{f.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < f.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{f.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{f.city} · {new Date(f.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reports */}
        {tab === "reports" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{pendingReports} pending reports</p>
            {!reports?.length ? (
              <div className="text-center py-10 text-muted-foreground">
                <Flag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reports yet</p>
              </div>
            ) : (
              reports.map((r: any) => (
                <div key={r.id} className="bg-card rounded-xl p-3 shadow-card">
                  <p className="text-sm font-semibold text-foreground">{r.properties?.title || "Unknown"}</p>
                  <p className="text-xs text-destructive font-medium mt-1">{r.reason}</p>
                  {r.details && <p className="text-xs text-muted-foreground mt-1">{r.details}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      r.status === "pending" ? "bg-primary/10 text-primary" : r.status === "resolved" ? "bg-accent/10 text-accent" : "bg-secondary text-foreground"
                    }`}>{r.status}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => updateProperty.mutate({ id: r.id, updates: { status: "resolved" } })}>
                        Mark Resolved
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive border-destructive" onClick={() => updateProperty.mutate({ id: r.id, updates: { status: "dismissed" } })}>
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- AI Automation Panel ----------
function AIAutomationPanel({ properties }: { properties: any[] }) {
  const queryClient = useQueryClient();
  const [runningId, setRunningId] = useState<string | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  const pending = properties.filter((p) => p.status === "pending");

  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ["ai-review-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_review_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const reviewOne = async (propertyId: string) => {
    const { data, error } = await supabase.functions.invoke("ai-property-review", {
      body: { property_id: propertyId },
    });
    if (error) throw error;
    return data;
  };

  const handleReview = async (id: string) => {
    setRunningId(id);
    try {
      const res: any = await reviewOne(id);
      toast.success(`AI verdict: ${res.status} (score ${res.ai_result?.realness_score ?? "?"})`);
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      refetchLogs();
    } catch (e: any) {
      toast.error(e.message || "AI review failed");
    } finally {
      setRunningId(null);
    }
  };

  const handleBulk = async () => {
    if (!pending.length) return toast.info("No pending listings to review");
    setBulkRunning(true);
    setProgress({ done: 0, total: pending.length });
    let approved = 0, rejected = 0, review = 0, failed = 0;
    for (let i = 0; i < pending.length; i++) {
      try {
        const res: any = await reviewOne(pending[i].id);
        if (res.status === "approved") approved++;
        else if (res.status === "rejected") rejected++;
        else review++;
      } catch {
        failed++;
      }
      setProgress({ done: i + 1, total: pending.length });
    }
    setBulkRunning(false);
    toast.success(`AI done — ${approved} approved · ${rejected} rejected · ${review} needs review${failed ? ` · ${failed} failed` : ""}`);
    queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    refetchLogs();
  };

  const logByPropId = new Map((logs || []).map((l: any) => [l.property_id, l]));

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">AI Moderator</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analyses photos + text like a human reviewer. Auto-approves score ≥85, auto-rejects &lt;50, flags 50–84 for you.
            </p>
          </div>
        </div>
        <Button
          onClick={handleBulk}
          disabled={bulkRunning || !pending.length}
          className="w-full mt-3 gradient-cta text-accent-foreground border-0 gap-2"
        >
          {bulkRunning ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Reviewing {progress.done}/{progress.total}…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Review all {pending.length} pending</>
          )}
        </Button>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Pending listings</p>
        {!pending.length ? (
          <div className="bg-card rounded-xl p-6 text-center shadow-card">
            <Check className="h-8 w-8 mx-auto text-accent mb-2" />
            <p className="text-sm text-muted-foreground">All caught up. No pending listings.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((p) => {
              const log: any = logByPropId.get(p.id);
              return (
                <div key={p.id} className="bg-card rounded-xl p-3 shadow-card">
                  <div className="flex gap-3">
                    <img
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                      alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.city} · ₹{Number(p.price).toLocaleString("en-IN")} · {p.type}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" disabled={runningId === p.id} onClick={() => handleReview(p.id)}>
                      {runningId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      AI
                    </Button>
                  </div>
                  {log && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.realness_score >= 85 ? "bg-accent/20 text-accent" : log.realness_score < 50 ? "bg-destructive/20 text-destructive" : "bg-yellow-100 text-yellow-800"
                        }`}>Score {log.realness_score}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">→ {log.resulting_status}</span>
                      </div>
                      {log.photo_notes && <p className="text-[11px] text-muted-foreground italic">"{log.photo_notes}"</p>}
                      {log.reasons?.length > 0 && (
                        <ul className="text-[11px] text-foreground/80 list-disc list-inside">
                          {log.reasons.slice(0, 3).map((r: string, i: number) => <li key={i}>{r}</li>)}
                        </ul>
                      )}
                      {log.flagged_issues?.length > 0 && (
                        <div className="flex items-start gap-1 text-[11px] text-destructive">
                          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{log.flagged_issues.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {logs && logs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Recent AI reviews</p>
          <div className="space-y-2">
            {logs.slice(0, 10).map((l: any) => {
              const prop = properties.find((p) => p.id === l.property_id);
              return (
                <div key={l.id} className="bg-card rounded-xl p-3 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">{prop?.title || "Deleted listing"}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      l.realness_score >= 85 ? "bg-accent/20 text-accent" : l.realness_score < 50 ? "bg-destructive/20 text-destructive" : "bg-yellow-100 text-yellow-800"
                    }`}>{l.realness_score} · {l.resulting_status}</span>
                  </div>
                  {l.photo_notes && <p className="text-[11px] text-muted-foreground mt-1 italic">"{l.photo_notes}"</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

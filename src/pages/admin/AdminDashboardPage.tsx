import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-card rounded-xl p-4 lg:p-5 shadow-card border border-border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl lg:text-3xl font-extrabold text-foreground mt-1">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [props, users] = await Promise.all([
        supabase.from("properties").select("status, view_count, created_at"),
        supabase.from("profiles").select("id"),
      ]);
      const properties = props.data || [];
      return {
        total: properties.length,
        pending: properties.filter((p) => p.status === "pending").length,
        approved: properties.filter((p) => p.status === "approved").length,
        rejected: properties.filter((p) => p.status === "rejected").length,
        users: users.data?.length || 0,
        views: properties.reduce((s: number, p: any) => s + (p.view_count || 0), 0),
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, status, city, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Platform metrics at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <StatCard icon={Home} label="Total Properties" value={stats?.total ?? "—"} color="bg-primary/10 text-primary" />
        <StatCard icon={Clock} label="Pending Approval" value={stats?.pending ?? "—"} color="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" />
        <StatCard icon={CheckCircle} label="Approved" value={stats?.approved ?? "—"} color="bg-green-500/10 text-green-600 dark:text-green-400" />
        <StatCard icon={XCircle} label="Rejected" value={stats?.rejected ?? "—"} color="bg-destructive/10 text-destructive" />
        <StatCard icon={Users} label="Users" value={stats?.users ?? "—"} color="bg-primary/10 text-primary" />
        <StatCard icon={Eye} label="Total Views" value={stats?.views ?? "—"} color="bg-accent/10 text-accent" />
      </div>

      {(stats?.pending ?? 0) > 0 && (
        <Link
          to="/admin/pending"
          className="block bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 hover:bg-yellow-500/20 transition-colors"
        >
          <p className="text-sm font-semibold text-foreground">
            {stats?.pending} {stats?.pending === 1 ? "property is" : "properties are"} waiting for approval
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tap to review →</p>
        </Link>
      )}

      <div className="bg-card rounded-xl p-4 lg:p-5 shadow-card border border-border">
        <h3 className="font-bold text-foreground mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recent?.length ? recent.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.city} · {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                r.status === "approved" ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : r.status === "pending" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                : "bg-destructive/10 text-destructive"
              }`}>{r.status}</span>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

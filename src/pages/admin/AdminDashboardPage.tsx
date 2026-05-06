import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Clock, Users, Ban, TrendingUp } from "lucide-react";

const AdminDashboardPage = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [props, profiles] = await Promise.all([
        supabase.from("properties").select("id,status,created_at,title"),
        supabase.from("profiles").select("id,is_banned,name,email"),
      ]);
      const properties = props.data || [];
      const users = profiles.data || [];
      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      return {
        approved: properties.filter((p) => p.status === "approved").length,
        pending: properties.filter((p) => p.status === "pending").length,
        rejected: properties.filter((p) => p.status === "rejected").length,
        users: users.length,
        banned: users.filter((u) => u.is_banned).length,
        thisWeek: properties.filter((p) => p.created_at >= weekAgo).length,
        recent: [...properties]
          .sort((a, b) => (b.created_at > a.created_at ? 1 : -1))
          .slice(0, 10),
      };
    },
    refetchInterval: 15000,
  });

  const cards = [
    { label: "Approved Properties", value: stats?.approved ?? 0, icon: Building2, color: "text-accent" },
    { label: "Pending Approvals", value: stats?.pending ?? 0, icon: Clock, color: "text-amber-500", highlight: (stats?.pending ?? 0) > 0 },
    { label: "Total Users", value: stats?.users ?? 0, icon: Users, color: "text-primary" },
    { label: "Banned Users", value: stats?.banned ?? 0, icon: Ban, color: "text-destructive" },
    { label: "New This Week", value: stats?.thisWeek ?? 0, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of urbanStay activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-card border rounded-xl p-4 ${c.highlight ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20" : "border-border"}`}
          >
            <c.icon className={`h-5 w-5 ${c.color} mb-2`} />
            <p className="text-2xl font-extrabold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3">Recent Listings</h3>
        {!stats?.recent?.length ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.recent.map((p) => (
              <li key={p.id} className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{p.title}</span>
                <span className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                    p.status === "approved" ? "bg-accent/15 text-accent" :
                    p.status === "pending" ? "bg-amber-100 text-amber-800" :
                    "bg-destructive/15 text-destructive"
                  }`}>{p.status}</span>
                  <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

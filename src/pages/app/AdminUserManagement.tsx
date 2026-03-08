import { useState } from "react";
import { ArrowLeft, Shield, Users, Search, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ROLES = ["client", "owner", "agent", "admin"] as const;

const roleColors: Record<string, string> = {
  client: "bg-secondary text-foreground",
  owner: "bg-primary/10 text-primary",
  agent: "bg-accent/10 text-accent",
  admin: "bg-destructive/10 text-destructive",
};

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQ, setSearchQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      return !!data;
    },
    enabled: !!user,
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-user-mgmt"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!isAdmin,
  });

  const { data: userRoles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
    enabled: !!isAdmin,
  });

  const updateVerification = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_verified: verified }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-mgmt"] });
      toast.success("User updated");
    },
  });

  const getUserRoles = (userId: string) => {
    return userRoles?.filter((r) => r.user_id === userId).map((r) => r.role) || [];
  };

  const filtered = profiles?.filter((p) => {
    const matchSearch = !searchQ || p.name?.toLowerCase().includes(searchQ.toLowerCase()) || p.email?.toLowerCase().includes(searchQ.toLowerCase());
    const matchRole = roleFilter === "all" || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (!isAdmin) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Shield className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-bold text-foreground mb-2">Access Denied</h3>
        <Button onClick={() => navigate("/app")} variant="outline">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> User Management
        </h2>
      </div>

      {/* Search & Filter */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name or email..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {["all", ...ROLES].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                roleFilter === r ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{filtered?.length || 0} users</p>
      </div>

      {/* Users List */}
      <div className="px-4 space-y-2 pb-6">
        {filtered?.map((p) => {
          const roles = getUserRoles(p.id);
          const isExpanded = editingUser === p.id;

          return (
            <div key={p.id} className="bg-card rounded-xl shadow-card overflow-hidden">
              <button
                onClick={() => setEditingUser(isExpanded ? null : p.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className="h-10 w-10 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">
                    {p.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {p.name || "Unnamed"}
                    {p.is_verified && <Check className="h-3.5 w-3.5 text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[p.role] || roleColors.client}`}>
                  {p.role}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-2 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Phone: {p.phone || "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Roles:</span>
                    {roles.length > 0 ? roles.map((r) => (
                      <span key={r} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[r] || roleColors.client}`}>
                        {r}
                      </span>
                    )) : (
                      <span className="text-[10px] text-muted-foreground">No roles</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={p.is_verified ? "outline" : "default"}
                      className={`flex-1 text-xs ${!p.is_verified ? "gradient-blue text-primary-foreground border-0" : ""}`}
                      onClick={() => updateVerification.mutate({ userId: p.id, verified: !p.is_verified })}
                    >
                      {p.is_verified ? "Remove Verified" : "✅ Verify User"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUserManagement;

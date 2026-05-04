import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Ban, CheckCircle, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id, role");
      const map: Record<string, string[]> = {};
      (data || []).forEach((r) => {
        map[r.user_id] = [...(map[r.user_id] || []), r.role];
      });
      return map;
    },
  });

  const updateBan = useMutation({
    mutationFn: async ({ id, is_banned }: { id: string; is_banned: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_banned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      toast.success("User updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ id, makeAdmin }: { id: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (users || []).filter(
    (u) => !search || `${u.name || ""} ${u.email || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {users?.length || 0} users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const userRoles = roles?.[u.id] || [];
                  const isAdmin = userRoles.includes("admin");
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground font-bold text-xs">{u.name?.charAt(0)?.toUpperCase() || "U"}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[180px]">{u.name || "Unnamed"}</p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{u.role}</span>
                        {isAdmin && <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">admin</span>}
                      </td>
                      <td className="px-4 py-3">
                        {u.is_banned ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Banned</span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            title={isAdmin ? "Remove admin" : "Make admin"}
                            className="p-1.5 rounded-md hover:bg-secondary text-foreground"
                            onClick={() => {
                              if (confirm(`${isAdmin ? "Remove" : "Grant"} admin role for ${u.email}?`)) {
                                toggleAdmin.mutate({ id: u.id, makeAdmin: !isAdmin });
                              }
                            }}
                          >
                            {isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>
                          <button
                            title={u.is_banned ? "Unban" : "Ban"}
                            className={`p-1.5 rounded-md hover:bg-secondary ${u.is_banned ? "text-green-600" : "text-destructive"}`}
                            onClick={() => updateBan.mutate({ id: u.id, is_banned: !u.is_banned })}
                          >
                            {u.is_banned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;

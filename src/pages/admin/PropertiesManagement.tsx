import { forwardRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Trash2, Search, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PropertiesManagement = forwardRef<HTMLDivElement>((_, ref) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-all-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("properties").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-properties"] });
      toast.success("Updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-properties"] });
      toast.success("Property deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (properties || []).filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !`${p.title} ${p.city} ${p.address}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div ref={ref} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">All Properties</h2>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {properties?.length || 0} listings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, city, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 bg-secondary p-1 rounded-lg">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                statusFilter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Property</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">City</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200"}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[200px]">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.city}</td>
                    <td className="px-4 py-3 text-foreground font-medium">₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        p.status === "approved" ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : p.status === "pending" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                        : "bg-destructive/10 text-destructive"
                      }`}>{p.status}</span>
                      {!p.is_visible && <span className="ml-1 text-[10px] text-muted-foreground">(hidden)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          title={p.is_visible ? "Hide" : "Show"}
                          className="p-1.5 rounded-md hover:bg-secondary text-foreground"
                          onClick={() => update.mutate({ id: p.id, updates: { is_visible: !p.is_visible } })}
                        >
                          {p.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          title={p.is_featured ? "Unfeature" : "Feature"}
                          className="p-1.5 rounded-md hover:bg-secondary text-foreground"
                          onClick={() => update.mutate({ id: p.id, updates: { is_featured: !p.is_featured } })}
                        >
                          {p.is_featured ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                        </button>
                        <button
                          title="Delete"
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                          onClick={() => {
                            if (confirm(`Delete "${p.title}"? This cannot be undone.`)) remove.mutate(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No properties match your filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

PropertiesManagement.displayName = "PropertiesManagement";

export default PropertiesManagement;

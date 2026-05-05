import { forwardRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, MapPin, Bed, Bath, IndianRupee, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PendingApprovals = forwardRef<HTMLDivElement>((_, ref) => {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const ownerIds = Array.from(new Set((properties || []).map((p) => p.owner_id).filter(Boolean))) as string[];
  const { data: owners } = useQuery({
    queryKey: ["admin-pending-owners", ownerIds.sort().join(",")],
    queryFn: async () => {
      if (!ownerIds.length) return {} as Record<string, any>;
      const { data } = await supabase.from("profiles").select("id, name, email").in("id", ownerIds);
      return Object.fromEntries((data || []).map((p) => [p.id, p]));
    },
    enabled: ownerIds.length > 0,
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .update({ status: "approved", is_verified: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Property approved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async ({ id, rejection_reason }: { id: string; rejection_reason: string }) => {
      const { error } = await supabase
        .from("properties")
        .update({ status: "rejected", rejection_reason })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setRejecting(null);
      setReason("");
      toast.success("Property rejected");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div ref={ref} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pending Approvals</h2>
        <p className="text-sm text-muted-foreground mt-1">{properties?.length || 0} properties waiting</p>
      </div>

      {!properties?.length ? (
        <div className="bg-card rounded-xl p-12 text-center shadow-card border border-border">
          <Check className="h-10 w-10 mx-auto text-accent mb-3" />
          <p className="text-foreground font-semibold">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No properties pending review.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((p) => {
            const owner = p.owner_id ? owners?.[p.owner_id] : null;
            return (
              <div key={p.id} className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                <div className="aspect-video bg-secondary relative">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pending</span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground">{p.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {p.address || p.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground flex-wrap">
                    <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{Number(p.price).toLocaleString("en-IN")}</span>
                    <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{p.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.bathrooms}</span>
                    <span className="px-2 py-0.5 bg-secondary rounded capitalize">{p.type}</span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  )}
                  {owner && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 pt-2 border-t border-border">
                      <User className="h-3 w-3" /> {owner.name || "—"} · {owner.email}
                    </p>
                  )}

                  {rejecting === p.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for rejection (sent to owner)"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setRejecting(null); setReason(""); }}>Cancel</Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={!reason.trim() || reject.isPending}
                          onClick={() => reject.mutate({ id: p.id, rejection_reason: reason.trim() })}
                        >
                          Confirm Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1"
                        disabled={approve.isPending}
                        onClick={() => approve.mutate(p.id)}
                      >
                        <Check className="h-3 w-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-destructive border-destructive gap-1"
                        onClick={() => setRejecting(p.id)}
                      >
                        <X className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

PendingApprovals.displayName = "PendingApprovals";

export default PendingApprovals;

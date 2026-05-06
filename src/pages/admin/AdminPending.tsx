import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

const AdminPending = () => {
  const qc = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data: list } = useQuery({
    queryKey: ["admin-pending-list"],
    queryFn: async () => {
      const { data: properties } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      const ownerIds = Array.from(new Set((properties || []).map((p) => p.owner_id).filter(Boolean)));
      const owners = ownerIds.length
        ? (await supabase.from("profiles").select("id,name,email").in("id", ownerIds)).data || []
        : [];
      const ownerMap = Object.fromEntries(owners.map((o) => [o.id, o]));
      return (properties || []).map((p) => ({ ...p, owner: ownerMap[p.owner_id || ""] }));
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").update({ status: "approved", is_verified: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-list"] });
      qc.invalidateQueries({ queryKey: ["admin-pending-count"] });
      toast.success("Property approved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async ({ id, rejection_reason }: { id: string; rejection_reason: string }) => {
      const { error } = await supabase
        .from("properties")
        .update({ status: "rejected", rejection_reason: rejection_reason || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending-list"] });
      qc.invalidateQueries({ queryKey: ["admin-pending-count"] });
      toast.success("Property rejected");
      setRejectId(null);
      setReason("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Listings</h1>
        <p className="text-sm text-muted-foreground">Review and approve new property submissions</p>
      </div>

      {!list?.length ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground">All caught up — no pending listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex gap-3">
                <img
                  src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                  alt={p.title}
                  className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.type}</p>
                  <p className="text-sm font-bold text-primary mt-1">₹{Number(p.price).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {p.address || p.city}
                  </p>
                </div>
              </div>

              {p.images?.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                  {p.images.slice(0, 6).map((img: string, i: number) => (
                    <img key={i} src={img} alt="" className="h-14 w-14 rounded-md object-cover flex-shrink-0" />
                  ))}
                </div>
              )}

              <div className="mt-3 text-xs text-muted-foreground">
                <p><span className="font-semibold text-foreground">Owner:</span> {p.owner?.name || "—"} ({p.owner?.email || "—"})</p>
                <p><span className="font-semibold text-foreground">Submitted:</span> {new Date(p.created_at).toLocaleString()}</p>
                {p.description && <p className="mt-1 line-clamp-3">{p.description}</p>}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => approve.mutate(p.id)}
                  disabled={approve.isPending}
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setRejectId(p.id)}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Optionally provide a reason. The property will not appear publicly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => rejectId && reject.mutate({ id: rejectId, rejection_reason: reason })}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPending;

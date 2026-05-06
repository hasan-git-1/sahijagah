import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Action = { type: "ban" | "unban" | "delete"; userId: string; name: string } | null;

const AdminUsers = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<Action>(null);

  const { data } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const [{ data: profiles }, { data: properties }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("properties").select("id,owner_id"),
      ]);
      const counts: Record<string, number> = {};
      (properties || []).forEach((p) => {
        if (p.owner_id) counts[p.owner_id] = (counts[p.owner_id] || 0) + 1;
      });
      return (profiles || []).map((u) => ({ ...u, listingCount: counts[u.id] || 0 }));
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data || [];
    return (data || []).filter((u) =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const setBanned = useMutation({
    mutationFn: async ({ id, is_banned }: { id: string; is_banned: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_banned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
      toast.success(vars.is_banned ? "User banned" : "User unbanned");
      setAction(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeUser = useMutation({
    mutationFn: async (id: string) => {
      // Delete user's properties first (will also clean up listings)
      await supabase.from("properties").delete().eq("owner_id", id);
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
      toast.success("User and listings deleted");
      setAction(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const confirmText =
    action?.type === "ban" ? `Ban ${action.name}? They will lose access immediately.` :
    action?.type === "unban" ? `Unban ${action.name}? Their access will be restored.` :
    action?.type === "delete" ? `Delete ${action.name}? This will remove them and all their listings permanently.` : "";

  const handleConfirm = () => {
    if (!action) return;
    if (action.type === "ban") setBanned.mutate({ id: action.userId, is_banned: true });
    else if (action.type === "unban") setBanned.mutate({ id: action.userId, is_banned: false });
    else if (action.type === "delete") removeUser.mutate(action.userId);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">Manage registered users</p>
      </div>

      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name || "Unnamed"}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{u.listingCount}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.is_banned ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}>
                    {u.is_banned ? "Banned" : "Active"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {u.is_banned ? (
                      <Button size="sm" variant="ghost" onClick={() => setAction({ type: "unban", userId: u.id, name: u.name || "user" })}>
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setAction({ type: "ban", userId: u.id, name: u.name || "user" })}>
                        <Ban className="h-4 w-4 text-amber-600" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setAction({ type: "delete", userId: u.id, name: u.name || "user" })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No users found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm action</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={action?.type === "unban" ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
              onClick={handleConfirm}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;

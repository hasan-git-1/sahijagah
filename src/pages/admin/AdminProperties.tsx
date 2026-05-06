import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const STATUSES = ["all", "approved", "pending", "rejected"] as const;

const AdminProperties = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("all");
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: properties } = useQuery({
    queryKey: ["admin-all-properties"],
    queryFn: async () => {
      const { data: rows } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      const ownerIds = Array.from(new Set((rows || []).map((r) => r.owner_id).filter(Boolean)));
      const owners = ownerIds.length
        ? (await supabase.from("profiles").select("id,name,email").in("id", ownerIds)).data || []
        : [];
      const map = Object.fromEntries(owners.map((o) => [o.id, o]));
      return (rows || []).map((r) => ({ ...r, owner: map[r.owner_id || ""] }));
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (properties || []).filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (q && !p.title?.toLowerCase().includes(q) && !p.owner?.name?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [properties, search, filter]);

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase.from("properties").update({ is_visible }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-all-properties"] });
      toast.success("Visibility updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-all-properties"] });
      toast.success("Property deleted");
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Properties</h1>
        <p className="text-sm text-muted-foreground">Manage every listing in the system</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or owner..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">{p.city}</TableCell>
                <TableCell>₹{Number(p.price).toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-muted-foreground max-w-[160px] truncate">{p.owner?.name || "—"}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                    p.status === "approved" ? "bg-accent/15 text-accent" :
                    p.status === "pending" ? "bg-amber-100 text-amber-800" :
                    "bg-destructive/15 text-destructive"
                  }`}>{p.status}</span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={p.is_visible !== false}
                    onCheckedChange={(v) => toggleVisibility.mutate({ id: p.id, is_visible: v })}
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!pageRows.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                  No properties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages} • {filtered.length} total
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && remove.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProperties;

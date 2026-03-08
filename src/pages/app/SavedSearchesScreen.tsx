import { ArrowLeft, Trash2, Search, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SavedSearchesScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: searches, isLoading } = useQuery({
    queryKey: ["saved-searches", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteSaved = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("saved_searches").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
      toast.success("Search deleted");
    },
  });

  const toggleNotify = useMutation({
    mutationFn: async ({ id, notify }: { id: string; notify: boolean }) => {
      await supabase.from("saved_searches").update({ notify }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-searches"] }),
  });

  const applySearch = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.type) params.set("type", filters.type);
    if (filters.query) params.set("q", filters.query);
    navigate(`/app/search?${params.toString()}`);
  };

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Search className="h-12 w-12 text-primary mb-4" />
        <h3 className="font-bold text-foreground mb-2">Sign in to save searches</h3>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">Saved Searches</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !searches?.length ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Search className="h-12 w-12 text-primary/50 mb-4" />
          <h3 className="font-bold text-foreground mb-1">No saved searches</h3>
          <p className="text-sm text-muted-foreground">Save a search from the search screen to get notified of new listings.</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {searches.map((s: any) => (
            <div key={s.id} className="bg-card rounded-xl p-3 shadow-card">
              <div className="flex items-center justify-between">
                <button onClick={() => applySearch(s.filters)} className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Object.entries(s.filters || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ") || "All properties"}
                  </p>
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleNotify.mutate({ id: s.id, notify: !s.notify })}
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${s.notify ? "bg-primary/10" : "bg-secondary"}`}
                  >
                    {s.notify ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button
                    onClick={() => deleteSaved.mutate(s.id)}
                    className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearchesScreen;

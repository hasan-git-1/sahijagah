import { useState } from "react";
import { ArrowLeft, Wrench, Plus, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = ["Plumbing", "Electrical", "Appliance", "Pest Control", "Painting", "Other"];
const priorityColors: Record<string, string> = {
  low: "bg-accent/10 text-accent",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};
const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  "in-progress": AlertCircle,
  resolved: CheckCircle2,
};

const MaintenanceScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["maintenance", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_requests")
        .select("*, properties(title)")
        .eq("tenant_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myProperties } = useQuery({
    queryKey: ["my-rented", user?.id],
    queryFn: async () => {
      // Get properties the user has booked (simulated as rented)
      const { data } = await supabase
        .from("bookings")
        .select("property_id, properties(id, title)")
        .eq("client_id", user!.id)
        .eq("status", "confirmed")
        .limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const propertyId = myProperties?.[0]?.property_id;
      if (!propertyId) throw new Error("No property found");
      const { error } = await supabase.from("maintenance_requests").insert({
        tenant_id: user!.id,
        property_id: propertyId,
        category,
        priority,
        description,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Maintenance request submitted!");
      setShowForm(false);
      setCategory("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Sign in to access maintenance requests</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground flex-1">Maintenance</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1 gradient-blue text-primary-foreground border-0">
          <Plus className="h-3.5 w-3.5" /> New
        </Button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {showForm && (
          <div className="bg-card rounded-2xl p-4 shadow-card space-y-3 animate-fade-in">
            <h3 className="font-bold text-foreground text-sm">New Request</h3>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors ${
                      category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Priority</p>
              <div className="flex gap-2">
                {["low", "medium", "high"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      priority === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-sm"
            />

            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!category || !description || submitMutation.isPending}
              className="w-full gradient-blue text-primary-foreground border-0 gap-2"
            >
              <Send className="h-4 w-4" /> Submit Request
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-1">No maintenance requests</h3>
            <p className="text-sm text-muted-foreground">Tap "New" to submit a request</p>
          </div>
        ) : (
          requests.map((req: any) => {
            const StatusIcon = statusIcons[req.status] || Clock;
            return (
              <div key={req.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{req.category}</p>
                    <p className="text-[10px] text-muted-foreground">{req.properties?.title || "Property"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${priorityColors[req.priority]}`}>
                      {req.priority}
                    </span>
                    <StatusIcon className={`h-4 w-4 ${
                      req.status === "resolved" ? "text-accent" : req.status === "in-progress" ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                </div>
                <p className="text-xs text-foreground">{req.description}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · 
                  <span className="capitalize"> {req.status}</span>
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MaintenanceScreen;

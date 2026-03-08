import { useState } from "react";
import { ArrowLeft, Plus, X, BedDouble, Bath, MapPin, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Property } from "@/hooks/useProperties";

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const CompareScreen = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const { data: searchResults } = useQuery({
    queryKey: ["compare-search", searchQ],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .or(`title.ilike.%${searchQ}%,city.ilike.%${searchQ}%`)
        .limit(10);
      return (data || []) as Property[];
    },
    enabled: searchQ.length > 1,
  });

  const { data: selected } = useQuery({
    queryKey: ["compare-properties", selectedIds],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .in("id", selectedIds);
      return (data || []) as Property[];
    },
    enabled: selectedIds.length > 0,
  });

  const addProperty = (id: string) => {
    if (selectedIds.length >= 3) return;
    if (!selectedIds.includes(id)) setSelectedIds([...selectedIds, id]);
    setShowPicker(false);
    setSearchQ("");
  };

  const removeProperty = (id: string) => {
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  const compareFields = [
    { label: "Price", render: (p: Property) => formatPrice(p.price, p.type) },
    { label: "Type", render: (p: Property) => p.type.charAt(0).toUpperCase() + p.type.slice(1) },
    { label: "City", render: (p: Property) => p.city },
    { label: "Bedrooms", render: (p: Property) => p.bedrooms?.toString() || "—" },
    { label: "Bathrooms", render: (p: Property) => p.bathrooms?.toString() || "—" },
    { label: "Area", render: (p: Property) => p.area || "—" },
    { label: "Amenities", render: (p: Property) => p.amenities?.join(", ") || "None" },
    { label: "Verified", render: (p: Property) => p.is_verified ? "✅ Yes" : "No" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h2 className="text-lg font-bold text-foreground">Compare Properties</h2>
      </div>

      {/* Selected properties header */}
      <div className="px-4 py-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((slot) => {
            const prop = selected?.find((p) => p.id === selectedIds[slot]);
            return (
              <div key={slot} className="flex-1">
                {prop ? (
                  <div className="bg-card rounded-xl shadow-card overflow-hidden relative">
                    <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"} alt="" className="w-full h-20 object-cover" />
                    <button onClick={() => removeProperty(prop.id)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                      <X className="h-3 w-3 text-destructive-foreground" />
                    </button>
                    <div className="p-2">
                      <p className="text-[10px] font-semibold text-foreground truncate">{prop.title}</p>
                      <p className="text-[10px] text-primary font-bold">{formatPrice(prop.price, prop.type)}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPicker(true)}
                    className="w-full h-[120px] rounded-xl border-2 border-dashed border-input flex flex-col items-center justify-center gap-1 hover:bg-secondary/50 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Add</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {selected && selected.length >= 2 && (
        <div className="px-4 pb-6">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {compareFields.map((field, i) => (
              <div key={field.label} className={`flex ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="w-24 flex-shrink-0 bg-secondary/50 px-3 py-3 text-xs font-semibold text-foreground">
                  {field.label}
                </div>
                <div className="flex-1 flex divide-x divide-border">
                  {selected.map((p) => (
                    <div key={p.id} className="flex-1 px-2 py-3 text-xs text-muted-foreground">
                      {field.render(p)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && selected.length < 2 && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">Add at least 2 properties to compare</p>
        </div>
      )}

      {/* Search Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
            <button onClick={() => { setShowPicker(false); setSearchQ(""); }}>
              <X className="h-5 w-5 text-foreground" />
            </button>
            <input
              autoFocus
              placeholder="Search property to add..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {searchResults?.filter((r) => !selectedIds.includes(r.id)).map((p) => (
              <button
                key={p.id}
                onClick={() => addProperty(p.id)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary/50 text-left"
              >
                <img src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.city} · {formatPrice(p.price, p.type)}</p>
                </div>
                <Plus className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareScreen;

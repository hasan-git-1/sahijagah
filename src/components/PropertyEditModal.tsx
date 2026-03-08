import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PropertyEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  userId: string;
}

const amenitiesList = ["WiFi", "Parking", "Gym", "Pool", "AC", "Furnished", "Security", "Garden", "Elevator", "Power Backup"];

const PropertyEditModal = ({ open, onOpenChange, property, userId }: PropertyEditModalProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: property.title || "",
    description: property.description || "",
    price: String(property.price || ""),
    city: property.city || "",
    address: property.address || "",
    bedrooms: String(property.bedrooms || 0),
    bathrooms: String(property.bathrooms || 0),
    area: property.area || "",
    amenities: property.amenities || [],
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const toggleAmenity = (a: string) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x: string) => x !== a) : [...f.amenities, a],
    }));

  const handleSave = async () => {
    if (!form.title || !form.price || !form.city) {
      toast.error("Title, price, and city are required");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("properties").update({
        title: form.title,
        description: form.description || null,
        price: Number(form.price),
        city: form.city,
        address: form.address || null,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: form.area || null,
        amenities: form.amenities,
      }).eq("id", property.id).eq("owner_id", userId);
      if (error) throw error;
      toast.success("Property updated!");
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-x-4 top-8 bottom-8 z-50 bg-card rounded-2xl shadow-card overflow-y-auto max-w-md mx-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-3 flex items-center justify-between border-b border-border">
          <h3 className="font-bold text-foreground">Edit Property</h3>
          <button onClick={() => onOpenChange(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="p-4 space-y-3">
          <input className={inputClass} placeholder="Title *" value={form.title} onChange={e => update("title", e.target.value)} />
          <textarea className={inputClass + " resize-none"} placeholder="Description" rows={3} value={form.description} onChange={e => update("description", e.target.value)} />
          <input className={inputClass} placeholder="Price (₹) *" type="number" value={form.price} onChange={e => update("price", e.target.value)} />
          <input className={inputClass} placeholder="City *" value={form.city} onChange={e => update("city", e.target.value)} />
          <input className={inputClass} placeholder="Address" value={form.address} onChange={e => update("address", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputClass} placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={e => update("bedrooms", e.target.value)} />
            <input className={inputClass} placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={e => update("bathrooms", e.target.value)} />
          </div>
          <input className={inputClass} placeholder="Area (e.g. 1,100 sqft)" value={form.area} onChange={e => update("area", e.target.value)} />
          
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map(a => (
                <button key={a} onClick={() => toggleAmenity(a)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.amenities.includes(a) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full gradient-blue text-primary-foreground border-0">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default PropertyEditModal;

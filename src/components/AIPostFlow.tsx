import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Check, Phone, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import MapPinPicker from "@/components/MapPinPicker";

const amenitiesList = ["WiFi", "Parking", "Gym", "Pool", "AC", "Furnished", "Security", "Garden", "Elevator", "Power Backup"];

interface Draft {
  title: string;
  description: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  extra_amenities: string[];
}

const AIPostFlow = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const [form, setForm] = useState({
    type: "",
    city: "",
    address: "",
    price: "",
    phone: "",
    amenities: [] as string[],
    lat: null as number | null,
    lng: null as number | null,
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const toggleAmenity = (a: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground";

  const generate = async () => {
    if (images.length === 0) {
      toast.error("Add at least one photo so AI can describe the place");
      return;
    }
    if (!form.type || !form.city || !form.price) {
      toast.error("Add type, location and rate first");
      return;
    }
    if (!form.phone) {
      toast.error("Please provide a phone number");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-listing-draft", {
        body: {
          images,
          type: form.type,
          city: form.city,
          address: form.address,
          price: Number(form.price),
          amenities: form.amenities,
        },
      });
      if (error) {
        const details = (error as any)?.context?.text ? await (error as any).context.text() : error.message;
        let msg = details;
        try {
          msg = JSON.parse(details)?.error ?? details;
        } catch { /* plain text */ }
        throw new Error(msg);
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      setDraft(data as Draft);
      toast.success("AI wrote your listing ✨");
    } catch (err: any) {
      toast.error(err.message || "AI could not draft the listing");
    } finally {
      setGenerating(false);
    }
  };


  const publish = async () => {
    if (!draft) return;
    setPublishing(true);
    try {
      await supabase.from("profiles").update({ phone: form.phone }).eq("id", userId);

      const mergedAmenities = Array.from(new Set([...form.amenities, ...(draft.extra_amenities || [])]));

      const { data: inserted, error } = await supabase
        .from("properties")
        .insert({
          title: draft.title,
          description: draft.description || null,
          type: form.type,
          category: draft.category || null,
          price: Number(form.price),
          city: form.city,
          address: form.address || null,
          bedrooms: draft.bedrooms,
          bathrooms: draft.bathrooms,
          area: draft.area || null,
          amenities: mergedAmenities,
          images,
          owner_id: userId,
          status: "pending",
          is_featured: true,
          lat: form.lat,
          lng: form.lng,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (inserted?.id) {
        supabase.functions.invoke("ai-property-review", { body: { property_id: inserted.id } }).catch(() => {});
      }

      toast.success("AI posted your property! Going live after image check 🎉");
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Failed to post property");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">1. Photos</p>
          <ImageUploader userId={userId} images={images} onImagesChange={setImages} maxImages={5} />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">2. The basics</p>
          <select className={inputClass} value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="">Select Type *</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
            <option value="pg">PG</option>
            <option value="commercial">Commercial</option>
          </select>
          <input className={inputClass} placeholder="City *" value={form.city} onChange={(e) => update("city", e.target.value)} />
          <input className={inputClass} placeholder="Full Address" value={form.address} onChange={(e) => update("address", e.target.value)} />
          <MapPinPicker
            lat={form.lat ?? undefined}
            lng={form.lng ?? undefined}
            city={form.city}
            onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
          />
          <input className={inputClass} placeholder="Rate / Price (₹) *" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} />
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className={inputClass + " pl-10"}
              placeholder="Phone Number * (for WhatsApp & calls)"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-2">3. Amenities</p>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((a) => (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                  form.amenities.includes(a) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {form.amenities.includes(a) && <Check className="h-3 w-3" />}
                {a}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={generating} className="w-full gap-2 font-semibold">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? "AI is writing your listing..." : draft ? "Regenerate with AI" : "Let AI build my listing"}
        </Button>
      </div>

      {draft && (
        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-foreground">AI draft — review & publish</h3>
          </div>

          <div className="space-y-2">
            <input className={inputClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <textarea
              className={inputClass + " resize-none"}
              rows={5}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <input className={inputClass} type="number" value={draft.bedrooms} onChange={(e) => setDraft({ ...draft, bedrooms: Number(e.target.value) })} placeholder="Beds" />
              <input className={inputClass} type="number" value={draft.bathrooms} onChange={(e) => setDraft({ ...draft, bathrooms: Number(e.target.value) })} placeholder="Baths" />
              <input className={inputClass} value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} placeholder="Area" />
            </div>
            <p className="text-xs text-muted-foreground">
              Category: <span className="text-foreground font-medium capitalize">{draft.category}</span>
              {draft.extra_amenities?.length > 0 && (
                <> · AI spotted: <span className="text-foreground font-medium">{draft.extra_amenities.join(", ")}</span></>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={generate} disabled={generating} className="gap-1">
              <RefreshCw className="h-4 w-4" /> Redo
            </Button>
            <Button onClick={publish} disabled={publishing} className="flex-1 gradient-cta text-accent-foreground border-0 font-semibold">
              {publishing ? "Posting..." : "Publish with AI"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPostFlow;

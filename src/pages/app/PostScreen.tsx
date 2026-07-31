import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, ChevronLeft, ChevronRight, Check, Phone, Sparkles, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import BulkUploadModal from "@/components/BulkUploadModal";
import MapPinPicker from "@/components/MapPinPicker";
import AIPostFlow from "@/components/AIPostFlow";

const steps = ["Photos", "Basic Info", "Location", "Details", "Amenities", "Review"];
const amenitiesList = ["WiFi", "Parking", "Gym", "Pool", "AC", "Furnished", "Security", "Garden", "Elevator", "Power Backup"];

const PostScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"choose" | "manual" | "ai">("choose");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showBulk, setShowBulk] = useState(false);


  const [form, setForm] = useState({
    title: "", description: "", type: "", category: "",
    price: "", city: "", address: "", phone: "",
    bedrooms: "0", bathrooms: "0", area: "",
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

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <div className="h-16 w-16 rounded-full gradient-blue flex items-center justify-center mb-4">
          <Camera className="h-8 w-8 text-primary-foreground" />
        </div>
        <h3 className="font-bold text-lg text-foreground mb-2">Sign in to post</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center">Create an account to list your property for free.</p>
        <Button onClick={() => navigate("/auth")} className="gradient-blue text-primary-foreground border-0 px-8">Sign In</Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.title || !form.type || !form.price || !form.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!form.phone) {
      toast.error("Please provide a phone number");
      return;
    }
    setLoading(true);
    try {
      // Save phone to profile
      await supabase.from("profiles").update({ phone: form.phone }).eq("id", user.id);

      const { data: inserted, error } = await supabase.from("properties").insert({
        title: form.title,
        description: form.description || null,
        type: form.type,
        category: form.category || null,
        price: Number(form.price),
        city: form.city,
        address: form.address || null,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: form.area || null,
        amenities: form.amenities,
        images: images,
        owner_id: user.id,
        status: "pending",
        is_featured: true,
        lat: form.lat,
        lng: form.lng,
      }).select("id").single();
      if (error) throw error;

      // Fire-and-forget AI image authenticity check → auto-approves if photos look real
      if (inserted?.id) {
        supabase.functions.invoke("ai-property-review", { body: { property_id: inserted.id } }).catch(() => {});
      }

      toast.success("Property posted! Going live after image check 🎉");
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Failed to post property");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground";
  const selectClass = inputClass + " text-muted-foreground";

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Post Property</h2>
          <button onClick={() => setShowBulk(true)} className="text-xs font-semibold text-primary">
            📋 Bulk Upload
          </button>
        </div>
        <div className="flex gap-1 mt-2">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Step {step + 1}: {steps[step]}</p>
      </div>

      <div className="px-4 py-6">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          {step === 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Add Property Photos</p>
              <ImageUploader userId={user.id} images={images} onImagesChange={setImages} maxImages={5} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <input className={inputClass} placeholder="Property Title *" value={form.title} onChange={(e) => update("title", e.target.value)} />
              <select className={selectClass} value={form.type} onChange={(e) => update("type", e.target.value)}>
                <option value="">Select Type *</option>
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
                <option value="pg">PG</option>
                <option value="commercial">Commercial</option>
              </select>
              <select className={selectClass} value={form.category} onChange={(e) => update("category", e.target.value)}>
                <option value="">Select Category</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
                <option value="office">Office</option>
              </select>
              <textarea className={inputClass + " resize-none"} placeholder="Description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <input className={inputClass} placeholder="City *" value={form.city} onChange={(e) => update("city", e.target.value)} />
              <input className={inputClass} placeholder="Full Address" value={form.address} onChange={(e) => update("address", e.target.value)} />
              <MapPinPicker
                lat={form.lat ?? undefined}
                lng={form.lng ?? undefined}
                city={form.city}
                onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <input className={inputClass} placeholder="Price (₹) *" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
                <input className={inputClass} placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
              </div>
              <input className={inputClass} placeholder="Area (e.g. 1,100 sqft)" value={form.area} onChange={(e) => update("area", e.target.value)} />
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
              <p className="text-[10px] text-muted-foreground">Your phone number will be used for WhatsApp enquiries and calls from interested buyers/tenants.</p>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Select Amenities</p>
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
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h3 className="font-bold text-foreground">Review Your Listing</h3>
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                  ))}
                </div>
              )}
              <div className="text-sm space-y-2">
                <p><span className="text-muted-foreground">Title:</span> <span className="text-foreground font-medium">{form.title || "—"}</span></p>
                <p><span className="text-muted-foreground">Type:</span> <span className="text-foreground font-medium capitalize">{form.type || "—"}</span></p>
                <p><span className="text-muted-foreground">Category:</span> <span className="text-foreground font-medium capitalize">{form.category || "—"}</span></p>
                <p><span className="text-muted-foreground">Price:</span> <span className="text-foreground font-medium">₹{Number(form.price).toLocaleString("en-IN") || "—"}</span></p>
                <p><span className="text-muted-foreground">City:</span> <span className="text-foreground font-medium">{form.city || "—"}</span></p>
                <p><span className="text-muted-foreground">Address:</span> <span className="text-foreground font-medium">{form.address || "—"}</span></p>
                <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground font-medium">{form.phone || "—"}</span></p>
                <p><span className="text-muted-foreground">Bedrooms:</span> <span className="text-foreground font-medium">{form.bedrooms}</span></p>
                <p><span className="text-muted-foreground">Bathrooms:</span> <span className="text-foreground font-medium">{form.bathrooms}</span></p>
                <p><span className="text-muted-foreground">Area:</span> <span className="text-foreground font-medium">{form.area || "—"}</span></p>
                <p><span className="text-muted-foreground">Photos:</span> <span className="text-foreground font-medium">{images.length}</span></p>
                <p><span className="text-muted-foreground">Amenities:</span> <span className="text-foreground font-medium">{form.amenities.join(", ") || "None"}</span></p>
                {form.lat && form.lng && <p><span className="text-muted-foreground">📍 Location:</span> <span className="text-foreground font-medium">{form.lat}, {form.lng}</span></p>}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1 gradient-blue text-primary-foreground border-0 gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 gradient-cta text-accent-foreground border-0 font-semibold">
                {loading ? "Posting..." : "Post Property"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <BulkUploadModal open={showBulk} onOpenChange={setShowBulk} userId={user.id} />
    </div>
  );
};

export default PostScreen;
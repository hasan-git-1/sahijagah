import { ArrowLeft, Heart, Share2, MapPin, BedDouble, Bath, Phone, MessageSquare, Calendar, Wifi, Car, Dumbbell, Wind, Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useProperty } from "@/hooks/useProperties";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import PropertyMapWithNearby from "@/components/PropertyMapWithNearby";
import BookingModal from "@/components/BookingModal";
import EMICalculator from "@/components/EMICalculator";
import PropertyReviews from "@/components/PropertyReviews";

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi, Parking: Car, Gym: Dumbbell, AC: Wind, Pool: Dumbbell,
};

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const typeLabel: Record<string, string> = { rent: "Rent", sale: "Buy", pg: "PG", commercial: "Commercial" };

const PropertyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: property, isLoading } = useProperty(id || "");
  const { data: wishlistIds } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const [showBooking, setShowBooking] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  // Track view count and recently viewed
  useEffect(() => {
    if (!id || viewTracked) return;
    setViewTracked(true);

    // Increment view count (works for all users)
    supabase.rpc("increment_view_count", { property_id: id }).then();

    // Track recently viewed (authenticated only)
    if (user) {
      supabase.from("recently_viewed").upsert(
        { user_id: user.id, property_id: id, viewed_at: new Date().toISOString() },
        { onConflict: "user_id,property_id" }
      ).then();
    }
  }, [id, user, viewTracked]);

  const isWishlisted = wishlistIds?.includes(id || "") ?? false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/app/property/${id}`;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleWishlist = () => {
    if (!user) { toast.error("Sign in to save properties"); navigate("/auth"); return; }
    toggleWishlist.mutate(id!);
  };

  const handleMessage = async () => {
    if (!user) { toast.error("Sign in to message owner"); navigate("/auth"); return; }
    if (!property.owner_id) { toast.error("Owner not available"); return; }
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${property.owner_id}),and(participant_1.eq.${property.owner_id},participant_2.eq.${user.id})`)
      .eq("property_id", property.id)
      .maybeSingle();

    if (existing) { navigate("/app/chat"); return; }

    const { error } = await supabase.from("conversations").insert({
      participant_1: user.id, participant_2: property.owner_id, property_id: property.id,
    });
    if (error) { toast.error("Could not start conversation"); return; }
    toast.success("Conversation started!");
    navigate("/app/chat");
  };

  const handleBookVisit = () => {
    if (!user) { toast.error("Sign in to book a visit"); navigate("/auth"); return; }
    if (!property.owner_id) { toast.error("Owner not available"); return; }
    setShowBooking(true);
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="relative">
        <img
          src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={handleWishlist} className="h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
            <Heart className={`h-5 w-5 ${isWishlisted ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
          </button>
          <button onClick={handleShare} className="h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            {typeLabel[property.type] || property.type}
          </span>
          <span className="bg-card/80 backdrop-blur text-foreground text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Eye className="h-3 w-3" /> {property.view_count || 0} views
          </span>
        </div>
      </div>

      {/* Image gallery */}
      {property.images && property.images.length > 1 && (
        <div className="flex gap-1.5 px-4 mt-3 overflow-x-auto hide-scrollbar">
          {property.images.map((img, i) => (
            <img key={i} src={img} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border-2 border-transparent hover:border-primary transition-colors" />
          ))}
        </div>
      )}

      <div className="px-4 pt-4">
        <p className="text-2xl font-extrabold text-primary">{formatPrice(property.price, property.type)}</p>
        <h1 className="text-lg font-bold text-foreground mt-1">{property.title}</h1>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm">{property.address || property.city}</span>
        </div>

        <div className="flex gap-4 mt-4 py-3 border-y border-border">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <BedDouble className="h-4 w-4 text-primary" /><span>{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Bath className="h-4 w-4 text-primary" /><span>{property.bathrooms} Bath</span>
            </div>
          )}
          {property.area && <div className="text-sm text-foreground">{property.area}</div>}
        </div>

        <div className="mt-4">
          <h3 className="font-bold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
        </div>

        {property.amenities?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold text-foreground mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => {
                const Icon = amenityIcons[a] || Wifi;
                return (
                  <span key={a} className="flex items-center gap-1.5 bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                    <Icon className="h-3.5 w-3.5 text-primary" /> {a}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Map with nearby amenities */}
        {property.lat && property.lng && (
          <div className="mt-4">
            <h3 className="font-bold text-foreground mb-2">Location & Nearby</h3>
            <PropertyMapWithNearby lat={property.lat} lng={property.lng} title={property.title} className="h-56 w-full rounded-xl overflow-hidden" showNearby={true} />
          </div>
        )}

        {/* EMI Calculator for sale properties */}
        {(property.type === "sale" || property.type === "commercial") && (
          <div className="mt-4">
            <EMICalculator propertyPrice={property.price} />
          </div>
        )}

        {/* Reviews */}
        <div className="mt-4">
          <PropertyReviews propertyId={property.id} />
        </div>

        {/* Compare CTA */}
        <div className="mt-4">
          <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/app/compare")}>
            📊 Compare with other properties
          </Button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border px-4 py-3 flex gap-3 z-50">
        <Button variant="outline" className="flex-1 gap-2">
          <Phone className="h-4 w-4" /> Call
        </Button>
        <Button onClick={handleMessage} className="flex-1 gradient-blue text-primary-foreground border-0 gap-2">
          <MessageSquare className="h-4 w-4" /> Message
        </Button>
        <Button onClick={handleBookVisit} className="flex-1 gradient-cta text-accent-foreground border-0 gap-2">
          <Calendar className="h-4 w-4" /> Book Visit
        </Button>
      </div>

      {property.owner_id && user && (
        <BookingModal
          open={showBooking}
          onOpenChange={setShowBooking}
          propertyId={property.id}
          ownerId={property.owner_id}
          userId={user.id}
          propertyTitle={property.title}
        />
      )}
    </div>
  );
};

export default PropertyDetail;

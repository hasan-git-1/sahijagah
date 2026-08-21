import { ArrowLeft, Heart, MapPin, BedDouble, Bath, Phone, MessageSquare, Calendar, Wifi, Car, Dumbbell, Wind, Eye, Globe } from "lucide-react";
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
import PropertyReviews from "@/components/PropertyReviews";
import NeighborhoodInsights from "@/components/NeighborhoodInsights";
import SEOHead from "@/components/SEOHead";
import PropertyShareMenu from "@/components/PropertyShareMenu";
import ImageGallery from "@/components/ImageGallery";
import SimilarProperties from "@/components/SimilarProperties";
import ReportPropertyModal from "@/components/ReportPropertyModal";
import VerifiedBadge from "@/components/VerifiedBadge";
import VirtualTourViewer from "@/components/VirtualTourViewer";
import TranslatedDescription from "@/components/TranslatedDescription";
import ClickToCall from "@/components/ClickToCall";
import FloorPlanViewer from "@/components/FloorPlanViewer";

import WhatsAppButton from "@/components/WhatsAppButton";
import NeighborhoodReviews from "@/components/NeighborhoodReviews";
import AutoRenewalReminder from "@/components/AutoRenewalReminder";
import SocialProofBanner from "@/components/SocialProofBanner";
import OwnerContactHours from "@/components/OwnerContactHours";
import PropertyVideo from "@/components/PropertyVideo";
import PriceDropAlert from "@/components/PriceDropAlert";
import PropertyShareCard from "@/components/PropertyShareCard";

import CommuteEstimator from "@/components/CommuteEstimator";
import NearbyTransport from "@/components/NearbyTransport";

import SafetyScoreWidget from "@/components/SafetyScoreWidget";
import PropertyTimeline from "@/components/PropertyTimeline";
import QuickContactForm from "@/components/QuickContactForm";

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
  const [ownerProfile, setOwnerProfile] = useState<{ phone?: string | null } | null>(null);

  useEffect(() => {
    if (!id || viewTracked || !user) return;
    setViewTracked(true);
    supabase.rpc("increment_view_count", { property_id: id }).then();
    supabase.from("recently_viewed").upsert(
      { user_id: user.id, property_id: id, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,property_id" }
    ).then();
  }, [id, user, viewTracked]);

  // Fetch owner phone for WhatsApp/Call (signed-in users only — contact details are private)
  useEffect(() => {
    if (!property?.owner_id || !user) return;
    supabase.from("profiles").select("phone").eq("id", property.owner_id).maybeSingle().then(({ data }) => {
      if (data) setOwnerProfile(data);
    });
  }, [property?.owner_id, user]);

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

  const priceLabel = formatPrice(property.price, property.type);

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
    if (existing) { navigate("/app/chat", { state: { openConvoId: existing.id } }); return; }
    const { data: newConvo, error } = await supabase.from("conversations").insert({
      participant_1: user.id, participant_2: property.owner_id, property_id: property.id,
    }).select("id").single();
    if (error || !newConvo) { toast.error("Could not start conversation"); return; }
    toast.success("Conversation started!");
    navigate("/app/chat", { state: { openConvoId: newConvo.id } });
  };

  const handleBookVisit = () => {
    if (!user) { toast.error("Sign in to book a visit"); navigate("/auth"); return; }
    if (!property.owner_id) { toast.error("Owner not available"); return; }
    setShowBooking(true);
  };

  const seoTitle = `${property.title} - ${formatPrice(property.price, property.type)} in ${property.city}`;
  const seoDesc = property.description?.slice(0, 155) || `${property.bedrooms} BHK property for ${property.type} in ${property.city}`;

  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: seoDesc,
    image: property.images?.[0],
    brand: { "@type": "Brand", name: "urbanStay" },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/app/property/${id}`,
    },
  };

  return (
    <main className="bg-background min-h-screen pb-24">
      <SEOHead title={seoTitle} description={seoDesc} image={property.images?.[0]} url={`${window.location.origin}/app/property/${id}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }} />
      
      {/* Hero Image */}
      <div className="relative">
        <img src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"} alt={property.title} className="w-full h-64 object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={handleWishlist} className="h-9 w-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
            <Heart className={`h-5 w-5 ${isWishlisted ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
          </button>
          <PropertyShareMenu propertyId={property.id} title={property.title} price={priceLabel} city={property.city} />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">{typeLabel[property.type] || property.type}</span>
          <span className="bg-card/80 backdrop-blur text-foreground text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Eye className="h-3 w-3" /> {property.view_count || 0} views
          </span>
        </div>
      </div>

      {property.images && property.images.length > 1 && <ImageGallery images={property.images} alt={property.title} />}
      {property.images && property.images.length > 2 && <div className="px-4 mt-4"><VirtualTourViewer images={property.images} title={property.title} /></div>}
      <div className="px-4 mt-4"><PropertyVideo propertyId={property.id} isOwner={user?.id === property.owner_id} /></div>

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-extrabold text-primary">{priceLabel}</p>
          <PriceDropAlert propertyId={property.id} propertyTitle={property.title} currentPrice={property.price} />
        </div>
        <h1 className="text-lg font-bold text-foreground mt-1 flex items-center gap-1.5">
          {property.title}
          <VerifiedBadge isVerified={property.is_verified} size="md" />
        </h1>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm">{property.address || property.city}</span>
        </div>

        <div className="mt-3"><SocialProofBanner viewCount={property.view_count || 0} createdAt={property.created_at} /></div>

        <div className="flex gap-4 mt-4 py-3 border-y border-border">
          {property.bedrooms > 0 && <div className="flex items-center gap-1.5 text-sm text-foreground"><BedDouble className="h-4 w-4 text-primary" /><span>{property.bedrooms} Beds</span></div>}
          {property.bathrooms > 0 && <div className="flex items-center gap-1.5 text-sm text-foreground"><Bath className="h-4 w-4 text-primary" /><span>{property.bathrooms} Bath</span></div>}
          {property.area && <div className="text-sm text-foreground">{property.area}</div>}
        </div>

        <div className="mt-4"><TranslatedDescription description={property.description || ""} /></div>

        {property.amenities?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold text-foreground mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => {
                const Icon = amenityIcons[a] || Wifi;
                return <span key={a} className="flex items-center gap-1.5 bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-full"><Icon className="h-3.5 w-3.5 text-primary" /> {a}</span>;
              })}
            </div>
          </div>
        )}

        {/* Quick Contact */}
        <div className="mt-4"><QuickContactForm propertyTitle={property.title} /></div>

        {/* Listing Timeline */}
        <div className="mt-4">
          <PropertyTimeline createdAt={property.created_at} updatedAt={property.updated_at} viewCount={property.view_count} isVerified={property.is_verified} status={property.status} />
        </div>

        {/* Safety Score */}
        <div className="mt-4"><SafetyScoreWidget city={property.city} /></div>

        {/* Nearby Transport */}
        <div className="mt-4"><NearbyTransport city={property.city} /></div>

        {/* Commute Estimator */}
        <div className="mt-4"><CommuteEstimator propertyCity={property.city} /></div>

        {/* Map & Location */}
        {property.lat && property.lng && (
          <div className="mt-4">
            <h3 className="font-bold text-foreground mb-2">Location & Nearby</h3>
            <PropertyMapWithNearby lat={property.lat} lng={property.lng} title={property.title} className="h-56 w-full rounded-xl overflow-hidden" showNearby={true} />
          </div>
        )}
        {property.lat && property.lng && <div className="mt-4"><NeighborhoodInsights lat={property.lat} lng={property.lng} city={property.city} /></div>}

        <div className="mt-4"><OwnerContactHours /></div>

        {property.images && property.images.length > 1 && <div className="mt-4"><FloorPlanViewer images={property.images} title={property.title} /></div>}

        <div className="mt-4"><NeighborhoodReviews city={property.city} locality={property.address} /></div>

        {/* Auto Renewal Reminder for rent */}
        {property.type === "rent" && (
          <div className="mt-4">
            <AutoRenewalReminder propertyTitle={property.title} />
          </div>
        )}

        <div className="mt-4"><PropertyReviews propertyId={property.id} /></div>
        <SimilarProperties propertyId={property.id} city={property.city} type={property.type} price={property.price} />

        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
          {user && <ReportPropertyModal propertyId={property.id} userId={user.id} />}
          <PropertyShareCard propertyId={property.id} title={property.title} price={priceLabel} city={property.city} bedrooms={property.bedrooms} bathrooms={property.bathrooms} area={property.area} image={property.images?.[0]} type={property.type} />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/app/compare")}>📊 Compare</Button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border px-4 py-3 flex gap-2 z-50">
        <ClickToCall phoneNumber={ownerProfile?.phone || undefined} propertyId={property.id} propertyTitle={property.title} />
        <WhatsAppButton propertyTitle={property.title} propertyPrice={priceLabel} city={property.city} phone={ownerProfile?.phone || undefined} />
        <Button onClick={handleMessage} className="flex-1 gradient-blue text-primary-foreground border-0 gap-2"><MessageSquare className="h-4 w-4" /> Message</Button>
        <Button onClick={handleBookVisit} className="flex-1 gradient-cta text-accent-foreground border-0 gap-2"><Calendar className="h-4 w-4" /> Visit</Button>
      </div>

      {property.owner_id && user && (
        <BookingModal open={showBooking} onOpenChange={setShowBooking} propertyId={property.id} ownerId={property.owner_id} userId={user.id} propertyTitle={property.title} />
      )}
    </main>
  );
};

export default PropertyDetail;
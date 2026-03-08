import { useState } from "react";
import { Search, User, Heart, MapPin, BedDouble, Bath, ChevronRight } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import PropertyTags from "@/components/PropertyTags";
import GeolocationDetect from "@/components/GeolocationDetect";
import AIRecommendations from "@/components/AIRecommendations";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeaturedProperties, Property } from "@/hooks/useProperties";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import heroBanner from "@/assets/hero-banner.jpg";
import cityHyd from "@/assets/city-hyderabad.jpg";
import cityBlr from "@/assets/city-bengaluru.jpg";
import cityPune from "@/assets/city-pune.jpg";
import cityMum from "@/assets/city-mumbai.jpg";
import cityChn from "@/assets/city-chennai.jpg";

const categories = [
  { label: "Rent", emoji: "🏠" },
  { label: "Buy", emoji: "🏗️" },
  { label: "PG", emoji: "🛏️" },
  { label: "Commercial", emoji: "🏢" },
];

const cities = [
  { name: "Hyderabad", count: "3", img: cityHyd },
  { name: "Bengaluru", count: "3", img: cityBlr },
  { name: "Pune", count: "2", img: cityPune },
  { name: "Mumbai", count: "1", img: cityMum },
  { name: "Chennai", count: "1", img: cityChn },
];

const popularAreas = [
  { name: "Gachibowli", img: cityHyd },
  { name: "Whitefield", img: cityBlr },
  { name: "Hinjewadi", img: cityPune },
  { name: "Andheri", img: cityMum },
  { name: "OMR", img: cityChn },
];

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const typeLabel: Record<string, string> = { rent: "Rent", sale: "Buy", pg: "PG", commercial: "Commercial" };

const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: featuredProperties, isLoading } = useFeaturedProperties();
  const { data: wishlistIds } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const handleWishlist = (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save properties"); navigate("/auth"); return; }
    toggleWishlist.mutate(propId);
  };

  return (
    <div className="bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 pt-3 pb-2 shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app/search")}
            className="flex-1 flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search city or locality</span>
          </button>
          <button
            onClick={() => user ? navigate("/app/profile") : navigate("/auth")}
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <User className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      {/* Geolocation */}
      <div className="px-4 mt-2 flex justify-end">
        <GeolocationDetect onLocationDetected={(lat, lng, city) => navigate("/app/search")} />
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden relative">
        <img src={heroBanner} alt="" className="w-full h-36 object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          <h2 className="text-lg font-extrabold text-primary-foreground leading-tight">
            Easy Home Rentals<br />& Sales!
          </h2>
          <p className="text-[10px] text-primary-foreground/80 mt-1">
            Verified Listings | No Brokerage | Direct Contact
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex justify-around px-4 py-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate("/app/search")}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-card">
              <span className="text-xl">{cat.emoji}</span>
            </div>
            <span className="text-xs font-medium text-foreground">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Properties Near You */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Properties Near You</h3>
          <button onClick={() => navigate("/app/search")} className="text-xs text-primary font-medium flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {cities.map((city) => (
            <button
              key={city.name}
              onClick={() => navigate("/app/search")}
              className="flex-shrink-0 w-36 rounded-xl overflow-hidden shadow-card bg-card"
            >
              <img src={city.img} alt={city.name} className="w-full h-20 object-cover" />
              <div className="p-2.5">
                <p className="text-sm font-semibold text-foreground">{city.name}</p>
                <p className="text-[10px] text-muted-foreground">{city.count} properties</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Areas */}
      <div className="px-4 mb-5">
        <h3 className="font-bold text-foreground mb-3">Popular Areas</h3>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
          {popularAreas.map((area) => (
            <button key={area.name} onClick={() => navigate("/app/search")} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="h-16 w-16 rounded-full overflow-hidden shadow-card border-2 border-primary/20">
                <img src={area.img} alt={area.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-medium text-foreground">{area.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* Featured Properties from DB */}
      <div className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-3">Featured Properties</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {featuredProperties?.map((prop) => (
              <button
                key={prop.id}
                onClick={() => navigate(`/app/property/${prop.id}`)}
                className="w-full bg-card rounded-xl overflow-hidden shadow-card text-left"
              >
                <div className="relative">
                  <img
                    src={prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                    alt={prop.title}
                    className="w-full h-40 object-cover"
                  />
                  <span className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {typeLabel[prop.type] || prop.type}
                    </span>
                  </span>
                  <div className="absolute bottom-2 left-2">
                    <PropertyTags createdAt={prop.created_at} viewCount={prop.view_count} isFeatured={prop.is_featured} />
                  </div>
                  <button
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
                    onClick={(e) => handleWishlist(e, prop.id)}
                  >
                    <Heart className={`h-4 w-4 ${wishlistIds?.includes(prop.id) ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="font-bold text-primary text-lg">{formatPrice(prop.price, prop.type)}</p>
                  <p className="font-semibold text-sm text-foreground mt-0.5 flex items-center gap-1">
                    {prop.title}
                    <VerifiedBadge isVerified={prop.is_verified} />
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{prop.address || prop.city}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {prop.bedrooms > 0 && (
                      <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {prop.bedrooms} Beds</span>
                    )}
                    {prop.bathrooms > 0 && (
                      <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {prop.bathrooms} Bath</span>
                    )}
                    {prop.area && <span>{prop.area}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;

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
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import heroBanner from "@/assets/hero-banner.jpg";
import cityHyd from "@/assets/city-hyderabad.jpg";
import cityBlr from "@/assets/city-bengaluru.jpg";
import cityPune from "@/assets/city-pune.jpg";
import cityMum from "@/assets/city-mumbai.jpg";
import cityChn from "@/assets/city-chennai.jpg";

// Default popular areas (shown before geolocation)
const defaultPopularAreas = [
  { name: "Gachibowli", lat: 17.4401, lng: 78.3489, img: cityHyd },
  { name: "Kukatpally", lat: 17.4849, lng: 78.4138, img: cityHyd },
  { name: "HiTech City", lat: 17.4474, lng: 78.3762, img: cityHyd },
  { name: "Madhapur", lat: 17.4483, lng: 78.3915, img: cityHyd },
  { name: "Kondapur", lat: 17.4647, lng: 78.3635, img: cityHyd },
  { name: "Miyapur", lat: 17.4969, lng: 78.3719, img: cityHyd },
];

// All known areas for nearby detection
const allAreas = [
  ...defaultPopularAreas,
  { name: "Whitefield", lat: 12.9698, lng: 77.7500, img: cityBlr },
  { name: "Koramangala", lat: 12.9352, lng: 77.6245, img: cityBlr },
  { name: "Electronic City", lat: 12.8452, lng: 77.6602, img: cityBlr },
  { name: "Indiranagar", lat: 12.9784, lng: 77.6408, img: cityBlr },
  { name: "Hinjewadi", lat: 18.5912, lng: 73.7389, img: cityPune },
  { name: "Kharadi", lat: 18.5515, lng: 73.9350, img: cityPune },
  { name: "Viman Nagar", lat: 18.5679, lng: 73.9143, img: cityPune },
  { name: "Andheri", lat: 19.1197, lng: 72.8468, img: cityMum },
  { name: "Bandra", lat: 19.0596, lng: 72.8295, img: cityMum },
  { name: "Powai", lat: 19.1176, lng: 72.9060, img: cityMum },
  { name: "OMR", lat: 12.8956, lng: 80.2267, img: cityChn },
  { name: "Velachery", lat: 12.9750, lng: 80.2200, img: cityChn },
  { name: "T Nagar", lat: 13.0418, lng: 80.2341, img: cityChn },
];

// Haversine distance in km
const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatPrice = (p: number, type: string) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString("en-IN")}${type === "rent" || type === "pg" ? "/mo" : ""}`;
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: featuredProperties, isLoading } = useFeaturedProperties();
  const { data: wishlistIds } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  const popularAreas = userLoc
    ? allAreas
        .map((a) => ({ ...a, dist: distanceKm(userLoc.lat, userLoc.lng, a.lat, a.lng) }))
        .filter((a) => a.dist <= 10)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 8)
    : defaultPopularAreas;

  const categories = [
    { label: t("rent"), emoji: "🏠", type: "rent" },
    { label: t("buy"), emoji: "🏗️", type: "sale" },
    { label: t("pg"), emoji: "🛏️", type: "pg" },
    { label: t("commercial"), emoji: "🏢", type: "commercial" },
  ];

  const typeLabel: Record<string, string> = { rent: t("rent"), sale: t("buy"), pg: t("pg"), commercial: t("commercial") };

  const handleWishlist = (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    if (!user) { toast.error(t("sign_in")); navigate("/auth"); return; }
    toggleWishlist.mutate(propId);
  };

  return (
    <div className="bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 pt-3 pb-2 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app/search")} className="flex-1 flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("search_placeholder")}</span>
          </button>
          <button onClick={() => user ? navigate("/app/profile") : navigate("/auth")} className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-2 flex justify-end">
        <GeolocationDetect onLocationDetected={(lat, lng) => setUserLoc({ lat, lng })} />
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden relative">
        <img src={heroBanner} alt="" className="w-full h-36 object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          <h2 className="text-lg font-extrabold text-primary-foreground leading-tight">{t("easy_home")}</h2>
          <p className="text-[10px] text-primary-foreground/80 mt-1">{t("verified_listings")}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex justify-around px-4 py-4">
        {categories.map((cat) => (
          <button key={cat.type} onClick={() => navigate("/app/search")} className="flex flex-col items-center gap-1.5">
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
          <h3 className="font-bold text-foreground">{t("properties_near")}</h3>
          <button onClick={() => navigate("/app/search")} className="text-xs text-primary font-medium flex items-center gap-0.5">
            {t("view_all")} <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {cities.map((city) => (
            <button key={city.name} onClick={() => navigate("/app/search")} className="flex-shrink-0 w-36 rounded-xl overflow-hidden shadow-card bg-card">
              <img src={city.img} alt={city.name} className="w-full h-20 object-cover" />
              <div className="p-2.5">
                <p className="text-sm font-semibold text-foreground">{city.name}</p>
                <p className="text-[10px] text-muted-foreground">{city.count} {t("properties")}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Areas */}
      <div className="px-4 mb-5">
        <h3 className="font-bold text-foreground mb-3">{t("popular_areas")}</h3>
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

      <AIRecommendations />

      {/* Featured Properties */}
      <div className="px-4 mb-6">
        <h3 className="font-bold text-foreground mb-3">{t("featured")}</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featuredProperties?.map((prop) => (
              <button key={prop.id} onClick={() => navigate(`/app/property/${prop.id}`)} className="w-full bg-card rounded-xl overflow-hidden shadow-card text-left flex flex-col">
                <div className="relative">
                  <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"} alt={prop.title} className="w-full h-28 object-cover" />
                  <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-semibold px-2 py-0.5 rounded-full">
                    {typeLabel[prop.type] || prop.type}
                  </span>
                  <button className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-card/70 backdrop-blur flex items-center justify-center" onClick={(e) => handleWishlist(e, prop.id)}>
                    <Heart className={`h-3.5 w-3.5 ${wishlistIds?.includes(prop.id) ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <div className="p-2.5 flex flex-col gap-0.5 flex-1">
                  <p className="font-bold text-primary text-sm">{formatPrice(prop.price, prop.type)}</p>
                  <p className="font-semibold text-xs text-foreground truncate">{prop.title}</p>
                  <div className="flex items-center gap-0.5 text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="text-[10px] truncate">{prop.address || prop.city}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
                    {prop.bedrooms > 0 && <span className="flex items-center gap-0.5"><BedDouble className="h-2.5 w-2.5" /> {prop.bedrooms} {t("beds")}</span>}
                    {prop.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-2.5 w-2.5" /> {prop.bathrooms} {t("bath")}</span>}
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

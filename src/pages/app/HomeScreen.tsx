import { useState } from "react";
import { Search, Heart, MapPin, BedDouble, Bath, Maximize2, ShieldCheck, Bell, Sparkles, TrendingUp, ArrowRight, Home as HomeIcon, Building2, BedSingle, Store } from "lucide-react";
import GeolocationDetect from "@/components/GeolocationDetect";
import SEOHead from "@/components/SEOHead";
import AIRecommendations from "@/components/AIRecommendations";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeaturedProperties } from "@/hooks/useProperties";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import cityHyd from "@/assets/city-hyderabad.jpg";
import cityBlr from "@/assets/city-bengaluru.jpg";
import cityPune from "@/assets/city-pune.jpg";
import cityMum from "@/assets/city-mumbai.jpg";
import cityChn from "@/assets/city-chennai.jpg";
import areaGachibowli from "@/assets/area-gachibowli.jpg";
import areaKukatpally from "@/assets/area-kukatpally.jpg";
import areaHitechcity from "@/assets/area-hitechcity.jpg";
import areaMadhapur from "@/assets/area-madhapur.jpg";
import areaKondapur from "@/assets/area-kondapur.jpg";
import areaMiyapur from "@/assets/area-miyapur.jpg";

const defaultPopularAreas = [
  { name: "Gachibowli", lat: 17.4401, lng: 78.3489, img: areaGachibowli },
  { name: "Kukatpally", lat: 17.4849, lng: 78.4138, img: areaKukatpally },
  { name: "HiTech City", lat: 17.4474, lng: 78.3762, img: areaHitechcity },
  { name: "Madhapur", lat: 17.4483, lng: 78.3915, img: areaMadhapur },
  { name: "Kondapur", lat: 17.4647, lng: 78.3635, img: areaKondapur },
  { name: "Miyapur", lat: 17.4969, lng: 78.3719, img: areaMiyapur },
];


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
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
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

  const { data: notifCount } = useQuery({
    queryKey: ["home-notif", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
  });

  const popularAreas = userLoc
    ? allAreas
        .map((a) => ({ ...a, dist: distanceKm(userLoc.lat, userLoc.lng, a.lat, a.lng) }))
        .filter((a) => a.dist <= 10)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 8)
    : defaultPopularAreas;

  const categories = [
    { label: t("rent"), Icon: HomeIcon, type: "rent" },
    { label: t("buy"), Icon: Building2, type: "sale" },
    { label: t("pg"), Icon: BedSingle, type: "pg" },
    { label: t("commercial"), Icon: Store, type: "commercial" },
  ];

  const typeLabel: Record<string, string> = { rent: t("rent"), sale: t("buy"), pg: t("pg"), commercial: t("commercial") };

  const handleWishlist = (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    if (!user) { toast.error(t("sign_in")); navigate("/auth"); return; }
    toggleWishlist.mutate(propId);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = user?.user_metadata?.full_name?.split(" ")?.[0] || user?.email?.split("@")?.[0] || "there";

  return (
    <div className="bg-background min-h-screen">
      <SEOHead
        title="Home"
        description="Browse popular areas and featured properties on urbanStay — verified rentals, sales, PG, and commercial listings near you."
      />

      {/* Editorial header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 pt-3 pb-3 flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{greeting}</span>
            <span className="text-[15px] font-bold text-foreground font-display capitalize">{firstName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => user ? navigate("/app/notifications") : navigate("/auth")}
              className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5 text-foreground" strokeWidth={1.8} />
              {!!notifCount && notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-5 pb-4">
        <h1 className="text-[28px] leading-[1.1] font-bold text-foreground font-display tracking-tight">
          Find a home<br />you'll <span className="italic text-accent">truly</span> love.
        </h1>
        <p className="text-[13px] text-muted-foreground mt-2 max-w-[22ch]">
          Verified listings. Zero brokerage. Talk to owners directly.
        </p>

        {/* Search box */}
        <button
          onClick={() => navigate("/app/search")}
          className="mt-4 w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 shadow-card active:scale-[0.99] transition text-left"
        >
          <Search className="h-4.5 w-4.5 text-foreground" strokeWidth={2} />
          <span className="flex-1 text-[13px] text-muted-foreground">Search city, area or landmark</span>
          <span className="h-7 w-7 rounded-xl bg-foreground flex items-center justify-center">
            <ArrowRight className="h-3.5 w-3.5 text-background" strokeWidth={2.5} />
          </span>
        </button>

        {/* Trust strip */}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-success" /> Verified owners</span>
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-accent" /> AI matched</span>
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-foreground" /> Live prices</span>
        </div>

        <div className="mt-3 flex justify-end">
          <GeolocationDetect onLocationDetected={(lat, lng) => setUserLoc({ lat, lng })} />
        </div>
      </section>

      {/* Categories — editorial chips */}
      <section className="px-4 pb-6">
        <div className="grid grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.Icon;
            return (
              <button
                key={cat.type}
                onClick={() => navigate(`/app/search?type=${cat.type}`)}
                className="group flex flex-col items-center gap-2 py-3.5 rounded-2xl bg-card border border-border shadow-card active:scale-[0.97] transition"
              >
                <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-foreground transition-colors">
                  <Icon className="h-4.5 w-4.5 text-foreground group-hover:text-background transition-colors" strokeWidth={1.8} />
                </span>
                <span className="text-[11px] font-semibold text-foreground">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Areas */}
      <section className="pl-4 pr-0 mb-6">
        <div className="flex items-end justify-between pr-4 mb-3">
          <div>
            <p className="section-eyebrow">{userLoc ? "Within 10 km" : "Trending"}</p>
            <h2 className="section-title mt-0.5">
              {userLoc ? "Areas near you" : "Popular areas"}
            </h2>
          </div>
          <button onClick={() => navigate("/app/search")} className="text-[11px] font-semibold text-foreground underline-offset-4 hover:underline">
            See all
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 pr-4">
          {popularAreas.map((area) => (
            <button
              key={area.name}
              onClick={() => navigate(`/app/search?location=${encodeURIComponent(area.name)}`)}
              className="group flex-shrink-0 w-[124px] rounded-2xl overflow-hidden bg-card shadow-card active:scale-[0.98] transition"
            >
              <div className="relative h-[88px] overflow-hidden">
                <img src={area.img} alt={area.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-background tracking-tight">{area.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <AIRecommendations />

      {/* Featured Properties — editorial 2-col grid */}
      <section className="px-4 pb-10">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="section-eyebrow">Hand-picked</p>
            <h2 className="section-title mt-0.5">Featured homes</h2>
          </div>
          <button onClick={() => navigate("/app/search")} className="text-[11px] font-semibold text-foreground underline-offset-4 hover:underline">
            See all
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0,1,2,3,4,5,6,7].map((i) => (
              <div key={i} className="rounded-2xl bg-secondary/60 animate-pulse h-[218px]" />
            ))}
          </div>
        ) : !featuredProperties?.length ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No featured listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featuredProperties.map((prop) => {
              const wished = wishlistIds?.includes(prop.id);
              return (
                <button
                  key={prop.id}
                  onClick={() => navigate(`/app/property/${prop.id}`)}
                  className="w-full bg-card rounded-2xl overflow-hidden shadow-card text-left flex flex-col active:scale-[0.98] transition border border-border/60"
                >
                  <div className="relative">
                    <img
                      src={prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                      alt={prop.title}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-background/95 backdrop-blur text-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      {typeLabel[prop.type] || prop.type}
                    </span>
                    {prop.is_verified && (
                      <span className="absolute bottom-2 left-2 bg-success text-success-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                    <button
                      onClick={(e) => handleWishlist(e, prop.id)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/95 backdrop-blur flex items-center justify-center shadow-pill active:scale-90 transition"
                      aria-label="Save"
                    >
                      <Heart className={`h-3.5 w-3.5 ${wished ? "text-destructive fill-destructive" : "text-foreground"}`} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <p className="font-bold text-foreground text-[15px] font-display tracking-tight leading-none">
                      {formatPrice(prop.price, prop.type)}
                    </p>
                    <p className="font-semibold text-[12px] text-foreground/90 truncate">{prop.title}</p>
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="text-[10px] truncate">{prop.address || prop.city}</span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 text-[10px] text-muted-foreground border-t border-border/60 pt-2">
                      {prop.bedrooms > 0 && <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3" /> {prop.bedrooms}</span>}
                      {prop.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" /> {prop.bathrooms}</span>}
                      {prop.area && <span className="flex items-center gap-0.5"><Maximize2 className="h-3 w-3" /> {prop.area}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeScreen;

import { useState } from "react";
import { Search, Heart, MapPin, BedDouble, Bath, Maximize2, ShieldCheck, Bell, Sparkles, Zap, Home as HomeIcon, Building2, BedSingle, Store, ArrowRight, Mic, Navigation, Star } from "lucide-react";
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
    { label: t("rent"), sub: "Find your perfect home", Icon: HomeIcon, type: "rent", tint: "hsl(28 80% 88%)", iconTint: "hsl(28 70% 55%)" },
    { label: t("buy"), sub: "Own your dream home", Icon: Building2, type: "sale", tint: "hsl(260 55% 92%)", iconTint: "hsl(260 45% 55%)" },
    { label: t("pg"), sub: "Comfortable PGs near you", Icon: BedSingle, type: "pg", tint: "hsl(150 45% 88%)", iconTint: "hsl(150 45% 35%)" },
    { label: t("commercial"), sub: "Grow your business", Icon: Store, type: "commercial", tint: "hsl(210 55% 90%)", iconTint: "hsl(210 55% 45%)" },
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
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 pt-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-foreground flex items-center justify-center shadow-pill">
              <HomeIcon className="h-4 w-4 text-background" strokeWidth={2.4} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <span className="animate-[wave_1.6s_ease-in-out_infinite] origin-[70%_70%] inline-block">👋</span>
                Hi, <span className="text-foreground font-semibold capitalize">{firstName}</span>
              </span>
              <span className="text-[15px] font-bold text-foreground font-display -mt-0.5 tracking-tight">
                Where do you want to live?
              </span>
            </div>
          </div>
          <button
            onClick={() => user ? navigate("/app/notifications") : navigate("/auth")}
            className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition hover:shadow-pill flex-shrink-0"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-foreground" strokeWidth={1.8} />
            {!!notifCount && notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 pt-5 pb-4 overflow-hidden">
        <div aria-hidden className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border mb-3 shadow-pill">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground">Live in 40+ cities</span>
        </div>

        <h1 className="text-[34px] leading-[1.02] font-bold text-foreground font-display tracking-tight">
          Find your next<br />
          <span className="text-accent italic">perfect</span> place.
        </h1>
        <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed max-w-[30ch]">
          Verified listings from real owners.<br />Zero brokerage. Zero games.
        </p>

        {/* Search bar with mic + arrow */}
        <div className="mt-4 flex items-center gap-2 bg-card border border-border rounded-2xl pl-3 pr-1.5 py-1.5 shadow-card">
          <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Search className="h-4 w-4 text-foreground" strokeWidth={2.4} />
          </span>
          <button
            onClick={() => navigate("/app/search")}
            className="flex-1 text-left py-1"
          >
            <span className="block text-[13px] font-semibold text-foreground leading-tight">Search city, area or landmark</span>
            <span className="block text-[10.5px] text-muted-foreground leading-tight mt-0.5 truncate">Hyderabad, PG, Flat, Hitech City…</span>
          </button>
          <button
            onClick={() => navigate("/app/search?voice=1")}
            aria-label="Voice search"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition flex-shrink-0"
          >
            <Mic className="h-4 w-4 text-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate("/app/search")}
            aria-label="Search"
            className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center active:scale-90 transition flex-shrink-0"
          >
            <ArrowRight className="h-4 w-4 text-background" strokeWidth={2.5} />
          </button>
        </div>

        {/* Chip row */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-pill">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span className="text-[11px] font-semibold text-foreground">Verified</span>
          </button>
          <button
            onClick={() => document.getElementById("ai-recs")?.scrollIntoView({ behavior: "smooth" })}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-pill"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] font-semibold text-foreground">AI Picks</span>
          </button>
          <button
            onClick={() => navigate("/app/search")}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-pill"
          >
            <Zap className="h-3.5 w-3.5" style={{ color: "hsl(260 60% 55%)" }} />
            <span className="text-[11px] font-semibold text-foreground">Live Deals</span>
          </button>
          <div className="flex-shrink-0 ml-auto">
            <GeolocationDetect onLocationDetected={(lat, lng) => setUserLoc({ lat, lng })} />
          </div>
        </div>
      </section>

      {/* Categories — colored tiles with subtitles */}
      <section className="px-4 pt-2 pb-6">
        <div className="grid grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.Icon;
            return (
              <button
                key={cat.type}
                onClick={() => navigate(`/app/search?type=${cat.type}`)}
                className="group relative flex flex-col items-start gap-2 p-2.5 rounded-2xl border border-border/60 active:scale-[0.97] hover:-translate-y-0.5 transition-all overflow-hidden text-left"
                style={{ backgroundColor: cat.tint }}
              >
                <span
                  className="h-9 w-9 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center shadow-pill"
                >
                  <Icon className="h-4 w-4" style={{ color: cat.iconTint }} strokeWidth={2.2} />
                </span>
                <div className="w-full">
                  <p className="text-[12px] font-bold text-foreground leading-none">{cat.label}</p>
                  <p className="text-[9px] text-foreground/60 leading-tight mt-1 line-clamp-2">{cat.sub}</p>
                </div>
                <span className="absolute bottom-1.5 right-1.5 h-5 w-5 rounded-full bg-card flex items-center justify-center shadow-pill">
                  <ArrowRight className="h-2.5 w-2.5 text-foreground" strokeWidth={2.5} />
                </span>
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
          {popularAreas.map((area, i) => {
            const counts = [1240, 980, 2300, 1560, 870, 1120, 640, 1800];
            const propCount = counts[i % counts.length];
            return (
              <button
                key={area.name}
                onClick={() => navigate(`/app/search?location=${encodeURIComponent(area.name)}`)}
                className="group flex-shrink-0 w-[168px] rounded-2xl overflow-hidden bg-card shadow-card active:scale-[0.98] transition"
              >
                <div className="relative h-[112px] overflow-hidden">
                  <img src={area.img} alt={area.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-background tracking-tight leading-none">{area.name}</p>
                      <p className="text-[9.5px] text-background/80 mt-1 font-medium">{propCount.toLocaleString("en-IN")}+ Properties</p>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-foreground" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div id="ai-recs" />


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

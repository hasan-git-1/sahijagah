import { useState } from "react";
import { SlidersHorizontal, MapPin, Heart, BedDouble, Bath, Bookmark, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useFilteredProperties, Property } from "@/hooks/useProperties";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FilterPanel, { SearchFilters, defaultFilters } from "@/components/FilterPanel";
import MapSearchView from "@/components/MapSearchView";
import HeatmapSearchView from "@/components/HeatmapSearchView";
import SEOHead from "@/components/SEOHead";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import AdvancedFilterChips, { AdvancedFilters, defaultAdvancedFilters } from "@/components/AdvancedFilterChips";

const filterTypes = ["All", "Rent", "Buy", "PG", "Commercial"];

const PropertyCard = ({ property, isWishlisted, onWishlist }: { property: Property; isWishlisted: boolean; onWishlist: (e: React.MouseEvent) => void }) => {
  const navigate = useNavigate();
  const typeLabel: Record<string, string> = { rent: "Rent", sale: "Buy", pg: "PG", commercial: "Commercial" };
  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p.toLocaleString("en-IN")}${property.type === "rent" || property.type === "pg" ? "/mo" : ""}`;
  };

  return (
    <button
      onClick={() => navigate(`/app/property/${property.id}`)}
      className="w-full bg-card rounded-xl overflow-hidden shadow-card text-left"
    >
      <div className="relative">
        <img
          src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
          alt={property.title}
          className="w-full h-40 object-cover"
        />
        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
          {typeLabel[property.type] || property.type}
        </span>
        <button
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
          onClick={onWishlist}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
        </button>
      </div>
      <div className="p-3">
        <p className="font-bold text-primary text-lg">{formatPrice(property.price)}</p>
        <p className="font-semibold text-sm text-foreground mt-0.5">{property.title}</p>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="text-xs">{property.address || property.city}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {property.bedrooms} Beds</span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {property.bathrooms} Bath</span>
          )}
          {property.area && <span>{property.area}</span>}
        </div>
      </div>
    </button>
  );
};

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [advFilters, setAdvFilters] = useState<AdvancedFilters>(defaultAdvancedFilters);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: wishlistIds } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const { data: results, isLoading } = useFilteredProperties(query, activeFilter, filters);

  const activeFilterCount = [filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms].filter(Boolean).length + filters.amenities.length;

  const handleSaveSearch = async () => {
    if (!user) { toast.error("Sign in to save searches"); navigate("/auth"); return; }
    const name = query || `${activeFilter} in all cities`;
    const filterData = { query, type: activeFilter, ...filters };
    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id, name, filters: filterData,
    });
    if (error) { toast.error("Failed to save search"); return; }
    toast.success("Search saved! You'll be notified of new matches.");
  };

  const handleWishlist = (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save properties"); navigate("/auth"); return; }
    toggleWishlist.mutate(propId);
  };

  return (
    <div className="bg-background min-h-screen">
      <SEOHead title="Search Properties" description="Search verified rental, sale, PG & commercial properties across India." />
      {showMap && results && <MapSearchView properties={results} onClose={() => setShowMap(false)} />}
      {showHeatmap && results && <HeatmapSearchView properties={results} onClose={() => setShowHeatmap(false)} />}
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 pt-3 pb-2 shadow-card">
        <div className="flex items-center gap-2">
          <SearchAutocomplete
            value={query}
            onChange={setQuery}
            autoFocus
          />
          <button
            onClick={() => setShowFilters(true)}
            className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center relative"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
          {filterTypes.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results && results.length > 0 ? (
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{results.length} properties found</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowMap(true)} className="flex items-center gap-1 text-xs text-primary font-semibold">
                <Map className="h-3.5 w-3.5" /> Map
              </button>
              <button onClick={() => setShowHeatmap(true)} className="flex items-center gap-1 text-xs text-primary font-semibold">
                🔥 Heatmap
              </button>
              <button onClick={handleSaveSearch} className="flex items-center gap-1 text-xs text-primary font-semibold">
                <Bookmark className="h-3.5 w-3.5" /> Save
              </button>
            </div>
          </div>
          {results.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isWishlisted={wishlistIds?.includes(p.id) ?? false}
              onWishlist={(e) => handleWishlist(e, p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Search for properties</h3>
          <p className="text-sm text-muted-foreground">
            Try searching "Hyderabad", "Bengaluru", or "Pune"
          </p>
        </div>
      )}

      <FilterPanel open={showFilters} onOpenChange={setShowFilters} filters={filters} onApply={setFilters} />
    </div>
  );
};

export default SearchScreen;

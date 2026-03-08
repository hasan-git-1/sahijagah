import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, MapPin, Heart, BedDouble, Bath } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchProperties, Property } from "@/hooks/useProperties";

const filterTypes = ["All", "Rent", "Buy", "PG", "Commercial"];

const PropertyCard = ({ property }: { property: Property }) => {
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
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="h-4 w-4 text-muted-foreground" />
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
  const { data: results, isLoading } = useSearchProperties(query, activeFilter);

  return (
    <div className="bg-background min-h-screen">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg px-4 pt-3 pb-2 shadow-card">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search city or locality"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              autoFocus
            />
          </div>
          <button className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </button>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
          {filterTypes.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
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
          <p className="text-sm text-muted-foreground">{results.length} properties found</p>
          {results.map((p) => (
            <PropertyCard key={p.id} property={p} />
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
    </div>
  );
};

export default SearchScreen;

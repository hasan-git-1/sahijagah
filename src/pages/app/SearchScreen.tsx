import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, MapPin } from "lucide-react";

const filterTypes = ["All", "Rent", "Buy", "PG", "Commercial"];

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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
        {/* Filter Chips */}
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

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-bold text-foreground mb-1">Search for properties</h3>
        <p className="text-sm text-muted-foreground">
          Try searching "Hyderabad", "Bengaluru", or "Pune"
        </p>
      </div>
    </div>
  );
};

export default SearchScreen;

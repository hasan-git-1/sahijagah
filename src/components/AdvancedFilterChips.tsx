import { useState } from "react";
import { Filter, X } from "lucide-react";

export interface AdvancedFilters {
  furnished: string;
  petFriendly: boolean;
  floorLevel: string;
  ageOfProperty: string;
  facing: string;
  availableFrom: string;
}

export const defaultAdvancedFilters: AdvancedFilters = {
  furnished: "",
  petFriendly: false,
  floorLevel: "",
  ageOfProperty: "",
  facing: "",
  availableFrom: "",
};

interface AdvancedFilterChipsProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
}

const furnishedOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];
const floorOptions = ["Ground", "Low (1-3)", "Mid (4-8)", "High (9+)"];
const ageOptions = ["New", "1-5 yrs", "5-10 yrs", "10+ yrs"];
const facingOptions = ["East", "West", "North", "South"];

const AdvancedFilterChips = ({ filters, onChange }: AdvancedFilterChipsProps) => {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof AdvancedFilters, val: any) => onChange({ ...filters, [key]: val });

  const activeCount = [
    filters.furnished,
    filters.petFriendly,
    filters.floorLevel,
    filters.ageOfProperty,
    filters.facing,
    filters.availableFrom,
  ].filter(Boolean).length;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary"
      >
        <Filter className="h-3.5 w-3.5" />
        More Filters
        {activeCount > 0 && (
          <span className="h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
            {activeCount}
          </span>
        )}
      </button>

      {expanded && (
        <div className="bg-card rounded-xl p-3 shadow-card space-y-3 animate-fade-in">
          {/* Furnished */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Furnished</p>
            <div className="flex gap-1.5 flex-wrap">
              {furnishedOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update("furnished", filters.furnished === opt ? "" : opt)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    filters.furnished === opt ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Friendly */}
          <button
            onClick={() => update("petFriendly", !filters.petFriendly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full ${
              filters.petFriendly ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            }`}
          >
            🐾 Pet Friendly
          </button>

          {/* Floor Level */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Floor Level</p>
            <div className="flex gap-1.5 flex-wrap">
              {floorOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update("floorLevel", filters.floorLevel === opt ? "" : opt)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    filters.floorLevel === opt ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Age of Property</p>
            <div className="flex gap-1.5 flex-wrap">
              {ageOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update("ageOfProperty", filters.ageOfProperty === opt ? "" : opt)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    filters.ageOfProperty === opt ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Facing */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Facing</p>
            <div className="flex gap-1.5 flex-wrap">
              {facingOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => update("facing", filters.facing === opt ? "" : opt)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    filters.facing === opt ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Available From */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Available From</p>
            <input
              type="date"
              value={filters.availableFrom}
              onChange={(e) => update("availableFrom", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {activeCount > 0 && (
            <button
              onClick={() => onChange(defaultAdvancedFilters)}
              className="flex items-center gap-1 text-[10px] font-medium text-destructive"
            >
              <X className="h-3 w-3" /> Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterChips;

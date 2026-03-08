import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface SearchFilters {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  sortBy: string;
}

const defaultFilters: SearchFilters = {
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  amenities: [],
  sortBy: "newest",
};

const amenitiesList = ["WiFi", "Parking", "Gym", "Pool", "AC", "Furnished", "Security", "Garden", "Elevator", "Power Backup"];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

const FilterPanel = ({ open, onOpenChange, filters, onApply }: FilterPanelProps) => {
  const [local, setLocal] = useState<SearchFilters>(filters);

  const update = (key: keyof SearchFilters, val: any) => setLocal((f) => ({ ...f, [key]: val }));
  const toggleAmenity = (a: string) =>
    setLocal((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const handleApply = () => {
    onApply(local);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocal(defaultFilters);
    onApply(defaultFilters);
    onOpenChange(false);
  };

  const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Price Range */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass} placeholder="Min" type="number" value={local.minPrice} onChange={(e) => update("minPrice", e.target.value)} />
              <input className={inputClass} placeholder="Max" type="number" value={local.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Bedrooms</label>
            <div className="flex gap-2">
              {["", "1", "2", "3", "4+"].map((v) => (
                <button
                  key={v}
                  onClick={() => update("bedrooms", v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    local.bedrooms === v ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {v || "Any"}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Bathrooms</label>
            <div className="flex gap-2">
              {["", "1", "2", "3+"].map((v) => (
                <button
                  key={v}
                  onClick={() => update("bathrooms", v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    local.bathrooms === v ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {v || "Any"}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    local.amenities.includes(a) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
            <div className="flex gap-2">
              {sortOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => update("sortBy", s.value)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-semibold transition-colors ${
                    local.sortBy === s.value ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
            <Button onClick={handleApply} className="flex-1 gradient-blue text-primary-foreground border-0">Apply Filters</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { defaultFilters };
export default FilterPanel;

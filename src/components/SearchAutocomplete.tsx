import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const POPULAR_AREAS = [
  "Gachibowli, Hyderabad",
  "Whitefield, Bengaluru",
  "Hinjewadi, Pune",
  "Andheri, Mumbai",
  "OMR, Chennai",
  "Banjara Hills, Hyderabad",
  "Koramangala, Bengaluru",
  "Kharadi, Pune",
  "Powai, Mumbai",
  "T Nagar, Chennai",
  "Madhapur, Hyderabad",
  "Electronic City, Bengaluru",
  "Viman Nagar, Pune",
  "Bandra, Mumbai",
  "Velachery, Chennai",
];

const SearchAutocomplete = ({ value, onChange, onSelect, placeholder, autoFocus }: SearchAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dbCities, setDbCities] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch unique cities from DB once
  useEffect(() => {
    supabase
      .from("properties")
      .select("city, address")
      .eq("status", "active")
      .limit(200)
      .then(({ data }) => {
        if (data) {
          const cities = [...new Set(data.map((p) => p.city))];
          const addresses = data.map((p) => p.address).filter(Boolean) as string[];
          setDbCities([...cities, ...addresses]);
        }
      });
  }, []);

  useEffect(() => {
    if (value.length < 1) {
      setSuggestions([]);
      return;
    }

    const q = value.toLowerCase();
    const allSources = [...new Set([...dbCities, ...POPULAR_AREAS])];
    const matches = allSources
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 6);

    setSuggestions(matches);
  }, [value, dbCities]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder || "Search city or locality"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          autoFocus={autoFocus}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-elevated border border-border z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(s);
                onSelect?.(s);
                setShowSuggestions(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
            >
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchFilters } from "@/components/FilterPanel";

export interface Property {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  price: number;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  area: string | null;
  owner_id: string | null;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export const useFeaturedProperties = () => {
  return useQuery({
    queryKey: ["properties", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as Property[];
    },
  });
};

export const useSearchProperties = (query: string, type?: string) => {
  return useQuery({
    queryKey: ["properties", "search", query, type],
    queryFn: async () => {
      let q = supabase.from("properties").select("*").eq("status", "active");
      if (query) {
        q = q.or(`city.ilike.%${query}%,title.ilike.%${query}%,address.ilike.%${query}%`);
      }
      if (type && type !== "All") {
        const typeMap: Record<string, string> = { Rent: "rent", Buy: "sale", PG: "pg", Commercial: "commercial" };
        q = q.eq("type", typeMap[type] || type.toLowerCase());
      }
      const { data, error } = await q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
    enabled: query.length > 0 || (!!type && type !== "All"),
  });
};

export const useFilteredProperties = (query: string, type: string, filters: SearchFilters) => {
  return useQuery({
    queryKey: ["properties", "filtered", query, type, filters],
    queryFn: async () => {
      let q = supabase.from("properties").select("*").eq("status", "active");

      if (query) {
        q = q.or(`city.ilike.%${query}%,title.ilike.%${query}%,address.ilike.%${query}%`);
      }
      if (type && type !== "All") {
        const typeMap: Record<string, string> = { Rent: "rent", Buy: "sale", PG: "pg", Commercial: "commercial" };
        q = q.eq("type", typeMap[type] || type.toLowerCase());
      }
      if (filters.minPrice) q = q.gte("price", Number(filters.minPrice));
      if (filters.maxPrice) q = q.lte("price", Number(filters.maxPrice));
      if (filters.bedrooms) {
        const beds = filters.bedrooms.replace("+", "");
        q = q.gte("bedrooms", Number(beds));
      }
      if (filters.bathrooms) {
        const baths = filters.bathrooms.replace("+", "");
        q = q.gte("bathrooms", Number(baths));
      }
      if (filters.amenities.length > 0) {
        q = q.contains("amenities", filters.amenities);
      }

      // Sort
      if (filters.sortBy === "price_asc") {
        q = q.order("price", { ascending: true });
      } else if (filters.sortBy === "price_desc") {
        q = q.order("price", { ascending: false });
      } else {
        q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Property[];
    },
    enabled: query.length > 0 || (!!type && type !== "All") || !!filters.minPrice || !!filters.maxPrice || !!filters.bedrooms || !!filters.bathrooms || filters.amenities.length > 0,
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Property;
    },
    enabled: !!id,
  });
};

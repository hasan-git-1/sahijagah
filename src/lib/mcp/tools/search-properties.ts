import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function anonClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "search_properties",
  title: "Search properties",
  description:
    "Search approved (public) property listings on urbanStay. Filter by city, price range, BHK, listing type (rent/sale), or property type. Returns up to 20 matching listings.",
  inputSchema: {
    city: z.string().optional().describe("City name, e.g. 'Hyderabad'."),
    query: z.string().optional().describe("Free-text search across title, description, and locality."),
    min_price: z.number().optional().describe("Minimum price (INR)."),
    max_price: z.number().optional().describe("Maximum price (INR)."),
    bhk: z.number().int().optional().describe("Number of bedrooms (BHK)."),
    listing_type: z.enum(["rent", "sale"]).optional().describe("Rent or sale."),
    property_type: z.string().optional().describe("Property type, e.g. apartment, villa, pg, commercial."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const supabase = anonClient();
    let q = supabase
      .from("properties")
      .select(
        "id, title, description, price, city, locality, address, bhk, bathrooms, area_sqft, property_type, listing_type, images, is_featured, view_count, created_at",
      )
      .eq("status", "approved");

    if (input.city) q = q.ilike("city", `%${input.city}%`);
    if (input.min_price != null) q = q.gte("price", input.min_price);
    if (input.max_price != null) q = q.lte("price", input.max_price);
    if (input.bhk != null) q = q.eq("bhk", input.bhk);
    if (input.listing_type) q = q.eq("listing_type", input.listing_type);
    if (input.property_type) q = q.ilike("property_type", `%${input.property_type}%`);
    if (input.query) {
      const like = `%${input.query}%`;
      q = q.or(`title.ilike.${like},description.ilike.${like},locality.ilike.${like}`);
    }

    const { data, error } = await q
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(input.limit ?? 20);

    if (error) {
      return { content: [{ type: "text", text: `Search failed: ${error.message}` }], isError: true };
    }

    const results = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify({ count: results.length, results }, null, 2) }],
      structuredContent: { count: results.length, results },
    };
  },
});

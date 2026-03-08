import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all saved searches with notify = true
    const { data: savedSearches, error: ssError } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("notify", true);

    if (ssError) throw ssError;

    let notifCount = 0;

    for (const search of savedSearches || []) {
      const filters = search.filters as Record<string, any>;
      const since = new Date();
      since.setHours(since.getHours() - 24); // Check last 24 hours

      let query = supabase
        .from("properties")
        .select("id, title, city, price, type")
        .eq("status", "active")
        .gte("created_at", since.toISOString());

      if (filters.type && filters.type !== "All") {
        const typeMap: Record<string, string> = { Rent: "rent", Buy: "sale", PG: "pg", Commercial: "commercial" };
        query = query.eq("type", typeMap[filters.type] || filters.type);
      }
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,city.ilike.%${filters.query}%`);
      }
      if (filters.minPrice) query = query.gte("price", filters.minPrice);
      if (filters.maxPrice) query = query.lte("price", filters.maxPrice);

      const { data: newProps } = await query.limit(5);

      if (newProps && newProps.length > 0) {
        // Create notification for the user
        await supabase.from("notifications").insert({
          user_id: search.user_id,
          title: `${newProps.length} new properties match "${search.name}"`,
          message: newProps.map((p) => p.title).join(", "),
          type: "saved_search",
          link: "/app/search",
        });
        notifCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications_sent: notifCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

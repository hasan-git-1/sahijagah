import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";

function anonClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "list_cities",
  title: "List cities with listings",
  description:
    "List all cities that currently have approved (public) urbanStay property listings, with a count per city.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from("properties")
      .select("city")
      .eq("status", "approved")
      .limit(2000);

    if (error) {
      return { content: [{ type: "text", text: `List failed: ${error.message}` }], isError: true };
    }
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const c = (row as { city: string | null }).city?.trim();
      if (!c) continue;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    const cities = Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
    return {
      content: [{ type: "text", text: JSON.stringify({ cities }, null, 2) }],
      structuredContent: { cities },
    };
  },
});

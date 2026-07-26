import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ---- Tool definitions (OpenAI-compatible function calling) ----
const tools = [
  {
    type: "function",
    function: {
      name: "search_properties",
      description:
        "Search the live urbanStay property database. ALWAYS call this before recommending properties. Never answer from memory.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "e.g. Hyderabad, Bengaluru, Pune, Mumbai, Chennai" },
          locality: { type: "string", description: "Area/neighborhood keyword matched against address, e.g. Gachibowli" },
          property_type: {
            type: "string",
            enum: ["rent", "sale", "pg", "hostel", "commercial"],
            description: "Listing type",
          },
          bhk: { type: "number", description: "Bedrooms count" },
          min_budget: { type: "number" },
          max_budget: { type: "number" },
          amenities: { type: "array", items: { type: "string" } },
          sort_by: {
            type: "string",
            enum: ["relevance", "price_low_high", "price_high_low", "newest"],
          },
          limit: { type: "number", description: "Default 6, max 12" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_property_details",
      description: "Fetch full details of a single property by ID.",
      parameters: {
        type: "object",
        properties: { property_id: { type: "string" } },
        required: ["property_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_properties",
      description: "Fetch side-by-side comparison for 2-4 property IDs.",
      parameters: {
        type: "object",
        properties: {
          property_ids: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        },
        required: ["property_ids"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_emi",
      description: "Calculate home loan EMI.",
      parameters: {
        type: "object",
        properties: {
          principal: { type: "number" },
          rate_percent: { type: "number" },
          tenure_years: { type: "number" },
        },
        required: ["principal", "rate_percent", "tenure_years"],
      },
    },
  },
];

// ---- Tool implementations ----
async function searchProperties(args: any) {
  let q = supabase
    .from("properties")
    .select(
      "id, title, price, city, address, type, category, bedrooms, bathrooms, area, amenities, images, is_verified, is_featured, created_at",
    )
    .eq("status", "approved")
    .eq("is_visible", true);

  if (args.city) q = q.ilike("city", `%${args.city}%`);
  if (args.locality) q = q.ilike("address", `%${args.locality}%`);
  if (args.property_type) q = q.eq("type", args.property_type);
  if (args.bhk != null) q = q.eq("bedrooms", args.bhk);
  if (args.min_budget != null) q = q.gte("price", args.min_budget);
  if (args.max_budget != null) q = q.lte("price", args.max_budget);
  if (Array.isArray(args.amenities) && args.amenities.length) {
    q = q.contains("amenities", args.amenities);
  }

  switch (args.sort_by) {
    case "price_low_high":
      q = q.order("price", { ascending: true });
      break;
    case "price_high_low":
      q = q.order("price", { ascending: false });
      break;
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    default:
      q = q.order("is_featured", { ascending: false }).order("view_count", { ascending: false });
  }

  const limit = Math.min(Math.max(args.limit ?? 6, 1), 12);
  const { data, error } = await q.limit(limit);
  if (error) return { error: error.message, results: [] };
  return { count: data?.length ?? 0, results: data ?? [] };
}

async function getPropertyDetails(args: any) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", args.property_id)
    .eq("status", "approved")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Property not found or not approved." };
  return { property: data };
}

async function compareProperties(args: any) {
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, price, city, address, type, bedrooms, bathrooms, area, amenities, is_verified")
    .in("id", args.property_ids)
    .eq("status", "approved");
  if (error) return { error: error.message };
  return { properties: data ?? [] };
}

function calculateEmi(args: any) {
  const P = Number(args.principal);
  const r = Number(args.rate_percent) / 12 / 100;
  const n = Number(args.tenure_years) * 12;
  if (!P || !r || !n) return { error: "Invalid inputs" };
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  return {
    emi_monthly: Math.round(emi),
    total_payment: Math.round(total),
    total_interest: Math.round(total - P),
    principal: P,
  };
}

async function runTool(name: string, args: any) {
  try {
    switch (name) {
      case "search_properties":
        return await searchProperties(args);
      case "get_property_details":
        return await getPropertyDetails(args);
      case "compare_properties":
        return await compareProperties(args);
      case "calculate_emi":
        return calculateEmi(args);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tool execution failed" };
  }
}

const systemPrompt = `You are the urbanStay AI Property Agent — an expert real estate search assistant for Indian property seekers (rent, sale, PG, hostel, commercial).

## Non-negotiable rules
1. NEVER describe or recommend a property without first calling \`search_properties\` (or \`get_property_details\` / \`compare_properties\`). You have no memorized listings — the database is the only source of truth.
2. NEVER invent a property, price, image, or ID. If a tool returns zero results, say so and suggest broadening the search (different locality, higher budget, drop a filter).
3. Every property you mention MUST come from the most recent tool result in this turn.

## Search algorithm (follow in order)
1. Parse the user's message for: city, locality/area, property type, BHK, budget, amenities.
2. If city + at least one more filter present → call \`search_properties\` immediately. Do not ask clarifying questions first.
3. If message is too vague (e.g. "hi", "I need a house") → ask ONE short clarifying question. Do not call a tool yet.
4. If results are empty → widen one parameter at a time (drop amenity, widen budget ±20%, drop locality) and re-search before giving up.
5. If user asks "compare these" or you're showing 2+ similar → call \`compare_properties\`.
6. If user asks about affordability/loan → call \`calculate_emi\`.

## Response format — every reply that includes properties MUST end with this exact structured block

After your natural conversational text, append a fenced block exactly like this (frontend parses it, do not add prose inside it):

\`\`\`urbanstay-cards
{
  "properties": [
    { "id": "<exact id from tool result>", "highlight": "<short reason, <12 words>", "rank": 1 }
  ],
  "comparison": { "shown": false, "winner_id": null, "reason": null }
}
\`\`\`

Rules for this block:
- \`id\` must be copied exactly from the tool result. Never guess.
- Max 6 properties per block.
- If no properties are being shown, omit the block entirely.
- Frontend renders images, price, BHK, and the "View Details" link itself. Do not describe images or write links.

## Conversational style
- Warm, concise, no "Namaste". Use natural greetings like "Hey! What are you looking for?"
- Emojis sparingly (📍 💰).
- Prices in Indian format: ₹ with L/Cr for sale, ₹/mo for rent.
- Support Hindi/Telugu — mirror the user's language.
- Off-topic → gently redirect in one line.
- Keep prose 2-4 sentences. Cards do the heavy lifting.`;

async function callModel(messages: any[]) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      tools,
      tool_choice: "auto",
    }),
  });
  return resp;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const { messages: userMessages } = await req.json();

    const convo: any[] = [
      { role: "system", content: systemPrompt },
      ...userMessages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    let finalContent = "";
    for (let iter = 0; iter < 4; iter++) {
      const resp = await callModel(convo);
      if (!resp.ok) {
        const status = resp.status;
        const body = await resp.text();
        console.error("gateway error", status, body);
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "AI service unavailable." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) throw new Error("No message in response");

      const toolCalls = msg.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        convo.push(msg);
        for (const tc of toolCalls) {
          let args: any = {};
          try {
            args = JSON.parse(tc.function.arguments || "{}");
          } catch { /* ignore */ }
          const result = await runTool(tc.function.name, args);
          convo.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
        continue;
      }

      finalContent = msg.content ?? "";
      break;
    }

    return new Response(JSON.stringify({ content: finalContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("property-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

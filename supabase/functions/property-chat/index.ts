import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch active properties from DB for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: properties } = await supabase
      .from("properties")
      .select("id, title, price, city, type, bedrooms, bathrooms, area, address, amenities, category, is_verified, is_featured")
      .eq("status", "active")
      .limit(50);

    const propertyContext = properties && properties.length > 0
      ? properties.map(p => {
          const priceStr = p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(1)} Cr` :
            p.price >= 100000 ? `₹${(p.price / 100000).toFixed(1)} L` :
            `₹${p.price.toLocaleString("en-IN")}`;
          return `- ID: ${p.id} | "${p.title}" | ${priceStr} | ${p.city} | ${p.type} | ${p.bedrooms || '?'} BHK | ${p.bathrooms || '?'} Bath | Area: ${p.area || 'N/A'} | Amenities: ${(p.amenities || []).join(', ')} | Verified: ${p.is_verified ? 'Yes' : 'No'} | Featured: ${p.is_featured ? 'Yes' : 'No'}`;
        }).join("\n")
      : "No properties currently available.";

    const systemPrompt = `You are the Sahi Jagah AI Property Assistant — a friendly, knowledgeable real estate advisor for Indian property seekers. You help users find properties, answer questions about real estate, localities, pricing, legal aspects, and more.

## Your Capabilities:
- Search and recommend properties from our database
- Provide price comparisons and market insights
- Explain legal processes (stamp duty, registration, agreements)
- Give locality insights for Indian cities (Hyderabad, Bengaluru, Pune, Mumbai, Chennai)
- Help with EMI calculations and financial planning
- Offer vastu tips and interior design suggestions
- Guide on tenant/owner processes

## Current Properties Database:
${propertyContext}

## Response Guidelines:
- Be warm, helpful, and conversational — use emojis occasionally. Never use "Namaste" as a greeting. Use casual English greetings like "Hi! How can I help you today?" or "Hey there! What are you looking for?"
- When recommending properties, format them clearly with price, location, BHK
- If the user asks about a property, provide its ID so they can navigate: "You can view it at /app/property/{id}"
- For pricing, always use Indian format: ₹ with L (Lakhs) and Cr (Crores)
- Keep responses concise but informative
- If you don't know something specific, be honest and suggest alternatives
- Support Hindi and Telugu — if user writes in Hindi/Telugu, respond in that language
- When user asks something unrelated to real estate, politely redirect them

## Important:
- Never make up property listings that don't exist in the database
- If no matching property is found, suggest broadening the search criteria
- Always be transparent about property verification status`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("property-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

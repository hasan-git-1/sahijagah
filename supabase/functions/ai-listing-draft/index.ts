// AI Listing Draft — turns a few raw details + photos into a complete property listing.
// Different from the chatbot: this is a one-shot structured generator used by the "AI Post" flow.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You write property listings for urbanStay, an Indian rental/sale platform for tier-2/3 cities.

You are given raw owner inputs (photos, type, location, price, amenities) and must produce a complete, honest, ready-to-publish listing.

Rules:
- Look at the photos to infer room count, furnishing, condition and approximate size.
- Never invent amenities that were not provided and are not visible in photos.
- Title: 4-9 words, specific, no ALL CAPS, no emojis.
- Description: 40-90 words, warm but factual, mention locality, what's included, who it suits.
- category must be one of: apartment, house, villa, plot, office.
- bedrooms/bathrooms: integers inferred from photos/details (0 if a plot/office).
- area: short string like "1,100 sqft" or empty string if unclear.

Respond with ONLY valid JSON, no markdown fences:
{"title":"","description":"","category":"","bedrooms":0,"bathrooms":0,"area":"","extra_amenities":[]}
extra_amenities: amenities clearly visible in the photos, chosen ONLY from this list: WiFi, Parking, Gym, Pool, AC, Furnished, Security, Garden, Elevator, Power Backup.`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { images = [], type, city, address, price, amenities = [] } = body ?? {};

    if (!type || !city || !price) {
      return json({ error: "type, city and price are required" }, 400);
    }

    const details = [
      `Listing type: ${type}`,
      `City: ${city}`,
      address ? `Address: ${address}` : null,
      `Price (INR): ${price}`,
      amenities.length ? `Owner-selected amenities: ${amenities.join(", ")}` : "Owner-selected amenities: none",
      `Number of photos: ${images.length}`,
    ].filter(Boolean).join("\n");

    const content: any[] = [{ type: "text", text: `Create the listing from these details:\n${details}` }];
    for (const url of (images as string[]).slice(0, 5)) {
      content.push({ type: "image_url", image_url: { url } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
      }),
    });

    if (res.status === 429) return json({ error: "AI is busy right now, try again in a moment." }, 429);
    if (res.status === 402) return json({ error: "AI credits exhausted. Please add credits." }, 402);
    if (!res.ok) {
      const text = await res.text();
      return json({ error: `AI request failed: ${text.slice(0, 300)}` }, 502);
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    let draft: any;
    try {
      draft = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) return json({ error: "AI returned an unreadable draft. Try again." }, 502);
      draft = JSON.parse(m[0]);
    }

    const allowed = ["WiFi", "Parking", "Gym", "Pool", "AC", "Furnished", "Security", "Garden", "Elevator", "Power Backup"];
    const categories = ["apartment", "house", "villa", "plot", "office"];

    return json({
      title: String(draft.title || "").slice(0, 120),
      description: String(draft.description || "").slice(0, 1500),
      category: categories.includes(String(draft.category)) ? draft.category : "apartment",
      bedrooms: Number.isFinite(Number(draft.bedrooms)) ? Math.max(0, Math.min(20, Number(draft.bedrooms))) : 0,
      bathrooms: Number.isFinite(Number(draft.bathrooms)) ? Math.max(0, Math.min(20, Number(draft.bathrooms))) : 0,
      area: String(draft.area || "").slice(0, 40),
      extra_amenities: Array.isArray(draft.extra_amenities)
        ? draft.extra_amenities.filter((a: string) => allowed.includes(a))
        : [],
    });
  } catch (err) {
    return json({ error: (err as Error).message || "Unexpected error" }, 500);
  }
});

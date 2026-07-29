// AI Property Verification & Auto-Approval
// Uses Lovable AI Gateway (Gemini) with vision to review PG/hostel/room/house listings.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are a property listing verification specialist for an Indian PG/hostel/room/house rental platform (urbanStay). You review new listings the way a careful, experienced human moderator would before they go live to renters.

You will receive listing text fields, listing photos, and pre-check flags (duplicate_image_match, price_outlier, incomplete_fields).

Evaluate on these dimensions:
1. PHOTO AUTHENTICITY — Are photos real phone/camera shots of an actual PG/hostel/house room (visible bed frames, wardrobes, bathroom, kitchen, common area, minor imperfections like switchboards/cables, varied angles of the SAME room) — or stock photography, interior-design portfolio shots, watermarked images, or lifted from real-estate marketing sites (99acres, NoBroker, MagicBricks)?
2. CONSISTENCY — Do photos match the claimed room type, AC/non-AC, attached bathroom, occupancy, furnishing?
3. DESCRIPTION QUALITY — Genuine and specific (locality, landmarks, floor, rules, food, deposit) or generic copy-paste spam?
4. PRICING SANITY — Plausible for the stated room type + locality in India. Rent PG single ~4-12k, shared ~3-8k; 1BHK rent ~8-25k tier-2/3, ~15-45k metros; buy prices in lakhs/crores. Respect price_outlier flag but reason yourself too.
5. FRAUD PATTERNS — Pressure for advance payment, no exact address, off-platform contact push, wildly-below-market pricing, duplicate images.

Weigh all 5 dimensions together — don't reject on one weak signal alone if others are strong (a slightly generic description with excellent authentic-looking photos and sane price is likely a lazy-writer real listing).

Respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "realness_score": <integer 0-100>,
  "verdict": "approve" | "review" | "reject",
  "reasons": ["short factual reason 1", "short factual reason 2"],
  "flagged_issues": ["specific issue if any, else empty array"],
  "photo_notes": "1-2 sentence summary of what the photos actually show"
}

Scoring: 85-100 approve, 50-84 review, 0-49 reject. Cite specifics, never fabricate.`;

async function runPreChecks(supabase: any, listing: any) {
  const flags: Record<string, boolean> = {
    duplicate_image_match: false,
    price_outlier: false,
    incomplete_fields: false,
  };

  const req = ["title", "description", "price", "address", "type"];
  if (req.some((f) => !listing[f]) || (listing.images?.length ?? 0) < 3) {
    flags.incomplete_fields = true;
  }

  const { data: comps } = await supabase
    .from("properties")
    .select("price")
    .eq("city", listing.city)
    .eq("type", listing.type)
    .eq("status", "approved")
    .neq("id", listing.id)
    .limit(50);

  if (comps && comps.length >= 3) {
    const avg = comps.reduce((s: number, c: any) => s + Number(c.price), 0) / comps.length;
    const p = Number(listing.price);
    if (p < avg * 0.35 || p > avg * 2.5) flags.price_outlier = true;
  }

  const { data: dupes } = await supabase
    .from("properties")
    .select("id, images")
    .neq("id", listing.id)
    .limit(300);

  const set = new Set(listing.images || []);
  if ((dupes || []).some((d: any) => (d.images || []).some((u: string) => set.has(u)))) {
    flags.duplicate_image_match = true;
  }

  return flags;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { property_id } = await req.json();
    if (!property_id) {
      return new Response(JSON.stringify({ error: "property_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: listing, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", property_id)
      .single();

    if (error || !listing) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flags = await runPreChecks(supabase, listing);

    const imageUrls: string[] = (listing.images || []).slice(0, 6);
    const content: any[] = [
      {
        type: "text",
        text: `Listing details:
Title: ${listing.title}
Description: ${listing.description || "(none)"}
Price: ₹${listing.price} (${listing.type})
Address: ${listing.address || "(none)"}
City: ${listing.city}
Type: ${listing.type}
Category: ${listing.category || "(none)"}
Bedrooms: ${listing.bedrooms} | Bathrooms: ${listing.bathrooms} | Area: ${listing.area || "(none)"}
Amenities: ${(listing.amenities || []).join(", ") || "(none)"}
Images provided: ${imageUrls.length}

Pre-check flags: ${JSON.stringify(flags)}

Review this listing per your instructions and respond with the JSON only.`,
      },
      ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errTxt = await aiRes.text();
      return new Response(
        JSON.stringify({ error: "AI gateway error", status: aiRes.status, detail: errTxt }),
        { status: aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    const rawText: string = aiData.choices?.[0]?.message?.content || "{}";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let verdict: any;
    try {
      verdict = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      verdict = m ? JSON.parse(m[0]) : { realness_score: 60, verdict: "review", reasons: ["AI returned malformed JSON"], flagged_issues: [], photo_notes: "" };
    }

    const score = Number(verdict.realness_score) || 0;
    let newStatus = "pending";
    if (score >= 85) newStatus = "approved";
    else if (score < 50) newStatus = "rejected";

    const updates: any = { status: newStatus };
    if (newStatus === "approved") updates.is_verified = true;
    if (newStatus === "rejected") updates.rejection_reason = `AI review: ${(verdict.reasons || []).slice(0, 2).join("; ")}`;

    await supabase.from("properties").update(updates).eq("id", property_id);

    await supabase.from("ai_review_logs").insert({
      property_id,
      realness_score: score,
      verdict: verdict.verdict || (score >= 85 ? "approve" : score < 50 ? "reject" : "review"),
      reasons: verdict.reasons || [],
      flagged_issues: verdict.flagged_issues || [],
      photo_notes: verdict.photo_notes || "",
      pre_check_flags: flags,
      resulting_status: newStatus,
    });

    return new Response(
      JSON.stringify({ status: newStatus, ai_result: verdict, pre_check_flags: flags }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

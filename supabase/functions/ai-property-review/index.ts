// AI Property Image Verification & Auto-Approval
// Uses Lovable AI Gateway (Gemini) with vision to detect fake/AI-generated/stock images.
// If images look like real, authentic phone/camera photos of an actual property → auto-approve.
// If images look AI-generated, stock, watermarked, or lifted from marketing sites → reject.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are an image authenticity checker for an Indian PG/hostel/room/house rental platform (urbanStay).

Your ONLY job: look at the listing photos (and video thumbnails if any) and decide whether they are REAL, authentic phone/camera photos of an actual property — or FAKE (AI-generated, stock photography, watermarked, or lifted from real-estate marketing sites like 99acres/NoBroker/MagicBricks).

Signs of REAL photos:
- Visible imperfections: switchboards, cables, minor clutter, uneven lighting
- Phone/camera angles, slightly tilted framing
- Real bed frames, wardrobes, bathrooms, kitchens with actual usage marks
- Consistent room shown from multiple angles

Signs of FAKE / AI / stock photos:
- Perfect studio lighting, magazine-quality staging
- Impossibly clean, portfolio-style interior design shots
- AI artifacts: warped furniture, extra fingers on people, melted textures, nonsensical geometry
- Watermarks or logos from other sites
- All photos look like different rooms / different buildings stitched together

Do NOT judge price, description quality, amenities, or completeness. ONLY image authenticity.

Respond with ONLY valid JSON, no markdown fences:
{
  "realness_score": <integer 0-100>,
  "verdict": "approve" | "reject",
  "photo_notes": "1-2 sentence summary of what the photos actually show and why they look real or fake"
}

Scoring: >=60 approve (looks like real photos), <60 reject (looks fake/AI/stock). Be lenient — only reject when you're confident images are fake.`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function reviewProperty(property_id: string) {
  const { data: listing, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", property_id)
    .single();

  if (error || !listing) return { property_id, status: "error", error: "Listing not found" };

  const imageUrls: string[] = (listing.images || []).slice(0, 6);

  // No images → can't verify, auto-approve (owner will add later) rather than block
  if (imageUrls.length === 0) {
    await supabase.from("properties").update({ status: "approved", is_verified: false }).eq("id", property_id);
    await supabase.from("ai_review_logs").insert({
      property_id,
      realness_score: 70,
      verdict: "approve",
      reasons: ["No images to verify"],
      flagged_issues: [],
      photo_notes: "No images provided",
      pre_check_flags: {},
      resulting_status: "approved",
    });
    return { property_id, status: "approved", reason: "no images" };
  }

  const content: any[] = [
      { type: "text", text: `Check whether these ${imageUrls.length} listing photos are real or fake. Respond with the JSON only.` },
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
      // On AI failure, auto-approve so owner listings go live instead of getting stuck
      await supabase.from("properties").update({ status: "approved" }).eq("id", property_id);
      return new Response(
        JSON.stringify({ status: "approved", note: "AI unavailable, auto-approved", detail: errTxt }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      verdict = m ? JSON.parse(m[0]) : { realness_score: 70, verdict: "approve", photo_notes: "AI returned malformed JSON — defaulted to approve" };
    }

    const score = Number(verdict.realness_score) || 0;
    const newStatus = score >= 60 ? "approved" : "rejected";

    const updates: any = { status: newStatus };
    if (newStatus === "approved") updates.is_verified = true;
    if (newStatus === "rejected") updates.rejection_reason = `Images appear fake/AI-generated/stock. ${verdict.photo_notes || ""}`.trim();

    await supabase.from("properties").update(updates).eq("id", property_id);

    await supabase.from("ai_review_logs").insert({
      property_id,
      realness_score: score,
      verdict: verdict.verdict || (score >= 60 ? "approve" : "reject"),
      reasons: [verdict.photo_notes || ""],
      flagged_issues: newStatus === "rejected" ? ["fake_or_ai_images"] : [],
      photo_notes: verdict.photo_notes || "",
      pre_check_flags: {},
      resulting_status: newStatus,
    });

    return new Response(
      JSON.stringify({ status: newStatus, ai_result: verdict }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { supabase } from "@/integrations/supabase/client";

/**
 * Profile photos live in a private bucket. Stored values are storage paths
 * (e.g. "<user-id>/avatar.jpg"); legacy rows may still hold absolute URLs.
 */
export async function resolveProfilePhoto(value?: string | null): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("http")) {
    // Legacy public URL — extract the object path and sign it.
    const marker = "/profile-photos/";
    const idx = value.indexOf(marker);
    if (idx === -1) return value;
    value = value.slice(idx + marker.length).split("?")[0];
  }
  const { data } = await supabase.storage.from("profile-photos").createSignedUrl(value, 3600);
  return data?.signedUrl ?? null;
}

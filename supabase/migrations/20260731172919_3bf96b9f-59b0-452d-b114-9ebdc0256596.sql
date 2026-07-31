DROP POLICY IF EXISTS "Public can view non-sensitive profile fields" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view chat and booking counterparties"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.participant_1 = auth.uid() AND c.participant_2 = profiles.id)
       OR (c.participant_2 = auth.uid() AND c.participant_1 = profiles.id)
  )
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE (b.client_id = auth.uid() AND b.owner_id = profiles.id)
       OR (b.owner_id = auth.uid() AND b.client_id = profiles.id)
  )
);

CREATE POLICY "Signed-in users can view owners of live listings"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.owner_id = profiles.id
      AND p.status = 'approved'
      AND p.is_visible = true
  )
);

REVOKE SELECT ON public.profiles FROM anon;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = off) AS
SELECT id, name, profile_photo, is_verified
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_view_count(property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.properties
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = property_id
    AND status = 'approved'
    AND is_visible = true;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Signed-in users can view profile photos" ON storage.objects;
CREATE POLICY "Signed-in users can view profile photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos');
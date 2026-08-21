-- 1. Profiles: remove blanket anon read
DROP POLICY IF EXISTS "Anyone can view profile display fields" ON public.profiles;
REVOKE ALL ON public.profiles FROM anon;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = off) AS
  SELECT id, name, profile_photo, is_verified FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. Storage: profile photos readable only by their owner
DROP POLICY IF EXISTS "Signed-in users can view profile photos" ON storage.objects;

-- 3. Properties: remove owner_id IS NULL ban bypass
DROP POLICY IF EXISTS "Public can view approved visible properties" ON public.properties;

CREATE POLICY "Public can view live listings"
ON public.properties FOR SELECT TO anon, authenticated
USING (status = 'approved' AND is_visible = true);

CREATE POLICY "Owners and admins can view their listings"
ON public.properties FOR SELECT TO authenticated
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.sync_banned_owner_listings()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_banned IS DISTINCT FROM OLD.is_banned THEN
    UPDATE public.properties SET is_visible = NOT NEW.is_banned WHERE owner_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_banned_owner_listings() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_banned_owner_listings ON public.profiles;
CREATE TRIGGER trg_sync_banned_owner_listings
AFTER UPDATE OF is_banned ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_banned_owner_listings();

UPDATE public.properties p SET is_visible = false
WHERE p.is_visible = true
  AND EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = p.owner_id AND pr.is_banned);

-- 4. Prevent owner_id from being cleared / reassigned on update
DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
CREATE POLICY "Owners can update own properties"
ON public.properties FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id AND NOT public.is_user_banned(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
CREATE POLICY "Admins can update any property"
ON public.properties FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. SECURITY DEFINER helpers: not callable by signed-out visitors
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_user_banned(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;


-- 1. Profiles: restrict email/phone exposure
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Public can view non-sensitive profile fields"
  ON public.profiles FOR SELECT
  USING (true);

-- Revoke sensitive columns from anon and authenticated; keep for owner via separate policy path
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, name, role, is_verified, profile_photo, created_at, updated_at, is_banned)
  ON public.profiles TO anon, authenticated;
GRANT SELECT (email, phone) ON public.profiles TO service_role;

-- Allow the owner to still read their own email/phone via a security-definer function
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- 2. Notifications: prevent spoofing other users
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Users insert own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
-- Service role (used by triggers/edge functions) bypasses RLS.

-- 3. Storage: property-images ownership on INSERT + add UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Users can upload to own property image folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Users can update own property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 4. Public bucket listing: restrict storage.objects SELECT to owner; public URLs still work
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
CREATE POLICY "Owners can list own property images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Owners can list own profile photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 5. Revoke execute on internal trigger/helper functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.notify_on_property_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_booking() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM PUBLIC, anon;

-- 6. Realtime: restrict channel subscription to conversation participants
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conversation participants can receive realtime" ON realtime.messages;
CREATE POLICY "Conversation participants can receive realtime"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (realtime.topic() = 'messages:' || c.id::text
             OR realtime.topic() = 'typing:' || c.id::text
             OR realtime.topic() = 'conversations-list')
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()
             OR realtime.topic() = 'conversations-list')
    )
  );

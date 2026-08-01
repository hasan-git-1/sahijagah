DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
CREATE POLICY "Owners can insert properties" ON public.properties
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id AND NOT public.is_user_banned(auth.uid()));
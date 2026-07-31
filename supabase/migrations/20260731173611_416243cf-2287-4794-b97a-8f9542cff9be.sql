GRANT SELECT (id, name, profile_photo, is_verified) ON public.profiles TO anon;

CREATE POLICY "Anyone can view profile display fields"
ON public.profiles FOR SELECT TO anon
USING (true);